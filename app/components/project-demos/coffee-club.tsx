import { Camera } from "@phosphor-icons/react";
import { Appear, type Demo, type SceneProps } from "./stage";

/* Coffee Club: filter Islamabad's cafes by what you need, find a spot,
   and leave a memory that waits for moderation before it goes public.
   Cafe Biblio and its features come from the app's own seed data. */

const FILTERS = ["Wifi", "Sockets", "Reading"];
/* Pin positions in percent, and the filter step that hides each one
   (0 means it matches every filter). */
const PINS: { x: number; y: number; hiddenBy: number }[] = [
  { x: 18, y: 44, hiddenBy: 3 },
  { x: 33, y: 62, hiddenBy: 1 },
  { x: 45, y: 38, hiddenBy: 0 },
  { x: 28, y: 30, hiddenBy: 2 },
  { x: 69, y: 52, hiddenBy: 0 },
  { x: 78, y: 34, hiddenBy: 0 },
  { x: 86, y: 60, hiddenBy: 1 },
  { x: 54, y: 70, hiddenBy: 2 },
];
const SELECTED = 4;

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const filtersOn = Math.max(0, Math.min(FILTERS.length, step - 1));
  const picked = on(5);

  return (
    <>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <path d="M0 0 H400 V46 C330 64 250 40 170 56 C100 70 40 52 0 62 Z" fill="#dfe7d3" />
        <g stroke="#ffffff" strokeLinecap="round" transform="rotate(-12 200 120)">
          <path d="M-40 110 H440" strokeWidth="7" />
          <path d="M-40 190 H440" strokeWidth="4" />
          <path d="M120 -40 V280" strokeWidth="7" />
          <path d="M270 -40 V280" strokeWidth="4" />
          <path d="M-40 150 H440 M195 -40 V280 M45 -40 V280 M345 -40 V280" strokeWidth="2.5" />
        </g>
      </svg>

      <div className="absolute left-3 top-3 flex gap-1.5">
        {FILTERS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-2 py-0.5 text-[11px] shadow-sm ring-1 transition-colors duration-300 ${
              filtersOn > i
                ? "bg-gray-900 text-white ring-gray-900"
                : "bg-white text-gray-600 ring-gray-200"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {PINS.map((pin, i) => {
        const filteredOut = pin.hiddenBy > 0 && filtersOn >= pin.hiddenBy;
        const selected = picked && i === SELECTED;
        return (
          <Appear
            key={i}
            on={on(1)}
            className="absolute -ml-1.5 -mt-1.5"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transitionDelay: on(1) && !on(2) && !still ? `${i * 50}ms` : "0ms",
            }}
          >
            <span
              className={`block h-3 w-3 rounded-full border-2 border-white bg-orange-500 shadow transition-[opacity,transform] duration-300 ${
                filteredOut ? "scale-75 opacity-25" : ""
              } ${selected ? "scale-[1.4] ring-4 ring-orange-500/20" : ""}`}
            />
          </Appear>
        );
      })}

      <Appear
        on={picked}
        className="absolute bottom-10 left-3 w-[176px] rounded-lg bg-white p-2.5 shadow-md ring-1 ring-gray-200/70"
      >
        <p className="text-[12.5px] font-medium text-gray-900">Cafe Biblio</p>
        <p className="text-[11px] text-gray-500">F-7/3 · Reading room</p>
        <Appear
          on={on(6)}
          className="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2 text-[11px] text-gray-600"
        >
          <Camera size={13} />
          Memory added
          <span className="ml-auto rounded-full bg-amber-50 px-1.5 text-amber-700">pending</span>
        </Appear>
      </Appear>
    </>
  );
}

export const coffeeClub: Demo = {
  label:
    "Animated demo: a map of Islamabad cafes is filtered by wifi, sockets and reading, Cafe Biblio is picked, and a photo memory is added for moderation.",
  chapters: ["Filter by vibe", "Find a spot", "Add a memory"],
  cues: [
    { at: 200 },
    { at: 1000 },
    { at: 1600 },
    { at: 2200 },
    { at: 3100, chapter: 1 },
    { at: 4400, chapter: 2 },
  ],
  surface: "bg-[#eeede6]",
  Scene,
};
