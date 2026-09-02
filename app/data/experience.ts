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
      "Electronics commerce for consumer and B2B buyers, and I own the platform underneath it. That means the parts catalogue and the search over it, the sourcing and RFQ flows built on top, the go-to-market systems that sell against them, the authentication every service trusts, and the internal AI that reads all of it. The brief runs across product, platform, data, AI, and GTM rather than stopping at a layer.",
    stack: [
      "React",
      "Node.js",
      "NestJS",
      "Go",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Microservices",
      "AI Agents",
    ],
    bullets: [
      "Pulled tightly coupled flows apart into independently deployable services, and wrote the production microservices behind sourcing, sales, auth, and analytics, each with its own contract and its own release path.",
      "Built the electronic-parts data platform: millions of component records normalised across supplier feeds, with indexed retrieval landing around a millisecond, so search stays instant inside the sourcing and sales screens people actually work in.",
      "Designed and shipped the Lead Truth Engine, the go-to-market brain: website activity, Apollo, Clay, HeyReach, calls, and RFQs resolved to a single person as each event arrives, scored on an append-only timeline, and gated before anything reaches a real buyer. It contributed to roughly 30% sales growth.",
      "Stood up an always-on internal agent on a locally hosted Qwen model running on a DGX Spark: reasoning and execution loops over internal tools, business context retrieved on demand rather than stuffed into a prompt, and workflow state that survives a restart. Sourcing, sales, and operations query it from the messaging tools they already live in.",
      "Architected the authentication service around asymmetric signing: RS256 with JWKS so no service holds a shared secret, OAuth 2.0, Redis-backed revocation, refresh-token rotation with reuse detection, and invalidation that takes effect immediately rather than at the next expiry.",
      "Architected the admin command-center: account ownership and assignment, follow-up activity, campaign links, provider intelligence, and live monitoring, kept reload-safe over durable tables and versioned API contracts.",
      "Built multi-tenant analytics and visitor tracking with per-site data separation enforced the whole way down, from schema design through backend payload isolation to what the frontend is allowed to see.",
      "Profiled real production hot paths instead of guessing at them, reshaping queries, adding targeted indexes, and parallelizing backend reads, with every improvement verified against live timing.",
      "Containerized and shipped services with Docker on DigitalOcean, alongside guarded preview environments, secret hygiene, and repeatable smoke tests that run before anything goes out.",
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
