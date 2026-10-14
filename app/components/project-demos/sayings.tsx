import { Check, Microphone } from "@phosphor-icons/react";
import { Appear, Count, Typed, type Demo, type SceneProps } from "./stage";

/* Sayings: you speak instead of typing, and the post comes back
   transcribed, read for emotion, and tagged with its topics. */

const LINE = "Finally shipped the thing I was scared of for months.";
/* Offsets so the bars of the waveform never move in step. */
const BARS = [0.1, 0.35, 0.2, 0.5, 0.05, 0.4, 0.25, 0.55, 0.15, 0.45, 0.3, 0.6, 0.12, 0.38, 0.22, 0.5, 0.08, 0.42];

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const recording = on(1) && !on(2) && !still;

  return (
    <div className="absolute inset-x-5 top-5 bottom-10 flex flex-col gap-3">
      <div className="flex items-center gap-3.5">
        <span
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
            recording
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-gray-200 bg-white text-gray-700"
          }`}
        >
          {recording && (
            <span className="demo-pulse absolute inset-0 rounded-full text-rose-400" />
          )}
          <Microphone size={18} weight={recording ? "fill" : "regular"} className="relative" />
        </span>
        <span className="demo-wave flex h-8 items-center gap-[3px]" data-live={recording}>
          {BARS.map((delay, i) => (
            <span
              key={i}
              className="h-full w-[3px] rounded-full bg-gray-400"
              style={{ animationDelay: `-${delay}s` }}
            />
          ))}
        </span>
        <span className="font-mono text-[11px] text-gray-400">
          <Count
            from={0}
            to={4}
            on={on(1)}
            still={still}
            ms={2000}
            linear
            format={(s) => `0:0${s}`}
          />
        </span>
      </div>

      <p className="min-h-[50px] font-serif text-[20px] leading-[1.25] text-gray-900">
        <Typed text={LINE} on={on(2)} still={still} speed={26} />
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Appear
          inline
          on={on(3)}
          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
        >
          Feeling: relief
        </Appear>
        {["#shipping", "#fear"].map((topic, i) => (
          <Appear
            key={topic}
            inline
            on={on(4 + i)}
            className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-500"
          >
            {topic}
          </Appear>
        ))}
        <Appear inline on={on(6)} className="ml-1 gap-1 text-[11px] text-gray-500">
          <Check size={12} weight="bold" />
          Posted
        </Appear>
      </div>
    </div>
  );
}

export const sayings: Demo = {
  label:
    "Animated demo: someone records a voice post, it is transcribed, read as relief, tagged with its topics, and posted.",
  chapters: ["You speak", "AI transcribes", "Emotion and topics"],
  cues: [
    { at: 100 },
    { at: 2300, chapter: 1 },
    { at: 4000, chapter: 2 },
    { at: 4250 },
    { at: 4500 },
    { at: 5000 },
  ],
  Scene,
};
