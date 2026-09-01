import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ReplyActions,
  replyActions,
  type ProjectLink,
} from "./reply-actions";

/* ───────────────────────────────────────────────────────────
   A single search box that unfolds into a conversation.

   Used twice with different copy: `generalAgent` on the home
   page, where anything is fair game, and `cvAgent` at the foot
   of the résumé, where the openers point at the document above
   it. Topic routing happens server-side from the question
   itself, so the only real difference here is the framing.

   Styled against the site's own palette (white, gray-100/200
   hairlines, gray-900 ink) rather than the warmer /agent page,
   so it reads as part of the page and not a widget dropped on
   top of it.
   ─────────────────────────────────────────────────────────── */

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  /* One animation delay per word, frozen at the moment that word arrives.
     Words that land together in a single streamed chunk get a rising
     stagger, and the next chunk starts its own run. Frozen rather than
     derived, because recomputing the delay of a word already on screen
     would restart its animation under it. */
  delays: number[];
};

type ChatResponse = { error?: unknown };

const MAX_TURNS = 6;
const STAGGER_STEP = 26;
const STAGGER_CAP = 260;

/* Give every newly arrived word a delay, counting from the start of its own
   batch. Words already on screen keep the delay they were born with. */
function extendDelays(previous: number[], wordCount: number) {
  if (wordCount <= previous.length) return previous;

  const next = previous.slice();
  const base = previous.length;
  for (let index = base; index < wordCount; index++) {
    next.push(Math.min((index - base) * STAGGER_STEP, STAGGER_CAP));
  }
  return next;
}

/* Bold and links, matched as whole units so each animates as one word. */
const SEGMENT_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
const LINK_RE = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/;

function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function normalizeVisibleText(text: string) {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    // Collapsing the dash can leave a doubled space behind.
    .replace(/[ \t]{2,}/g, " ");
}

function makeMessage(role: Message["role"], text: string): Message {
  return {
    id: `${role}-${Date.now()}`,
    role,
    text,
    delays: extendDelays([], countWords(text)),
  };
}

export type AgentPrompt = { label: string; value: string };

export type AgentBoxConfig = {
  /* The visible label is sr-only but still needs a unique target. */
  inputId: string;
  heading: string;
  welcome: string;
  /* Goblin is the default, so this is the line most visitors actually see. */
  goblinWelcome: string;
  placeholder: string;
  prompts: AgentPrompt[];
};

/* Home page. Nothing is out of scope, so the openers spread across current
   work, projects, history, and the person. */
export const generalAgent: AgentBoxConfig = {
  inputId: "ask-general",
  heading: "Ask my agent anything :)",
  welcome:
    "Ask me anything. The work, the projects, or the person behind them. I'll say so plainly when something isn't on record.",
  goblinWelcome:
    "You have landed in the wordy mode, which is switched on by default because nobody stopped me. Ask about the work, the projects, or the man behind them. I will not invent a single thing, however much better the story would be. :)",
  placeholder: "Ask me anything...",
  prompts: [
    {
      label: "What are you building?",
      value: "What are you building right now?",
    },
    {
      label: "Walk me through a project",
      value: "Walk me through one of your projects.",
    },
    {
      label: "Where have you worked?",
      value: "Where have you worked, and what did you do there?",
    },
    {
      label: "Outside of work",
      value: "What do you do when you're not working?",
    },
  ],
};

/* Foot of the résumé. The openers point at the document above them. */
export const cvAgent: AgentBoxConfig = {
  inputId: "ask-cv",
  heading: "Ask my agent anything :)",
  welcome:
    "Ask me anything about this résumé. I answer from work that actually shipped, and I'll say so plainly when something isn't on record.",
  goblinWelcome:
    "Everything above is the tidy version. Ask me about any line of it and you will get the longer, more honest one. Still true, just less well behaved. :)",
  placeholder: "Ask about the work above...",
  prompts: [
    {
      label: "The 1 ms moment",
      value: "What is the 1 ms retrieval in your work, and how did you get there?",
    },
    {
      label: "Summon Electronics",
      value: "Walk me through what you own at Summon Electronics.",
    },
    {
      label: "The auth service",
      value: "How did you build the authentication service, and why that way?",
    },
    {
      label: "Systems thinking",
      value: "Which project best shows your systems thinking, and why?",
    },
  ],
};

/* Said once, when the visitor flips the switch. Fixed text, because it is a
   UI affordance rather than an answer. */
const GOBLIN_GREETING =
  "Very well. You have found the switch, and I have no dignity left to protect. Ask me something. I will still tell you the truth, which is the only part of this I take seriously.";

const PLAIN_GREETING = "Plain mode. Shorter answers, same facts.";

/* Goblin is on unless the visitor turns it off. */
const GOBLIN_BY_DEFAULT = true;

function welcomeMessageFor(text: string): Message {
  return {
    id: "welcome",
    role: "assistant",
    text,
    delays: extendDelays([], countWords(text)),
  };
}

/* ─── One animated word ─── */
function Word({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <span className="agent-word" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </span>
  );
}

