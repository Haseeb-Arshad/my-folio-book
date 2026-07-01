import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";

/* ─── Blur-in wrapper ─── */
function BlurIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="animate-blur-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Logo ─── */
function LogoIcon() {
  return (
    <Link to="/" aria-label="Haseeb Arshad, home">
      <svg
        width="24"
        height="28"
        viewBox="0 0 24 28"
        fill="none"
        aria-hidden="true"
        className="text-gray-800 hover:text-gray-600 transition-colors"
      >
        <rect x="0" y="0" width="3" height="28" rx="1.5" fill="currentColor" />
        <rect x="7" y="0" width="3" height="28" rx="1.5" fill="currentColor" />
        <rect x="14" y="0" width="3" height="18" rx="1.5" fill="currentColor" />
      </svg>
    </Link>
  );
}

/* ─── helper: get Date in Asia/Karachi ─── */
function pktDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
}

/* ─── Analog Clock ─── */
function AnalogClock({ onBook }: { onBook: () => void }) {
  const [time, setTime] = useState(pktDate);

  useEffect(() => {
    const id = setInterval(() => setTime(pktDate()), 1000);
    return () => clearInterval(id);
  }, []);

  /* everything below derives from the single `time` read, so the hands,
     the date, and the digital readout can never disagree */
  const s = time.getSeconds();
  const m = time.getMinutes();
  const h = time.getHours() % 12;
  const sDeg = s * 6;
  const mDeg = m * 6 + s * 0.1;
  const hDeg = h * 30 + m * 0.5;

  const month = time.toLocaleString("en-US", { month: "short" });
  const day = time.getDate();
  const timeStr = time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const [tp, ampm] = timeStr.split(" ");

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">{month}</span>
        <span className="text-gray-900 font-medium">{day}</span>
      </div>

      <div
        className="relative w-[100px] h-[100px]"
        role="img"
        aria-label={`Current time in Pakistan: ${timeStr}`}
      >
        <div className="absolute inset-0 rounded-full border-[1.5px] border-gray-200" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const r = 44;
          const cx = 50 + r * Math.sin(angle);
          const cy = 50 - r * Math.cos(angle);
          return (
            <div
              key={i}
              className="absolute w-[2px] h-[4px] bg-gray-300 rounded-full"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
            />
          );
        })}
        <div
          className="absolute bg-gray-900 rounded-full"
          style={{
            width: "2.5px",
            height: "24px",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -100%) rotate(${hDeg}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
        <div
          className="absolute bg-gray-900 rounded-full"
          style={{
            width: "1.5px",
            height: "32px",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -100%) rotate(${mDeg}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: "1px",
            height: "36px",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -100%) rotate(${sDeg}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
        <div className="absolute w-[6px] h-[6px] bg-red-500 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
      </div>

      <div className="text-center">
        <div className="text-xl font-light tracking-[0.15em] text-gray-900">
          {tp}
        </div>
        <div className="text-[10px] text-gray-500 tracking-wider uppercase">
          {ampm}
        </div>
      </div>

      <button
        onClick={onBook}
        className="press text-[11px] text-gray-500 hover:text-gray-900 transition-colors mt-1 underline underline-offset-2"
      >
        Book a meeting
      </button>
    </div>
  );
}

/* ─── Date Badge (backdrop pattern — click-safe) ─── */
function DateBadge() {
  const [open, setOpen] = useState(false);

  const now = pktDate();
  const month = now.toLocaleString("en-US", { month: "short" });
  const day = now.getDate();

  const handleBook = () => {
    window.open("https://calendly.com/haseebarshad/30min", "_blank");
  };

  /* Close on scroll (the header isn't sticky, so the panel would otherwise
     drift off-screen) and on Escape. */
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Today is ${month} ${day}. Show clock and booking options`}
        className="relative z-50 flex items-center gap-1.5 text-gray-500 text-sm tracking-wide hover:text-gray-700 transition-colors"
      >
        <span>{month}</span>
        <span className="text-gray-800 font-medium">{day}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          className={`transition-transform duration-300 ${open ? "rotate-90" : "-rotate-45"}`}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Invisible backdrop — clicking it closes the panel */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Clock panel — above backdrop, fully interactive */}
          <div
            role="dialog"
            aria-label="Local time and booking"
            className="absolute top-full right-0 mt-3 z-50 animate-expand-in"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 min-w-[200px]">
              <AnalogClock onBook={handleBook} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Navigation (Apple-style pill with hover tracking) ─── */
function Nav() {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const hasMounted = useRef(false);

  const items = [
    { label: "Work", to: "/work" },
    { label: "Blog", to: "/blog" },
    { label: "Connect", to: "/connect" },
    { label: "Now", to: "/now" },
  ];

  /* prefix match so nested routes (e.g. /blog/some-post) keep their tab lit */
  const activeIdx = items.findIndex(
    (item) =>
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
  );

  const measureTab = (idx: number) => {
    const nav = navRef.current;
    if (!nav || idx < 0) return null;
    const el = nav.querySelectorAll<HTMLElement>("[data-nav]")[idx];
    if (!el) return null;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      width: `${elRect.width}px`,
      transform: `translateX(${elRect.left - navRect.left}px)`,
    };
  };

  /* position pill on active tab */
  useEffect(() => {
    if (activeIdx < 0) {
      setPillStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const pos = measureTab(activeIdx);
    if (!pos) return;

    setPillStyle({
      ...pos,
      opacity: 1,
      transition: hasMounted.current
        ? "transform 0.45s var(--ease-out), width 0.45s var(--ease-out), opacity 0.35s ease"
        : "opacity 0.35s ease",
    });
    if (!hasMounted.current) hasMounted.current = true;
  }, [activeIdx]);

  /* re-measure when the window resizes or the web font finishes loading —
     both change tab widths and would otherwise leave the pill misaligned */
  useEffect(() => {
    if (activeIdx < 0) return;
    let cancelled = false;

    const snapToActive = () => {
      const pos = measureTab(activeIdx);
      if (!pos || cancelled) return;
      setPillStyle((s) => ({ ...s, ...pos, transition: "none" }));
    };

    window.addEventListener("resize", snapToActive);
    document.fonts?.ready.then(snapToActive);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", snapToActive);
    };
  }, [activeIdx]);

  /* hover → slide pill to hovered tab */
  const handleHover = (idx: number) => {
    const pos = measureTab(idx);
    if (!pos) return;
    setPillStyle((s) => ({
      ...s,
      ...pos,
      opacity: 1,
      transition:
        "transform 0.28s var(--ease-out), width 0.28s var(--ease-out), opacity 0.2s ease",
    }));
  };

  /* leave → return pill to active tab (or hide) */
  const handleLeave = () => {
    if (activeIdx < 0) {
      setPillStyle((s) => ({
        ...s,
        opacity: 0,
        transition: "opacity 0.2s ease",
      }));
      return;
    }
    const pos = measureTab(activeIdx);
    if (!pos) return;
    setPillStyle((s) => ({
      ...s,
      ...pos,
      transition:
        "transform 0.28s var(--ease-out), width 0.28s var(--ease-out)",
    }));
  };

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="relative flex gap-0.5 pt-4 pb-16"
      onMouseLeave={handleLeave}
    >
      {/* sliding pill */}
      <div
        className="absolute top-4 left-0 h-[36px] bg-gray-100 rounded-lg pointer-events-none"
        style={pillStyle}
      />

      {items.map((item, i) => {
        const isActive = i === activeIdx;
        return (
          <Link
            key={item.to}
            to={item.to}
            data-nav=""
            aria-current={isActive ? "page" : undefined}
            onMouseEnter={() => handleHover(i)}
            onFocus={() => handleHover(i)}
            className={`relative z-10 px-4 py-1.5 text-[0.95rem] transition-colors duration-300 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
              isActive
                ? "text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.label}
            {!isActive && (
              <span className="absolute bottom-1.5 left-4 right-4 h-px rounded-full bg-gray-400/30" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Full Header ─── */
export default function Header() {
  return (
    <header className="max-w-[980px] mx-auto px-6 pt-12 pb-6">
      <div className="animate-blur-in" style={{ animationDelay: "0ms" }}>
        <div className="flex items-center justify-between">
          <LogoIcon />
          <DateBadge />
        </div>
      </div>
    </header>
  );
}

export { Nav, BlurIn };
