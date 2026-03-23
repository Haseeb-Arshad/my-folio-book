import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";

/* ─── Logo ─── */
function LogoIcon() {
  return (
    <Link to="/">
      <svg
        width="24"
        height="28"
        viewBox="0 0 24 28"
        fill="none"
        className="text-gray-800 hover:text-gray-600 transition-colors"
      >
        <rect x="0" y="0" width="3" height="28" rx="1.5" fill="currentColor" />
        <rect x="7" y="0" width="3" height="28" rx="1.5" fill="currentColor" />
        <rect x="14" y="0" width="3" height="18" rx="1.5" fill="currentColor" />
      </svg>
    </Link>
  );
}

/* ─── Analog Clock (inline-expanded) ─── */
function AnalogClock({ onBook }: { onBook: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
        <span className="text-gray-400">{month}</span>
        <span className="text-gray-900 font-semibold">{day}</span>
      </div>

      <div className="relative w-[100px] h-[100px]">
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
        <div className="text-[10px] text-gray-400 tracking-wider uppercase">
          {ampm}
        </div>
      </div>

      <button
        onClick={onBook}
        className="text-[11px] text-gray-400 hover:text-gray-900 transition-colors mt-1 underline underline-offset-2"
      >
        Book a meeting
      </button>
    </div>
  );
}

/* ─── Date Badge ─── */
function DateBadge() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "short" });
  const day = now.getDate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBook = () => {
    // Replace with your Cal.com link
    window.open("https://cal.com", "_blank");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-400 text-sm tracking-wide hover:text-gray-600 transition-colors"
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
          className={`transition-transform duration-300 ${open ? "rotate-90" : "-rotate-45"}`}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 z-50 animate-expand-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 min-w-[200px]">
            <AnalogClock onBook={handleBook} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Music Player ─── */
function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", onUpdate);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onUpdate);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const ct = audioRef.current?.currentTime || 0;
  const dur = audioRef.current?.duration || 0;
  const rem = dur - ct;

  return (
    <div ref={ref} className="relative">
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/audio/2024/11/29/audio_d4b7e5b42f.mp3"
        preload="metadata"
      />

      {/* Collapsed pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 bg-gray-900 rounded-full px-3 py-1.5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_24px_rgba(99,102,241,0.2)]"
        >
          <div
            className="w-7 h-7 rounded-full shrink-0"
            style={{
              background: "radial-gradient(circle at 30% 30%, #818cf8, #6d28d9, #312e81)",
            }}
          />
          <div className="flex gap-[3px] items-end h-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-gray-500"
                style={
                  isPlaying
                    ? {
                        height: "4px",
                        animation: `eqBar${((i - 1) % 5) + 1} ${0.4 + i * 0.1}s ease-in-out infinite`,
                      }
                    : { height: `${8 + Math.sin(i * 1.2) * 4}px` }
                }
              />
            ))}
          </div>
        </button>
      )}

      {/* Expanded inline player */}
      {open && (
        <div className="animate-expand-in">
          <div className="bg-gray-950 rounded-2xl p-4 w-[300px] shadow-2xl border border-gray-800/40">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-400 transition-colors z-10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Track */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg shrink-0 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #312e81 0%, #6d28d9 50%, #818cf8 100%)",
                }}
              >
                <div className="w-full h-full flex items-center justify-center opacity-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  Cornfield Chase
                </div>
                <div className="text-gray-500 text-xs">Hans Zimmer</div>
              </div>
              <div className="flex gap-[3px] items-end h-3.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-[2.5px] rounded-full bg-indigo-500"
                    style={
                      isPlaying
                        ? {
                            height: "3px",
                            animation: `eqBar${i} ${0.3 + i * 0.12}s ease-in-out infinite`,
                          }
                        : { height: `${3 + i * 2}px` }
                    }
                  />
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div
                className="w-full h-[3px] bg-gray-800 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const audio = audioRef.current;
                  if (!audio || !audio.duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  audio.currentTime = pct * audio.duration;
                }}
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%`, transition: "width 0.15s linear" }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-600 tabular-nums">
                <span>{fmt(ct)}</span>
                <span>-{fmt(rem > 0 ? rem : 0)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-7">
              <button
                className="text-white/60 hover:text-white transition-colors"
                onClick={() => {
                  if (audioRef.current)
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                </svg>
              </button>
              <button
                className="text-white hover:scale-105 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                className="text-white/60 hover:text-white transition-colors"
                onClick={() => {
                  if (audioRef.current)
                    audioRef.current.currentTime = Math.min(
                      audioRef.current.duration || 0,
                      audioRef.current.currentTime + 10
                    );
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Navigation ─── */
function Nav() {
  const location = useLocation();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  const items = [
    { label: "Work", to: "/work" },
    { label: "Photos", to: "/photos" },
    { label: "Connect", to: "/connect" },
    { label: "Now", to: "/now" },
  ];

  const activeIdx = items.findIndex((item) => location.pathname === item.to);

  const updateIndicator = (idx: number | null) => {
    if (idx === null) {
      // If there's an active route, snap to that
      if (activeIdx >= 0) {
        updateIndicator(activeIdx);
      } else {
        setIndicatorStyle({ opacity: 0, transition: "opacity 0.2s ease" });
      }
      return;
    }
    const nav = navRef.current;
    if (!nav) return;
    const links = nav.querySelectorAll<HTMLElement>("[data-nav-item]");
    const el = links[idx];
    if (!el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicatorStyle({
      width: `${elRect.width}px`,
      transform: `translateX(${elRect.left - navRect.left}px)`,
      opacity: 1,
      transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
    });
  };

  useEffect(() => {
    if (activeIdx >= 0) updateIndicator(activeIdx);
  }, [location.pathname]);

  return (
    <nav ref={navRef} className="relative flex gap-1 pt-4 pb-16">
      {/* Sliding background indicator */}
      <div
        className="absolute top-4 left-0 h-[36px] bg-gray-100 rounded-lg pointer-events-none"
        style={indicatorStyle}
      />

      {items.map((item, i) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            data-nav-item
            className={`relative z-10 px-4 py-1.5 text-[0.95rem] transition-colors duration-200 rounded-lg ${
              isActive
                ? "text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onMouseEnter={() => {
              setHoverIdx(i);
              updateIndicator(i);
            }}
            onMouseLeave={() => {
              setHoverIdx(null);
              updateIndicator(null);
            }}
          >
            <span className="relative">
              {item.label}
              {isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-gray-900 rounded-full" />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── Full Header ─── */
export default function Header() {
  return (
    <>
      <header className="max-w-[980px] mx-auto px-6 pt-12 pb-6">
        <div className="animate-blur-in" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center justify-between">
            <LogoIcon />
            <MusicPlayer />
            <DateBadge />
          </div>
        </div>
      </header>
    </>
  );
}

export { Nav };
