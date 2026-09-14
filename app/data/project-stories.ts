import type { CaseStudy } from "./case-studies";

export type WalkthroughStep = {
  title: string;
  text: string;
  image: string;
  alt: string;
  caption: string;
};
export type ProjectPresentation = {
  slug: string;
  category: string;
  headline: string;
  description: string;
  cover: string;
  alt: string;
  logo?: string;
  tone: "paper" | "night" | "slate";
  status: string;
  facts: { label: string; value: string }[];
  steps: WalkthroughStep[];
  link?: { href: string; label: string };
};

export const presentations: Record<string, ProjectPresentation> = {
  Incillum: {
    slug: "incillum",
    category: "Persistent intelligence",
    headline: "The work moves forward. You make the call.",
    description:
      "Intelligence for commercial work, from the first request to the evidence behind a decision.",
    cover: "/work/incillum/overview.jpg",
    alt: "Incillum's public website introducing intelligence for commercial work",
    logo: "/logos/incillum.png",
    tone: "paper",
    status: "In development · Early access",
    facts: [
      { label: "Focus", value: "Commercial operations" },
      { label: "First workflow", value: "RFQ to decision" },
      { label: "Principle", value: "Human authority" },
    ],
    link: { href: "https://incillum.com", label: "Visit Incillum" },
    steps: [
      {
        title: "Start with the work",
        text: "A request is the beginning of a longer commercial process. Incillum's public introduction connects the request to the documents, follow-ups and decisions that come after it.",
        image: "/work/incillum/overview.jpg",
        alt: "Incillum introduction and early access invitation",
        caption: "The public introduction. Incillum is in development.",
      },
      {
        title: "Follow the evidence",
        text: "In the illustrative quotation, a supplier cost changes. The consequence is carried through to the margin, alongside the source that explains the change.",
        image: "/work/incillum/evidence.jpg",
        alt: "Illustrative supplier cost and margin comparison on Incillum's website",
        caption:
          "Illustrative scenario from the public site; invented figures, not a production dashboard.",
      },
      {
        title: "Return to a decision",
        text: "The person reviews the commercial consequence and the available choices. Missing evidence and approval boundaries remain visible, rather than being resolved by a confident guess.",
        image: "/work/incillum/review.jpg",
        alt: "Incillum's illustrative review decision and source calculation",
        caption:
          "The same illustrative scenario, with the decision and supporting calculation exposed.",
      },
    ],
  },
  ChatGideon: {
    link: { href: "https://chatgideon.com", label: "Visit ChatGideon" },
    slug: "chatgideon",
    category: "Conversational interfaces",
    headline: "A conversation with a presence.",
    description:
      "Voice, text and visible responses share one surface. The conversation stays central; the timing is there to inspect.",
    cover: "/work/chatgideon/answer.jpg",
    alt: "ChatGideon answering a sample question in its voice and text interface",
    logo: "/logos/chatgideon.png",
    tone: "night",
    status: "In development · Local demonstration",
    facts: [
      { label: "Interface", value: "Voice + text" },
      { label: "Focus", value: "Conversational flow" },
      { label: "Evidence", value: "Visible turn timing" },
    ],
    steps: [
      {
        title: "Ask in your own words",
        text: "The text input sits alongside the voice controls. This captured example starts with a short question about compilers and interpreters, with voice muted.",
        image: "/work/chatgideon/question.jpg",
        alt: "A sample question typed into ChatGideon",
        caption:
          "Actual local interface with a sample prompt. No private conversation data.",
      },
      {
        title: "Stay with the answer",
        text: "The reply appears in the same focused surface. The sample demonstrates a working text turn, from a typed question to the response shown here.",
        image: "/work/chatgideon/answer.jpg",
        alt: "ChatGideon's completed answer to the sample question",
        caption:
          "An actual response captured locally. This text demonstration does not establish voice latency.",
      },
      {
        title: "Look behind the pause",
        text: "The latency panel exposes the stages of the turn. It makes the waiting time inspectable without keeping instrumentation in the main conversation.",
        image: "/work/chatgideon/timing.jpg",
        alt: "ChatGideon latency panel showing timing for the sample turn",
        caption:
          "Timing from one local sample, not a benchmark or a production performance claim.",
      },
    ],
  },
  "Lead Truth Engine": {
    slug: "lead-truth-engine",
    category: "Production engineering",
    headline: "One buyer. One coherent story.",
    description:
      "Turning fragmented buyer activity into an explainable sales priority, with evidence behind the engineering decisions.",
    cover: "/case-studies/lead-truth-engine/03-query.svg",
    alt: "Lead Truth Engine dashboard read before and after optimization",
    tone: "slate",
    status: "Engineering case study",
    facts: [
      { label: "Company", value: "Summon Electronics" },
      { label: "Focus", value: "Identity + intent" },
      { label: "Read", value: "Decisions + results" },
    ],
    steps: [],
  },
};

