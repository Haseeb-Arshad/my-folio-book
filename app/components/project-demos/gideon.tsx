import type { CSSProperties, ReactNode } from "react";
import {
  ArrowCounterClockwise,
  ArrowUp,
  ArrowUpRight,
  Cloud,
  Microphone,
  Pulse,
  Waveform,
  X,
} from "@phosphor-icons/react";
import { FujiArt, type FujiScene } from "./gideon-art";
import { Typed, type Demo, type SceneProps } from "./stage";

/* ───────────────────────────────────────────────────────────
   GIDEON, as chatgideon.com draws it: a dark room, a face made
   of two glowing eyes, and glass cards for what it finds.

   The beats follow the product. You speak; the face moves aside
   to the corner as a pane condenses out of blur and searches;
   the card fills in piece by piece, its picture settling into
   focus, and facts light up as GIDEON says them. Ask for
   pictures and the first card shrinks into the column beside a
   new one, whose tiles arrive one after another.
   ─────────────────────────────────────────────────────────── */

const ASK = "Tell me about Mount Fuji.";
const ANSWER = "Mount Fuji is Japan's highest peak, at 3,776 metres. It last erupted in 1707.";
const ASK_PICTURES = "Show me some pictures.";
const ANSWER_PICTURES = "Here it is at dawn, at night, and in cherry blossom season.";

const FACTS = [
  { label: "Height", value: "3,776 m", said: true },
  { label: "Last eruption", value: "1707", said: true },
  { label: "Prefectures", value: "Shizuoka, Yamanashi", said: false },
  { label: "World Heritage", value: "Since 2013", said: false },
];

const TILES: { scene: FujiScene; className: string }[] = [
  { scene: "dawn", className: "col-span-2 row-span-2" },
  { scene: "night", className: "" },
  { scene: "blossom", className: "" },
  { scene: "day", className: "" },
  { scene: "winter", className: "" },
];

/* Steps, as cued below. */
const HEARING = 1;
const OPEN = 2;
const CARD = 3;
const ANSWERING = 4;
const SAYING = 5;
const ASKING_PICTURES = 6;
const FINDING_PICTURES = 7;
const PICTURES = 8;
const SHOWING = 9;

type Mood = "neutral" | "curious" | "focused" | "happy";

function moodAt(step: number): Mood {
  if (step >= SHOWING) return "happy";
  if (step >= PICTURES) return "neutral";
  if (step >= FINDING_PICTURES) return "focused";
  if (step >= ASKING_PICTURES) return "curious";
  if (step >= CARD) return "neutral";
  if (step >= OPEN) return "focused";
  if (step >= HEARING) return "curious";
  return "neutral";
}

/* A piece's place in the card's rising line, as GIDEON numbers them. */
const rise = (i: number) => ({ "--i": i }) as CSSProperties;

function Eyes({ mood, glance }: { mood: Mood; glance: boolean }) {
  return (
    <div className="gd-eyes" data-mood={mood} data-glance={glance}>
      {[0, 1].map((i) => (
        <span key={i} className="gd-eye">
          <i className="gd-eye-body" />
          <i className="gd-eye-arc" />
        </span>
      ))}
    </div>
  );
}

