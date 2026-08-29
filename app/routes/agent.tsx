import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import {
  ArrowCounterClockwise,
  ArrowRight,
  ArrowUp,
  Briefcase,
  Code,
  EnvelopeSimple,
  Sparkle,
} from "@phosphor-icons/react";
import { resumeProfile } from "../data/resume";
import { BlurIn } from "../components/header";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ChatResponse = {
  answer?: unknown;
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
  text:
    "Hey — I’m Haseeb’s on-page agent. Ask me about the work, the projects, the systems behind them, or how to get in touch. I’ll keep the conversation grounded in the public resume.",
};

const prompts: Prompt[] = [
  {
    label: "What are you building now?",
    value: "What are you building right now?",
    icon: Briefcase,
  },
  {
    label: "Give me the short version",
    value: "Give me the short version of your work.",
    icon: Sparkle,
  },
  {
    label: "Which projects matter?",
    value: "Which projects are you most excited about?",
    icon: Code,
  },
  {
    label: "How can I reach you?",
    value: "How can I get in touch?",
    icon: EnvelopeSimple,
  },
];

const scope = [
  ["Work", resumeProfile.experience.map((job) => job.company).join(", ")],
  ["Builds", "AI agents, microservices, GTM and lead-generation systems"],
  ["Now", "Reasoning loops, RAG, MCP, and workflow automation"],
  ["Projects", resumeProfile.projects.map((project) => project.name).join(", ")],
] as const;

