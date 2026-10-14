import { useState, useRef } from "react";
import { Link, useLoaderData } from "react-router";
import { BlurIn } from "../components/header";
import BuildingStatus from "../components/building-status";
import { DemoStage, demoFor, type Demo } from "../components/project-demos";
import { type Project } from "../data/projects";
import {
  getProjects,
  getExperience,
  getCaseStudiesByOrg,
} from "../data/content.server";

export async function loader() {
  const [projects, experience, byOrg] = await Promise.all([
    getProjects(),
    getExperience(),
    getCaseStudiesByOrg(),
  ]);

  /* A Map does not survive the loader boundary, so hand the route a plain
     object keyed by org with only the fields the card needs. */
  const caseStudies = Object.fromEntries(
    [...byOrg].map(([org, studies]) => [
      org,
      studies.map((s) => ({ slug: s.slug, title: s.title })),
    ])
  );

  return { projects, experience, caseStudies };
}

export function meta() {
  return [
    { title: "Work · Haseeb Arshad" },
    {
      name: "description",
      content: "Selected projects: AI, agentic systems, and full-stack craft.",
    },
  ];
}

/* Case-study routes live on this site, so they must not open in a new tab
   or lose client-side navigation. */
const isInternal = (href: string) => href.startsWith("/");

/* ─── tiny link with arrow ─── */
function ProjectLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const internal = isInternal(href);
  const arrow = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="opacity-50 group-hover/link:opacity-100 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-all duration-200 ease-out"
    >
      {external && !internal ? (
        <path d="M7 17L17 7M17 7H8M17 7v9" />
      ) : (
        <path d="M5 12h14M12 5l7 7-7 7" />
      )}
    </svg>
  );
  const className =
    "group/link inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors";

  if (internal) {
    return (
      <Link
        to={href}
        onClick={(e) => e.stopPropagation()}
        className={className}
      >
        {label}
        {arrow}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {label}
      {arrow}
    </a>
  );
}

/* ─── Project card pieces ─── */
function ProjectMark({ p, size }: { p: Project; size: "sm" | "md" }) {
  const box = size === "md" ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg";
  if (p.logo) {
    return (
      <div
        className={`${box} shrink-0 bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm`}
      >
        <img
          src={p.logo}
          alt={`${p.name} logo`}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }
  return (
    <div
      className={`${box} shrink-0 ${p.color} flex items-center justify-center text-white ${
        size === "md" ? "text-base" : "text-sm"
      } font-bold shadow-sm`}
    >
      {p.letter}
    </div>
  );
}

/* Not an anchor around the card. The title carries the link and stretches
   an overlay across the whole card, which keeps the card clickable without
   nesting anchors inside it. */
function ProjectTitle({ p }: { p: Project }) {
  const primary = p.live ?? p.code;
  const overlay =
    "after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900";

  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="text-gray-900 font-semibold group-hover:underline underline-offset-2 truncate">
          {isInternal(primary) ? (
            <Link to={primary} className={overlay}>
              {p.name}
            </Link>
          ) : (
            <a
              href={primary}
              target="_blank"
              rel="noopener noreferrer"
              className={overlay}
            >
              {p.name}
            </a>
          )}
        </h3>
        {p.status === "building" && (
          <BuildingStatus label="Building" logo={p.logo} />
        )}
      </div>
      <span className="text-gray-400 text-xs shrink-0 font-mono">{p.year}</span>
    </div>
  );
}

