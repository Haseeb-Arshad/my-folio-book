import type { CSSProperties } from "react";
import { HandGrabbing } from "@phosphor-icons/react";
import { Appear, type Demo, type SceneProps } from "./stage";

/* Harsukh Residences: turn the building, pick a floor, and its plan
   opens with a unit picked out. The tower is a CSS 3D box, so it really
   turns rather than cross-fading between pictures. */

const FLOORS = 9;
const FLOOR_PX = 15;
/* zero-based from the ground, so this reads as "Floor 6" */
const PICKED = 5;
const W = 64;
const D = 44;
const H = FLOORS * FLOOR_PX;

const slabs = (tone: string): CSSProperties => ({
  background: `repeating-linear-gradient(to top, ${tone} 0 ${FLOOR_PX - 1}px, #cdc3b3 ${FLOOR_PX - 1}px ${FLOOR_PX}px)`,
});

function Face({
  width,
  height,
  transform,
  style,
  band,
}: {
  width: number;
  height: number;
  transform: string;
  style: CSSProperties;
  band?: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 border border-[#b9ad9a]/60"
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, transform, ...style }}
    >
      {band !== undefined && (
        <div
          className="absolute inset-x-0 bg-amber-400/80 transition-opacity duration-500"
          style={{ bottom: PICKED * FLOOR_PX, height: FLOOR_PX - 1, opacity: band ? 1 : 0 }}
        />
      )}
    </div>
  );
}

function Scene({ step, still }: SceneProps) {
  const on = (n: number) => step >= n;
  const turned = on(2);
  /* Only the forward turn animates; the reset back happens while the
     stage is faded out and must not be seen spinning. */
  const turn = turned && !still ? "transform 1800ms var(--ease-in-out)" : "none";
  const band = on(3);
  const dragging = on(2) && !on(3) && !still;

  return (
    <div className="absolute inset-x-4 top-3 bottom-9 grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-3 h-16 w-full"
        >
          <path d="M0 80 L0 52 L28 30 L50 44 L82 14 L112 40 L138 24 L170 46 L200 32 L200 80 Z" fill="#e7e2d8" />
          <path d="M0 80 L0 64 L40 48 L70 60 L104 42 L140 58 L176 50 L200 58 L200 80 Z" fill="#ddd6c8" />
        </svg>

        <Appear on={on(1)} className="absolute inset-0" style={{ perspective: 600 }}>
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(-16deg) rotateY(${turned ? -35 : 50}deg)`,
              transition: turn,
            }}
          >
            <Face width={W} height={H} transform={`translateZ(${D / 2}px)`} style={slabs("#f4f0e9")} band={band} />
            <Face width={W} height={H} transform={`rotateY(180deg) translateZ(${D / 2}px)`} style={slabs("#ebe5da")} />
            <Face width={D} height={H} transform={`rotateY(90deg) translateZ(${W / 2}px)`} style={slabs("#e4ddd0")} band={band} />
            <Face width={D} height={H} transform={`rotateY(-90deg) translateZ(${W / 2}px)`} style={slabs("#ece6db")} band={band} />
            <Face width={W} height={D} transform={`rotateX(90deg) translateZ(${H / 2}px)`} style={{ background: "#f8f5ef" }} />
          </div>
        </Appear>

        <span
          className="absolute top-1/2 text-gray-700 transition-[left,opacity] duration-[1800ms] ease-in-out"
          style={{
            left: dragging ? "18%" : "72%",
            opacity: dragging ? 1 : 0,
            transitionDuration: dragging ? "1800ms" : "200ms",
          }}
        >
          <HandGrabbing size={20} weight="fill" />
        </span>

        <Appear
          inline
          on={band}
          className="absolute left-1 top-1 rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-700 shadow-sm ring-1 ring-gray-200/70"
        >
          Floor {PICKED + 1}
        </Appear>
      </div>

      <Appear on={on(4)} className="flex min-w-0 flex-col justify-center gap-2">
        <svg viewBox="0 0 160 112" className="w-full">
          <rect
            x="81"
            y="2"
            width="77"
            height="46"
            className="transition-[fill] duration-500"
            fill={on(5) ? "#fde9c4" : "transparent"}
          />
          <path
            pathLength={1}
            data-on={on(4)}
            className="demo-draw"
            d="M2 2 H158 V110 H2 Z M2 48 H158 M2 64 H158 M80 2 V48 M56 64 V110 M106 64 V110"
            fill="none"
            stroke="#3f3a33"
            strokeWidth="1.5"
          />
          <path d="M100 2 H140" stroke="#7aa6c2" strokeWidth="3" />
          <path d="M20 2 H60" stroke="#7aa6c2" strokeWidth="3" />
        </svg>
        <Appear on={on(5)} className="text-[11px] leading-snug text-gray-600">
          <span className="text-gray-900">Unit B</span> · mountain-facing
        </Appear>
      </Appear>
    </div>
  );
}

export const harsukh: Demo = {
  label:
    "Animated demo: the Harsukh building turns in 3D, floor 6 is picked, and its floor plan opens with one mountain-facing unit highlighted.",
  chapters: ["Turn the building", "Pick a floor", "Open the plan"],
  cues: [
    { at: 200 },
    { at: 700 },
    { at: 2700, chapter: 1 },
    { at: 3500, chapter: 2 },
    { at: 4400 },
  ],
  surface: "bg-[#f7f5f1]",
  Scene,
};