function makeMessage(role: Message["role"], text: string): Message {
  return {
    id: `${role}-${Date.now()}`,
    role,
    text,
  };
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
    <span key={`${line}-${index}`}>
      {index > 0 && <br />}
      {renderInlineText(line)}
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
            <span>Haseeb&apos;s agent</span>
            <span className="h-1 w-1 rounded-full bg-[#c26b4e]" aria-hidden="true" />
            <span>Resume context</span>
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
    <div className="animate-agent-message flex justify-start" aria-label="Agent is thinking">
      <div className="max-w-[78%]">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#9a9188]">
          <span>Haseeb&apos;s agent</span>
          <span className="h-1 w-1 rounded-full bg-[#c26b4e]" aria-hidden="true" />
          <span>Thinking</span>
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
    { title: "Agent · Haseeb Arshad" },
    {
      name: "description",
      content:
        "Have a grounded conversation about Haseeb Arshad's work, projects, and current focus.",
    },
  ];
}

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          messages: conversation.slice(-8).map(({ role, text }) => ({
            role,
            content: text,
          })),
        }),
      });
      const payload = (await upstream.json().catch(() => null)) as ChatResponse | null;

      if (!upstream.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "The live model could not answer right now. Please try again."
        );
      }

      if (typeof payload?.answer !== "string" || !payload.answer.trim()) {
        throw new Error("The live model returned an empty answer. Please try again.");
      }

      setMessages((current) => [...current, makeMessage("assistant", payload.answer as string)]);
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "The live model is unavailable right now. Please try again."
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

  return (
    <section className="animate-blur-in pb-24 pt-2">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-14">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <BlurIn delay={80}>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#a19991]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c26b4e] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c26b4e]" />
              </span>
              Personal agent / online
            </div>
          </BlurIn>

          <BlurIn delay={150}>
            <h1 className="mt-5 max-w-[11ch] text-[clamp(2.7rem,6vw,4.8rem)] leading-[0.96] tracking-[-0.065em] text-[#332e29]">
              Ask the part of me that keeps the notes.
            </h1>
            <p className="mt-6 max-w-[31rem] text-[15px] leading-7 text-[#756d65]">
              A conversational layer over the work, experiments, and ideas I&apos;ve
              chosen to make public. Ask naturally. I&apos;ll give you the useful
              version, with the edges left intact.
            </p>
          </BlurIn>

          <BlurIn delay={240}>
            <div className="mt-10 border-t border-[#e9e2db]">
              <div className="flex items-center justify-between gap-4 border-b border-[#e9e2db] py-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#9a9188]">
                  The scope
                </p>
                <span className="font-mono text-[10px] text-[#b0a69c]">01 / 01</span>
              </div>
              <ul className="divide-y divide-[#e9e2db]">
                {scope.map(([label, value]) => (
                  <li key={label} className="grid grid-cols-[4.5rem_1fr] gap-3 py-4">
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#a19991]">
                      {label}
                    </span>
                    <span className="text-[13px] leading-5 text-[#625a53]">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurIn>

          <BlurIn delay={320}>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[13px]">
              <Link
                to="/work"
                className="press group inline-flex items-center gap-1.5 text-[#514941] transition-colors hover:text-[#c26b4e]"
              >
                Read the work
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                to="/connect"
                className="press group inline-flex items-center gap-1.5 text-[#8b8178] transition-colors hover:text-[#514941]"
              >
                Contact Haseeb
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                to="/resume"
                className="press group inline-flex items-center gap-1.5 text-[#8b8178] transition-colors hover:text-[#514941]"
              >
                View resume
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </BlurIn>
        </div>

        <BlurIn delay={120}>
          <div className="relative overflow-hidden rounded-[29px] border border-[#e6ded6] bg-[#f5f1ed] shadow-[0_28px_80px_-46px_rgba(79,57,42,0.55)]">
            <div className="flex items-center justify-between border-b border-[#e6ded6] px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <AgentMark />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium tracking-[-0.01em] text-[#3a342e]">
                    Haseeb&apos;s agent
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#a19991]">
                    Resume-grounded
                    <span className="h-1 w-1 rounded-full bg-[#c26b4e]" aria-hidden="true" />
                    No private data
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetConversation}
                className="press inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#ded5cc] bg-[#faf8f5] px-3 py-2 text-[11px] text-[#8e857c] transition-colors hover:border-[#cfc3b8] hover:text-[#514941] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]"
              >
                <ArrowCounterClockwise size={14} aria-hidden="true" />
                Reset
              </button>
            </div>

            <div
              ref={feedRef}
              className="agent-noise flex min-h-[390px] max-h-[min(58dvh,640px)] flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7"
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.length === 0 ? (
                <div className="m-auto max-w-[18rem] text-center">
                  <p className="text-sm font-medium text-[#514941]">Nothing here yet.</p>
                  <p className="mt-2 text-[13px] leading-6 text-[#8e857c]">
                    Start with one of the prompts below and the conversation will find its shape.
                  </p>
                </div>
              ) : (
                messages.map((message) => <MessageBubble key={message.id} message={message} />)
              )}
              {isThinking && <ThinkingBubble />}
            </div>

            <div className="border-t border-[#e6ded6] bg-[#f8f5f1] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a19991]">Try asking</p>
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
                  <button
                    type="button"
                    onClick={retryLastPrompt}
                    className="shrink-0 font-medium underline underline-offset-2 hover:text-[#6f392a]"
                  >
                    Retry
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative">
                <label htmlFor="agent-question" className="sr-only">
                  Ask Haseeb&apos;s agent a question
                </label>
                <textarea
                  ref={inputRef}
                  id="agent-question"
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask something about Haseeb…"
                  disabled={isThinking}
                  className="min-h-12 w-full resize-none rounded-[18px] border border-[#dcd2c8] bg-white py-3.5 pl-4 pr-14 text-[14px] leading-5 text-[#3a342e] outline-none transition-[border-color,box-shadow] placeholder:text-[#ada39a] focus:border-[#bc8069] focus:shadow-[0_0_0_3px_rgba(194,107,78,0.11)] disabled:cursor-wait disabled:bg-[#f2ede8]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  aria-label="Send question"
                  className="press absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-[13px] bg-[#c26b4e] text-[#fffaf4] transition-[background-color,opacity,transform] hover:bg-[#a9573d] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c26b4e]"
                >
                  <ArrowUp size={17} weight="bold" aria-hidden="true" />
                </button>
              </form>

              <p className="mt-3 text-[11px] leading-5 text-[#aaa097]">
                This agent answers from the public resume and will say when a question falls outside it. The OpenRouter key stays on the server.
              </p>
            </div>
          </div>
        </BlurIn>
      </div>
    </section>
  );
}