function Pane({
  children,
  ready,
  leaving = false,
}: {
  children: ReactNode;
  ready: boolean;
  leaving?: boolean;
}) {
  return (
    <div className="gd-front gd-pane" data-leaving={leaving}>
      <div className="gd-bob">
        <div className="gd-glass gd-glass-in" data-state={ready ? "ready" : "searching"}>
          {children}
          <span className="absolute right-3 top-3 z-[4] flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60">
            <X size={11} weight="bold" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Searching({ kind }: { kind: "web" | "pictures" }) {
  return (
    <div className="relative z-[2] p-4 pr-11">
      <p className="gd-kicker flex items-center gap-1.5">
        <span className="gd-breathe h-1.5 w-1.5 rounded-full bg-[rgb(191_233_255)]" />
        {kind === "web" ? "Searching the web" : "Finding pictures"}
      </p>
      <p className="mt-1.5 font-serif text-[22px] leading-none text-white">Mount Fuji</p>
      {kind === "web" ? (
        <div className="mt-4 flex flex-col gap-2 pb-1">
          {[92, 78, 56].map((width, i) => (
            <i
              key={width}
              className="gd-breathe block h-2 rounded-full bg-white/10"
              style={{ width: `${width}%`, ...rise(i) }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-1.5 pb-1">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} className="gd-breathe block h-12 rounded-[10px] bg-white/[0.07]" style={rise(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Profile({ said }: { said: boolean }) {
  return (
    <div className="relative z-[2] flex flex-col @min-[600px]:flex-row">
      <figure className="relative h-[76px] shrink-0 overflow-hidden @min-[600px]:h-auto @min-[600px]:min-h-[236px] @min-[600px]:w-[36%]">
        <div className="gd-media-in absolute inset-0">
          <FujiArt scene="dawn" />
        </div>
      </figure>
      <div className="min-w-0 flex-1 p-4 pr-11 @min-[600px]:pr-10">
        <p className="gd-rise font-serif text-[24px] leading-none text-white" style={rise(0)}>
          Mount Fuji
        </p>
        <p className="gd-rise mt-1.5 text-[12px] text-[rgb(214_222_234/0.62)]" style={rise(1)}>
          Active stratovolcano, Japan
        </p>
        <p
          className="gd-rise mt-2 hidden text-[12.5px] leading-snug text-[rgb(236_240_247/0.84)] @min-[600px]:block"
          style={rise(2)}
        >
          Japan's highest mountain, a near-symmetrical volcanic cone southwest of Tokyo.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
          {/* A phone-sized card keeps the two facts GIDEON says aloud. */}
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className={`gd-rise min-w-0 border-t border-white/10 pt-1.5 ${fact.said ? "" : "hidden @min-[600px]:block"}`}
              style={rise(3 + i)}
            >
              <dt className="gd-label">{fact.label}</dt>
              <dd
                className="gd-said mt-0.5 inline text-[12.5px] leading-snug text-[rgb(236_240_247/0.84)]"
                data-said={said && fact.said}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        <span className="gd-chip gd-rise mt-3" style={rise(7)}>
          wikipedia.org
          <ArrowUpRight size={9} />
        </span>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="relative z-[2] p-4">
      <p className="gd-kicker gd-rise" style={rise(0)}>
        Pictures
      </p>
      <p className="gd-rise mt-1 font-serif text-[22px] leading-none text-white" style={rise(1)}>
        Mount Fuji
      </p>
      <div className="mt-3 grid h-[150px] grid-cols-4 grid-rows-2 gap-1.5 @min-[600px]:h-[172px]">
        {TILES.map((tile, i) => (
          <div
            key={tile.scene}
            className={`gd-tile-in relative overflow-hidden rounded-[10px] ${tile.className}`}
            style={rise(i)}
          >
            <FujiArt scene={tile.scene} />
          </div>
        ))}
      </div>
      <span className="gd-chip gd-rise mt-3" style={rise(4)}>
        commons.wikimedia.org
        <ArrowUpRight size={9} />
      </span>
    </div>
  );
}

function Compact() {
  return (
    <div className="gd-compact-in">
      <div className="gd-glass flex items-center gap-2.5 rounded-[14px] p-2 opacity-[0.82]">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[9px]">
          <FujiArt scene="dawn" />
        </span>
        <span className="relative z-[2] min-w-0">
          <span className="gd-label block">Place</span>
          <span className="block truncate font-serif text-[15px] leading-tight text-white">Mount Fuji</span>
          <span className="block truncate text-[10.5px] text-white/50">Active stratovolcano</span>
        </span>
      </div>
    </div>
  );
}

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const open = on(OPEN);
  const listening = (on(HEARING) && !on(OPEN)) || (on(ASKING_PICTURES) && !on(FINDING_PICTURES));

  const turns = [
    { who: "You", text: ASK, shown: on(OPEN), typed: false },
    { who: "Gideon", text: ANSWER, shown: on(ANSWERING), typed: true },
    { who: "You", text: ASK_PICTURES, shown: on(ASKING_PICTURES), typed: true },
    { who: "Gideon", text: ANSWER_PICTURES, shown: on(SHOWING), typed: true },
  ];
  const shownTurns = turns.filter((t) => t.shown);
  const latest = shownTurns.length - 1;

  return (
    <div className="gd-room absolute inset-0" data-open={open} data-reset={step === 0 && !still}>
      <div className="gd-field" />

      {/* chrome: the brand, which steps aside for the face, and the pills */}
      <div
        className={`absolute left-4 top-3.5 flex items-center gap-2 transition-[opacity,transform] duration-500 ${
          open ? "-translate-y-1.5 opacity-0" : ""
        }`}
      >
        <span className="h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffb27a,#3b5bd6_55%,#0b1430)] shadow-[0_0_10px_rgb(91_120_230/0.5)]" />
        <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-[rgb(238_243_251/0.75)]">
          GIDEON
        </span>
      </div>
      <div className="absolute right-3.5 top-3 flex gap-1.5">
        <span className="gd-pill hidden @min-[600px]:inline-flex">
          <Waveform size={12} />
          Voices
        </span>
        <span className="gd-pill hidden @min-[600px]:inline-flex">
          <Cloud size={12} />
          Thoughts
        </span>
        <span className="gd-pill hidden @min-[600px]:inline-flex">
          <Pulse size={12} />
          Latency
        </span>
        <span className="gd-pill">
          <ArrowCounterClockwise size={12} />
          New
        </span>
      </div>

      <div className="gd-face">
        <Eyes mood={moodAt(step)} glance={on(SAYING) && !on(ASKING_PICTURES)} />
      </div>

      {/* the line under the face, before anything is found */}
      <div
        className={`absolute inset-x-6 top-[58%] text-center transition-opacity duration-300 ${
          open ? "opacity-0" : ""
        }`}
      >
        <div className="relative h-[52px]">
          {[
            { key: "hello", show: !on(HEARING), who: "Gideon", line: <>Hey, I'm GIDEON. I'm listening.</> },
            {
              key: "ask",
              show: on(HEARING),
              who: "You",
              line: <Typed text={ASK} on={on(HEARING)} still={still} speed={40} />,
            },
          ].map((caption) => (
            <div
              key={caption.key}
              className="demo-appear absolute inset-x-0 top-0"
              data-on={caption.show}
            >
              <p className="gd-kicker">{caption.who}</p>
              <p className="mt-1 font-serif text-[19px] leading-tight text-white @min-[600px]:text-[22px]">
                {caption.line}
              </p>
            </div>
          ))}
        </div>
        <p className="font-mono text-[9.5px] tracking-[0.08em] text-[rgb(166_175_187/0.6)]">
          ● {on(HEARING) ? "Hearing you" : "Listening"}
        </p>
      </div>

      {/* the conversation, down the left of a wide stage */}
      <div className="gd-transcript">
        {shownTurns.map((turn, i) => (
          <div
            key={i}
            className={`gd-rise transition-opacity duration-500 ${i < latest ? "opacity-45" : ""}`}
            style={rise(0)}
          >
            <p className="gd-kicker">{turn.who}</p>
            <p className="mt-0.5 font-serif text-[15.5px] leading-[1.2] text-white">
              {turn.typed ? <Typed text={turn.text} on still={still} speed={22} /> : turn.text}
            </p>
          </div>
        ))}
      </div>

      {/* on a narrow stage, the latest line sits beside the face */}
      {open && latest >= 0 && (
        <div key={latest} className="gd-rise absolute left-[78px] right-[64px] top-3 @min-[600px]:hidden" style={rise(0)}>
          <p className="gd-kicker">{shownTurns[latest].who}</p>
          <p className="mt-0.5 line-clamp-2 font-serif text-[14px] leading-[1.2] text-white">
            {shownTurns[latest].typed ? (
              <Typed text={shownTurns[latest].text} on still={still} speed={22} />
            ) : (
              shownTurns[latest].text
            )}
          </p>
        </div>
      )}

      <div className="gd-stage" data-split={on(FINDING_PICTURES)}>
        {open && (
          <Pane ready={on(CARD)} leaving={on(FINDING_PICTURES)}>
            {on(CARD) ? <Profile said={on(SAYING)} /> : <Searching kind="web" />}
          </Pane>
        )}
        {on(FINDING_PICTURES) && (
          <Pane ready={on(PICTURES)}>{on(PICTURES) ? <Gallery /> : <Searching kind="pictures" />}</Pane>
        )}
        <div className="gd-side">{on(FINDING_PICTURES) && <Compact />}</div>
      </div>

      <div className="gd-dock">
        <span
          className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${
            listening
              ? "gd-ring border-[rgb(191_233_255/0.5)] bg-[rgb(191_233_255/0.14)] text-[rgb(191_233_255)]"
              : "border-white/10 bg-white/[0.04] text-white/60"
          }`}
        >
          <Microphone size={14} weight={listening ? "fill" : "regular"} />
        </span>
        <span className="flex h-8 w-[174px] items-center justify-between rounded-full border border-[rgb(210_222_239/0.11)] bg-white/[0.04] pl-3 pr-1">
          <span className="text-[11px] text-white/35">Or type something…</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70">
            <ArrowUp size={11} weight="bold" />
          </span>
        </span>
      </div>
    </div>
  );
}

export const gideon: Demo = {
  label:
    "Animated recreation of GIDEON: you ask about Mount Fuji, the eyes move aside, a glass card pops up with a picture and facts that light up as GIDEON says them, then a gallery of pictures comes in when you ask for them.",
  chapters: ["Ask out loud", "A card pops up", "Pictures come in"],
  cues: [
    { at: 300 },
    { at: 2100, chapter: 1 },
    { at: 3100 },
    { at: 3500 },
    { at: 4900 },
    { at: 6100, chapter: 2 },
    { at: 7300 },
    { at: 8200 },
    { at: 8700 },
  ],
  hold: 3400,
  wide: true,
  height: "h-[400px]",
  dark: true,
  surface: "bg-[#060a13]",
  Scene,
};
