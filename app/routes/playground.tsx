import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/playground";

type FieldMode = "curvature" | "wavefront" | "geodesic";
type PretextModule = typeof import("@chenglou/pretext");
type PreparedCopy = ReturnType<PretextModule["prepareWithSegments"]>;
type MetricKey = "primary" | "secondary" | "tertiary";
type MetricSnapshot = Record<MetricKey, string>;
type WavePulse = {
  radius: number;
  strength: number;
  hueShift: number;
};
type ViewRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type LensState = {
  x: number;
  y: number;
  radius: number;
  preferRight: boolean;
};
type MetricDescriptor = {
  label: string;
  unit: string;
};
type ModeConfig = {
  label: string;
  title: string;
  subtitle: string;
  footer: string;
  body: string;
  metrics: Record<MetricKey, MetricDescriptor>;
};
type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  drift: number;
};

const PANEL_ACCENT = "120, 214, 221";
const BACKDROP = "#091016";
const BODY_FONT =
  '500 15px "Outfit", "ABC Diatype", ui-sans-serif, system-ui, sans-serif';
const BODY_FONT_MOBILE =
  '500 14px "Outfit", "ABC Diatype", ui-sans-serif, system-ui, sans-serif';
const MONO_FONT =
  '500 12px "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace';
const MONO_FONT_MOBILE =
  '500 11px "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace';

const MODE_CONFIG: Record<FieldMode, ModeConfig> = {
  curvature: {
    label: "Curvature",
    title: "Metric Curvature",
    subtitle:
      "Mass-energy changes the metric. Free motion looks bent because the geometry is no longer flat.",
    footer:
      "Drag the source. The tighter the contour spacing, the steeper the local metric.",
    body:
      "Field note. Curvature is not an added push poured into empty space. It is the rule that decides which intervals count as nearby, how clocks separate, and which routes remain locally inertial. Where the atlas tightens, neighboring worldlines disagree faster about what straight means. Shift the source and the page recomputes that rule everywhere at once. The practical reading is simple: if a trajectory appears to fall, inspect the geometry before inventing a force. Geometry is the ledger. Motion is the consequence. The visible gradient is a map of changing intervals, not a decorative glow.",
    metrics: {
      primary: { label: "curvature", unit: "kappa" },
      secondary: { label: "gradient", unit: "m^-1" },
      tertiary: { label: "drift", unit: "tau" },
    },
  },
  wavefront: {
    label: "Wavefront",
    title: "Wavefront Propagation",
    subtitle:
      "A disturbance leaves the source as a finite-speed phase front and only later changes what distant observers can resolve.",
    footer:
      "Each pulse is a moving update surface. Watch phase fronts clear the panel before the field settles.",
    body:
      "Field note. A pulse never updates the whole field at once. Information leaves the source, establishes a new phase surface, and only then changes what an observer downstream can measure. The leading ring is not the field itself but the frontier of newly available information. When the source shifts, wavelengths compress on the near side and relax on the far side. That asymmetry is what makes timing, sampling, and reconstruction matter in real instruments. Treat the wavefront as a bookkeeping surface for causality: if it has not arrived, the remote readout should not yet agree with the new state.",
    metrics: {
      primary: { label: "front radius", unit: "lambda" },
      secondary: { label: "phase lag", unit: "ms" },
      tertiary: { label: "coherence", unit: "sigma" },
    },
  },
  geodesic: {
    label: "Geodesic",
    title: "Geodesic Drift",
    subtitle:
      "Objects do not need a steering instruction. They follow locally straight paths through a curved metric.",
    footer:
      "The streamlines are test particles. Deflection rises with the local slope, not with an explicit tug command.",
    body:
      "Field note. A geodesic is the path that refuses unnecessary turning once the metric is fixed. In flat space those paths read as straight lines. In a bent metric they drift, focus, and separate even though each segment still remains locally straight. That is why lensing and orbital precession can be computed from geometry alone. The useful question is not what force vector was applied at every instant. The useful question is which metric makes this path extremal. Change the source, and the best path changes with it. The stream does not chase the well. It obeys the map.",
    metrics: {
      primary: { label: "deflection", unit: "deg" },
      secondary: { label: "shear", unit: "1/s" },
      tertiary: { label: "transit", unit: "tau" },
    },
  },
};

