import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/playground";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Typography Lab — Haseeb Arshad" },
    {
      name: "description",
      content: "Interactive text reflow experiment powered by Pretext",
    },
  ];
}

const QUOTES = [
  "Design is not just what it looks like and feels like — design is how it works.",
  "The details are not the details. They make the design.",
  "Simplicity is the ultimate sophistication.",
  "Good design is as little design as possible.",
  "Technology is nothing — what's important is that you have faith in people.",
  "Stay hungry. Stay foolish.",
  "The only way to do great work is to love what you do.",
  "Code is poetry written in logic.",
  "First, solve the problem. Then, write the code.",
  "Good programmers write code that humans can understand.",
  "The function of good software is to make the complex appear simple.",
  "Perfection is achieved when there is nothing left to take away.",
  "Make it work, make it right, make it fast.",
  "Programs must be written for people to read.",
  "Software is a great combination of artistry and engineering.",
  "The art of programming is the art of organizing complexity.",
  "Every great design begins with an even better story.",
  "Typography is the craft of endowing human language with durable visual form.",
  "Whitespace is like air — it gives everything room to breathe.",
  "The keyboard is my instrument, the screen my canvas, code my medium.",
  "In design, less is more. In code, less is elegant.",
  "Talk is cheap. Show me the code.",
  "The best error message is the one that never shows up.",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
];

const SEP = " · ";
const FULL_TEXT = (QUOTES.join(SEP) + SEP).repeat(12);

