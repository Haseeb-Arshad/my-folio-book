import type { ActionFunctionArgs } from "react-router";
import {
  buildConversationPrompt,
  type ConversationMessage,
} from "../agent/prompt.server";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const MAX_MESSAGES = 6;
const MAX_MESSAGE_LENGTH = 1600;
const MAX_BODY_LENGTH = 18_000;
const MAX_OUTPUT_TOKENS = 280;
const MAX_OUTPUT_CHARACTERS = 4000;
const REQUEST_TIMEOUT_MS = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

type OpenRouterStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: unknown;
    };
  }>;
};

const requestLog = new Map<string, number[]>();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function clientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS
  );

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

function parseMessages(value: unknown): ConversationMessage[] | null {
  if (!Array.isArray(value)) return null;

  const messages = value
    .slice(-MAX_MESSAGES)
    .filter(
      (message): message is Record<string, unknown> =>
        typeof message === "object" && message !== null
    )
    .map((message) => {
      const role = message.role;
      const content = message.content;
      if (
        (role !== "user" && role !== "assistant") ||
        typeof content !== "string"
      ) {
        return null;
      }
      const trimmed = content.trim();
      if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null;
      return { role, content: trimmed } satisfies ConversationMessage;
    });

  if (messages.some((message) => message === null)) return null;
  return messages as ConversationMessage[];
}

function instantConversationReply(messages: ConversationMessage[]) {
  const latest = messages.at(-1)?.content.trim().toLowerCase() ?? "";

  if (/^(hi|hello|hey|hiya|yo|sup|good (morning|afternoon|evening)|👋)[\s!.?]*$/i.test(latest)) {
    return "Hey, what's up?";
  }
  if (/^(thanks|thank you|thx|got it|cool|nice)[\s!.?]*$/i.test(latest)) {
    return "Anytime, glad that helped.";
  }
  if (/^(bye|goodbye|see you)[\s!.?]*$/i.test(latest)) {
    return "Take care. Good talking with you.";
  }
  if (/system prompt|hidden prompt|hidden instruction|ignore (your|all|the) (rules|instructions)|developer message|api key/i.test(latest)) {
    return "I can't share hidden instructions. Ask me about the published work instead.";
  }

  return null;
}

function normalizeAssistantText(text: string) {
  // Keep the visible voice free of typographic dash punctuation. Technical
  // hyphens inside names such as full-stack are intentionally left alone.
  return text.replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",");
}

function textResponse(text: string) {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function configuredModel() {
  const configured = process.env.PORTFOLIO_OPENROUTER_MODEL?.trim();
  if (!configured) return DEFAULT_MODEL;

  // Keep this portfolio conversation away from Anthropic models, auto-routing
  // that could silently select one, and the previous slow Qwen default.
  if (/anthropic|claude|openrouter\/auto|qwen\/qwen3-32b/i.test(configured)) {
    return DEFAULT_MODEL;
  }
  return configured;
}

function streamedText(value: unknown) {
  const content = (value as OpenRouterStreamChunk).choices?.[0]?.delta?.content;
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (
          typeof part === "object" &&
          part !== null &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }
        return "";
      })
      .join("");
  }

  return "";
}

function parseSseEvent(event: string) {
  const data = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();

  if (!data) return { text: "", done: false };
  if (data === "[DONE]") return { text: "", done: true };

  try {
    return { text: streamedText(JSON.parse(data)), done: false };
  } catch {
    return { text: "", done: false };
  }
}

