import { useState, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Nav, BlurIn } from "../components/header";
import { favorites } from "../data/blogs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Haseeb Arshad — Founding Full-Stack & Principal Engineer" },
    {
      name: "description",
      content:
        "Software crafted with curiosity, dedication, and relentless attention to detail.",
    },
  ];
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
      <a href="#" className="text-gray-900">
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

/* ─── Selected Reading (home preview of favorite blogs) ─── */
function SelectedReading() {
  const featured = favorites.filter((b) => b.featured).slice(0, 3);

  return (
    <section className="pb-12">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Selected reading
        </h2>
        <Link
          to="/blog"
          className="group flex items-center gap-1 text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
        >
          All blogs
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-50 group-hover:translate-x-0.5 transition-transform duration-200 ease-out"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {featured.map((blog) => (
          <a
            key={blog.url}
            href={blog.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium text-sm group-hover:underline underline-offset-2">
                {blog.title}
              </span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-300 group-hover:text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200 ease-out"
              >
                <path d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </div>
            <p className="text-gray-500 text-[13px] leading-relaxed mt-2">
              {blog.note}
            </p>
            <span className="text-gray-400 text-xs mt-3 block">
              {blog.author}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <BlurIn delay={100}>
        <section className="pt-10 pb-6">
          <h1 className="text-[1.35rem] font-semibold text-gray-900 tracking-tight">
            Haseeb Arshad
          </h1>
          <p className="text-[1.05rem] text-gray-500 mt-1">
            Founding Full-Stack &amp; Principal Engineer at <CompanyLink /> — AI
            &amp; Agentic Systems
          </p>
        </section>
      </BlurIn>

      <BlurIn delay={220}>
        <section className="pt-6 pb-8">
          <p
            className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-normal text-gray-400 max-w-2xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Mind and hand, in equal measure. I build software slowly and
            deliberately — until the craft turns invisible, and only the
            feeling is left.
          </p>
        </section>
      </BlurIn>

      <BlurIn delay={340}>
        <Nav />
      </BlurIn>

      <BlurIn delay={460}>
        <SelectedReading />
      </BlurIn>
    </>
  );
}
