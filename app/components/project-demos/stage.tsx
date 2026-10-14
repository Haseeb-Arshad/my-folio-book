import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ───────────────────────────────────────────────────────────
   A project demo is a short scripted scene: a list of cues, each
   advancing `step` by one, and a Scene that draws whatever that
   step should show. The stage owns the clock, so scenes stay pure
   functions of `step`.

   Before it plays, and for anyone who prefers reduced motion, the
   stage holds the finished frame. That frame tells the whole story
   on its own, so server render, no-JS and reduced motion all get a
   complete picture rather than an empty box.
   ─────────────────────────────────────────────────────────── */

export type SceneProps = {
  step: number;
  /* true while holding the finished frame: typing and counters jump to
     their end values instead of animating */
  still: boolean;
};

export type Cue = {
  at: number;
  /* the caption chapter this cue opens */
  chapter?: number;
};

export type Demo = {
  /* read in place of the animation by screen readers */
  label: string;
  chapters: string[];
  cues: Cue[];
  /* how long the finished frame stays up before the loop restarts */
  hold?: number;
  /* spans both grid columns, for scenes that read left to right */
  wide?: boolean;
  /* stage height classes, for a scene that needs more room than a card */
  height?: string;
  dark?: boolean;
  /* stage background, for products with a paper or map look of their own */
  surface?: string;
  Scene: ComponentType<SceneProps>;
};

const CLEAR_MS = 280;
const SETTLE_MS = 450;

export function DemoStage({ demo }: { demo: Demo }) {
  const ref = useRef<HTMLDivElement>(null);
  const finalStep = demo.cues.length;
  const [step, setStep] = useState(finalStep);
  const [still, setStill] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };
    const stop = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    /* Fade the frame out, reset while it is invisible, then play. Every
       loop, and every return into view, starts from the first beat. */
    const restart = () => {
      stop();
      setClearing(true);
      later(CLEAR_MS, () => {
        setStill(false);
        setStep(0);
      });
      later(CLEAR_MS + SETTLE_MS, play);
    };
    const play = () => {
      setClearing(false);
      demo.cues.forEach((cue, i) => later(cue.at, () => setStep(i + 1)));
      const last = demo.cues[demo.cues.length - 1]?.at ?? 0;
      later(last + (demo.hold ?? 2600), restart);
    };

    /* The margin starts the reset just before the card scrolls in, so the
       visitor lands on the first beat rather than watching it clear. */
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? restart() : stop()),
      { rootMargin: "80px 0px" }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [demo]);

  const chapter = useMemo(() => {
    let current = 0;
    for (let i = 0; i < step; i++) {
      const next = demo.cues[i]?.chapter;
      if (next !== undefined) current = next;
    }
    return current;
  }, [demo, step]);

  const { Scene } = demo;
  const surface = demo.dark
    ? `${demo.surface ?? "bg-[#141414]"} border-black/5`
    : `${demo.surface ?? "bg-gray-50"} border-gray-100`;
  const idle = demo.dark ? "text-gray-600" : "text-gray-400";
  const active = demo.dark ? "text-gray-200" : "text-gray-900";

  return (
    <div
      ref={ref}
      role="img"
      aria-label={demo.label}
      className={`@container relative ${demo.height ?? "h-[220px] sm:h-[236px]"} overflow-hidden rounded-xl border ${surface}`}
    >
      <div aria-hidden className="demo-scene absolute inset-0" data-clearing={clearing}>
        <Scene step={step} still={still} />
      </div>

      <div
        aria-hidden
        className="absolute inset-x-3.5 bottom-2.5 text-[11px] whitespace-nowrap"
      >
        {/* Narrow stages show progress and the current chapter only. */}
        <div className="flex items-center gap-2 @sm:hidden">
          <span className="flex gap-1">
            {demo.chapters.map((c, i) => (
              <span
                key={c}
                className={`h-1 w-3 rounded-full transition-colors duration-300 ${
                  i <= chapter
                    ? demo.dark
                      ? "bg-gray-300"
                      : "bg-gray-800"
                    : demo.dark
                      ? "bg-gray-700"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </span>
          <span className={active}>{demo.chapters[chapter]}</span>
        </div>
        <ol className="hidden @sm:flex gap-3.5">
          {demo.chapters.map((c, i) => (
            <li
              key={c}
              className={`transition-colors duration-300 ${i === chapter ? active : idle}`}
            >
              {c}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* Fades and lifts in when `on` turns true. */
export function Appear({
  on,
  inline,
  className = "",
  style,
  children,
}: {
  on: boolean;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  /* A transform does nothing on a plain inline box, so inline appears are
     inline-flex. */
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={`demo-appear ${inline ? "inline-flex items-center" : ""} ${className}`}
      style={style}
      data-on={on}
    >
      {children}
    </Tag>
  );
}

/* Types `text` out once `on` turns true. */
export function Typed({
  text,
  on,
  still,
  speed = 28,
  caret,
}: {
  text: string;
  on: boolean;
  still: boolean;
  speed?: number;
  caret?: boolean;
}) {
  const [count, setCount] = useState(still ? text.length : 0);

  useEffect(() => {
    if (still) {
      setCount(text.length);
      return;
    }
    if (!on) {
      setCount(0);
      return;
    }
    let typed = 0;
    setCount(0);
    const id = window.setInterval(() => {
      typed += 1;
      setCount(typed);
      if (typed >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [on, still, text, speed]);

  const typing = caret && on && !still && count < text.length;
  return (
    <>
      {text.slice(0, count)}
      {typing && <span className="demo-caret">▍</span>}
    </>
  );
}

/* Counts from `from` to `to` once `on` turns true. */
export function Count({
  from,
  to,
  on,
  still,
  ms = 900,
  linear,
  format = String,
}: {
  from: number;
  to: number;
  on: boolean;
  still: boolean;
  ms?: number;
  /* clocks tick evenly; scores ease out */
  linear?: boolean;
  format?: (value: number) => string;
}) {
  const [value, setValue] = useState(still ? to : from);

  useEffect(() => {
    if (still) {
      setValue(to);
      return;
    }
    if (!on) {
      setValue(from);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = linear ? t : 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [on, still, from, to, ms, linear]);

  return <span className="tabular-nums">{format(value)}</span>;
}
