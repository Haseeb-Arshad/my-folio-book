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
  /* single-letter accent + tailwind bg class */
  letter: string;
  color: string;
  /* "Building" badge for work-in-progress */
  status?: "building";
  /* extra links beyond Live/Code, e.g. npm / PyPI distributions */
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    name: "TaskHive",
    tagline:
      "A marketplace where humans post tasks and AI agents browse, claim, and deliver work for reputation credits — built on a Skill/Tools/Software 'Trinity' architecture with REST and MCP entry points.",
    year: "2026",
    stack: ["Next.js", "Python", "MCP", "AI Agents"],
    live: "https://task-hive-sigma.vercel.app",
    code: "https://github.com/Haseeb-Arshad/TaskHive",
    letter: "T",
    color: "bg-violet-600",
  },
  {
    name: "Sayings",
    tagline:
      "A voice-first social platform — share spoken posts that AI transcribes, reads for emotion, and distills into topics.",
    year: "2026",
    stack: ["React", "ElevenLabs", "Speech-to-Text", "Emotion AI"],
    live: "https://sayings-eight.vercel.app",
    code: "https://github.com/Haseeb-Arshad/sayings",
    letter: "S",
    color: "bg-rose-500",
  },
  {
    name: "Gideon",
    tagline:
      "A voice-first subconscious AI — ask by voice and the page renders a bespoke generated answer (summary, comparison, sources, follow-ups) instead of a wall of chat. Currently building.",
    year: "2026",
    stack: ["React 19", "TanStack", "Framer Motion", "Vite"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/talkGideon",
    letter: "G",
    color: "bg-teal-600",
    status: "building",
  },
  {
    name: "Milo",
    tagline:
      "A household-operations agent that mines family messages for school tasks, payments, and reminders — with safe approvals.",
    year: "2026",
    stack: ["TypeScript", "OpenAI", "Prisma", "AI Agent"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/milo-app",
    letter: "M",
    color: "bg-emerald-600",
  },
  {
    name: "SearchBox",
    tagline:
      "A semantic product-search engine over regional brand stores, with a Go backend wired through the Model Context Protocol.",
    year: "2025",
    stack: ["Go", "MCP", "TypeScript", "Semantic Search"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/searchbox",
    letter: "S",
    color: "bg-sky-600",
  },
  {
    name: "DialogFlow Form",
    tagline:
      "AI-native forms that replace static surveys with a conversation — questions adapt as people chat.",
    year: "2025",
    stack: ["React", "TypeScript", "OpenAI"],
    live: "https://dialogflow-form.vercel.app",
    code: "https://github.com/Haseeb-Arshad/dialogflow-form",
    letter: "D",
    color: "bg-indigo-600",
  },
  {
    name: "TraceCLI",
    tagline:
      "A privacy-first, terminal-native activity tracker and AI productivity coach — local-only SQLite, focus mode with live distraction detection, and natural-language queries over your habits. Shipped as both an npm (Node) and a pip (Python) CLI.",
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
    name: "Wiki Asterick",
    tagline:
      "A magazine-style Wikipedia reader with section extraction, references, highlights, and a text-mining-ready structure.",
    year: "2026",
    stack: ["React", "Vite", "Express", "TanStack"],
    live: "https://wiki-asterick.vercel.app",
    code: "https://github.com/Haseeb-Arshad/wiki-asterick",
    letter: "W",
    color: "bg-amber-500",
  },
  {
    name: "Coffee Club",
    tagline:
      "Map-first cafe discovery for Islamabad — community picks, moderated memories, and an admin review flow on Supabase.",
    year: "2026",
    stack: ["React", "Supabase", "Leaflet", "TanStack"],
    live: null,
    code: "https://github.com/Haseeb-Arshad/coffee-club",
    letter: "C",
    color: "bg-orange-500",
  },
];
