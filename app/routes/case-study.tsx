import { Fragment } from "react";
import { Link, useLoaderData, isRouteErrorResponse } from "react-router";
import { BlurIn } from "../components/header";
import type { Block, CaseStudy } from "../data/case-studies";
import { getCaseStudy } from "../data/content.server";
import type { Route } from "./+types/case-study";

export async function loader({ params }: Route.LoaderArgs) {
  const study = await getCaseStudy(params.slug!);
  if (!study) {
    throw new Response("Not found", { status: 404 });
  }
  return { study };
}

export function meta({ data }: Route.MetaArgs) {
  const study = data?.study;
  if (!study) {
    return [{ title: "Case study · Haseeb Arshad" }];
  }
  return [
    { title: `${study.title} · Haseeb Arshad` },
    { name: "description", content: study.summary },
  ];
}

/* ─── Reading typography ───

   Two faces, each doing the job it is good at. Body copy is Roboto: it is a
   text face, and at paragraph length it stays legible in a way a display face
   does not. Headings, the opening line, and captions are Instrument Serif,
   which gives the page a voice without asking the serif to carry a thousand
   words of running text.

   Instrument Serif ships no bold, so emphasis inside a serif line is set as
   italic rather than a synthetic weight.

   `prose` caps the measure. The page container is 980px, which runs past 100
   characters a line. Reading wants 65 to 75, so text blocks are capped and
   only figures and tables use the full width. The cap is an explicit width,
   not a `ch` value: `ch` is relative to the current font, so the same number
   measures out differently under the serif and the sans. */
const serif = { fontFamily: "var(--font-serif)" } as const;
const reading = { fontFamily: "var(--font-reading)" } as const;

/* One column for everything that is read, a wider one for the things that need
   room. Both align left; figures break out to the right of the text column. */
const prose = "max-w-[36rem]";
const wide = "max-w-[48rem]";

