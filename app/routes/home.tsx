import { useState, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Nav, BlurIn } from "../components/header";
import { favorites } from "../data/blogs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Haseeb Arshad, Founding Full-Stack & Principal Engineer" },
    {
      name: "description",
      content:
        "Founding engineer building AI and agentic systems. Software crafted with curiosity, dedication, and relentless attention to detail.",
    },
    { property: "og:type", content: "website" },
    {
      property: "og:title",
      content: "Haseeb Arshad, Founding Full-Stack & Principal Engineer",
    },
    {
      property: "og:description",
      content:
        "Founding engineer building AI and agentic systems. Software crafted with curiosity, dedication, and relentless attention to detail.",
    },
    { name: "twitter:card", content: "summary" },
    {
      name: "twitter:title",
      content: "Haseeb Arshad, Founding Full-Stack & Principal Engineer",
    },
  ];
}

/* ─── Company link with hover card ───
   Links to /work (where the full experience lives), and shows a small
   factual card on hover/focus. */
function CompanyLink() {
  const [showCard, setShowCard] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowCard(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setShowCard(false), 300);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        to="/work"
        className="text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500 transition-colors"
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        Summon Electronics
      </Link>

      {showCard && (
        <div
          className="absolute top-full left-0 mt-2 z-50 animate-video-in hidden md:block"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="w-[340px] rounded-xl shadow-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-gray-900 font-medium text-sm">
                Summon Electronics
              </span>
              <span className="text-gray-500 text-xs font-mono shrink-0">
                Since 2025
              </span>
            </div>
            <p className="text-gray-500 text-[13px] leading-relaxed mt-2">
              Electronics commerce across both consumer and B2B. As a founding
              engineer I play a central role in building the platform it runs
              on: RFQ workflows, supplier intelligence, multi-tenant
              analytics, and AI-assisted automation across React, Node.js,
              Go, and PostgreSQL.
            </p>
            <span className="text-gray-500 text-xs mt-3 block">
              Founding Full-Stack / Principal Engineer
            </span>
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
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Selected reading
        </h2>
        <Link
          to="/blog"
          className="group flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
        >
          All blogs
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
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
            className="group rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:bg-gray-50/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
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
                aria-hidden="true"
                className="text-gray-300 group-hover:text-gray-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200 ease-out"
              >
                <path d="M7 17L17 7M17 7H8M17 7v9" />
              </svg>
            </div>
            <p className="text-gray-500 text-[13px] leading-relaxed mt-2">
              {blog.note}
            </p>
            <span className="text-gray-500 text-xs mt-3 block">
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
          {/* font-medium (500) is the only real weight of ABC Diatype we
             ship; semibold would render as synthesized bold */}
          <h1 className="text-[1.35rem] font-medium text-gray-900 tracking-tight">
            Haseeb Arshad
          </h1>
          <p className="text-[1.05rem] text-gray-500 mt-1">
            Founding Full-Stack &amp; Principal Engineer at <CompanyLink />,
            AI &amp; Agentic Systems
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
            deliberately, until the craft turns invisible, and only the
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