/* ─── Message body: lines → segments → words ───
   Keys are the running word index, so words already on screen keep their DOM
   node (and stay still) while newly streamed ones mount and animate in. */
function MessageText({
  text,
  delays,
  tone,
}: {
  text: string;
  delays: number[];
  tone: "assistant" | "user";
}) {
  let cursor = 0;

  return (
    <>
      {text.split(/\r?\n/).map((line, lineIndex) => {
        const nodes: ReactNode[] = [];

        for (const segment of line.split(SEGMENT_RE)) {
          if (!segment) continue;

          const link = segment.match(LINK_RE);
          if (link) {
            const index = cursor++;
            nodes.push(
              <Word key={`l${index}`} delay={delays[index] ?? 0}>
                <a
                  href={link[2]}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    tone === "assistant"
                      ? "underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-600"
                      : "underline decoration-white/40 underline-offset-2 transition-colors hover:decoration-white"
                  }
                >
                  {link[1]}
                </a>
              </Word>
            );
            continue;
          }

          if (
            segment.length > 4 &&
            segment.startsWith("**") &&
            segment.endsWith("**")
          ) {
            const index = cursor++;
            nodes.push(
              <Word key={`b${index}`} delay={delays[index] ?? 0}>
                <strong
                  className={
                    tone === "assistant"
                      ? "font-medium text-gray-900"
                      : "font-medium"
                  }
                >
                  {segment.slice(2, -2)}
                </strong>
              </Word>
            );
            continue;
          }

          /* Split on whitespace but keep it: separators are emitted as plain
             text nodes so the inline-block words still wrap normally. */
          for (const token of segment.split(/(\s+)/)) {
            if (!token) continue;
            if (/^\s+$/.test(token)) {
              nodes.push(token);
              continue;
            }
            const index = cursor++;
            nodes.push(
              <Word key={`w${index}`} delay={delays[index] ?? 0}>
                {token}
              </Word>
            );
          }
        }

        return (
          <span key={lineIndex} className="block">
            {nodes.length > 0 ? nodes : " "}
          </span>
        );
      })}
    </>
  );
}

