import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowCounterClockwise,
  ArrowUp,
  EnvelopeSimple,
  PlugsConnected,
  Sparkle,
} from "@phosphor-icons/react";
import { resumeProfile } from "../data/resume";
import { agentPlugins } from "../agent/plugins";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ChatResponse = {
  error?: unknown;
};

type Prompt = {
  label: string;
  value: string;
  icon: ElementType;
};

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  text: "Hey, good to see you. What's on your mind?",
};

const prompts: Prompt[] = [
  {
    label: "What is happening now?",
    value: "What are you building right now?",
    icon: Sparkle,
  },
  {
    label: "Show me the 1 ms moment",
    value: "Show me the 1 ms moment in your work.",
    icon: Sparkle,
  },
  {
    label: "What happens behind the scenes?",
    value: "Which project best shows your systems thinking, and why?",
    icon: PlugsConnected,
  },
  {
    label: "Tell me the honest version",
    value: "Give me the honest short version of your work.",
    icon: EnvelopeSimple,
  },
  {
    label: "Walk me through a project",
    value: "Walk me through one of your projects.",
    icon: PlugsConnected,
  },
];

function makeMessage(role: Message["role"], text: string): Message {
  return {
    id: `${role}-${Date.now()}`,
    role,
    text,
  };
}

function normalizeVisibleText(text: string) {
  return text.replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",");
}

function AgentMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[13px] bg-[#c26b4e] text-[#fffaf4] shadow-[0_8px_18px_-10px_rgba(169,76,48,0.8)]">
      <Sparkle size={17} weight="bold" aria-hidden="true" />
    </span>
  );
}

