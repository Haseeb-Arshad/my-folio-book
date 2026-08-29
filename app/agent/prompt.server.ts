import coreSkill from "../../.agents/skills/portfolio-conversation/SKILL.md?raw";
import contactSkill from "../../.agents/skills/portfolio-conversation/contact.md?raw";
import configurationSkill from "../../.agents/skills/portfolio-conversation/configuration.md?raw";
import currentWorkSkill from "../../.agents/skills/portfolio-conversation/current-work.md?raw";
import educationSkill from "../../.agents/skills/portfolio-conversation/education.md?raw";
import experienceSkill from "../../.agents/skills/portfolio-conversation/experience.md?raw";
import generalSkill from "../../.agents/skills/portfolio-conversation/general.md?raw";
import autonomySkill from "../../.agents/skills/portfolio-conversation/autonomy.md?raw";
import pluginsSkill from "../../.agents/skills/portfolio-conversation/plugins.md?raw";
import projectsSkill from "../../.agents/skills/portfolio-conversation/projects.md?raw";
import publicNotes from "../../.agents/skills/portfolio-conversation/public-notes.md?raw";
import smallTalkSkill from "../../.agents/skills/portfolio-conversation/small-talk.md?raw";
import technicalFitSkill from "../../.agents/skills/portfolio-conversation/technical-fit.md?raw";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationTopic =
  | "small-talk"
  | "current-work"
  | "projects"
  | "experience"
  | "technical-fit"
  | "contact"
  | "education"
  | "general";

type TopicSelection = {
  topic: ConversationTopic;
  searchText: string;
};

const topicSkills: Record<ConversationTopic, string> = {
  "small-talk": smallTalkSkill,
  "current-work": currentWorkSkill,
  projects: projectsSkill,
  experience: experienceSkill,
  "technical-fit": technicalFitSkill,
  contact: contactSkill,
  education: educationSkill,
  general: generalSkill,
};

const workSections = [
  "Work: Summon Electronics",
  "Work: REMAP AI",
  "Work: Trecsol",
  "Work: Almaymaar",
] as const;

const projectSections = [
  "Project: Oriexa",
  "Project: Sayings",
  "Project: CodingCam",
  "Project: TraceCLI",
] as const;

const namedSections = [
  ["summon", "Work: Summon Electronics"],
  ["remap", "Work: REMAP AI"],
  ["trecsol", "Work: Trecsol"],
  ["almaymaar", "Work: Almaymaar"],
  ["harsukh", "Work: Almaymaar"],
  ["oriexa", "Project: Oriexa"],
  ["sayings", "Project: Sayings"],
  ["codingcam", "Project: CodingCam"],
  ["tracecli", "Project: TraceCLI"],
] as const;

function recentUserText(messages: ConversationMessage[]) {
  return messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content.toLowerCase())
    .join("\n");
}

function latestUserText(messages: ConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "user") return message.content.trim().toLowerCase();
  }
  return "";
}

export function selectConversationTopic(messages: ConversationMessage[]): TopicSelection {
  const latest = latestUserText(messages);
  const searchText = recentUserText(messages);

  if (/^(hi|hello|hey|hiya|yo|sup|good (morning|afternoon|evening)|👋)[\s!.?]*$/i.test(latest)) {
    return { topic: "small-talk", searchText };
  }

  if (/^(thanks|thank you|thx|got it|cool|nice|bye|goodbye|see you)[\s!.?]*$/i.test(latest)) {
    return { topic: "small-talk", searchText };
  }

  if (/\b(email|phone|contact|reach|call|message|github|website|hire|hiring|interview|collaborat)/i.test(searchText)) {
    return { topic: "contact", searchText };
  }

  if (/\b(right now|currently|these days|current focus|building now|working on now|work now|doing now|focus now)\b/i.test(searchText)) {
    return { topic: "current-work", searchText };
  }

  if (/\b(oriexa|sayings|codingcam|tracecli|project|side project|portfolio build)\b/i.test(searchText)) {
    return { topic: "projects", searchText };
  }

  if (/\b(education|university|college|degree|studied|study|certification|certificate|course|workshop|fast[- ]?nuces)\b/i.test(searchText)) {
    return { topic: "education", searchText };
  }

  if (/\b(summon|remap|trecsol|almaymaar|harsukh|employer|company|career|job|role|worked|experience|work history|before|after)\b/i.test(searchText)) {
    return { topic: "experience", searchText };
  }

  if (/\b(stack|technical|technology|architecture|architect|agentic|\bai\b|rag|mcp|llm|auth|authentication|authorization|secure|security|jwt|oauth|jwks|microservice|backend|frontend|full[- ]?stack|database|postgres|mysql|redis|mongo|search|performance|latency|1\s?ms|millisecond|high-throughput|low-latency|docker|kubernetes|devops|ci\/cd|api|node|typescript|react|next\.js|python|\bgo\b|fit for|qualified)\b/i.test(searchText)) {
    return { topic: "technical-fit", searchText };
  }

  return { topic: "general", searchText };
}