const MODE_ORDER: FieldMode[] = ["curvature", "wavefront", "geodesic"];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Physics Field Atlas - Haseeb Arshad" },
    {
      name: "description",
      content:
        "Interactive spacetime and field explainer built with canvas physics and Pretext layout.",
    },
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function softRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function formatMetric(value: number, unit: string) {
  if (unit === "deg") return `${value.toFixed(1)} ${unit}`;
  if (unit === "ms") return `${Math.round(value)} ${unit}`;
  if (unit === "m^-1") return `${value.toFixed(3)} ${unit}`;
  if (unit === "1/s") return `${value.toFixed(3)} ${unit}`;
  return `${value.toFixed(2)} ${unit}`;
}

function createStars(count: number) {
  return Array.from({ length: count }, (_, index): Star => {
    const seed = index * 127.13;
    return {
      x: (Math.sin(seed) * 0.5 + 0.5) * 0.98 + 0.01,
      y: (Math.cos(seed * 1.71) * 0.5 + 0.5) * 0.96 + 0.02,
      size: 0.7 + ((index * 37) % 100) / 125,
      alpha: 0.1 + ((index * 19) % 100) / 520,
      drift: 0.8 + ((index * 11) % 100) / 120,
    };
  });
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  width: number,
  height: number,
  time: number,
) {
  ctx.save();
  for (const star of stars) {
    const twinkle = 0.35 + Math.sin(time * 0.18 * star.drift + star.x * 12) * 0.25;
    ctx.fillStyle = `rgba(${PANEL_ACCENT}, ${star.alpha + twinkle * 0.08})`;
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGridField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  source: { x: number; y: number },
  strength: number,
  isMobile: boolean,
) {
  const step = isMobile ? 52 : 64;
  const sample = isMobile ? 12 : 14;
  const radius = Math.min(width, height) * 0.46;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(120, 214, 221, 0.12)";

  for (let x = -step; x <= width + step; x += step) {
    ctx.beginPath();
    for (let y = -step; y <= height + step; y += sample) {
      const dx = source.x - x;
      const dy = source.y - y;
      const distance = Math.hypot(dx, dy);
      const falloff = Math.exp(-(distance * distance) / (radius * radius));
      const offsetX = dx * falloff * 0.16 * strength;
      const offsetY = dy * falloff * 0.07 * strength;
      const px = x + offsetX;
      const py = y + offsetY;
      if (y === -step) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  for (let y = -step; y <= height + step; y += step) {
    ctx.beginPath();
    for (let x = -step; x <= width + step; x += sample) {
      const dx = source.x - x;
      const dy = source.y - y;
      const distance = Math.hypot(dx, dy);
      const falloff = Math.exp(-(distance * distance) / (radius * radius));
      const offsetX = dx * falloff * 0.07 * strength;
      const offsetY = dy * falloff * 0.16 * strength;
      const px = x + offsetX;
      const py = y + offsetY;
      if (x === -step) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawWavefronts(
  ctx: CanvasRenderingContext2D,
  source: { x: number; y: number },
  waves: WavePulse[],
) {
  ctx.save();
  for (const wave of waves) {
    ctx.strokeStyle = `hsla(${188 + wave.hueShift}, 58%, 72%, ${wave.strength * 0.18})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(source.x, source.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `hsla(${188 + wave.hueShift}, 64%, 78%, ${wave.strength * 0.08})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(source.x, source.y, wave.radius + 18, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGeodesics(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  source: { x: number; y: number },
  intensity: number,
  time: number,
  isMobile: boolean,
) {
  const tracks = isMobile ? 7 : 10;
  const rowGap = height / (tracks + 1);

  ctx.save();
  ctx.lineWidth = 1.25;
  for (let row = 0; row < tracks; row++) {
    const startY = rowGap * (row + 1);
    const hue = 188 + row * 2.3;
    ctx.strokeStyle = `hsla(${hue}, 58%, 72%, 0.18)`;
    ctx.beginPath();
    let x = -40;
    let y = startY;
    ctx.moveTo(x, y);

    while (x < width + 60) {
      const dx = x - source.x;
      const dy = y - source.y;
      const distanceSq = dx * dx + dy * dy + 3200;
      const bend = (-dy / distanceSq) * 9400 * intensity;
      const wave = Math.sin(time * 0.55 + row * 0.6 + x * 0.008) * 0.18;
      y += bend * 12 + wave;
      x += 14;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSource(
  ctx: CanvasRenderingContext2D,
  source: { x: number; y: number },
  time: number,
  intensity: number,
  isDragging: boolean,
) {
  const halo = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, 160);
  halo.addColorStop(0, "rgba(120, 214, 221, 0.28)");
  halo.addColorStop(0.45, "rgba(120, 214, 221, 0.12)");
  halo.addColorStop(1, "rgba(120, 214, 221, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(source.x, source.y, 160, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = `rgba(120, 214, 221, ${isDragging ? 0.42 : 0.22})`;
  ctx.lineWidth = 1;
  const orbitBase = isDragging ? 44 : 36;
  for (let index = 0; index < 3; index++) {
    ctx.beginPath();
    ctx.arc(
      source.x,
      source.y,
      orbitBase + index * 18 + Math.sin(time * 1.2 + index) * 2.5 * intensity,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(240, 251, 252, 0.94)";
  ctx.beginPath();
  ctx.arc(source.x, source.y, isDragging ? 8 : 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(120, 214, 221, 0.28)";
  ctx.beginPath();
  ctx.arc(source.x, source.y, isDragging ? 14 : 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  panelRect: ViewRect,
  bodyRect: ViewRect,
  lens: LensState,
) {
  ctx.save();
  softRect(ctx, panelRect.x, panelRect.y, panelRect.width, panelRect.height, 34);
  ctx.save();
  ctx.clip();

  const fill = ctx.createLinearGradient(
    panelRect.x,
    panelRect.y,
    panelRect.x,
    panelRect.y + panelRect.height,
  );
  fill.addColorStop(0, "rgba(12, 20, 26, 0.92)");
  fill.addColorStop(0.52, "rgba(9, 17, 22, 0.82)");
  fill.addColorStop(1, "rgba(7, 14, 18, 0.94)");
  ctx.fillStyle = fill;
  ctx.fillRect(panelRect.x, panelRect.y, panelRect.width, panelRect.height);

  ctx.strokeStyle = "rgba(120, 214, 221, 0.06)";
  ctx.lineWidth = 1;
  for (let y = panelRect.y + 24; y <= panelRect.y + panelRect.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(panelRect.x + 20, y);
    ctx.lineTo(panelRect.x + panelRect.width - 20, y);
    ctx.stroke();
  }

  const lensGlow = ctx.createRadialGradient(lens.x, lens.y, 0, lens.x, lens.y, lens.radius * 1.8);
  lensGlow.addColorStop(0, "rgba(120, 214, 221, 0.18)");
  lensGlow.addColorStop(0.58, "rgba(120, 214, 221, 0.08)");
  lensGlow.addColorStop(1, "rgba(120, 214, 221, 0)");
  ctx.fillStyle = lensGlow;
  ctx.beginPath();
  ctx.arc(lens.x, lens.y, lens.radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(120, 214, 221, 0.18)";
  ctx.lineWidth = 1.1;
  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, lens.radius + ring * 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(120, 214, 221, 0.2)";
  ctx.beginPath();
  ctx.moveTo(bodyRect.x, bodyRect.y - 18);
  ctx.lineTo(bodyRect.x + bodyRect.width * 0.26, bodyRect.y - 18);
  ctx.stroke();

  ctx.restore();

  ctx.strokeStyle = "rgba(120, 214, 221, 0.22)";
  ctx.lineWidth = 1;
  softRect(ctx, panelRect.x, panelRect.y, panelRect.width, panelRect.height, 34);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  softRect(
    ctx,
    panelRect.x + 1,
    panelRect.y + 1,
    panelRect.width - 2,
    panelRect.height - 2,
    33,
  );
  ctx.stroke();
  ctx.restore();
}

function deriveLens(bodyRect: ViewRect, source: { x: number; y: number }, view: ViewRect): LensState {
  const normX = source.x / view.width;
  const normY = source.y / view.height;
  const preferRight = normX < 0.48;
  const radius = Math.min(bodyRect.width * 0.22, bodyRect.height * 0.24);
  const x = preferRight
    ? bodyRect.x + bodyRect.width * 0.2 + normX * bodyRect.width * 0.14
    : bodyRect.x + bodyRect.width * 0.74 + (normX - 0.48) * bodyRect.width * 0.12;
  const y = bodyRect.y + bodyRect.height * (0.18 + normY * 0.48);

  return { x, y, radius, preferRight };
}

function drawAtlasText(
  ctx: CanvasRenderingContext2D,
  pretext: PretextModule,
  prepared: PreparedCopy,
  bodyRect: ViewRect,
  lens: LensState,
  isMobile: boolean,
) {
  const lineHeight = isMobile ? 22 : 24;
  const font = isMobile ? BODY_FONT_MOBILE : BODY_FONT;
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = bodyRect.y;

  ctx.save();
  ctx.font = font;
  ctx.textBaseline = "top";

  while (y <= bodyRect.y + bodyRect.height - lineHeight) {
    const centerY = y + lineHeight / 2;
    const dy = centerY - lens.y;
    let lineX = bodyRect.x;
    let lineWidth = bodyRect.width;

    if (Math.abs(dy) < lens.radius) {
      const chord = Math.sqrt(lens.radius * lens.radius - dy * dy);
      if (lens.preferRight) {
        const start = lens.x + chord + 14;
        if (start < bodyRect.x + bodyRect.width - 72) {
          lineX = start;
          lineWidth = bodyRect.x + bodyRect.width - start;
        }
      } else {
        const end = lens.x - chord - 14;
        if (end > bodyRect.x + 72) {
          lineWidth = end - bodyRect.x;
        }
      }
    }

    if (lineWidth < 48) {
      y += lineHeight;
      continue;
    }

    const line = pretext.layoutNextLine(prepared, cursor, lineWidth);
    if (!line) break;

    const proximity = clamp(1 - Math.abs(centerY - lens.y) / (lens.radius * 1.6), 0, 1);
    ctx.fillStyle = `rgba(219, 235, 237, ${0.64 + proximity * 0.22})`;
    ctx.fillText(line.text, lineX, y);

    cursor = line.end;
    y += lineHeight;
  }

  ctx.restore();
}

function getMetrics(
  mode: FieldMode,
  source: { x: number; y: number; vx: number; vy: number },
  viewport: ViewRect,
  waves: WavePulse[],
) {
  const dx = source.x - viewport.width * 0.34;
  const dy = source.y - viewport.height * 0.46;
  const distance = Math.hypot(dx, dy);
  const norm = clamp(distance / (Math.min(viewport.width, viewport.height) * 0.42), 0, 1);
  const speed = Math.hypot(source.vx, source.vy);
  const front = waves[0]?.radius ?? 0;

  switch (mode) {
    case "curvature":
      return {
        primary: formatMetric(0.36 + (1 - norm) * 1.12, "kappa"),
        secondary: formatMetric(0.013 + (1 - norm) * 0.072, "m^-1"),
        tertiary: formatMetric(0.82 + speed * 0.26, "tau"),
      };
    case "wavefront":
      return {
        primary: formatMetric(0.72 + front / 180, "lambda"),
        secondary: formatMetric(18 + speed * 190, "ms"),
        tertiary: formatMetric(0.42 + (1 - norm) * 0.44, "sigma"),
      };
    case "geodesic":
      return {
        primary: formatMetric(1.7 + (1 - norm) * 7.2, "deg"),
        secondary: formatMetric(0.014 + speed * 0.011, "1/s"),
        tertiary: formatMetric(1.08 + (1 - norm) * 1.46, "tau"),
      };
  }
}

export default function Playground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyBoundsRef = useRef<HTMLDivElement>(null);
  const primaryMetricRef = useRef<HTMLSpanElement>(null);
  const secondaryMetricRef = useRef<HTMLSpanElement>(null);
  const tertiaryMetricRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef<FieldMode>("curvature");
  const reducedMotionRef = useRef(false);
  const interactedRef = useRef(false);
  const pulseRef = useRef<((strength?: number) => void) | null>(null);
  const [mode, setMode] = useState<FieldMode>("curvature");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
    pulseRef.current?.(1.12);
  }, [mode]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPref = () => setReducedMotion(media.matches);

    applyMotionPref();
    media.addEventListener("change", applyMotionPref);
    return () => media.removeEventListener("change", applyMotionPref);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    const copyBounds = copyBoundsRef.current;
    const primaryMetric = primaryMetricRef.current;
    const secondaryMetric = secondaryMetricRef.current;
    const tertiaryMetric = tertiaryMetricRef.current;

    if (!canvas || !panel || !copyBounds || !primaryMetric || !secondaryMetric || !tertiaryMetric) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      setFailed("Canvas rendering is not available in this browser.");
      return;
    }

    let raf = 0;
    let destroyed = false;
    let dpr = window.devicePixelRatio || 1;
    let panelRect: ViewRect = { x: 0, y: 0, width: 0, height: 0 };
    let bodyRect: ViewRect = { x: 0, y: 0, width: 0, height: 0 };
    let view: ViewRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    let pretext: PretextModule | null = null;
    let preparedDesktop: Record<FieldMode, PreparedCopy> | null = null;
    let preparedMobile: Record<FieldMode, PreparedCopy> | null = null;
    let pulseClock = 0;
    let lastFrame = performance.now();
    const pointer = { x: view.width * 0.34, y: view.height * 0.46, down: false };
    const source = { x: pointer.x, y: pointer.y, vx: 0, vy: 0 };
    const target = { x: pointer.x, y: pointer.y };
    const waves: WavePulse[] = [];
    const stars = createStars(76);

    const markInteracted = () => {
      if (interactedRef.current) return;
      interactedRef.current = true;
      setHasInteracted(true);
    };

    const setMetrics = (metrics: MetricSnapshot) => {
      primaryMetric.textContent = metrics.primary;
      secondaryMetric.textContent = metrics.secondary;
      tertiaryMetric.textContent = metrics.tertiary;
    };

    const resizeCanvas = () => {
      view = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(view.width * dpr);
      canvas.height = Math.round(view.height * dpr);
      canvas.style.width = `${view.width}px`;
      canvas.style.height = `${view.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const measureLayout = () => {
      const panelBox = panel.getBoundingClientRect();
      const bodyBox = copyBounds.getBoundingClientRect();

      panelRect = {
        x: panelBox.left,
        y: panelBox.top,
        width: panelBox.width,
        height: panelBox.height,
      };
      bodyRect = {
        x: bodyBox.left,
        y: bodyBox.top,
        width: bodyBox.width,
        height: bodyBox.height,
      };
    };

    const getInteractionBounds = () => {
      const desktop = view.width >= 960;
      const margin = 48;

      if (desktop && panelRect.width > 0) {
        return {
          minX: margin,
          maxX: Math.max(margin, panelRect.x - 72),
          minY: margin + 32,
          maxY: view.height - margin,
        };
      }

      if (!desktop && panelRect.height > 0) {
        return {
          minX: margin,
          maxX: view.width - margin,
          minY: margin + 28,
          maxY: Math.max(margin, panelRect.y - 78),
        };
      }

      return {
        minX: margin,
        maxX: view.width - margin,
        minY: margin,
        maxY: view.height - margin,
      };
    };

    const spawnPulse = (strength = 1) => {
      waves.unshift({
        radius: 0,
        strength,
        hueShift: modeRef.current === "wavefront" ? 12 : modeRef.current === "geodesic" ? -8 : 0,
      });
      while (waves.length > 7) waves.pop();
    };

    pulseRef.current = spawnPulse;

    const setTarget = (clientX: number, clientY: number) => {
      const bounds = getInteractionBounds();
      target.x = clamp(clientX, bounds.minX, bounds.maxX);
      target.y = clamp(clientY, bounds.minY, bounds.maxY);
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointer.down = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
      setTarget(event.clientX, event.clientY);
      markInteracted();
      spawnPulse(1.22);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!pointer.down) return;
      setTarget(event.clientX, event.clientY);
    };

    const handlePointerUp = () => {
      pointer.down = false;
    };

    const handleResize = () => {
      resizeCanvas();
      measureLayout();
    };

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measureLayout())
        : null;

    observer?.observe(panel);
    observer?.observe(copyBounds);

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);
    window.addEventListener("resize", handleResize);

    const boot = async () => {
      try {
        await Promise.all([
          document.fonts.ready,
          document.fonts.load(BODY_FONT),
          document.fonts.load(BODY_FONT_MOBILE),
          document.fonts.load(MONO_FONT),
          document.fonts.load(MONO_FONT_MOBILE),
        ]);

        const mod = await import("@chenglou/pretext");
        pretext = mod;
        preparedDesktop = {
          curvature: mod.prepareWithSegments(MODE_CONFIG.curvature.body, BODY_FONT),
          wavefront: mod.prepareWithSegments(MODE_CONFIG.wavefront.body, BODY_FONT),
          geodesic: mod.prepareWithSegments(MODE_CONFIG.geodesic.body, BODY_FONT),
        };
        preparedMobile = {
          curvature: mod.prepareWithSegments(MODE_CONFIG.curvature.body, BODY_FONT_MOBILE),
          wavefront: mod.prepareWithSegments(MODE_CONFIG.wavefront.body, BODY_FONT_MOBILE),
          geodesic: mod.prepareWithSegments(MODE_CONFIG.geodesic.body, BODY_FONT_MOBILE),
        };

        resizeCanvas();
        measureLayout();

        if (!destroyed) {
          setReady(true);
          raf = requestAnimationFrame(frame);
        }
      } catch (error) {
        if (!destroyed) {
          const message =
            error instanceof Error ? error.message : "Unable to initialize the field atlas.";
          setFailed(message);
        }
      }
    };

    const frame = (now: number) => {
      if (destroyed || !pretext || !preparedDesktop || !preparedMobile) return;

      const dt = Math.min((now - lastFrame) / 1000, 0.032);
      lastFrame = now;
      const time = now * 0.001;
      const isMobile = view.width < 960;
      const reduced = reducedMotionRef.current;
      const bounds = getInteractionBounds();

      if (!pointer.down) {
        const driftX = bounds.minX + (bounds.maxX - bounds.minX) * (0.46 + Math.sin(time * 0.18) * 0.16);
        const driftY = bounds.minY + (bounds.maxY - bounds.minY) * (0.44 + Math.cos(time * 0.21) * 0.13);
        target.x = reduced ? lerp(target.x, driftX, 0.02) : driftX;
        target.y = reduced ? lerp(target.y, driftY, 0.02) : driftY;
      }

      const spring = pointer.down ? 0.18 : reduced ? 0.04 : 0.11;
      source.vx += (target.x - source.x) * spring;
      source.vy += (target.y - source.y) * spring;
      source.vx *= pointer.down ? 0.72 : 0.84;
      source.vy *= pointer.down ? 0.72 : 0.84;
      source.x += source.vx;
      source.y += source.vy;

      pulseClock += dt;
      if (pulseClock > (modeRef.current === "wavefront" ? 1.15 : 1.95)) {
        spawnPulse(modeRef.current === "wavefront" ? 1.18 : 0.88);
        pulseClock = 0;
      }

      for (let index = waves.length - 1; index >= 0; index--) {
        waves[index]!.radius += reduced ? 0.9 : 1.8 + waves[index]!.strength * 1.7;
        waves[index]!.strength *= reduced ? 0.986 : 0.976;
        if (waves[index]!.strength < 0.04) {
          waves.splice(index, 1);
        }
      }

      const fieldStrength =
        0.9 +
        clamp(
          1 - Math.hypot(source.x - view.width * 0.34, source.y - view.height * 0.46) /
            (Math.min(view.width, view.height) * 0.48),
          0,
          1,
        ) *
          1.1;

      const lens = deriveLens(bodyRect, source, view);
      const metrics = getMetrics(modeRef.current, source, view, waves);
      setMetrics(metrics);

      ctx.fillStyle = BACKDROP;
      ctx.fillRect(0, 0, view.width, view.height);

      const aura = ctx.createRadialGradient(
        source.x,
        source.y,
        0,
        source.x,
        source.y,
        Math.min(view.width, view.height) * 0.75,
      );
      aura.addColorStop(0, "rgba(120, 214, 221, 0.1)");
      aura.addColorStop(0.4, "rgba(120, 214, 221, 0.04)");
      aura.addColorStop(1, "rgba(120, 214, 221, 0)");
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, view.width, view.height);

      drawStars(ctx, stars, view.width, view.height, time);
      drawGridField(ctx, view.width, view.height, source, fieldStrength, isMobile);

      if (modeRef.current === "wavefront") {
        drawWavefronts(ctx, source, waves);
      }

      if (modeRef.current === "geodesic") {
        drawGeodesics(ctx, view.width, view.height, source, fieldStrength * 0.42, time, isMobile);
      }

      if (modeRef.current === "curvature") {
        ctx.save();
        ctx.strokeStyle = "rgba(120, 214, 221, 0.2)";
        ctx.lineWidth = 1;
        for (let ring = 0; ring < 5; ring++) {
          ctx.beginPath();
          ctx.arc(
            source.x,
            source.y,
            92 + ring * 28 + Math.sin(time * 0.9 + ring) * 2.4,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      drawSource(ctx, source, time, fieldStrength * 0.8, pointer.down);
      drawPanel(ctx, panelRect, bodyRect, lens);
      drawAtlasText(
        ctx,
        pretext,
        isMobile ? preparedMobile[modeRef.current] : preparedDesktop[modeRef.current],
        bodyRect,
        lens,
        isMobile,
      );

      raf = requestAnimationFrame(frame);
    };

    boot();

    return () => {
      destroyed = true;
      pulseRef.current = null;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, []);

  const currentMode = MODE_CONFIG[mode];

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#091016] text-[#edf6f7]"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 px-4 py-4 md:px-8 md:py-8">
        <div className="max-w-[30rem]">
          <p
            className="text-[11px] uppercase tracking-[0.3em] text-white/42"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Physics Field Atlas
          </p>
          <h1 className="mt-4 max-w-[9ch] text-[clamp(2.9rem,6vw,5.6rem)] leading-[0.94] tracking-[-0.05em] text-white/94">
            Spacetime and field behavior, rendered live.
          </h1>
          <p className="mt-5 max-w-[34rem] text-sm leading-7 text-[#b8c7cb] md:text-[1.01rem]">
            A minimal physics instrument built on canvas dynamics and Pretext line
            layout. The field source changes the geometry, the wavefront, and the
            way the atlas text yields space inside the panel.
          </p>
        </div>

        <div className="pointer-events-auto absolute right-4 top-4 flex items-center gap-3 md:right-8 md:top-8">
          <div className="rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-1">
              {MODE_ORDER.map((option) => {
                const isActive = option === mode;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setMode(option)}
                    className={`press rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.24em] transition-colors duration-200 ease-out ${
                      isActive
                        ? "bg-[#77d6dd]/15 text-[#dff7f8]"
                        : "text-white/42 hover:text-white/78"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {MODE_CONFIG[option].label}
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            to="/"
            aria-label="Return home"
            className="press grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/72 transition-[background-color,color] duration-200 ease-out hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Link>
        </div>

        <div
          ref={panelRef}
          className="absolute left-4 right-4 bottom-4 top-[55dvh] md:left-auto md:right-8 md:top-8 md:bottom-8 md:w-[min(34rem,36vw)]"
        >
          <div className="relative h-full w-full px-6 py-6 md:px-8 md:py-8">
            <div className="max-w-[24rem]">
              <p
                className="text-[11px] uppercase tracking-[0.26em] text-[#94adb1]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {currentMode.label}
              </p>
              <h2 className="mt-3 text-2xl tracking-[-0.04em] text-white md:text-[2rem]">
                {currentMode.title}
              </h2>
              <p className="mt-3 max-w-[26rem] text-sm leading-6 text-[#9db2b6] md:text-[0.98rem]">
                {currentMode.subtitle}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 md:mt-7">
              {(
                [
                  ["primary", primaryMetricRef],
                  ["secondary", secondaryMetricRef],
                  ["tertiary", tertiaryMetricRef],
                ] as [MetricKey, typeof primaryMetricRef][]
              ).map(([key, ref]) => (
                <div
                  key={key}
                  className="rounded-[1.3rem] border border-white/8 bg-white/[0.025] px-3 py-3"
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] text-white/38"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {currentMode.metrics[key].label}
                  </p>
                  <span
                    ref={ref}
                    className="mt-3 block text-sm text-white/86 md:text-[0.98rem]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              ))}
            </div>

            <div
              ref={copyBoundsRef}
              className="absolute bottom-8 left-6 right-6 top-[12.8rem] md:bottom-9 md:left-8 md:right-8 md:top-[14.2rem]"
            />

            <p
              className="absolute bottom-6 left-6 right-6 text-[11px] leading-5 text-white/34 md:bottom-7 md:left-8 md:right-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {currentMode.footer}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 max-w-[18rem] md:bottom-8 md:left-8">
          <p
            className="text-[11px] uppercase tracking-[0.24em] text-white/34"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {reducedMotion ? "Reduced motion active" : hasInteracted ? "Source locked to your hand" : "Awaiting input"}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/48">
            {hasInteracted
              ? "Hold and drag the field source to bend the grid and rewrite the atlas geometry."
              : "Press and drag the field source. The simulation responds as a metric, a wavefront, or a geodesic sheet."}
          </p>
        </div>
      </div>

      {!ready && !failed && (
        <div className="absolute inset-0 grid place-items-center bg-[#091016]">
          <div className="w-[18rem] rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <div className="h-2 w-24 rounded-full bg-white/10" />
            <div className="mt-6 space-y-3">
              <div className="animate-data-shimmer h-10 rounded-2xl bg-white/6" />
              <div className="animate-data-shimmer h-10 rounded-2xl bg-white/5 [animation-delay:120ms]" />
              <div className="animate-data-shimmer h-10 rounded-2xl bg-white/4 [animation-delay:240ms]" />
            </div>
            <p
              className="mt-6 text-[11px] uppercase tracking-[0.24em] text-white/42"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Preparing field geometry
            </p>
          </div>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 grid place-items-center bg-[#091016]/96 p-6">
          <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 text-left shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <p
              className="text-[11px] uppercase tracking-[0.24em] text-white/42"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Initialization error
            </p>
            <h2 className="mt-4 text-2xl tracking-[-0.04em] text-white">
              The field atlas could not start.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">{failed}</p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm text-white/86 transition-colors hover:bg-white/[0.1]"
            >
              Return home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