function renderInlineText(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }

      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        return (
          <a
            key={`${link[2]}-${index}`}
            href={link[2]}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[#c26b4e]/45 underline-offset-2 transition-colors hover:text-[#a9573d]"
          >
            {link[1]}
          </a>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
}

function MessageText({ text }: { text: string }) {
  return text.split(/\r?\n/).map((line, index) => (
    <span
      key={index}
      className="agent-message-line"
      style={{ animationDelay: `${Math.min(index * 45, 180)}ms` }}
    >
      {renderInlineText(line || " ")}
    </span>
  ));
}

function MessageBubble({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`animate-agent-message flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div className={`max-w-[88%] ${isAssistant ? "sm:max-w-[78%]" : "sm:max-w-[72%]"}`}>
        {isAssistant && (
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#9a9188]">
            <span>Haseeb&apos;s notes</span>
          </div>
        )}
        <div
          className={`rounded-[20px] px-4 py-3.5 text-[14px] leading-6 sm:px-5 ${
            isAssistant
              ? "whitespace-pre-wrap rounded-tl-[7px] border border-[#e9e2db] bg-white text-[#4e4842] shadow-[0_12px_34px_-28px_rgba(67,52,40,0.75)]"
              : "whitespace-pre-wrap rounded-tr-[7px] bg-[#352f2a] text-[#fffaf4] shadow-[0_12px_34px_-24px_rgba(43,35,29,0.8)]"
          }`}
        >
          <MessageText text={message.text} />
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="animate-agent-message flex justify-start" aria-label="Reply is on its way">
      <div className="max-w-[78%]">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#9a9188]">
          <span>Haseeb&apos;s notes</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-[20px] rounded-tl-[7px] border border-[#e9e2db] bg-white px-5 py-4 shadow-[0_12px_34px_-28px_rgba(67,52,40,0.75)]">
          <span className="animate-agent-dot h-1.5 w-1.5 rounded-full bg-[#c26b4e]" />
          <span className="animate-agent-dot h-1.5 w-1.5 rounded-full bg-[#c26b4e] [animation-delay:140ms]" />
          <span className="animate-agent-dot h-1.5 w-1.5 rounded-full bg-[#c26b4e] [animation-delay:280ms]" />
        </div>
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "Haseeb Arshad | Notes" },
    {
      name: "description",
      content:
        "A warm, grounded way into Haseeb Arshad's work and projects.",
    },
  ];
}

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const lastPrompt = useRef("");

  useEffect(() => {
    return () => {
      requestController.current?.abort();
    };
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages, isThinking]);

  const sendMessage = async (
    rawInput = input,
    { appendUser = true }: { appendUser?: boolean } = {}
  ) => {
    const value = rawInput.trim();
    if (!value || isThinking) return;

    setError(null);
    lastPrompt.current = value;
    setInput("");
    const userMessage = makeMessage("user", value);
    const conversation = appendUser ? [...messages, userMessage] : messages;
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
          messages: conversation.slice(-6).map(({ role, text }) => ({
            role,
            content: text,
          })),
        }),
      });

      if (!upstream.ok) {
        const payload = (await upstream.json().catch(() => null)) as ChatResponse | null;
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "That reply didn't come through. Try once more."
        );
      }

      if (!upstream.body) {
        throw new Error("That reply didn't come through. Try once more.");
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
          setMessages((current) => [
            ...current,
            { id: assistantId, role: "assistant", text: answer },
          ]);
          return;
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, text: answer } : message
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
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const resetConversation = () => {
    requestController.current?.abort();
    requestController.current = null;
    setMessages([welcomeMessage]);
    setInput("");
    setIsThinking(false);
    setError(null);
    lastPrompt.current = "";
    inputRef.current?.focus();
  };

  const retryLastPrompt = () => {
    if (!lastPrompt.current) return;
    setError(null);
    void sendMessage(lastPrompt.current, { appendUser: false });
  };

  const emailHref = `mailto:${resumeProfile.contact.email}?subject=${encodeURIComponent(
    "A note from your portfolio"
  )}&body=${encodeURIComponent(emailDraft.trim())}`;

  return (
    <section className="animate-blur-in pb-24 pt-2">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-6 flex flex-col gap-4 px-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#a19991]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c26b4e] opacity-35" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c26b4e]" />
              </span>
              Haseeb / field notes
            </p>
            <h1 className="mt-4 max-w-[12ch] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.07em] text-[#332e29]">
              The work, in motion.
            </h1>
          </div>
          <p className="max-w-[18rem] text-[13px] leading-6 text-[#81776e] sm:pb-1">
            A small window into the systems, experiments, and decisions behind the work.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[31px] border border-[#e6ded6] bg-[#f5f1ed] shadow-[0_28px_80px_-46px_rgba(79,57,42,0.55)]">
          <div className="flex items-center justify-between border-b border-[#e6ded6] px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <AgentMark />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium tracking-[-0.01em] text-[#3a342e]">
                  Haseeb&apos;s notes
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#a19991]">
                  Ready when you are
                  <span className="h-1 w-1 rounded-full bg-[#c26b4e]" aria-hidden="true" />
                  Published work
                </p>
              </div>
            </div>

            <div className="relative flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowEmailComposer((open) => !open);
                  setShowConnections(false);
                }}
                className="press inline-flex items-center gap-1.5 rounded-full border border-[#ded5cc] bg-[#faf8f5] px-3 py-2 text-[11px] text-[#756d65] transition-colors hover:border-[#c9b9ab] hover:text-[#514941] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]"
              >
                <EnvelopeSimple size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Write a note</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConnections((open) => !open);
                  setShowEmailComposer(false);
                }}
                aria-expanded={showConnections}
                aria-controls="agent-connections"
                aria-label="Show connections"
                className="press grid h-9 w-9 place-items-center rounded-full border border-[#ded5cc] bg-[#faf8f5] text-[#756d65] transition-colors hover:border-[#c9b9ab] hover:text-[#514941] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]"
              >
                <PlugsConnected size={16} aria-hidden="true" />
              </button>
              {showConnections && (
                <div
                  id="agent-connections"
                  role="dialog"
                  aria-label="Connections"
                  className="animate-agent-pop absolute right-0 top-12 z-20 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-[#ded5cc] bg-[#fffdfa] p-4 shadow-[0_20px_50px_-24px_rgba(67,52,40,0.55)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#514941]">Connections</p>
                    <button type="button" onClick={() => setShowConnections(false)} className="text-[11px] text-[#9a9188] underline underline-offset-2 hover:text-[#514941]">Close</button>
                  </div>
                  <div className="mt-3 divide-y divide-[#eee8e2]">
                    {agentPlugins.map((plugin) => (
                      <div key={plugin.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${plugin.status === "ready" ? "bg-[#6f9a75]" : "bg-[#c6a36b]"}`} aria-hidden="true" />
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <p className="text-[12px] font-medium text-[#514941]">{plugin.label}</p>
                            <span className="text-[10px] uppercase tracking-[0.12em] text-[#a19991]">{plugin.status === "ready" ? "Ready" : "Needs setup"}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-5 text-[#81776e]">{plugin.description}</p>
                          <p className="mt-0.5 text-[10px] leading-4 text-[#aaa097]">{plugin.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-[#eee8e2] pt-3 text-[10px] leading-4 text-[#a19991]">External messages always wait for a visible click.</p>
                </div>
              )}
            </div>
          </div>

          <div
            ref={feedRef}
            className="agent-noise flex min-h-[390px] max-h-[min(58dvh,640px)] flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-7 sm:py-8"
            aria-live="polite"
            aria-label="Messages"
          >
            {messages.length === 0 ? (
              <div className="m-auto max-w-[18rem] text-center">
                <p className="text-sm font-medium text-[#514941]">Nothing here yet.</p>
                <p className="mt-2 text-[13px] leading-6 text-[#8e857c]">Choose a thread below and let it unfold.</p>
              </div>
            ) : (
              messages.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
            {isThinking && <ThinkingBubble />}
          </div>

          <div className="border-t border-[#e6ded6] bg-[#f8f5f1] p-4 sm:p-5">
            {showEmailComposer && (
              <div className="animate-agent-pop mb-4 rounded-2xl border border-[#e4d8cf] bg-[#fffdfa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#514941]">Write a note to Haseeb</p>
                    <p className="mt-1 text-[11px] text-[#9a9188]">Your mail app will open with a draft. Nothing sends from this page.</p>
                  </div>
                  <button type="button" onClick={() => setShowEmailComposer(false)} className="text-[11px] text-[#9a9188] underline underline-offset-2 hover:text-[#514941]">Close</button>
                </div>
                <textarea
                  value={emailDraft}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  rows={3}
                  placeholder="A thought, an idea, or a project you want to talk about..."
                  className="mt-3 w-full resize-none rounded-xl border border-[#e1d7cf] bg-white px-3 py-2.5 text-[13px] leading-5 text-[#3a342e] outline-none placeholder:text-[#b0a69c] focus:border-[#bc8069] focus:shadow-[0_0_0_3px_rgba(194,107,78,0.1)]"
                />
                <a href={emailHref} className="press mt-3 inline-flex items-center gap-2 rounded-full bg-[#352f2a] px-3.5 py-2 text-[11px] font-medium text-[#fffaf4] transition-colors hover:bg-[#514941] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]">
                  <EnvelopeSimple size={14} aria-hidden="true" />
                  Open mail app
                </a>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#a19991]">A few good places to start</p>
              <p className="hidden text-[11px] text-[#aaa097] sm:block">Enter to send · Shift + Enter for a new line</p>
            </div>

            <div className="agent-prompt-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
              {prompts.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={prompt.value}
                    type="button"
                    disabled={isThinking}
                    onClick={() => void sendMessage(prompt.value)}
                    className="press inline-flex shrink-0 items-center gap-2 rounded-full border border-[#ded5cc] bg-[#fcfaf7] px-3 py-2 text-left text-[11px] text-[#756d65] transition-colors hover:border-[#c9b9ab] hover:bg-white hover:text-[#514941] disabled:cursor-wait disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]"
                  >
                    <Icon size={14} weight="regular" className="text-[#c26b4e]" aria-hidden="true" />
                    {prompt.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#e7c9bc] bg-[#fff6f1] px-3.5 py-3 text-[12px] text-[#9b513b]" role="alert">
                <span>{error}</span>
                <button type="button" onClick={retryLastPrompt} className="shrink-0 font-medium underline underline-offset-2 hover:text-[#6f392a]">Retry</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <label htmlFor="agent-question" className="sr-only">Write to Haseeb&apos;s notes</label>
              <textarea
                ref={inputRef}
                id="agent-question"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Send a thought..."
                disabled={isThinking}
                className="min-h-12 w-full resize-none rounded-[18px] border border-[#dcd2c8] bg-white py-3.5 pl-4 pr-14 text-[14px] leading-5 text-[#3a342e] outline-none transition-[border-color,box-shadow] placeholder:text-[#ada39a] focus:border-[#bc8069] focus:shadow-[0_0_0_3px_rgba(194,107,78,0.11)] disabled:cursor-wait disabled:bg-[#f2ede8]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                aria-label="Send message"
                className="press absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-[13px] bg-[#c26b4e] text-[#fffaf4] transition-[background-color,opacity,transform] hover:bg-[#a9573d] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]"
              >
                <ArrowUp size={17} weight="bold" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] leading-5 text-[#aaa097]">Replies stay within the work Haseeb has chosen to share.</p>
              <button type="button" onClick={resetConversation} aria-label="Reset messages" className="press inline-flex shrink-0 items-center gap-1.5 text-[11px] text-[#aaa097] transition-colors hover:text-[#514941] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]">
                <ArrowCounterClockwise size={13} aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
