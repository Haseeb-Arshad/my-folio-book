import { BlurIn } from "../components/header";
import { projects } from "../data/projects";
import { experience } from "../data/experience";

export function meta() {
  return [
    { title: "Work — Haseeb Arshad" },
    {
      name: "description",
      content: "Selected projects — AI, agentic systems, and full-stack craft.",
    },
  ];
}

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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="group/link inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
    >
      {label}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-50 group-hover/link:opacity-100 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-all duration-200 ease-out"
      >
        {external ? (
          <path d="M7 17L17 7M17 7H8M17 7v9" />
        ) : (
          <path d="M5 12h14M12 5l7 7-7 7" />
        )}
      </svg>
    </a>
  );
}

export default function Work() {
  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Work</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          Platform engineering, AI systems, and full-stack craft.
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
          <div className="rounded-2xl border border-gray-100 p-6 mb-12">
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
          </div>
        </BlurIn>
      ))}

      {/* ─── Projects ─── */}
      <BlurIn delay={200}>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
          Projects
        </h3>
      </BlurIn>

      <div className="flex flex-col gap-2">
        {projects.map((p, i) => {
          const primary = p.live ?? p.code;
          return (
            <BlurIn key={p.name} delay={80 + i * 90}>
              <a
                href={primary}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:bg-gray-50/40 transition-colors -mx-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 shrink-0 ${p.color} rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm`}
                  >
                    {p.letter}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-gray-900 font-semibold group-hover:underline underline-offset-2 truncate">
                          {p.name}
                        </h3>
                        {p.status === "building" && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-data-shimmer" />
                            Building
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs shrink-0 font-mono">
                        {p.year}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                      {p.tagline}
                    </p>

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

                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      {p.live && (
                        <ProjectLink href={p.live} label="Live" external />
                      )}
                      {p.links ? (
                        p.links.map((l) => (
                          <ProjectLink
                            key={l.href}
                            href={l.href}
                            label={l.label}
                            external
                          />
                        ))
                      ) : (
                        <ProjectLink href={p.code} label="Code" external />
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </BlurIn>
          );
        })}
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
