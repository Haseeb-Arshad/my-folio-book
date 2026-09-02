import { useEffect, useRef } from "react";

/* ───────────────────────────────────────────────────────────
   A circular cursor that inverts whatever sits under it.

   The ring is a white disc in `mix-blend-mode: difference`, so it subtracts
   the backdrop rather than painting over it. White page becomes black ring,
   black text becomes white, and any colour in between comes back as its
   complement, with no need to know in advance what it is passing over.

   It mounts only for a fine pointer. A touch device has no cursor to replace,
   so there it renders nothing and installs no listeners.
   ─────────────────────────────────────────────────────────── */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    /* Reduced motion keeps the ring but drops the easing, so it tracks the
       pointer exactly instead of trailing it. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let visible = false;

    /* Anything that responds to a click grows the ring, so the cursor
       reports what is actionable without a colour change. */
    const INTERACTIVE =
      "a, button, summary, label, [role='button'], [role='link'], [tabindex]:not([tabindex='-1'])";

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        visible = true;
        /* Jump to the pointer on first sight rather than sliding in from
           the middle of the screen. */
        x = targetX;
        y = targetY;
        el.style.opacity = "1";
      }

      const target = event.target as Element | null;
      const over = target?.closest?.(INTERACTIVE) ?? null;
      el.dataset.over = over ? "true" : "false";
    };

    const hide = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const tick = () => {
      const ease = reduced ? 1 : 0.22;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return <div ref={ring} className="site-cursor" aria-hidden="true" />;
}