export default function Playground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = window.devicePixelRatio || 1;

    /* ── constants ── */
    const R = 130;
    const LH = 26;
    const FS = 16;
    const MX = 52;
    const MY = 28;
    const FONT = `500 ${FS}px "ABC Diatype", ui-sans-serif, system-ui, -apple-system, sans-serif`;

    /* ── mutable state ── */
    const mouse = { x: -999, y: -999, on: false };
    const sm = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let waves: { x: number; y: number; r: number; s: number; h: number }[] = [];
    let t = 0;
    let raf = 0;
    let prep: any = null;
    let nxt: any = null;
    let go = false;

    /* ── resize ── */
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
    };

    /* ── input handlers ── */
    const mm = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const ml = () => {
      mouse.on = false;
    };
    const mc = (e: MouseEvent) => {
      waves.push({
        x: e.clientX,
        y: e.clientY,
        r: 0,
        s: 1,
        h: (t * 30) % 360,
      });
    };
    const tm = (e: TouchEvent) => {
      e.preventDefault();
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.on = true;
    };
    const ts = (e: TouchEvent) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.on = true;
      waves.push({
        x: mouse.x,
        y: mouse.y,
        r: 0,
        s: 1,
        h: (t * 30) % 360,
      });
    };
    const te = () => {
      mouse.on = false;
    };

    /* ── draw one line of text ── */
    function drawLn(
      text: string,
      x: number,
      y: number,
      cy: number,
      W: number,
      H: number,
      hue: number,
      idx: number,
    ) {
      const dx = x - sm.x;
      const dy = cy - sm.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / (R * 2.8));

      const lh = (hue + idx * 1.3) % 360;
      const sat = 5 + prox * 68;
      const lit = 24 + prox * 42;
      const a = 0.32 + prox * 0.68;

      ctx.fillStyle = `hsla(${lh},${sat}%,${lit}%,${a})`;
      ctx.fillText(text, x, y);
    }

    /* ── frame loop ── */
    const frame = () => {
      t += 1 / 60;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      /* spring physics */
      if (mouse.on) {
        vel.x += (mouse.x - sm.x) * 0.1;
        vel.y += (mouse.y - sm.y) * 0.1;
      } else {
        vel.x += (W / 2 + Math.sin(t * 0.2) * 260 - sm.x) * 0.003;
        vel.y += (H / 2 + Math.cos(t * 0.28) * 190 - sm.y) * 0.003;
      }
      vel.x *= 0.84;
      vel.y *= 0.84;
      sm.x += vel.x;
      sm.y += vel.y;

      /* shockwaves */
      waves = waves.filter((w) => {
        w.r += 9;
        w.s *= 0.965;
        return w.s > 0.005;
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ── background ── */
      ctx.fillStyle = "#07070b";
      ctx.fillRect(0, 0, W, H);

      /* ── void glow ── */
      const hue = (t * 22) % 360;

      const g1 = ctx.createRadialGradient(
        sm.x,
        sm.y,
        0,
        sm.x,
        sm.y,
        R * 2.2,
      );
      g1.addColorStop(0, `hsla(${hue},80%,65%,0.07)`);
      g1.addColorStop(0.35, `hsla(${(hue + 35) % 360},70%,50%,0.035)`);
      g1.addColorStop(0.7, `hsla(${(hue + 70) % 360},60%,40%,0.012)`);
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(
        sm.x,
        sm.y,
        0,
        sm.x,
        sm.y,
        R * 0.5,
      );
      g2.addColorStop(0, `hsla(${hue},90%,72%,0.055)`);
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      /* ── shockwave rings ── */
      for (const w of waves) {
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${w.h},70%,70%,${w.s * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (w.r > 30) {
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.r - 25, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${w.h},50%,60%,${w.s * 0.12})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      /* ── text layout + render ── */
      if (prep && nxt) {
        ctx.font = FONT;
        ctx.textBaseline = "top";

        const cL = MX;
        const cR = W - MX;
        const cW = cR - cL;

        // Decide which side text flows to (consistent for all lines)
        const pushRight = sm.x < cL + cW * 0.5;

        let cur = { segmentIndex: 0, graphemeIndex: 0 };
        let y = MY;
        let idx = 0;
        let resets = 0;

        while (y < H + LH * 2) {
          const cy = y + LH / 2;
          const dy = cy - sm.y;
          const absDy = Math.abs(dy);

          let lw = cW;
          let lx = cL;

          // Variable-width layout around the void
          if (absDy < R && sm.x > cL - R && sm.x < cR + R) {
            const hc = Math.sqrt(R * R - dy * dy);

            if (pushRight) {
              const start = sm.x + hc + 14;
              if (start < cR - 40) {
                lx = Math.max(cL, start);
                lw = cR - lx;
              }
            } else {
              const end = sm.x - hc - 14;
              if (end > cL + 40) {
                lw = end - cL;
              }
            }
          }

          // Shockwave displacement
          let sx = 0;
          let sy = 0;
          for (const w of waves) {
            const wdx = (lx + lw / 2) - w.x;
            const wdy = cy - w.y;
            const wd = Math.sqrt(wdx * wdx + wdy * wdy);
            const rd = Math.abs(wd - w.r);
            if (rd < 70 && wd > 0) {
              const f = w.s * (1 - rd / 70);
              sx += (wdx / wd) * f * 50;
              sy += (wdy / wd) * f * 14;
            }
          }

          if (lw < 30) {
            y += LH;
            idx++;
            continue;
          }

          const line = nxt(prep, cur, lw);
          if (line === null) {
            cur = { segmentIndex: 0, graphemeIndex: 0 };
            resets++;
            if (resets > 3) break;
            continue;
          }
          resets = 0;
          cur = line.end;

          drawLn(line.text, lx + sx, y + sy, cy, W, H, hue, idx);

          y += LH;
          idx++;
        }
      }

      /* ── cursor indicator ── */
      if (mouse.on) {
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},80%,82%,0.85)`;
        ctx.fill();

        ctx.strokeStyle = `hsla(${hue},50%,65%,0.12)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(sm.x - 14, sm.y);
        ctx.lineTo(sm.x + 14, sm.y);
        ctx.moveTo(sm.x, sm.y - 14);
        ctx.lineTo(sm.x, sm.y + 14);
        ctx.stroke();
      }

      /* ── vignette ── */
      const vg = ctx.createRadialGradient(
        W / 2,
        H / 2,
        W * 0.28,
        W / 2,
        H / 2,
        W * 0.72,
      );
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(7,7,11,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    };

    /* ── setup ── */
    resize();
    sm.x = innerWidth / 2;
    sm.y = innerHeight / 2;

    addEventListener("resize", resize);
    canvas.addEventListener("mousemove", mm);
    canvas.addEventListener("mouseleave", ml);
    canvas.addEventListener("click", mc);
    canvas.addEventListener("touchmove", tm, { passive: false });
    canvas.addEventListener("touchstart", ts, { passive: false });
    canvas.addEventListener("touchend", te);

    /* ── load pretext after fonts are ready ── */
    document.fonts.ready.then(() =>
      import("@chenglou/pretext").then((mod) => {
        prep = mod.prepareWithSegments(FULL_TEXT, FONT);
        nxt = mod.layoutNextLine;
        setReady(true);
        if (!go) {
          go = true;
          frame();
        }
      }),
    );

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", mm);
      canvas.removeEventListener("mouseleave", ml);
      canvas.removeEventListener("click", mc);
      canvas.removeEventListener("touchmove", tm);
      canvas.removeEventListener("touchstart", ts);
      canvas.removeEventListener("touchend", te);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#07070b]"
      style={{ cursor: "none", touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block" />

      {/* header */}
      <div className="fixed top-6 left-8 z-10 pointer-events-none">
        <span className="text-white/20 text-[11px] tracking-[0.25em] uppercase font-medium">
          Pretext · Typography Lab
        </span>
      </div>

      {/* close */}
      <Link
        to="/"
        className="fixed top-6 right-8 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/25 hover:text-white/60 transition-all"
        style={{ cursor: "pointer" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Link>

      {/* hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 text-white/[0.13] text-[11px] tracking-wider pointer-events-none select-none">
        <span>Move to interact</span>
        <span className="w-px h-3 bg-white/10" />
        <span>Click for shockwave</span>
      </div>

      {/* loading */}
      {!ready && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#07070b]">
          <span className="text-white/25 text-sm tracking-wider animate-pulse">
            Initializing...
          </span>
        </div>
      )}
    </div>
  );
}
