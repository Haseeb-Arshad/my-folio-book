import type { ActionFunctionArgs } from "react-router";
import {
  parseChatPersistenceContext,
  recordAgentEvent,
  type AgentEventName,
} from "../data/chat.server";

const MAX_BODY_LENGTH = 4_000;
const EVENT_NAMES = new Set<AgentEventName>([
  "agent_opened",
  "agent_message_sent",
  "agent_reply_completed",
  "agent_reply_failed",
  "agent_conversation_reset",
  "agent_mode_changed",
]);
const ALLOWED_METADATA = new Set([
  "duration_ms",
  "message_characters",
  "response_characters",
  "from_mode",
  "to_mode",
]);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function sanitizeMetadata(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  const source = value as Record<string, unknown>;
  const metadata: Record<string, unknown> = {};

  for (const key of ALLOWED_METADATA) {
    const candidate = source[key];
    if (key.endsWith("mode")) {
      if (candidate === "plain" || candidate === "goblin") {
        metadata[key] = candidate;
      }
      continue;
    }

    const number = finiteNumber(candidate);
    if (number !== null) metadata[key] = number;
  }

  return metadata;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_LENGTH) {
      return jsonResponse({ error: "Event payload too large." }, 413);
    }
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid event payload." }, 400);
  }

  if (typeof payload !== "object" || payload === null) {
    return jsonResponse({ error: "Invalid event payload." }, 400);
  }

  const candidate = payload as Record<string, unknown>;
  const event = candidate.event;
  const context = parseChatPersistenceContext(candidate.context);
  if (typeof event !== "string" || !EVENT_NAMES.has(event as AgentEventName) || !context) {
    return jsonResponse({ error: "Invalid agent event." }, 400);
  }

  await recordAgentEvent(
    context,
    event as AgentEventName,
    sanitizeMetadata(candidate.metadata),
  );
  return new Response(null, { status: 204 });
}
