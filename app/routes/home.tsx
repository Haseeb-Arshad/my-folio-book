import { useState, useRef } from "react";
import type { Route } from "./+types/home";
import Header, { Nav } from "../components/header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Haseeb Arshad — Full-Stack Engineer" },
    {
      name: "description",
      content:
        "Software crafted with curiosity, dedication, and relentless attention to detail.",
    },
  ];
}

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

/* ─── Company link with video popup ─── */
function CompanyLink() {
  const [showVideo, setShowVideo] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowVideo(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setShowVideo(false), 300);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <a
        href="#"
        className="text-gray-900 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-900 transition-all"
      >
        Summon Electronics
      </a>

      {showVideo && (
        <div
          className="absolute top-full left-0 mt-2 z-50 animate-video-in"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="w-[420px] rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto"
              src="https://cdn.pixabay.com/video/2024/04/11/207878_large.mp4"
            />
          </div>
        </div>
      )}
    </span>
  );
}

/* ─── Phone Mockup ─── */
function PhoneMockup({
  variant,
  className = "",
}: {
  variant: "accounts" | "investments" | "savings";
  className?: string;
}) {
  const time =
    variant === "accounts" ? "5:30" : variant === "investments" ? "5:32" : "5:31";

  return (
    <div
      className={`relative w-[280px] shrink-0 ${className}`}
      style={{ aspectRatio: "9/19" }}
    >
      <div className="absolute inset-0 rounded-[2.5rem] bg-black shadow-2xl overflow-hidden border-[3px] border-gray-800">
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <div className="flex items-center gap-1">
            <span className="text-white text-xs font-semibold">{time}</span>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="white" className="ml-0.5">
              <path d="M4 0L6 3H2L4 0Z" />
            </svg>
          </div>
          <div className="w-20 h-6 bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <div className="flex gap-[2px]">
              {[4, 6, 8, 10].map((h, i) => (
                <div key={i} className="w-[3px] bg-white rounded-sm" style={{ height: `${h}px` }} />
              ))}
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="opacity-80">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <div className="flex items-center bg-white/20 rounded-sm px-1">
              <span className="text-white text-[9px] font-bold">67</span>
            </div>
          </div>
        </div>
        <div className="px-5 pt-2 bg-gradient-to-b from-[#0a1628] to-[#0f1d32] h-full">
          <div className="flex items-center justify-between mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span className="text-white text-lg font-light tracking-wide">Copilot</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="flex gap-2 mb-5">
            <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-600 text-white font-medium">Accounts</span>
            <span className="text-xs px-3 py-1.5 rounded-full text-gray-400">Investments</span>
            <span className="text-xs px-3 py-1.5 rounded-full text-gray-400">Tra...</span>
          </div>
          {variant === "accounts" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">&#9656;</span>
                  <span className="text-white text-sm font-medium">Credit Cards</span>
                </div>
                <span className="text-gray-400 text-xs">$4,338.45</span>
                <span className="text-indigo-400 text-xs">add &#8250;</span>
              </div>
              <div className="bg-[#162040] rounded-xl p-3">
                <div className="bg-blue-600 rounded px-2 py-0.5 text-[10px] text-white font-bold w-fit">CHASE</div>
                <div className="flex gap-6 text-xs text-gray-400 mt-2">
                  <span>$44,905</span>
                  <span>$99,000</span>
                </div>
              </div>
            </div>
          )}
          {variant === "investments" && (
            <div>
              <div className="bg-[#162040] rounded-xl p-3 mb-3">
                <span className="text-gray-400 text-sm">Apple Cash</span>
              </div>
              <div className="flex gap-6 mt-3">
                <span className="text-white text-lg font-medium">$4.96</span>
                <span className="text-white text-lg font-medium">61.58%<span className="text-red-400 text-xs ml-0.5">&#9662;</span></span>
              </div>
            </div>
          )}
          {variant === "savings" && (
            <div>
              <div className="mb-3">
                <span className="text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-400/10">Savings</span>
              </div>
              <div className="bg-[#162040] rounded-xl p-3 mb-3">
                <div className="w-5 h-5 bg-gray-600 rounded" />
              </div>
              <div className="flex gap-6 mt-3 text-sm">
                <span className="text-white">$4.96</span>
                <span className="text-white">61.58%<span className="text-red-400 ml-0.5">&#9662;</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[980px] mx-auto px-6">
        <BlurIn delay={150}>
          <section className="pt-10 pb-6">
            <h1 className="text-[1.35rem] font-semibold text-gray-900 tracking-tight">
              Haseeb Arshad
            </h1>
            <p className="text-[1.05rem] text-gray-500 mt-1">
              Full-Stack Engineer at <CompanyLink /> — AI &amp; Agentic Systems
            </p>
          </section>
        </BlurIn>

        <BlurIn delay={300}>
          <section className="pt-6 pb-8">
            <p
              className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-normal text-gray-400 max-w-2xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Software crafted with curiosity and care through relentless
              iteration and meticulous detail.
            </p>
          </section>
        </BlurIn>

        <BlurIn delay={450}>
          <Nav />
        </BlurIn>

        <BlurIn delay={600}>
          <section className="flex gap-6 justify-center pb-24 overflow-hidden">
            <PhoneMockup variant="accounts" />
            <PhoneMockup variant="investments" />
            <PhoneMockup variant="savings" className="hidden md:block" />
          </section>
        </BlurIn>
      </main>
    </div>
  );
}
