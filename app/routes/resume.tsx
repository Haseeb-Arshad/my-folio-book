import { BlurIn } from "../components/header";
import AgentBox, { cvAgent } from "../components/agent-box";
import { favorites } from "../data/blogs";
import { resumeProfile } from "../data/resume";

export function meta() {
  return [
    { title: "Résumé · Haseeb Arshad" },
    {
      name: "description",
      content:
        "Résumé of Haseeb Arshad, founding engineer working on AI and agentic systems. Read it here, download the PDF, or ask about the work behind it.",
    },
  ];
}

const PDF_PATH = "/resume.pdf";

/* ─── Header actions ─── */
function PdfActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={PDF_PATH}
        download="Haseeb-Arshad-Resume.pdf"
        className="press inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12M7 12l5 5 5-5M5 21h14" />
        </svg>
        Download PDF
      </a>
      <a
        href={PDF_PATH}
        target="_blank"
        rel="noreferrer"
        className="press inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >
        Open
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="opacity-60"
        >
          <path d="M7 17L17 7M17 7H8M17 7v9" />
        </svg>
      </a>
    </div>
  );
}

/* ─── Shown wherever the inline PDF viewer cannot be trusted: small screens,
   and as the <object> fallback on desktop browsers without a PDF plugin. ─── */
function ViewerFallback() {
  return (
    <div className="p-6">
      <p className="text-sm font-medium text-gray-900">
        {resumeProfile.name}
      </p>
      <p className="mt-1 text-[13px] text-gray-500">
        {resumeProfile.headline}
      </p>

      <ul className="mt-6 flex flex-col divide-y divide-gray-100 border-y border-gray-100">
        {resumeProfile.experience.map((job) => (
          <li
            key={job.company}
            className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-gray-900">
                {job.company}
              </p>
              <p className="text-[13px] text-gray-500">{job.role}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-gray-400">
              {job.dates}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[13px] leading-relaxed text-gray-500">
        The full résumé, with projects, skills, and education, is in the PDF.
      </p>
      <div className="mt-4">
        <PdfActions />
      </div>
    </div>
  );
}

/* ─── Reading list ─── */
function Reading() {
  return (
    <section className="pb-16">
      <BlurIn>
        <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
          Reading
        </h3>
        <p className="mb-4 text-[13px] text-gray-500">
          The writing that shaped how I think about this work.
        </p>
      </BlurIn>

      <div className="border-t border-gray-100">
        {favorites.map((blog, i) => (
          <BlurIn key={blog.url} delay={60 + i * 55}>
            <a
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group -mx-3 flex items-start justify-between gap-4 rounded-lg border-b border-gray-50 px-3 py-4 transition-colors hover:bg-gray-50/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-gray-900 underline-offset-2 group-hover:underline">
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
                    className="shrink-0 text-gray-300 transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-500"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7v9" />
                  </svg>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
                  {blog.note}
                </p>
              </div>
              <span className="shrink-0 pt-0.5 text-[13px] text-gray-400">
                {blog.author}
              </span>
            </a>
          </BlurIn>
        ))}
      </div>
    </section>
  );
}

export default function Resume() {
  return (
    <>
      <BlurIn>
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Résumé</h2>
              <p className="mt-1 text-sm text-gray-500">
                {resumeProfile.headline}. Read it here, or take the PDF with
                you.
              </p>
            </div>
            <PdfActions />
          </div>
        </div>
      </BlurIn>

      {/* ─── The document ─── */}
      <BlurIn delay={90}>
        <div className="mb-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          {/* Desktop: the real PDF, with the summary as the no-plugin fallback. */}
          <object
            data={`${PDF_PATH}#view=FitH&navpanes=0`}
            type="application/pdf"
            aria-label="Résumé, PDF"
            className="hidden h-[min(88vh,1150px)] w-full md:block"
          >
            <div className="bg-white">
              <ViewerFallback />
            </div>
          </object>

          {/* Mobile: inline PDF rendering is unreliable, so skip straight to
              the summary rather than showing an empty grey box. */}
          <div className="bg-white md:hidden">
            <ViewerFallback />
          </div>
        </div>
      </BlurIn>

      <Reading />

      <AgentBox config={cvAgent} />
    </>
  );
}
