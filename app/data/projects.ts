/* ───────────────────────────────────────────────────────────
   Featured work. Pulled from github.com/Haseeb-Arshad.
   Add a project by dropping a new object into `projects`.
   ─────────────────────────────────────────────────────────── */

export type Project = {
  name: string;
  /* one-to-two line pitch */
  tagline: string;
  year: string;
  stack: string[];
  /* live demo, or null if not deployed */
  live: string | null;
  code: string;
  /* the project's own logo (shown on the card); falls back to letter + color */
  logo?: string;
  /* single-letter accent + tailwind bg class (fallback when no logo) */
  letter: string;
  color: string;
  /* "Building" badge for work-in-progress */
  status?: "building";
  /* extra links beyond Live/Code, e.g. npm / PyPI distributions */
  links?: { label: string; href: string }[];
  /* hover preview — image + blurb pulled from the live site */
  popup?: { image: string; description: string };
};

export const projects: Project[] = [
  {
    name: "Incillum",
    tagline:
      "Persistent intelligence for enterprise operations. An AI system built to carry context, decisions and responsibility across long-running business work, acting within defined authority and bringing people in where judgment is required.",
    year: "2026",
    stack: ["TypeScript", "AI Agents", "PostgreSQL", "Enterprise Ops"],
    live: "https://incillum.com",
    logo: "/logos/incillum.png",
    /* Closed source, so there is no repository to link. `code` is required by
       the schema, and `links` overrides the default "Code" link that would
       otherwise point at the marketing site and call it source. */
    code: "https://incillum.com",
    links: [{ label: "Early access", href: "https://incillum.com/#waitlist" }],
    letter: "I",
    color: "bg-indigo-600",
    status: "building",
  },
  {
    name: "Lead Truth Engine",
    tagline:
      "The go-to-market intelligence system at Summon Electronics: activity from the website, Apollo, HeyReach, calls and RFQs is resolved to one person as each event arrives, scored on an append-only timeline, and gated before anything reaches a real buyer.",
    year: "2026",
    stack: ["NestJS", "TypeScript", "PostgreSQL", "Redis", "Queues"],
    live: null,
    /* No public repository: this is company work. `code` is required by the
       schema and doubles as the card's primary link, so it points at the
       case study rather than at an invented GitHub URL. */
    code: "/work/lead-truth-engine",
    letter: "L",
    color: "bg-slate-800",
    links: [{ label: "Case study", href: "/work/lead-truth-engine" }],
  },
  {
    name: "TaskHive",
    tagline:
      "A marketplace where humans post tasks and AI agents browse, claim, and deliver work for reputation credits, built on a Skill/Tools/Software 'Trinity' architecture with REST and MCP entry points.",
    year: "2026",
    stack: ["Next.js", "Python", "MCP", "AI Agents"],
    live: "https://task-hive-sigma.vercel.app",
    code: "https://github.com/Haseeb-Arshad/TaskHive",
    letter: "T",
    color: "bg-violet-600",
    popup: {
      image: "/previews/taskhive.png",
      description:
        "Post tasks, and AI agents browse, claim, and complete them, tracked through reputation credits. A marketplace built for the agentic era.",
    },
  },
  {
    name: "Sayings",
    tagline:
      "A voice-first social platform: share spoken posts that AI transcribes, reads for emotion, and distills into topics.",
    year: "2026",
    stack: ["React", "ElevenLabs", "Speech-to-Text", "Emotion AI"],
    live: "https://sayings.me",
    code: "https://github.com/Haseeb-Arshad/sayings",
    logo: "/logos/sayings.png",
    letter: "S",
    color: "bg-rose-500",
    popup: {
      image: "/previews/sayings.png",
      description:
        "A voice-first social platform where you speak instead of type. AI transcribes each post, reads it for emotion, and surfaces the topics underneath.",
    },
  },
  {
    name: "Gideon",
    tagline:
      "A voice-agent platform. You speak, and rather than returning a wall of chat the page composes the answer it needs: a summary, a comparison, the sources behind it, the follow-up worth asking next. Built around a low-latency speech loop, so the interface is the conversation rather than a transcript box under it.",
    year: "2026",
    stack: ["React 19", "TanStack", "Realtime Voice", "Vite"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/talkGideon",
    letter: "G",
    color: "bg-teal-600",
    status: "building",
  },
  {
    name: "Harsukh Residences",
    tagline:
      "Developed at Almaymaar: a premium real-estate experience for a luxury mountain-apartment development in Galyat, with an immersive 3D building explorer, interactive SVG floor plans, and Unity WebGL.",
    year: "2024",
    stack: ["Next.js 14", "Framer Motion", "Redux", "WebGL"],
    live: "https://theharsukh.com",
    /* Company work at Almaymaar, not a personal repo: `code` is required by
       the schema, and the empty `links` array suppresses the default "Code"
       link so the card shows Live only. */
    code: "https://theharsukh.com",
    links: [],
    logo: "/logos/harsukh.png",
    letter: "H",
    color: "bg-stone-700",
    popup: {
      image: "/previews/harsukh.webp",
      description:
        "Experience luxury living at its finest in Galyat. Harsukh Residences offers premium apartments with panoramic mountain views, smart home features, and world-class amenities.",
    },
  },
  {
    name: "Milo",
    tagline:
      "A household-operations agent that mines family messages for school tasks, payments, and reminders, with safe approvals.",
    year: "2026",
    stack: ["TypeScript", "OpenAI", "Prisma", "AI Agent"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/milo-app",
    letter: "M",
    color: "bg-emerald-600",
  },
  {
    name: "TraceCLI",
    tagline:
      "A privacy-first, terminal-native activity tracker and AI productivity coach: local-only SQLite, focus mode with live distraction detection, and natural-language queries over your habits. Shipped as both an npm (Node) and a pip (Python) CLI.",
    year: "2026",
    stack: ["Node", "Python", "SQLite", "Local AI"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/tracecli-npm",
    letter: "T",
    color: "bg-zinc-700",
    links: [
      { label: "npm pkg", href: "https://github.com/Haseeb-Arshad/tracecli-npm" },
      { label: "pip pkg", href: "https://github.com/Haseeb-Arshad/trace-cli" },
    ],
  },
  {
    name: "WikiAsterisk",
    tagline:
      "Read Wikipedia with the depth and care of a magazine: section extraction, references, highlights, and a text-mining-ready structure.",
    year: "2026",
    stack: ["React", "Vite", "Express", "TanStack"],
    live: "https://wiki-asterick.vercel.app",
    code: "https://github.com/Haseeb-Arshad/wiki-asterick",
    letter: "✶",
    color: "bg-amber-500",
    popup: {
      image: "/previews/wiki-asterick.png",
      description:
        "A magazine-style Wikipedia reader: beautiful typography, pull-out references, and highlights that turn any article into a long-form read.",
    },
  },
  {
    name: "Coffee Club",
    tagline:
      "Map-first cafe discovery for Islamabad: community picks, moderated memories, and an admin review flow on Supabase.",
    year: "2026",
    stack: ["React", "Supabase", "Leaflet", "TanStack"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/coffee-club",
    letter: "C",
    color: "bg-orange-500",
  },
];
