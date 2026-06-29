/* ───────────────────────────────────────────────────────────
   Professional experience — the headline of the Work page.
   ─────────────────────────────────────────────────────────── */

export type Experience = {
  role: string;
  org: string;
  year: string;
  summary: string;
  stack: string[];
  bullets: string[];
};

export const experience: Experience[] = [
  {
    role: "Founding Full-Stack / Principal Engineer",
    org: "Summon Electronics",
    year: "2025 — Present",
    summary:
      "Building and scaling an end-to-end B2B sourcing, RFQ, analytics, and sales-operations platform — from admin command-centers down to high-volume data pipelines — across React, Node.js, Go, PostgreSQL, MySQL, and a service-oriented backend.",
    stack: [
      "React",
      "Node.js",
      "Go",
      "PostgreSQL",
      "MySQL",
      "Microservices",
    ],
    bullets: [
      "Architected admin command-center workflows spanning sales operations, account assignment, provider intelligence, tracking, and live monitoring dashboards.",
      "Designed backend-backed sales-command flows — account ownership, follow-up activity, campaign links, and provider actions — with reload-safe persistence over durable tables and versioned API contracts.",
      "Built multi-tenant analytics and visitor tracking with per-site data separation, from schema design through backend payload isolation to site-level visibility on the frontend.",
      "Profiled real production hot paths to cut dashboard and search latency — reshaping queries, adding targeted indexes, and parallelizing backend reads, verified against live timing.",
      "Worked across a service-oriented codebase handling data at scale: admin frontends, backend APIs, monitoring services, event-processing pipelines, and sync/ingestion workers.",
      "Hardened auth, session, and environment handling and built repeatable local-preview and smoke-test workflows for backend verification — guarded preview bypass, secret hygiene, and safer runtime configuration.",
    ],
  },
];