/* ─── inline text: `code` and **emphasis**, nothing else ───

   The case-study bodies are written by hand in app/data/case-studies.ts, so
   the input is known. A full markdown parser would be more code than the two
   shapes actually used. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="font-mono text-[0.82em] text-gray-800 bg-gray-100 rounded px-1 py-0.5"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <em key={i} className="italic text-gray-900">
              {part.slice(2, -2)}
            </em>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return (
        <p
          className={`${prose} text-[17px] text-gray-700 leading-[1.72] mt-5`}
          style={reading}
        >
          <Inline text={block.text} />
        </p>
      );

    case "h":
      return (
        <h3
          className={`${prose} text-[24px] text-gray-900 mt-12 mb-1 leading-[1.25]`}
          style={serif}
        >
          {block.text}
        </h3>
      );

    case "list":
      return (
        <ul className={`${prose} mt-5 flex flex-col gap-3`}>
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3.5 text-[17px] text-gray-700 leading-[1.72]"
              style={reading}
            >
              <span className="mt-[11px] w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "deflist":
      return (
        <dl
          className={`${wide} mt-6 flex flex-col divide-y divide-gray-100 border-y border-gray-100`}
        >
          {block.items.map((item, i) => (
            <div key={i} className="py-3.5 sm:flex sm:gap-7">
              <dt className="text-[12.5px] font-medium text-gray-900 tracking-tight sm:w-[168px] sm:shrink-0 sm:pt-[4px]">
                {item.term}
              </dt>
              <dd
                className="text-[16px] text-gray-700 leading-[1.6] mt-1 sm:mt-0"
                style={reading}
              >
                <Inline text={item.detail} />
              </dd>
            </div>
          ))}
        </dl>
      );

    case "figure":
      return (
        <figure className={`${wide} mt-9`}>
          <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
            <img
              src={block.src}
              alt={block.alt}
              loading="lazy"
              className="w-full h-auto block min-w-[640px]"
            />
          </div>
          <figcaption
            className={`${prose} text-[17px] italic text-gray-500 leading-[1.5] mt-3`}
            style={serif}
          >
            {block.caption}
          </figcaption>
        </figure>
      );

    case "metrics":
      return (
        <div className={`${wide} mt-6 overflow-x-auto`}>
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {["Metric", "Before", "After", "Basis"].map((h) => (
                  <th
                    key={h}
                    className="text-[11px] font-medium text-gray-400 uppercase tracking-wider pb-2.5 pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 align-top">
                  <td className="text-[13.5px] text-gray-900 py-3 pr-4">
                    {row.label}
                  </td>
                  <td className="text-[13.5px] text-gray-400 py-3 pr-4 font-mono">
                    {row.before ?? ""}
                  </td>
                  <td className="text-[13.5px] text-gray-900 py-3 pr-4 font-mono">
                    {row.after}
                  </td>
                  <td className="text-[12px] text-gray-400 py-3 pr-4">
                    {row.basis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "callout":
      return (
        <div className={`${prose} mt-7 border-l-2 border-gray-900 pl-6 py-1 flex flex-col sm:flex-row gap-3 sm:gap-7 sm:items-baseline`}>
          <span className="font-mono text-[30px] leading-none text-gray-900 shrink-0">
            {block.title}
          </span>
          <span
            className="text-[16.5px] text-gray-700 leading-[1.68]"
            style={reading}
          >
            <Inline text={block.text} />
          </span>
        </div>
      );
  }
}

function Meta({ study }: { study: CaseStudy }) {
  const rows: [string, string][] = [
    ["Role", study.role],
    ["Organization", study.org],
    ["Team", study.team],
    ["My scope", study.scope],
  ];

  return (
    <dl className={`${wide} mt-8 border-y border-gray-100 divide-y divide-gray-100`}>
      {rows.map(([label, value]) => (
        <div key={label} className="py-3 sm:flex sm:gap-7">
          <dt className="text-[10.5px] font-medium text-gray-400 uppercase tracking-[0.12em] sm:w-[120px] sm:shrink-0 sm:pt-[5px]">
            {label}
          </dt>
          <dd
            className="text-[15.5px] text-gray-700 leading-[1.6] mt-1 sm:mt-0"
            style={reading}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function CaseStudyPage() {
  const { study } = useLoaderData<typeof loader>();

  return (
    <article className="pb-24">
      <BlurIn>
        <div className={prose}>
        <Link
          to="/work"
          className="group inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-60 group-hover:-translate-x-0.5 transition-transform duration-200 ease-out"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Work
        </Link>

        <h1 className="text-[28px] font-semibold text-gray-900 mt-5 tracking-[-0.02em]">
          {study.title}
        </h1>
        <p
          className="text-[25px] text-gray-500 leading-[1.35] mt-4"
          style={serif}
        >
          {study.summary}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-5">
          {study.stack.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-gray-500 bg-gray-100 rounded-md px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
        </div>
      </BlurIn>

      <BlurIn delay={60}>
        <Meta study={study} />
      </BlurIn>

      {/* ─── contents ─── */}
      <BlurIn delay={100}>
        <nav className={`${prose} mt-10 flex flex-wrap gap-x-4 gap-y-1.5`}>
          {study.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-[12.5px] text-gray-400 hover:text-gray-900 transition-colors"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </BlurIn>

      {/* ─── body ─── */}
      {study.sections.map((section, i) => (
        <BlurIn key={section.id} delay={180 + i * 40}>
          <section
            id={section.id}
            className={
              section.emphasis === "deep"
                ? "mt-16 scroll-mt-8 rounded-2xl border border-gray-200 bg-gray-50/40 p-6 sm:p-8 max-w-[52rem]"
                : "mt-16 scroll-mt-8"
            }
          >
            <h2
              className={`${prose} text-[10.5px] font-medium text-gray-400 uppercase tracking-[0.12em]`}
            >
              {section.title}
            </h2>
            {section.blocks.map((block, bi) => (
              <BlockView key={bi} block={block} />
            ))}
          </section>
        </BlurIn>
      ))}

      <BlurIn delay={220 + study.sections.length * 40}>
        <p
          className={`${prose} text-[17px] italic text-gray-400 leading-[1.5] mt-16 border-t border-gray-100 pt-7`}
          style={serif}
        >
          {study.provenance}
        </p>
      </BlurIn>
    </article>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <section className="pb-24 pt-4">
      <h1 className="text-lg font-semibold text-gray-900">
        {notFound ? "No case study here" : "Something broke"}
      </h1>
      <p className="text-gray-500 text-sm mt-2">
        {notFound
          ? "That slug does not match a published case study."
          : "The page could not be rendered."}
      </p>
      <Link
        to="/work"
        className="inline-block text-sm text-gray-500 hover:text-gray-900 transition-colors mt-5"
      >
        Back to Work
      </Link>
    </section>
  );
}