function ProjectTags({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      {p.stack.map((tag) => (
        <span
          key={tag}
          className="text-[11px] text-gray-500 bg-gray-100 rounded-md px-2 py-0.5"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ProjectLinks({ p, className = "" }: { p: Project; className?: string }) {
  return (
    <div className={`relative z-10 flex flex-wrap items-center gap-4 ${className}`}>
      {p.live && <ProjectLink href={p.live} label="Live" external />}
      {p.links ? (
        p.links.map((l) => (
          <ProjectLink key={l.href} href={l.href} label={l.label} external />
        ))
      ) : p.code !== p.live ? (
        /* Company work and closed source have no repository to show, so
           `code` is set to the live URL. A "Code" link pointing at the
           product's own site would be calling a marketing page source. */
        <ProjectLink href={p.code} label="Code" external />
      ) : null}
    </div>
  );
}

/* ─── Project card ───
   A project with a demo leads with it: a short loop of the product doing
   its one thing, so the card shows what it is rather than its landing
   page. The rest keep the compact row, with the hover preview when they
   have one. */
function ProjectCard({ p, demo }: { p: Project; demo?: Demo }) {
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const hasPreview = !demo && Boolean(p.popup);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPreview(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setShowPreview(false), 250);
  };

  if (demo) {
    return (
      <div className="group relative flex h-full flex-col rounded-2xl border border-gray-100 p-2 hover:border-gray-200 transition-colors">
        <DemoStage demo={demo} />
        <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <ProjectMark p={p} size="sm" />
            <div className="min-w-0 flex-1">
              <ProjectTitle p={p} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2.5 leading-relaxed">
            {p.tagline}
          </p>
          <ProjectTags p={p} />
          <ProjectLinks p={p} className="mt-auto pt-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full"
      onMouseEnter={hasPreview ? handleEnter : undefined}
      onMouseLeave={hasPreview ? handleLeave : undefined}
    >
      <div className="group relative h-full rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:bg-gray-50/40 transition-colors">
        <div className="flex items-start gap-4">
          <ProjectMark p={p} size="md" />
          <div className="min-w-0 flex-1">
            <ProjectTitle p={p} />
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
              {p.tagline}
            </p>
            <ProjectTags p={p} />
            <ProjectLinks p={p} className="mt-4" />
          </div>
        </div>
      </div>

      {/* hover preview — image + blurb from the live site */}
      {hasPreview && showPreview && p.popup && (
        <div className="absolute top-full right-4 mt-1 z-50 animate-video-in pointer-events-none">
          <div className="w-[360px] rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
            <img
              src={p.popup.image}
              alt={`${p.name} preview`}
              loading="lazy"
              className="w-full h-auto block"
            />
            <p className="text-[12px] text-gray-300 leading-relaxed p-3.5">
              {p.popup.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* Which cards take a whole row: no demo, a wide demo, or a half card whose
   row partner never comes because the next card is full width or there is
   no next card. */
function fullRows(projects: Project[]) {
  const cards = projects.map((p) => {
    const demo = demoFor(p.name);
    return { p, demo, full: !demo || Boolean(demo.wide) };
  });
  let column = 0;
  cards.forEach((card, i) => {
    if (card.full) {
      column = 0;
      return;
    }
    const next = cards[i + 1];
    if (column === 0 && (!next || next.full)) {
      card.full = true;
      return;
    }
    column = (column + 1) % 2;
  });
  return cards;
}

export default function Work() {
  const { projects, experience, caseStudies } = useLoaderData<typeof loader>();

  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Work</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          Principal engineering across AI systems, agentic products, and
          full-stack craft.
        </p>
      </BlurIn>

      {/* ─── Experience ─── */}
      <BlurIn delay={60}>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
          Experience
        </h3>
      </BlurIn>

      {experience.map((job, i) => (
        <BlurIn key={job.org} delay={120 + i * 90}>
          <div className="rounded-2xl border border-gray-100 p-6 mb-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h4 className="text-gray-900 font-semibold text-[15px]">
                {job.role}
              </h4>
              <span className="text-gray-400 text-xs shrink-0 font-mono">
                {job.year}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1 font-medium">{job.org}</p>

            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              {job.summary}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mt-4">
              {job.stack.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-gray-500 bg-gray-100 rounded-md px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>

            <ul className="mt-5 flex flex-col gap-2.5 border-t border-gray-100 pt-5">
              {job.bullets.map((b, bi) => (
                <li key={bi} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="mt-[7px] w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Deep-dives on systems built inside this role. */}
            {(caseStudies[job.org] ?? []).length > 0 && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <h5 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Case studies
                </h5>
                <div className="mt-3 flex flex-col gap-2">
                  {caseStudies[job.org].map((study) => (
                    <Link
                      key={study.slug}
                      to={`/work/${study.slug}`}
                      className="group/cs inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors w-fit"
                    >
                      <span className="underline underline-offset-2 decoration-gray-300 group-hover/cs:decoration-gray-900 transition-colors">
                        {study.title}
                      </span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="opacity-50 group-hover/cs:opacity-100 group-hover/cs:translate-x-0.5 transition-all duration-200 ease-out"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BlurIn>
      ))}

      {/* ─── Projects ─── */}
      <BlurIn delay={200}>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-12 mb-4">
          Projects
        </h3>
      </BlurIn>

      {/* Demo cards pair up in two columns. A project without a demo, or with
          a wide one, takes the full row, and so does a card that would
          otherwise sit alone in its row, so the grid never leaves a hole. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fullRows(projects).map(({ p, demo, full }, i) => (
          <BlurIn
            key={p.name}
            delay={80 + i * 90}
            className={full ? "md:col-span-2" : ""}
          >
            <ProjectCard p={p} demo={demo} />
          </BlurIn>
        ))}
      </div>

      <BlurIn delay={80 + projects.length * 90}>
        <a
          href="https://github.com/Haseeb-Arshad"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-8"
        >
          More on GitHub
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
        </a>
      </BlurIn>
    </section>
  );
}
