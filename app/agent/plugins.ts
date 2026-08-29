export type AgentPluginStatus = "ready" | "needs-setup";

export type AgentPlugin = {
  id: string;
  label: string;
  status: AgentPluginStatus;
  description: string;
  detail: string;
};

/**
 * Client-safe registry for the small set of actions this page can expose.
 * Secrets and provider credentials never belong in this module.
 */
export const agentPlugins: readonly AgentPlugin[] = [
  {
    id: "email-handoff",
    label: "Email handoff",
    status: "ready",
    description: "Open a note in your own mail app.",
    detail: "A click opens a prefilled draft. Nothing is sent automatically.",
  },
  {
    id: "messages-bridge",
    label: "Messages bridge",
    status: "needs-setup",
    description: "Connect Apple Messages through a private bridge.",
    detail: "This needs a user-owned macOS relay such as AirMessage or BlueBubbles.",
  },
];

