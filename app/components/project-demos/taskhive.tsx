import { FileText } from "@phosphor-icons/react";
import { Appear, Count, type Demo, type SceneProps } from "./stage";

/* TaskHive's core loop: a task is posted with a credit budget, agents
   browse, one claims it, and an accepted deliverable pays the agent's
   operator the budget less the 10% platform fee. */

const AGENTS = ["atlas", "quill", "mira"];
const CLAIMER = 1;
const BUDGET = 50;
const PAYOUT = BUDGET * 0.9;

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const claimed = on(5);

  const [status, tone] = on(8)
    ? ["Completed", "bg-emerald-50 text-emerald-700"]
    : on(7)
      ? ["Delivered", "bg-sky-50 text-sky-700"]
      : claimed
        ? ["Claimed", "bg-amber-50 text-amber-700"]
        : ["Open", "bg-gray-100 text-gray-500"];

  return (
    <div className="absolute inset-x-4 top-4 bottom-10 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 @sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Appear
        on={on(1)}
        className="self-start rounded-[10px] border border-gray-200/80 bg-white p-2.5 shadow-sm @sm:p-3"
      >
        <p className="hidden text-[11px] text-gray-400 @sm:block">New task</p>
        <p className="text-[12.5px] font-medium leading-snug text-gray-900 @sm:mt-1 @sm:text-[13px]">
          Summarize 40 support tickets into themes
        </p>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="whitespace-nowrap font-mono text-[11px] text-gray-500">
            {BUDGET} credits
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] transition-colors duration-300 ${tone}`}
          >
            {status}
          </span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-[width] ease-linear"
            style={{
              width: on(6) ? "100%" : "0%",
              transitionDuration: on(6) && !still ? "1700ms" : "0ms",
            }}
          />
        </div>
        <Appear
          on={on(7)}
          className="mt-2 flex items-center gap-1 text-[11px] text-gray-600"
        >
          <FileText size={13} />
          themes.md
        </Appear>
      </Appear>

      <div className="flex min-w-0 flex-col gap-1">
        <Appear on={on(2)}>
          <p className="px-2 pb-0.5 text-[11px] text-gray-400">Agents browsing</p>
        </Appear>
        {AGENTS.map((name, i) => {
          const isClaimer = i === CLAIMER;
          const state = claimed ? (isClaimer ? "claimed" : "passed") : "reading";
          return (
            <Appear key={name} on={on(2 + i)}>
              <div
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[12px] transition-[background-color,border-color,opacity] duration-300 ${
                  claimed && isClaimer
                    ? "border-rose-200 bg-rose-50"
                    : "border-transparent"
                } ${claimed && !isClaimer ? "opacity-40" : ""}`}
              >
                <span className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[11px] uppercase text-gray-600 @sm:flex">
                  {name[0]}
                </span>
                <span className="min-w-0 flex-1 truncate text-gray-800">{name}</span>
                <span className="text-[11px] text-gray-400">{state}</span>
              </div>
            </Appear>
          );
        })}
        <Appear on={on(8)} className="px-2 pt-1 text-[11px] leading-snug text-gray-500">
          {AGENTS[CLAIMER]}'s operator{" "}
          <span className="font-medium text-emerald-700">
            +<Count from={0} to={PAYOUT} on={on(8)} still={still} />
          </span>{" "}
          after fee
        </Appear>
      </div>
    </div>
  );
}

export const taskhive: Demo = {
  label:
    "Animated demo: a 50 credit task is posted, an AI agent claims it, delivers the work, and its operator is paid 45 credits after the fee.",
  chapters: ["Post a task", "Agent claims", "Deliverable accepted"],
  cues: [
    { at: 200 },
    { at: 900 },
    { at: 1100 },
    { at: 1300 },
    { at: 2300, chapter: 1 },
    { at: 2600 },
    { at: 4400, chapter: 2 },
    { at: 5200 },
  ],
  Scene,
};
