import { projects } from "../data/projects";
import { experience } from "../data/experience";
import { books } from "../data/books";
import { favorites, posts } from "../data/blogs";
import { caseStudies, type CaseStudySection } from "../data/case-studies";
import {
  emptyPayload,
  slugify,
  type ContentPayload,
  type ContentEntry,
  type EditorState,
} from "./types";
export function sectionsBody(sections: CaseStudySection[]) {
  return sections
    .map(
      (s) =>
        `## ${s.title}\n\n${s.blocks
          .map((b) => {
            if (b.kind === "p" || b.kind === "h")
              return b.kind === "h" ? "### " + b.text : b.text;
            if (b.kind === "list")
              return b.items.map((i) => "- " + i).join("\n");
            if (b.kind === "deflist")
              return b.items
                .map((i) => `**${i.term}**: ${i.detail}`)
                .join("\n\n");
            if (b.kind === "figure")
              return `![${b.alt}](${b.src})\n\n${b.caption}`;
            if (b.kind === "callout") return `**${b.title}**: ${b.text}`;
            return b.rows
              .map(
                (r) =>
                  `- ${r.label}: ${r.before ? r.before + " → " : ""}${r.after}. Basis: ${r.basis}.`,
              )
              .join("\n");
          })
          .join("\n\n")}`,
    )
    .join("\n\n");
}
function entry(
  input: Partial<ContentPayload> & Pick<ContentPayload, "kind" | "title">,
  published = true,
): ContentEntry {
  const payload = {
    ...emptyPayload(input.kind),
    ...input,
    slug: input.slug ?? slugify(input.title),
  };
  return {
    id: payload.kind + ":" + payload.slug,
    version: 0,
    draft: payload,
    published: published ? { ...payload } : null,
    publishedAt: published ? "2026-10-07T00:00:00.000Z" : undefined,
    archived: false,
    updatedAt: "2026-10-07T00:00:00.000Z",
    revisions: [],
  };
}
export function seedState(): EditorState {
  const entries: ContentEntry[] = [
    entry({
      kind: "profile",
      title: "Haseeb Arshad",
      slug: "home",
      summary:
        "I'm a builder who enjoys solving ambiguous problems. I work across machine learning systems and software engineering, turning messy business context into useful decisions.",
      body: "Mind and hand, in equal measure. I build software slowly and deliberately, until the craft turns invisible, and only the feeling is left.",
    }),
    ...projects.map((p, order) =>
      entry({
        kind: "project",
        title: p.name,
        subtitle: p.year,
        summary: p.tagline,
        image: p.popup?.image ?? "",
        url: p.live ?? "",
        code: p.code,
        tags: p.stack,
        order,
        display: JSON.stringify(p),
      }),
    ),
    ...experience.map((p, order) =>
      entry({
        kind: "experience",
        title: p.org,
        subtitle: p.role,
        summary: p.summary,
        body: p.bullets.map((b) => "- " + b).join("\n"),
        tags: p.stack,
        order,
        display: JSON.stringify(p),
      }),
    ),
    ...books.map((p, order) =>
      entry({
        kind: "book",
        title: p.title,
        subtitle: p.author,
        summary: p.note,
        tags: p.genres,
        image: p.isbn13
          ? `https://covers.openlibrary.org/b/isbn/${p.isbn13}-M.jpg`
          : "",
        featured: p.favorite ?? false,
        order,
        display: JSON.stringify(p),
      }),
    ),
    ...favorites.map((p, order) =>
      entry({
        kind: "link",
        title: p.title,
        subtitle: p.author,
        summary: p.note,
        url: p.url,
        featured: p.featured ?? false,
        order,
        display: JSON.stringify(p),
      }),
    ),
    ...posts.map((p, order) =>
      entry({
        kind: "post",
        title: p.title,
        subtitle: p.date,
        summary: p.summary,
        url: p.url,
        order,
      }),
    ),
    ...caseStudies.map((p, order) =>
      entry({
        kind: "case-study",
        title: p.title,
        slug: p.slug,
        subtitle: p.role,
        summary: p.summary,
        body: sectionsBody(p.sections),
        tags: p.stack,
        evidence: p.provenance,
        order,
        display: JSON.stringify(p),
      }),
    ),
    entry(
      {
        kind: "case-study",
        title: "Harsukh Residences",
        slug: "harsukh-residences",
        subtitle: "Frontend developer · Almaymaar",
        summary:
          "An interactive property experience combining a 3D building explorer, SVG floor plans, and Unity WebGL.",
        image: "/previews/harsukh.webp",
        url: "https://theharsukh.com",
        tags: ["Next.js 14", "WebGL", "SVG", "Redux"],
        order: 1,
        body: "## The problem\n\nProperty discovery involves more than a list of units. Buyers need to understand the building, compare floor plans, and connect what they see to a real apartment.\n\n## My work\n\nAt Almaymaar, I built the Harsukh Residences frontend: a 3D building explorer, interactive SVG floor plans, and Unity WebGL within a Next.js experience. The work also connected the interface to backend services for property information and lead-generation workflows.\n\n## The interface\n\n![Harsukh Residences property interface](/previews/harsukh.webp)\n\nThe project brings spatial exploration and conventional property information into one experience. Its technology stack includes Next.js 14, Framer Motion, Redux, and WebGL.\n\n## What is evidenced\n\nThis is published employer project work with a public site. No conversion lift, user count, or frame-rate benchmark is claimed here.",
        evidence:
          "Overview drawn from the existing published experience and public project notes. Employer source code is not included.",
      },
      false,
    ),
    entry(
      {
        kind: "case-study",
        title: "TaskHive / Oriexa",
        slug: "taskhive",
        subtitle: "Human and AI task marketplace",
        summary:
          "A task marketplace with REST and MCP access, orchestration, and explicit review flows.",
        image: "/previews/taskhive.png",
        url: "https://task-hive-sigma.vercel.app",
        code: "https://github.com/Haseeb-Arshad/TaskHive",
        tags: ["Next.js", "TypeScript", "Python", "MCP"],
        order: 2,
        body: "## The problem\n\nA marketplace for agents needs a shared description of work and an explicit path from claiming a task to delivering a result. Posting and answering alone do not capture that lifecycle.\n\n## The product\n\nHumans post tasks. Agents browse, claim, plan, execute, take feedback, and submit results for reputation credits. TaskHive is the portfolio label; the public workspace is now represented as Oriexa.\n\n![TaskHive marketplace interface](/previews/taskhive.png)\n\n## System boundaries\n\nThe architecture separates skills, tools, and software. The frontend and backend have separate public repositories. External agents can use REST and MCP entry points, with orchestration, reviewer flows, state transitions, persistence, rate limiting, and idempotency owned by the backend.\n\n## What is evidenced\n\nThe published stack includes Next.js, TypeScript, Python, FastAPI, PostgreSQL, Drizzle, REST, and MCP. This overview makes no claim about active users, revenue, or independent load-test results.",
        evidence:
          "Prepared from the portfolio's existing project-specific public notes. The workspace naming change does not imply a separate product implementation.",
      },
      false,
    ),
    entry(
      {
        kind: "post",
        title: "Outreach volume is not buyer intent",
        slug: "outreach-and-intent",
        summary:
          "A short engineering note from the Lead Truth Engine case study, on separating campaign activity from buyer behavior.",
        tags: ["System design", "AI operations"],
        body: "## The distinction\n\nSending more messages produces more activity. It does not establish that the buyer wants something. In the Lead Truth Engine, sending a message, requesting a connection, and having one accepted are recorded for attribution but do not move the intent score.\n\n## Why the boundary matters\n\nIf campaign mechanics increase the score, a campaign can manufacture its own evidence. The published design instead attaches the score to a canonical person and rebuilds it from an auditable activity timeline.\n\n## The engineering lesson\n\nA useful automation system needs to distinguish the events it causes from the evidence it uses to justify its next action. That distinction belongs in the data model and scoring rules.\n\nRead the full Lead Truth Engine case study for the implementation reasoning and measured results.",
        evidence:
          "Adapted from the already published Lead Truth Engine case study; no additional operational claims.",
      },
      false,
    ),
    entry(
      {
        kind: "post",
        title: "When an empty result means empty",
        slug: "empty-results-and-fallbacks",
        summary:
          "The portfolio editor distinguishes unpublished content from an unavailable database.",
        tags: ["Publishing", "Reliability"],
        order: 1,
        body: "## Two different states\n\nA content query can succeed and return no published items. It can also fail because the database is unavailable. Those states have different meanings.\n\n## The publishing contract\n\nA successful empty query stays empty. Drafts and archived entries remain private. Editing a published document changes the draft until the owner explicitly publishes the new version.\n\n## The failure boundary\n\nThe new editor reports a storage failure instead of silently displaying old content. In local development it can use a local JSON store. Production uses the server-side database, with optimistic version checks to prevent an older editing tab from overwriting a newer save.",
        evidence:
          "Describes this portfolio's implemented content workflow, not an external production benchmark.",
      },
      false,
    ),

    entry({
      kind: "now",
      title: "Building",
      summary:
        "Working on AI agentic systems at Summon Electronics, exploring the intersection of intelligent automation and thoughtful software design.",
      order: 0,
    }),
    entry({
      kind: "now",
      title: "Learning",
      summary:
        "Deep-diving into multi-agent architectures, LLM tooling, and systems that can reason and act autonomously.",
      order: 1,
    }),
    entry({
      kind: "now",
      title: "Exploring",
      summary:
        "Contributing to open source, experimenting with new frameworks, and pushing the boundaries of what's possible with code.",
      order: 2,
    }),
    entry({
      kind: "contact",
      title: "Email",
      slug: "email",
      url: "mailto:Haseebarshad992@gmail.com",
      order: 0,
    }),
    entry({
      kind: "contact",
      title: "LinkedIn",
      url: "https://www.linkedin.com/in/haseeb-arshad-",
      order: 1,
    }),
    entry({
      kind: "contact",
      title: "GitHub",
      url: "https://github.com/Haseeb-Arshad",
      order: 2,
    }),
    entry({
      kind: "contact",
      title: "Chess",
      url: "https://www.chess.com/member/Haseeb_Arshad",
      order: 3,
    }),
    entry({ kind: "resume", title: "Résumé", slug: "cv", url: "/resume.pdf" }),
    entry(
      {
        kind: "note",
        title: "A place for the next idea",
        summary:
          "Capture a link, a thought, or an unfinished project here. Notes start as drafts.",
        visibility: "private",
      },
      false,
    ),
  ];
  return { version: 0, entries };
}
