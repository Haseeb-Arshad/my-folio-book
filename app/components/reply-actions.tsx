import { useState } from "react";
import { Link } from "react-router";
import { resumeProfile } from "../data/resume";

/* The matching table, handed down from the route loader so it reflects
   whatever is in Supabase rather than a second, drifting copy. */
export type ProjectLink = {
  name: string;
  href: string;
  live: boolean;
};

/* ───────────────────────────────────────────────────────────
   Turns a finished reply into something you can act on.

   The agent writes prose. This reads that prose for things it
   already knows about, a project name, an employer, the email
   address, and offers the matching next step underneath the
   bubble.

   Deliberately derived on the client from local data rather
   than asked of the model: a link the model invented would
   look identical to a real one and go nowhere.
   ─────────────────────────────────────────────────────────── */

export type ReplyAction =
  | {
      kind: "link";
      key: string;
      label: string;
      href: string;
      external: boolean;
    }
  | { kind: "copy"; key: string; label: string; value: string };

const EMPLOYERS = [
  "Summon Electronics",
  "Summon",
  "REMAP AI",
  "REMAP",
  "Trecsol",
  "Almaymaar",
];

/* The two data sources disagree on names. The published notes call the agent
   marketplace "Oriexa"; projects.ts calls the same thing "TaskHive". Until
   those are reconciled, map the spoken name onto the card that has the links. */
const PROJECT_ALIASES: Record<string, string> = {
  Oriexa: "TaskHive",
  Harsukh: "Harsukh Residences",
};

/* Named in the résumé notes but with no card, so there is no link to offer.
   They still earn a route to the work page. */
const UNLINKED_PROJECTS = ["CodingCam"];

/* A short title beats matching every book row from the loader, and this list
   changes rarely enough that hardcoding it here is simpler than threading
   another prop through every AgentBox call site. */
const BOOK_TITLES = [
  "Rosie Project",
  "Life 3.0",
  "Singularity Is Near",
  "Singularity Is Nearer",
  "Beginning of Infinity",
  "Deep Work",
  "Kite Runner",
];

const MAX_ACTIONS = 3;

/* Whole-word-ish match so "Milo" does not fire inside "milometer" and a
   project called "Go" would not match every other sentence. */
function mentions(haystack: string, needle: string) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(haystack);
}

export function replyActions(
  text: string,
  projects: readonly ProjectLink[]
): ReplyAction[] {
  const actions: ReplyAction[] = [];
  const seen = new Set<string>();

  const push = (action: ReplyAction) => {
    if (seen.has(action.key)) return;
    seen.add(action.key);
    actions.push(action);
  };

  for (const project of projects) {
    const spokenAs = Object.entries(PROJECT_ALIASES).find(
      ([, canonical]) => canonical === project.name
    )?.[0];

    const named =
      mentions(text, project.name) ||
      (spokenAs ? mentions(text, spokenAs) : false);
    if (!named) continue;

    /* Label with the name the reply actually used, so the chip does not look
       like it belongs to a different project. */
    const shown = spokenAs && mentions(text, spokenAs) ? spokenAs : project.name;

    push({
      kind: "link",
      key: `project:${project.name}`,
      label: project.live ? `Open ${shown}` : `${shown} on GitHub`,
      href: project.href,
      external: true,
    });
  }

  const mentionsUnlinkedProject = UNLINKED_PROJECTS.some((name) =>
    mentions(text, name)
  );

  if (
    mentionsUnlinkedProject ||
    EMPLOYERS.some((employer) => mentions(text, employer))
  ) {
    push({
      kind: "link",
      key: "work",
      label: "See the work",
      href: "/work",
      external: false,
    });
  }

  /* Only when the address is actually printed, so a reply that merely uses
     the word "email" does not sprout a copy button. */
  if (text.includes(resumeProfile.contact.email)) {
    push({
      kind: "copy",
      key: "email",
      label: "Copy email",
      value: resumeProfile.contact.email,
    });
  }

  if (/github\.com\/Haseeb-Arshad/i.test(text)) {
    push({
      kind: "link",
      key: "github",
      label: "GitHub",
      href: "https://github.com/Haseeb-Arshad",
      external: true,
    });
  }

  if (/\b(resume|résumé|cv)\b/i.test(text)) {
    push({
      kind: "link",
      key: "resume",
      label: "Open the résumé",
      href: "/resume",
      external: false,
    });
  }

  if (/\bchess(\.com)?\b/i.test(text)) {
    push({
      kind: "link",
      key: "chess",
      label: "Chess.com profile",
      href: "https://www.chess.com/member/Haseeb_Arshad",
      external: true,
    });
  }

  if (BOOK_TITLES.some((title) => mentions(text, title))) {
    push({
      kind: "link",
      key: "reading",
      label: "See the reading list",
      href: "/reading",
      external: false,
    });
  }

  return actions.slice(0, MAX_ACTIONS);
}

const chipClass =
  "press agent-chip-in inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900";

function ArrowOut() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      className="opacity-45"
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

export function ReplyActions({ actions }: { actions: ReplyAction[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  if (actions.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {actions.map((action, index) => {
        const style = { animationDelay: `${index * 70}ms` };

        if (action.kind === "copy") {
          const isCopied = copied === action.key;
          return (
            <button
              key={action.key}
              type="button"
              style={style}
              className={chipClass}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(action.value);
                  setCopied(action.key);
                  setTimeout(() => setCopied(null), 1600);
                } catch {
                  /* Clipboard can be blocked. The address is in the reply
                     above either way, so there is nothing to recover. */
                }
              }}
            >
              {isCopied ? "Copied" : action.label}
            </button>
          );
        }

        if (action.external) {
          return (
            <a
              key={action.key}
              href={action.href}
              target="_blank"
              rel="noreferrer"
              style={style}
              className={chipClass}
            >
              {action.label}
              <ArrowOut />
            </a>
          );
        }

        return (
          <Link
            key={action.key}
            to={action.href}
            style={style}
            className={chipClass}
          >
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
