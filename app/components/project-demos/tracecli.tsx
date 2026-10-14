import { Appear, Count, Typed, type Demo, type SceneProps } from "./stage";

/* TraceCLI, using its real commands: a goal-bound focus session, the
   alert when you drift to a distracting app, and a plain-language
   question over your own tracked history. */

const FOCUS = 'tracecli focus --duration 25 --goal "Auth flow"';
const ASK = 'tracecli ask "What was my most used app on Monday?"';

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function Prompt() {
  return <span className="text-gray-500">$ </span>;
}

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;

  return (
    <div className="absolute inset-x-4 top-4 bottom-10 font-mono text-[11px] leading-[1.6] text-gray-300 @sm:text-[11.5px] @sm:leading-[1.7] [overflow-wrap:anywhere]">
      <p>
        <Prompt />
        <Typed text={FOCUS} on={on(1)} still={still} speed={24} caret />
      </p>
      <Appear on={on(2)}>
        <p className="text-emerald-400">
          ● focus · Auth flow ·{" "}
          <Count
            from={1500}
            to={1496}
            on={on(2)}
            still={still}
            ms={1500}
            linear
            format={clock}
          />{" "}
          left
        </p>
      </Appear>
      <Appear on={on(3)}>
        <p className="text-amber-300">! Switched to YouTube. Back to "Auth flow"?</p>
      </Appear>
      <Appear on={on(4)}>
        <p className="mt-1.5">
          <Prompt />
          <Typed text={ASK} on={on(4)} still={still} speed={24} caret />
        </p>
      </Appear>
      <Appear on={on(5)}>
        <p className="text-gray-100">→ VS Code, 4h 12m. Then Chrome, 1h 47m.</p>
      </Appear>
    </div>
  );
}

export const tracecli: Demo = {
  label:
    "Animated terminal demo: a TraceCLI focus session starts, it flags a switch to YouTube, then answers a question about the most used app on Monday.",
  chapters: ["Start a focus session", "Catch the drift", "Ask your history"],
  cues: [
    { at: 200 },
    { at: 1700 },
    { at: 3200, chapter: 1 },
    { at: 4300, chapter: 2 },
    { at: 5900 },
  ],
  dark: true,
  Scene,
};
