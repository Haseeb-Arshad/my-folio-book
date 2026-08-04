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
    year: "2025 – Present",
    summary:
      "Building and scaling an end-to-end electronics commerce platform serving both consumer and B2B sides: sourcing, RFQ, analytics, and sales operations, from admin command-centers down to high-volume data pipelines, across React, Node.js, Go, PostgreSQL, MySQL, and a service-oriented backend.",
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
      "Designed backend-backed sales-command flows for account ownership, follow-up activity, campaign links, and provider actions, with reload-safe persistence over durable tables and versioned API contracts.",
      "Built multi-tenant analytics and visitor tracking with per-site data separation, from schema design through backend payload isolation to site-level visibility on the frontend.",
      "Profiled real production hot paths to cut dashboard and search latency: reshaping queries, adding targeted indexes, and parallelizing backend reads, verified against live timing.",
      "Worked across a service-oriented codebase handling data at scale: admin frontends, backend APIs, monitoring services, event-processing pipelines, and sync/ingestion workers.",
      "Hardened auth, session, and environment handling and built repeatable local-preview and smoke-test workflows for backend verification: guarded preview bypass, secret hygiene, and safer runtime configuration.",
    ],
  },
  {
    role: "Full-Stack Developer",
    org: "Trecsol",
    year: "2024 – 2025",
    summary:
      "Built data-heavy web products end to end, with a focus on rendering large geospatial datasets in the browser: interactive SVG and WebGL visualizations on the front, Node.js APIs and MongoDB schema work behind them.",
    stack: [
      "Next.js",
      "Node.js",
      "MongoDB",
      "WebGL",
      "SVG",
      "REST APIs",
    ],
    bullets: [
      "Engineered high-performance Next.js applications and built advanced interactive data visualizations in SVG and WebGL for geospatial rendering.",
      "Architected a reusable UI component library on atomic-design principles, lifting delivery speed roughly 60% and making shared surfaces far easier to maintain.",
      "Worked the full stack on production features: responsive UI, backend API development, and database design and administration.",
      "Tuned render and query paths so large datasets stayed interactive rather than degrading as data volume grew.",
    ],
  },
  {
    role: "Frontend Developer",
    org: "Almaymaar",
    year: "2023 – 2024",
    summary:
      "Shipped premium marketing and product experiences for real-estate developments, including Harsukh Residences: an immersive 3D building explorer with interactive SVG floor plans and Unity WebGL, built on Next.js.",
    stack: [
      "Next.js",
      "JavaScript",
      "SSR / SSG",
      "WebSockets",
      "Framer Motion",
    ],
    bullets: [
      "Built the Harsukh Residences experience: a 3D building explorer, interactive SVG floor plans, and Unity WebGL embedded in a Next.js front end.",
      "Engineered high-performance frontend components using server-side rendering and static generation to keep first paint and interaction fast on media-heavy pages.",
      "Integrated frontend components with backend services over REST APIs and WebSockets for live data and real-time updates.",
      "Raised code quality through review and unit testing, tightening maintainability across a growing component surface.",
    ],
  },
];