/* ─── Bubbles ─── */
function Bubble({
  message,
  showActions,
  projectLinks,
}: {
  message: Message;
  showActions: boolean;
  projectLinks: readonly ProjectLink[];
}) {
  const isAssistant = message.role === "assistant";
  const actions = useMemo(
    () => (showActions ? replyActions(message.text, projectLinks) : []),
    [showActions, message.text, projectLinks]
  );

  return (
    <div
      className={`agent-bubble-in flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div className="max-w-[90%] sm:max-w-[76%]">
        {isAssistant && (
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
            Haseeb
          </p>
        )}
        <div
          className={
            isAssistant
              ? "rounded-2xl rounded-tl-md border border-gray-100 bg-gray-50/80 px-4 py-3 text-[14px] leading-6 text-gray-700"
              : "rounded-2xl rounded-tr-md bg-gray-900 px-4 py-3 text-[14px] leading-6 text-white"
          }
        >
          <MessageText
            text={message.text}
            delays={message.delays}
            tone={message.role}
          />
        </div>
        {isAssistant && <ReplyActions actions={actions} />}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div
      className="agent-bubble-in flex justify-start"
      aria-label="Reply is on its way"
    >
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
          Haseeb
        </p>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-gray-100 bg-gray-50/80 px-4 py-4">
          <span className="animate-agent-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
          <span className="animate-agent-dot h-1.5 w-1.5 rounded-full bg-gray-400 [animation-delay:140ms]" />
          <span className="animate-agent-dot h-1.5 w-1.5 rounded-full bg-gray-400 [animation-delay:280ms]" />
        </div>
      </div>
    </div>
  );
}

export default function AgentBox({
  config,
  projectLinks = [],
}: {
  config: AgentBoxConfig;
  projectLinks?: readonly ProjectLink[];
}) {
  const { inputId, heading, welcome, goblinWelcome, placeholder, prompts } =
    config;

  const [open, setOpen] = useState(false);
  const [goblin, setGoblin] = useState(GOBLIN_BY_DEFAULT);
  const [messages, setMessages] = useState<Message[]>(() => [
    welcomeMessageFor(GOBLIN_BY_DEFAULT ? goblinWelcome : welcome),
  ]);
  /* While a reply is still arriving its action chips would flicker in and out
     as entity names appear, so they wait for the stream to finish. */
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const lastPrompt = useRef("");

  useEffect(() => {
    return () => requestController.current?.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages, isThinking, open]);

  const sendMessage = async (
    rawInput = input,
    { appendUser = true }: { appendUser?: boolean } = {}
  ) => {
    const value = rawInput.trim();
    if (!value || isThinking) return;

    setOpen(true);
    setError(null);
    lastPrompt.current = value;
    setInput("");

    const conversation = appendUser
      ? [...messages, makeMessage("user", value)]
      : messages;
    if (appendUser) setMessages(conversation);
    setIsThinking(true);

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;

    try {
      const upstream = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goblin,
          messages: conversation.slice(-MAX_TURNS).map(({ role, text }) => ({
            role,
            content: text,
          })),
        }),
      });

      if (!upstream.ok) {
        const payload = (await upstream
          .json()
          .catch(() => null)) as ChatResponse | null;
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "That reply did not come through. Try once more."
        );
      }

      if (!upstream.body) {
        throw new Error("That reply did not come through. Try once more.");
      }

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = `assistant-${Date.now()}`;
      let answer = "";
      let hasStarted = false;

      const appendChunk = (chunk: string) => {
        if (!chunk) return;
        answer = normalizeVisibleText(answer + chunk);

        if (!hasStarted) {
          hasStarted = true;
          setIsThinking(false);
          setStreamingId(assistantId);
          setMessages((current) => [
            ...current,
            {
              id: assistantId,
              role: "assistant",
              text: answer,
              delays: extendDelays([], countWords(answer)),
            },
          ]);
          return;
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  text: answer,
                  delays: extendDelays(message.delays, countWords(answer)),
                }
              : message
          )
        );
      };

      try {
        while (true) {
          const { value: chunk, done } = await reader.read();
          if (done) break;
          appendChunk(decoder.decode(chunk, { stream: true }));
        }
        appendChunk(decoder.decode());
      } catch (streamError) {
        setMessages((current) =>
          current.filter((message) => message.id !== assistantId)
        );
        throw streamError;
      }

      if (!answer.trim()) {
        throw new Error("That reply came back empty. Try once more.");
      }
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "The conversation is unavailable for a moment. Try again shortly."
      );
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setIsThinking(false);
        setStreamingId(null);
      }
    }
  };

  const setMode = (next: boolean) => {
    if (next === goblin) return;
    setGoblin(next);

    /* Say so, rather than changing voice silently under the visitor. */
    setOpen(true);
    setMessages((current) => [
      ...current,
      makeMessage("assistant", next ? GOBLIN_GREETING : PLAIN_GREETING),
    ]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const resetConversation = () => {
    requestController.current?.abort();
    requestController.current = null;
    setMessages([
      welcomeMessageFor(GOBLIN_BY_DEFAULT ? goblinWelcome : welcome),
    ]);
    setGoblin(GOBLIN_BY_DEFAULT);
    setStreamingId(null);
    setInput("");
    setIsThinking(false);
    setError(null);
    lastPrompt.current = "";
    inputRef.current?.focus();
  };

  return (
    <section className="pb-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {heading}
        </h3>

        <div className="flex items-center gap-3">
          {/* Two named states rather than a switch. A switch makes you guess
              what the off position is; this shows both and borrows the
              sliding pill the site nav already uses. */}
          <div
            role="group"
            aria-label="Answer style"
            title="Goblin is wordier and funnier. Same facts either way."
            className="relative flex rounded-full border border-gray-200 bg-gray-50 p-0.5"
          >
            <span
              aria-hidden="true"
              className="absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-2px)] rounded-full bg-gray-900 shadow-sm transition-transform duration-[380ms] ease-[var(--ease-out)]"
              style={{
                transform: goblin ? "translateX(100%)" : "translateX(0)",
              }}
            />
            {[
              { label: "Plain", value: false },
              { label: "Goblin", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setMode(option.value)}
                aria-pressed={goblin === option.value}
                className={`press relative z-10 w-[68px] rounded-full py-1 text-[11px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                  goblin === option.value
                    ? "font-medium text-white"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {open && (
            <button
              type="button"
              onClick={resetConversation}
              className="press text-[12px] text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Conversation. Stays mounted at 0fr so the first open has a frame to
            transition from; `inert` keeps it out of the tab order and off the
            accessibility tree until it is actually on screen. */}
        <div className="agent-panel" data-open={open} inert={!open}>
          <div className="overflow-hidden">
            <div
              ref={feedRef}
              aria-live="polite"
              aria-label="Conversation"
              className="flex max-h-[min(52vh,440px)] flex-col gap-5 overflow-y-auto border-b border-gray-100 px-4 py-5 sm:px-5"
            >
              {messages.map((message) => (
                <Bubble
                  key={message.id}
                  message={message}
                  projectLinks={projectLinks}
                  showActions={
                    message.role === "assistant" && message.id !== streamingId
                  }
                />
              ))}
              {isThinking && <ThinkingBubble />}
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-[12px] text-gray-600 sm:px-5"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                if (!lastPrompt.current) return;
                setError(null);
                void sendMessage(lastPrompt.current, { appendUser: false });
              }}
              className="shrink-0 font-medium text-gray-900 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative p-2.5">
          <label htmlFor={inputId} className="sr-only">
            Ask a question
          </label>
          <textarea
            ref={inputRef}
            id={inputId}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isThinking}
            className="min-h-11 w-full resize-none rounded-xl bg-transparent py-2.5 pl-2.5 pr-12 text-[14px] leading-5 text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-wait disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            aria-label="Send message"
            className="press absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.value}
            type="button"
            disabled={isThinking}
            onClick={() => void sendMessage(prompt.value)}
            className="press rounded-full border border-gray-200 px-3 py-1.5 text-[12px] text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-wait disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            {prompt.label}
          </button>
        ))}
      </div>

    </section>
  );
}
