import { Check } from "@phosphor-icons/react";
import { Appear, type Demo, type SceneProps } from "./stage";

/* Milo, on the example from its own README: one school message becomes
   three items. The uniform reminder is saved straight away; the payment
   and the form wait for a parent to approve them. */

const MESSAGE: { text: string; item?: number }[] = [
  { text: "Dear parents, class 3 students will wear " },
  { text: "house uniform on Friday", item: 0 },
  { text: ". Please send " },
  { text: "Rs. 1500 by Thursday", item: 1 },
  { text: " for the trip and submit " },
  { text: "consent form tomorrow", item: 2 },
  { text: "." },
];

const ITEMS = [
  { title: "Ayan: house uniform", when: "Friday", risky: false },
  { title: "Ayan: trip fee Rs. 1,500", when: "Thursday", risky: true },
  { title: "Ayan: consent form", when: "Tomorrow", risky: true },
];
/* The item the parent approves in the last beat. */
const APPROVED = 1;

function Badge({ risky, approved }: { risky: boolean; approved: boolean }) {
  if (!risky || approved) {
    return (
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-emerald-50 px-1.5 text-[11px] text-emerald-700">
        <Check size={10} weight="bold" />
        {approved ? "Approved" : "Saved"}
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap rounded-full bg-amber-50 px-1.5 text-[11px] text-amber-700">
      Needs you
    </span>
  );
}

function Scene({ step }: SceneProps) {
  const on = (n: number) => step >= n;

  return (
    <div className="absolute inset-x-4 top-4 bottom-10 grid grid-cols-2 gap-3">
      <Appear on={on(1)} className="min-w-0">
        <p className="mb-1 text-[11px] text-gray-400">Class 3 parents</p>
        <p className="rounded-xl rounded-tl-sm bg-white px-2.5 py-2 text-[11.5px] leading-snug text-gray-700 shadow-sm ring-1 ring-gray-200/70">
          {MESSAGE.map((part, i) =>
            part.item === undefined ? (
              <span key={i}>{part.text}</span>
            ) : (
              <mark
                key={i}
                className={`rounded-sm text-inherit transition-colors duration-500 ${
                  on(2 + part.item) ? "bg-emerald-100" : "bg-transparent"
                }`}
              >
                {part.text}
              </mark>
            )
          )}
        </p>
      </Appear>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Appear on={on(2)} className="hidden @sm:block">
          <p className="text-[11px] text-gray-400">Milo found</p>
        </Appear>
        {ITEMS.map((item, i) => (
          <Appear
            key={item.title}
            on={on(2 + i)}
            className="rounded-lg border border-gray-200/80 bg-white px-2 py-1 @sm:py-1.5"
          >
            <p className="truncate text-[12px] text-gray-900">{item.title}</p>
            <div className="mt-0.5 flex items-center justify-between gap-1.5">
              {/* A narrow stage has no room for both; the date is still
                  highlighted in the message. */}
              <span className={`text-[11px] text-gray-400 ${on(5) ? "@max-sm:hidden" : ""}`}>
                {item.when}
              </span>
              <Appear inline on={on(5)}>
                <Badge risky={item.risky} approved={i === APPROVED && on(6)} />
              </Appear>
            </div>
          </Appear>
        ))}
      </div>
    </div>
  );
}

export const milo: Demo = {
  label:
    "Animated demo: Milo reads a school message and extracts a uniform reminder, a trip fee and a consent form; it saves the reminder and holds the fee and form for a parent to approve.",
  chapters: ["A message arrives", "Milo extracts", "Risky items wait for you"],
  cues: [
    { at: 200 },
    { at: 1400, chapter: 1 },
    { at: 1800 },
    { at: 2200 },
    { at: 3100, chapter: 2 },
    { at: 4300 },
  ],
  Scene,
};