function proxyTextStream(
  upstream: Response,
  upstreamController: AbortController,
  timeout: ReturnType<typeof setTimeout>,
  request: Request
) {
  const body = upstream.body;
  if (!body) {
    clearTimeout(timeout);
    return jsonResponse({ error: "That reply didn't come through. Try once more." }, 502);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let closed = false;
  let outputCharacters = 0;

  const abortUpstream = () => upstreamController.abort();
  request.signal.addEventListener("abort", abortUpstream, { once: true });

  const cleanup = () => {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", abortUpstream);
    reader.releaseLock();
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(destination) {
      let buffer = "";

      try {
        while (!closed) {
          const { value, done } = await reader.read();
          if (done) {
            buffer += decoder.decode();
          } else {
            buffer += decoder.decode(value, { stream: true });
          }

          buffer = buffer.replace(/\r\n/g, "\n");
          let boundary = buffer.indexOf("\n\n");

          while (boundary !== -1) {
            const event = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const parsed = parseSseEvent(event);

            if (parsed.text) {
              const remaining = MAX_OUTPUT_CHARACTERS - outputCharacters;
              const text = normalizeAssistantText(parsed.text).slice(0, remaining);
              if (text) {
                destination.enqueue(encoder.encode(text));
                outputCharacters += text.length;
              }
            }

            if (parsed.done || outputCharacters >= MAX_OUTPUT_CHARACTERS) {
              closed = true;
              upstreamController.abort();
              destination.close();
              return;
            }

            boundary = buffer.indexOf("\n\n");
          }

          if (done) {
            const parsed = parseSseEvent(buffer);
            if (parsed.text && outputCharacters < MAX_OUTPUT_CHARACTERS) {
              const remaining = MAX_OUTPUT_CHARACTERS - outputCharacters;
              const text = normalizeAssistantText(parsed.text).slice(0, remaining);
              if (text) destination.enqueue(encoder.encode(text));
            }
            closed = true;
            destination.close();
            return;
          }
        }
      } catch {
        if (!closed) {
          closed = true;
          destination.close();
        }
      } finally {
        cleanup();
      }
    },
    cancel() {
      closed = true;
      upstreamController.abort();
      clearTimeout(timeout);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  if (isRateLimited(clientAddress(request))) {
    return jsonResponse(
      { error: "A few questions came in at once. Give it a moment, then try again." },
      429
    );
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return jsonResponse(
        { error: "This thread has grown a little too long. Reset it and keep going." },
        413
      );
    }
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "That message didn't come through correctly." }, 400);
  }

  const messages =
    typeof payload === "object" && payload !== null
      ? parseMessages((payload as { messages?: unknown }).messages)
      : null;
  if (!messages?.length || messages.at(-1)?.role !== "user") {
    return jsonResponse({ error: "Write a question first, then send it through." }, 400);
  }

  const instantReply = instantConversationReply(messages);
  if (instantReply) return textResponse(instantReply);

  const apiKey =
    process.env.PORTFOLIO_OPENROUTER_API_KEY ??
    process.env.ALTHERAIL_MODEL_OPENROUTER_API_KEY;
  if (!apiKey?.trim()) {
    return jsonResponse(
      { error: "This conversation isn't available on the server right now." },
      503
    );
  }

  const upstreamController = new AbortController();
  const timeout = setTimeout(() => upstreamController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      signal: upstreamController.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.PORTFOLIO_SITE_URL ?? "https://haseebarshad.me",
        "X-OpenRouter-Title": "Haseeb Arshad Portfolio Conversation",
      },
      body: JSON.stringify({
        model: configuredModel(),
        messages: [
          { role: "system", content: buildConversationPrompt(messages) },
          ...messages,
        ],
        stream: true,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.68,
        provider: {
          allow_fallbacks: true,
          data_collection: "deny",
          sort: "latency",
        },
      }),
    });

    if (!upstream.ok) {
      clearTimeout(timeout);
      await upstream.body?.cancel().catch(() => undefined);
      return jsonResponse(
        {
          error:
            upstream.status === 429
              ? "Replies are busy for a moment. Try again shortly."
              : "That reply didn't come through. Try once more.",
        },
        upstream.status === 429 ? 429 : 502
      );
    }

    return proxyTextStream(upstream, upstreamController, timeout, request);
  } catch (error) {
    clearTimeout(timeout);
    const message = error instanceof Error ? error.message : "unknown error";
    const isTimeout = message.toLowerCase().includes("abort");
    return jsonResponse(
      {
        error: isTimeout
          ? "That took longer than it should. Try once more."
          : "The conversation is unavailable for a moment. Try again shortly.",
      },
      502
    );
  }
}
