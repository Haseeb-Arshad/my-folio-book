import { CaretRight, Check } from "@phosphor-icons/react";
import { Appear, Count, type Demo, type SceneProps } from "./stage";

/* Lead Truth Engine: signals from every channel resolve to one person,
   score on a timeline, and pass the gates before anything reaches a buyer.
   Outreach the team sends itself scores zero, so a campaign cannot
   manufacture intent. The weights shown are illustrative. */

const EVENTS: { source: string; what: string; delta: number | null }[] = [
  { source: "Website", what: "Viewed pricing", delta: 8 },
  { source: "Apollo", what: "Enriched: procurement lead", delta: null },
  { source: "HeyReach", what: "Connection request sent", delta: 0 },
  { source: "HeyReach", what: "Replied: send specs", delta: 14 },
  { source: "RFQ", what: "Quote request, 2,000 units", delta: 30 },
];
const SCORE = EVENTS.reduce((sum, e) => sum + (e.delta ?? 0), 0);
const GATES = ["Rules", "Suppression", "Duplicates", "Internal traffic"];
const RESOLVED = EVENTS.length + 1;
const QUEUED = RESOLVED + GATES.length + 1;

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">identity</span>;
  if (value === 0) return <span className="text-gray-400">+0 outreach</span>;
  return <span className="text-emerald-700">+{value}</span>;
}

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const resolved = on(RESOLVED);

  return (
    <div className="absolute inset-x-4 top-4 bottom-10 grid grid-cols-1 items-start gap-3 @md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @xl:grid-cols-[minmax(0,1.3fr)_auto_minmax(0,1fr)_auto_minmax(0,0.8fr)]">
      {/* On a narrow stage the signals keep the full width, and the person
          card lands on top of them as they fold into one record. */}
      <div
        className={`flex min-w-0 flex-col gap-1 transition-opacity duration-500 ${
          resolved ? "@max-md:opacity-40" : ""
        }`}
      >
        <p className="text-[11px] text-gray-400">Signals</p>
        {EVENTS.map((event, i) => (
          <Appear
            key={event.what}
            on={on(1 + i)}
            className="flex items-center gap-2 rounded-md bg-white px-2 py-1 text-[11.5px] ring-1 ring-gray-200/70"
          >
            <span className="w-14 shrink-0 font-mono text-[11px] text-gray-400">
              {event.source}
            </span>
            <span className="min-w-0 flex-1 truncate text-gray-800">{event.what}</span>
            {/* The wrapper carries the narrow-stage hide; Appear's own
                inline-flex would override a `hidden` placed on it. */}
            <span className="hidden @md:contents">
              <Appear inline on={resolved} className="shrink-0 text-[11px]">
                <Delta value={event.delta} />
              </Appear>
            </span>
          </Appear>
        ))}
      </div>

      <CaretRight size={14} className="mt-20 hidden text-gray-300 @xl:block" />

      <Appear
        on={resolved}
        className="min-w-0 rounded-[10px] border border-gray-200/80 bg-white p-3 shadow-sm @max-md:absolute @max-md:right-0 @max-md:bottom-0 @max-md:w-[178px] @max-md:shadow-md"
      >
        <p className="text-[11px] text-gray-400">One person</p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-gray-900">
          Buyer at Northwind
        </p>
        <p className="mt-0.5 text-[11px] text-gray-500">email · LinkedIn · phone</p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-[11px] text-gray-400">Intent score</span>
          <span className="text-[18px] font-semibold text-gray-900">
            <Count from={0} to={SCORE} on={resolved} still={still} ms={1200} />
          </span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-[width] ease-out"
            style={{
              width: resolved ? `${SCORE}%` : "0%",
              transitionDuration: resolved && !still ? "1200ms" : "0ms",
            }}
          />
        </div>
        <Appear
          on={on(QUEUED)}
          className="mt-2.5 flex items-center gap-1 text-[11px] text-emerald-700"
        >
          <Check size={11} weight="bold" />
          Queued for sales
        </Appear>
      </Appear>

      <CaretRight size={14} className="mt-20 hidden text-gray-300 @xl:block" />

      <div className="hidden min-w-0 flex-col gap-1 @xl:flex">
        <p className="text-[11px] text-gray-400">Gates</p>
        {GATES.map((gate, i) => {
          const passed = on(RESOLVED + 1 + i);
          return (
            <div key={gate} className="flex items-center gap-2 px-1 py-1 text-[11.5px]">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                  passed ? "bg-emerald-500 text-white" : "bg-gray-200 text-transparent"
                }`}
              >
                <Check size={9} weight="bold" />
              </span>
              <span className={passed ? "text-gray-800" : "text-gray-400"}>{gate}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const leadTruthEngine: Demo = {
  label:
    "Animated demo: website, Apollo, HeyReach and RFQ signals resolve to one buyer, outreach the team sent scores zero, the intent score climbs, and the lead passes four gates before it is queued for sales.",
  chapters: ["Signals arrive", "One person, one score", "Gates before outreach"],
  cues: [
    { at: 200 },
    { at: 600 },
    { at: 1000 },
    { at: 1400 },
    { at: 1800 },
    { at: 2600, chapter: 1 },
    { at: 4100, chapter: 2 },
    { at: 4350 },
    { at: 4600 },
    { at: 4850 },
    { at: 5400 },
  ],
  hold: 2800,
  wide: true,
  Scene,
};