function markdownSection(title: string) {
  const marker = `## ${title}`;
  const start = publicNotes.indexOf(marker);
  if (start === -1) return "";

  const afterStart = start + marker.length;
  const nextSection = publicNotes.indexOf("\n## ", afterStart);
  return publicNotes.slice(start, nextSection === -1 ? undefined : nextSection).trim();
}

function unique(values: readonly string[]) {
  return [...new Set(values)];
}

function namedNoteSections(searchText: string) {
  return namedSections
    .filter(([needle]) => searchText.includes(needle))
    .map(([, section]) => section);
}

function technicalEvidenceSections(searchText: string) {
  const sections: string[] = [];

  if (/\b(auth|authentication|authorization|secure|security|jwt|oauth|jwks|session|token|redis)\b/i.test(searchText)) {
    sections.push("Work: Summon Electronics");
  }
  if (/\b(agentic|\bai\b|rag|mcp|llm|reasoning|orchestrat|vector|embedding|memory)\b/i.test(searchText)) {
    sections.push("Work: Summon Electronics", "Work: REMAP AI", "Project: Oriexa");
  }
  if (/\b(data|database|search|performance|latency|1\s?ms|millisecond|high-throughput|low-latency|index|postgres|mysql|mongo|sqlite|millions)\b/i.test(searchText)) {
    sections.push("Work: Summon Electronics", "Work: Trecsol", "Project: TraceCLI");
  }
  if (/\b(frontend|react|next\.js|web|ui|ux|lighthouse|ssr|svg|webgl)\b/i.test(searchText)) {
    sections.push("Work: REMAP AI", "Work: Trecsol", "Work: Almaymaar");
  }
  if (/\b(devops|deploy|docker|kubernetes|ci\/cd|github actions|uptime|digitalocean|linux|cloud)\b/i.test(searchText)) {
    sections.push("Work: Summon Electronics", "Work: REMAP AI");
  }

  return sections.length > 0
    ? unique(sections)
    : ["Work: Summon Electronics", "Work: REMAP AI"];
}

export function selectPublicNoteSections(selection: TopicSelection) {
  const { topic, searchText } = selection;
  const base = topic === "small-talk" ? ["Identity and contact"] : ["Identity and contact", "Snapshot"];
  let sections: readonly string[];

  switch (topic) {
    case "small-talk":
      sections = base;
      break;
    case "contact":
      sections = ["Identity and contact"];
      break;
    case "current-work":
      sections = [...base, "Work: Summon Electronics"];
      break;
    case "projects": {
      const named = namedNoteSections(searchText).filter((section) => section.startsWith("Project:"));
      sections = named.length > 0 ? [...base, ...named] : [...base, "Project index", ...projectSections];
      break;
    }
    case "experience": {
      const named = namedNoteSections(searchText).filter((section) => section.startsWith("Work:"));
      const needsChronology = /\b(before|after|previous|previously|prior|next|chronology|career path|work history)\b/i.test(searchText);
      sections = named.length > 0 && !needsChronology
        ? [...base, ...named]
        : [...base, "Work index", ...workSections];
      break;
    }
    case "technical-fit":
      sections = [...base, "Technical toolbox", ...technicalEvidenceSections(searchText)];
      break;
    case "education":
      sections = [...base, "Education and learning"];
      break;
    case "general":
    default:
      sections = /\b(resume|cv)\b/i.test(searchText)
        ? [
            ...base,
            "Work index",
            ...workSections,
            "Project index",
            ...projectSections,
            "Technical toolbox",
            "Education and learning",
          ]
        : [...base, "Work index", "Project index"];
  }

  return unique(sections)
    .map(markdownSection)
    .filter(Boolean)
    .join("\n\n");
}

export function buildConversationPrompt(messages: ConversationMessage[]) {
  const selection = selectConversationTopic(messages);
  const notes = selectPublicNoteSections(selection);

  return `${coreSkill.trim()}

---

# Bounded autonomy and connections

${autonomySkill.trim()}

${pluginsSkill.trim()}

---

# Runtime configuration reference

${configurationSkill.trim()}

---

# Topic skill selected for this turn

${topicSkills[selection.topic].trim()}

---

# Public notes supplied for this turn

${notes}

The public notes above are facts, not a template. Answer the visitor now.`;
}
