/* ───────────────────────────────────────────────────────────
   Long-form case studies.

   A case study is attached to an experience entry by `org`, so
   the Work page can render a link inside the right job card,
   and to a project by `slug` so the project card can point at
   the same page.

   The body is structured rather than markdown on purpose: the
   site has no markdown renderer, and the blocks below are the
   only shapes these pages need. Adding a parser to support
   shapes nothing uses would be the more expensive choice.

   Disclosure rule for everything in this file: describe the
   problem, the reasoning, and the measured result. Do not
   publish the inside of the system. No source counts, schema
   counts, route counts, or test counts. No table, column, or
   internal surface names. No code from the employer's
   repository. No tuning values. No dates, months, or durations
   of any kind: not a period, not a "built over N months," not a
   date on a measurement. If a reader could reconstruct a
   calendar or a repository from this page, cut the sentence.
   ─────────────────────────────────────────────────────────── */

/** Inline text supports `code` spans and **bold**. Nothing else. */
export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "deflist"; items: { term: string; detail: string }[] }
  | { kind: "figure"; src: string; alt: string; caption: string }
  | {
      kind: "metrics";
      rows: { label: string; before?: string; after: string; basis: string }[];
    }
  | { kind: "callout"; title: string; text: string };

export type CaseStudySection = {
  id: string;
  title: string;
  /* `deep` gets the wider, emphasised treatment: this is the section
     a reader should be able to find in ten seconds. */
  emphasis?: "deep";
  blocks: Block[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  /* one line, the words a stranger would use */
  summary: string;
  org: string;
  role: string;
  team: string;
  stack: string[];
  scope: string;
  /* 150-word standalone version, used on cards and by the agent */
  excerpt: string;
  sections: CaseStudySection[];
  provenance: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "lead-truth-engine",
    title: "Lead Truth Engine",
    summary:
      "The go-to-market intelligence system behind Summon Electronics: buyer activity scattered across four disconnected tools is resolved to one person, scored on an auditable timeline, and turned into a ranked queue the sales floor works from.",
    org: "Summon Electronics",
    role: "Founding full-stack and principal engineer",
    team: "Sole engineer. Architecture through delivery, across the truth engine, the cross-engine propagation, and the sales surface it feeds.",
    stack: [
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Queues",
    ],
    scope:
      "I designed and built it end to end: the ingestion path, identity resolution, the scoring model, the promotion and safety gates, the cross-database propagation between the truth engine and the commercial platform, the composition layer behind the sales surface, the Apollo and HeyReach integrations, and the website event instrumentation underneath all of it.",
    excerpt:
      "At Summon Electronics, the information that told a salesperson whether an RFQ was worth a day of work lived in four systems with disjoint identifier spaces, so one buyer arrived as several unrelated prospects. I built the Lead Truth Engine: activity from the website, Apollo and HeyReach is appended to an immutable timeline, resolved to a canonical person on every event under per-identifier locks taken in a fixed order, and projected into a decaying intent score that gives outreach mechanics zero weight, so a campaign cannot manufacture intent by sending more. Identity decisions propagate across two database engines through a reversible journal that records a prior value for every row it rewrites. The sales surface composes a fan-out of independently fallible sources behind a single-flight cache and reports per-source freshness rather than a fabricated zero. Three measured production wins: a hot join taken from 17.6 s to 294 ms, a dashboard read from 1,092 ms to 91 ms, and a retry storm bounded.",

    sections: [
      {
        id: "problem",
        title: "The problem",
        blocks: [
          {
            kind: "p",
            text: "A salesperson gets an RFQ and has to decide whether it is worth a day of work. The answer existed, spread across four systems with disjoint identifier spaces: Apollo, HeyReach, the website, and the CRM. The same buyer arrived in each as a different, unrelated prospect.",
          },
          {
            kind: "p",
            text: "The problem was not a slow dashboard. It was that intent was invisible. A buyer who opened a tracked link, searched three part numbers, checked stock and abandoned a checkout looked identical to one who opened a single email, because nothing joined those events to a person and nothing ranked them.",
          },
        ],
      },

      {
        id: "constraints",
        title: "Constraints",
        blocks: [
          {
            kind: "deflist",
            items: [
              {
                term: "Inherited identifiers",
                detail:
                  "Four systems, four notions of a person, none of them mine to change.",
              },
              {
                term: "Two engines, no shared transaction",
                detail:
                  "Canonical identity lives in one database, the commercial records referencing it in another. Nothing spanning both can be atomic.",
              },
              {
                term: "Shared capacity",
                detail:
                  "The service runs beside the rest of the platform. A heavy query here is everyone's CPU alert, and memory is contended before CPU is.",
              },
              {
                term: "Actions reach real people",
                detail:
                  "It can send through Apollo and HeyReach. A bug is not a bad pixel, it is a message to a customer.",
              },
            ],
          },
        ],
      },

      {
        id: "built",
        title: "What I built",
        blocks: [
          {
            kind: "figure",
            src: "/case-studies/lead-truth-engine/01-pipeline.svg",
            alt: "Diagram of the event pipeline, from five activity sources, including Apollo and HeyReach, through an ingest step and a queue into a worker that resolves identity under database locks, then into a score and two gates before anything reaches the CRM or an outreach provider.",
            caption:
              "Identity is resolved before the event is scored, so a score is always attached to a person rather than to an identifier.",
          },
          {
            kind: "p",
            text: "Every interaction is appended to an immutable timeline, and the score is a projection rebuilt from it, stamped with the rule version that produced it so projections that fall behind can be found and rebuilt.",
          },
          {
            kind: "p",
            text: "What scores zero is the part I would defend hardest: sending a message, requesting a connection, having one accepted. All of it is recorded for attribution. None of it moves the score, because otherwise a campaign manufactures intent by sending more.",
          },
          {
            kind: "p",
            text: "Two gates stand in front of anything that reaches a person. A default-on safety switch, where only allow-listed addresses reach a provider at all. And a promotion gate that checks rules, suppression, duplicates and internal traffic, can route a decision to a human review queue, and replays past decisions against current rules.",
          },
          {
            kind: "p",
            text: "The sales surface is a fan-out over independently fallible sources, so each leg settles on its own and carries its own freshness. Severing every dependency, the dashboard still answers in 15 milliseconds reporting no rows and naming each source that failed, rather than a fabricated zero.",
          },
        ],
      },

      {
        id: "hard-part",
        title: "The hard part",
        emphasis: "deep",
        blocks: [
          {
            kind: "p",
            text: "Resolving identity on every event, rather than nightly, is what makes the system safe to automate. It is also the hardest correctness problem in it: two events about one buyer can arrive in the same instant and must end as one record.",
          },
          {
            kind: "p",
            text: "The obvious implementation sorts the identifiers and locks the first. It is wrong only under concurrency. Two events can share an email address and differ on their anonymous website ID, so they take different locks, run together, and each create a record. Nothing raises an error. The duplicate surfaces later as a split score and a contested owner.",
          },
          {
            kind: "figure",
            src: "/case-studies/lead-truth-engine/02-identity-race.svg",
            alt: "Side-by-side comparison. On the left, two events arriving at once that share an email address but have different anonymous IDs take different locks and create two records for one buyer. On the right, taking a lock for every identifier in a fixed order makes the second event wait, producing one record.",
            caption:
              "Sorting the identifiers and locking the first one looks correct and is not.",
          },
          {
            kind: "p",
            text: "The fix locks every identifier, which introduces the multi-lock deadlock: two transactions taking overlapping sets in different orders wait on each other forever. A total order prevents the cycle. Each identifier is reduced to a number, deduplicated, sorted, and the locks are taken in that order, so every caller approaches an overlapping set from the same direction. The locks are transaction-scoped, and the identifiers attached to one person are capped.",
          },
          {
            kind: "p",
            text: "Then the decision has to cross a boundary. The canonical identity is in one database and the records referencing it are in another, with no transaction spanning the two, so a merge cannot be atomic. It is made durable instead: a journal, applied transactionally on the far side, recording the prior value of every row it rewrites. Applying twice is a no-op, a run that dies resumes, and a reversal restores exactly what was there rather than inferring it. That is the only reason automatic merging is defensible.",
          },
        ],
      },

      {
        id: "performance",
        title: "Performance, measured in production",
        blocks: [
          { kind: "h", text: "A conversion that quietly disabled an index" },
          {
            kind: "p",
            text: "The join that makes attribution possible was the slowest read in the platform, and the cause was not the join. Its key columns had been created under two different collations, so a direct comparison is rejected outright, and the original code wrapped both sides in a conversion to make it legal.",
          },
          {
            kind: "p",
            text: "That also makes it unindexable. A converted column is not sargable, so the planner abandoned the unique index and scanned the whole link table, hash-joining it, on every read. The query was correct the entire time, and nothing in the code said it was doing a full scan.",
          },
          {
            kind: "p",
            text: "Normalising the collation on the join keys made the conversions redundant, and removing them returned the join to a unique-index lookup returning one row: 17.6 seconds to 294 milliseconds. The conversion stays on the projected columns, which are still mixed and which a union needs to agree on. Projections take no part in index selection, so there they are free.",
          },

          { kind: "h", text: "A decision moved from read time to write time" },
          {
            kind: "p",
            text: "A second read answered a qualification question by searching a large stored provider reply once per candidate row. Deciding it when the activity is written, and covering the read with an index carrying everything the query needed, took it from 1,092 ms to 91 ms and stopped it touching the stored replies at all.",
          },
          {
            kind: "figure",
            src: "/case-studies/lead-truth-engine/03-query.svg",
            alt: "Before and after comparison of a dashboard read. Before, the qualification decision was made at read time by searching the raw stored provider reply, costing 1,092 milliseconds. After, the decision is stored when the activity is written and the read is served entirely from an index, at 91 milliseconds.",
            caption:
              "The number that changed my mind was not the 1,092 ms. It was that the check excluded none of the rows it examined.",
          },

          { kind: "h", text: "A cache with two states that needed three" },
          {
            kind: "p",
            text: "The dashboard serves stale and refreshes in the background, which is right for a read that expensive. The pattern carries fresh and stale, and needs failing. Without it, a refresh that cannot finish is retried by the very next request, and a polling dashboard turns that into a permanent retry storm.",
          },
          {
            kind: "callout",
            title: "71%",
            text: "Sampling the shared database once a second across a five-minute window, one doomed query held it in 71% of samples while completing a handful of times in total. Backoff now caps what a query that cannot complete is allowed to cost.",
          },
        ],
      },

      {
        id: "results",
        title: "Results",
        blocks: [
          {
            kind: "metrics",
            rows: [
              {
                label: "Tracked-link to activity join",
                before: "17,609 ms, full scan and hash join",
                after: "294 ms, unique-index lookup",
                basis: "measured in production",
              },
              {
                label: "Dashboard read",
                before: "1,092 ms",
                after: "91 ms",
                basis: "measured in production",
              },
              {
                label: "Doomed query holding the shared database",
                before: "71% of one-second samples",
                after: "bounded by backoff",
                basis: "measured in production",
              },
              {
                label: "Sales response when every source is down",
                after: "answers in 15 ms, names each failed source",
                basis: "measured against a local preview",
              },
              {
                label: "Time to work one lead",
                before: "2 to 3 days, sometimes a week",
                after: "a few hours when a lead flows through",
                basis: "reported, not independently verified",
              },
            ],
          },
        ],
      },

      {
        id: "next",
        title: "Where it goes next",
        blocks: [
          {
            kind: "deflist",
            items: [
              {
                term: "Bounding the ranked list",
                detail:
                  "It does its per-person work before the page limit applies, so cost tracks the customer base rather than the page. Applying the limit first turns a full pass into a bounded one.",
              },
              {
                term: "The degradation contract on writes",
                detail:
                  "Reads answer with a structured envelope naming what failed. Two write paths still return a plain error. Same contract, both directions.",
              },
              {
                term: "A confidence layer above deterministic matching",
                detail:
                  "Matching is deliberately deterministic today. That is the right base for a probabilistic layer feeding scored suggestions into the review queue rather than merging automatically.",
              },
            ],
          },
        ],
      },

      {
        id: "demonstrates",
        title: "What this demonstrates",
        blocks: [
          {
            kind: "deflist",
            items: [
              {
                term: "Concurrency correctness",
                detail:
                  "A lock race that exists only when two events arrive together, closed with a total ordering that makes multi-lock acquisition deadlock-safe.",
              },
              {
                term: "Consistency without a shared transaction",
                detail:
                  "A durable, resumable, exactly-once journal carrying identity decisions between two engines, reversible because it records a prior value per row.",
              },
              {
                term: "Performance from reading plans",
                detail:
                  "A collation mismatch that silently disabled a unique index, and a predicate that cost a second and excluded nothing. Both found by profiling production, both confirmed by re-measuring.",
              },
              {
                term: "Judgment about automation that reaches customers",
                detail:
                  "A default-on safety switch, a human review queue, replayable decisions, and merges that can be undone.",
              },
            ],
          },
        ],
      },

      {
        id: "notes",
        title: "Notes on this write-up",
        blocks: [
          {
            kind: "list",
            items: [
              "Implementation detail belonging to Summon Electronics is deliberately not published: no schema, no internal surface names, no code, no tuning values.",
              "The diagrams are mine. No real buyer, contact, company, or business figure appears in any asset, and product surfaces are not shown because they run against live customer records.",
              "Numbers labelled measured were taken against the live system and confirmed by re-measuring after the change. The one labelled reported was never instrumented.",
            ],
          },
        ],
      },
    ],

    provenance:
      "Every claim on this page traces to a clearance record, an evidence ledger, a metrics file, an interview transcript, and a research file with cited sources, all kept privately with the project.",
  },
];

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function caseStudiesForOrg(org: string): CaseStudy[] {
  return caseStudies.filter((study) => study.org === org);
}
