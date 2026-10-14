import { useId } from "react";

/* ───────────────────────────────────────────────────────────
   The pictures in the GIDEON demo. GIDEON shows real photographs
   it finds on the web; a portfolio should not re-host someone
   else's photos, so these are drawn: one mountain, five moods.
   Each fills its frame like a cropped photo would.
   ─────────────────────────────────────────────────────────── */

export type FujiScene = "dawn" | "night" | "blossom" | "day" | "winter";

type Palette = {
  sky: [string, string, string];
  slope: [string, string];
  snow: [string, string];
  ground: [string, string];
};

const PALETTES: Record<FujiScene, Palette> = {
  dawn: {
    sky: ["#25325a", "#c9748a", "#f6b98a"],
    slope: ["#46527a", "#262f4c"],
    snow: ["#fff4ea", "#e7c3c0"],
    ground: ["#2a3352", "#141a2c"],
  },
  night: {
    sky: ["#060b1f", "#12214a", "#2a3d6e"],
    slope: ["#22305a", "#0f1832"],
    snow: ["#cdd9f0", "#8193b8"],
    ground: ["#0b1226", "#050912"],
  },
  blossom: {
    sky: ["#8fbbe2", "#cfe3f3", "#f6e4ec"],
    slope: ["#7088ad", "#4e6489"],
    snow: ["#ffffff", "#dde7f2"],
    ground: ["#86a07c", "#5f7a5a"],
  },
  day: {
    sky: ["#3f84cc", "#86b9e6", "#d5ebf8"],
    slope: ["#55739a", "#36506f"],
    snow: ["#ffffff", "#e1ebf5"],
    ground: ["#43704f", "#2b4c36"],
  },
  winter: {
    sky: ["#7f99b3", "#b5c7d8", "#e5edf4"],
    slope: ["#e2e9f0", "#aebdcd"],
    snow: ["#ffffff", "#f1f5f9"],
    ground: ["#dfe6ed", "#c3cfda"],
  },
};

const MOUNTAIN =
  "M-10 236 C60 208 118 172 158 122 C170 106 177 94 184 87 L216 87 C223 94 230 106 242 122 C282 172 340 208 410 236 Z";
const SNOW =
  "M150 132 C162 116 174 98 184 87 L216 87 C226 98 238 116 250 132 L241 128 L234 139 L225 127 L215 142 L205 126 L196 140 L187 126 L178 138 L169 127 L160 136 Z";

/* Fixed, not random, so the server and the browser draw the same sky. */
const STARS = [
  [22, 18], [48, 40], [71, 12], [96, 52], [118, 24], [142, 8], [163, 44], [236, 20],
  [258, 48], [281, 10], [304, 36], [331, 16], [352, 54], [377, 28], [392, 8], [12, 62],
  [86, 78], [210, 30], [322, 76], [368, 82],
];
const PETALS = [
  [18, 30, 13], [40, 18, 11], [8, 54, 10], [52, 42, 9], [30, 62, 8], [66, 22, 8],
  [384, 196, 14], [362, 214, 12], [392, 224, 10], [346, 236, 11], [372, 244, 9], [330, 252, 8],
];
const PINES = [
  [14, 260, 30], [40, 260, 42], [66, 260, 28], [322, 260, 34], [350, 260, 46], [380, 260, 32],
];

export function FujiArt({ scene }: { scene: FujiScene }) {
  /* Gradient ids must be unique per picture, and plain enough for url(#…). */
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const p = PALETTES[scene];
  const sky = `${id}-sky`;
  const slope = `${id}-slope`;
  const snow = `${id}-snow`;
  const ground = `${id}-ground`;
  const glow = `${id}-glow`;

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="62%" stopColor={p.sky[1]} />
          <stop offset="100%" stopColor={p.sky[2]} />
        </linearGradient>
        <linearGradient id={slope} x1="0" y1="0" x2="1" y2="0">
          <stop offset="30%" stopColor={p.slope[0]} />
          <stop offset="72%" stopColor={p.slope[1]} />
        </linearGradient>
        <linearGradient id={snow} x1="0" y1="0" x2="1" y2="0">
          <stop offset="40%" stopColor={p.snow[0]} />
          <stop offset="80%" stopColor={p.snow[1]} />
        </linearGradient>
        <linearGradient id={ground} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.ground[0]} />
          <stop offset="100%" stopColor={p.ground[1]} />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#fff3dc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff3dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="260" fill={`url(#${sky})`} />

      {scene === "night" &&
        STARS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.3 : 0.8} fill="#e6edff" opacity={0.5 + (i % 4) * 0.12} />
        ))}
      {scene === "night" && (
        <>
          <circle cx="318" cy="56" r="26" fill={`url(#${glow})`} opacity="0.35" />
          <circle cx="318" cy="56" r="10" fill="#f1f4ff" />
        </>
      )}
      {scene === "dawn" && (
        <>
          <circle cx="292" cy="150" r="46" fill={`url(#${glow})`} />
          <circle cx="292" cy="150" r="15" fill="#ffe7c4" />
        </>
      )}
      {scene === "day" && (
        <g fill="#ffffff" opacity="0.75">
          <ellipse cx="80" cy="60" rx="40" ry="9" />
          <ellipse cx="320" cy="44" rx="34" ry="7" />
        </g>
      )}

      <path d={MOUNTAIN} fill={`url(#${slope})`} />
      <path d={SNOW} fill={`url(#${snow})`} />

      {/* low cloud or mist around the foot of the mountain */}
      {scene !== "night" && (
        <g fill="#ffffff" opacity={scene === "winter" ? 0.5 : 0.28}>
          <ellipse cx="120" cy="198" rx="90" ry="8" />
          <ellipse cx="290" cy="190" rx="80" ry="7" />
        </g>
      )}

      <path d="M0 218 C90 210 160 222 230 214 C300 206 350 216 400 210 L400 260 L0 260 Z" fill={`url(#${ground})`} />

      {scene === "dawn" && (
        <g opacity="0.3">
          <path d="M150 226 L200 250 L250 226 Z" fill={p.snow[1]} />
          <rect x="120" y="232" width="160" height="1.2" fill="#ffe7c4" />
          <rect x="150" y="240" width="100" height="1" fill="#ffe7c4" />
        </g>
      )}
      {scene === "blossom" &&
        PETALS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={["#f7c6d4", "#f2a8bd", "#fde2ea"][i % 3]} />
        ))}
      {scene === "winter" &&
        PINES.map(([x, y, h], i) => (
          <path key={i} d={`M${x} ${y - h} L${x + h * 0.32} ${y} L${x - h * 0.32} ${y} Z`} fill="#24363a" />
        ))}
    </svg>
  );
}