// Product overviews are intentionally limited to public positioning and the
// demonstrated interface. The employer engineering story retains its own copy.
export const productStories: CaseStudy[] = [
  {
    slug: "incillum",
    title: "Incillum",
    summary: presentations.Incillum.description,
    org: "Incillum",
    role: "Product engineering",
    team: "",
    scope: "Persistent intelligence for commercial work",
    stack: ["TypeScript", "AI systems", "Commercial operations"],
    excerpt: presentations.Incillum.description,
    sections: [
      {
        id: "context",
        title: "Commercial work does not end at the request",
        blocks: [
          {
            kind: "p",
            text: "A quotation depends on more than the document that starts it. Supplier costs move, evidence arrives later, and a person still has to decide which commitments the business should make. The useful unit of work is the whole process, with its context intact.",
          },
          {
            kind: "p",
            text: "Incillum is being built around that continuity. Its first public workflow follows an RFQ towards a commercial decision, keeping the consequences of new information attached to the work.",
          },
        ],
      },
      {
        id: "judgment",
        title: "The boundary is part of the product",
        blocks: [
          {
            kind: "p",
            text: "The public demonstration makes the stopping points explicit. Ambiguity, missing evidence, commercial policy and approvals bring a question back to a person. The goal is a decision with the working already assembled.",
          },
          {
            kind: "deflist",
            items: [
              {
                term: "Evidence",
                detail:
                  "A figure should remain connected to the document behind it. Missing information stays missing.",
              },
              {
                term: "Authority",
                detail:
                  "Preparing a recommendation does not authorize sending a quotation or committing a price.",
              },
              {
                term: "Continuity",
                detail:
                  "A supplier update should change the relevant work, rather than become another disconnected message.",
              },
            ],
          },
        ],
      },
      {
        id: "status",
        title: "What you are seeing",
        blocks: [
          {
            kind: "p",
            text: "Incillum is in development and inviting early-access conversations. The walkthrough above captures the public website's illustrative scenario. Its customer, supplier and figures are invented; it is an explanation of the intended workflow, not evidence of a completed production deployment.",
          },
        ],
      },
    ],
    provenance:
      "Based on Incillum's public product introduction and explicitly illustrative walkthrough at incillum.com.",
  },
  {
    slug: "chatgideon",
    title: "ChatGideon",
    summary: presentations.ChatGideon.description,
    org: "ChatGideon",
    role: "Product engineering",
    team: "",
    scope: "Conversation interface and realtime interaction",
    stack: ["React", "TypeScript", "Realtime Voice", "WebSocket"],
    excerpt: presentations.ChatGideon.description,
    sections: [
      {
        id: "context",
        title: "Make the interaction feel like a conversation",
        blocks: [
          {
            kind: "p",
            text: "A spoken interface has more to communicate than the answer itself. The person needs to know whether it is listening, thinking or responding, and needs an easy way to speak, type or stop a turn.",
          },
          {
            kind: "p",
            text: "ChatGideon brings those states into one focused surface. The visual presence anchors the conversation, the current response stays readable, and the input remains close at hand.",
          },
        ],
      },
      {
        id: "decisions",
        title: "Keep the conversation clear, and the system inspectable",
        blocks: [
          {
            kind: "deflist",
            items: [
              {
                term: "Two ways in",
                detail:
                  "Text and voice controls share the interface. A typed question can be answered with the microphone muted.",
              },
              {
                term: "Visible state",
                detail:
                  "The interface distinguishes thinking from a completed response and exposes a stop control during a turn.",
              },
              {
                term: "Timing on demand",
                detail:
                  "An optional panel shows the last turn and session timing, without making the normal conversation a diagnostics screen.",
              },
            ],
          },
          {
            kind: "p",
            text: "The tension is between presence and information density. The main surface gives the current exchange room, while the timing panel provides a separate place to examine what happened.",
          },
        ],
      },
      {
        id: "status",
        title: "A working example, with a clear scope",
        blocks: [
          {
            kind: "p",
            text: "The walkthrough records an actual typed question and answer in a local build, with voice muted. It verifies that interaction and the timing display. It does not measure speech interruption, audio quality or production latency.",
          },
          {
            kind: "p",
            text: "The next layer of evaluation is the spoken interaction: how interruptions, listening states and playback work together across a complete conversation.",
          },
        ],
      },
    ],
    provenance:
      "Screenshots show a local ChatGideon build with a sample question. Captured responses and timing describe that run only.",
  },
];
