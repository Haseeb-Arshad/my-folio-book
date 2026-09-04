import { supabaseServer } from "../lib/supabase.server";

export type ChatSurface = "home" | "resume";
export type ChatMode = "plain" | "goblin";
export type ChatRole = "user" | "assistant";
export type ChatStatus = "completed" | "failed" | "truncated";
export type AgentEventName =
  | "agent_opened"
  | "agent_message_sent"
  | "agent_reply_completed"
  | "agent_reply_failed"
  | "agent_conversation_reset"
  | "agent_mode_changed";

export type ChatPersistenceContext = {
  visitorId: string;
  conversationId: string;
  surface: ChatSurface;
  mode: ChatMode;
};

const MAX_CHAT_CONTENT = 4_000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseChatPersistenceContext(
  value: unknown,
  expectedMode?: ChatMode,
): ChatPersistenceContext | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const visitorId = candidate.visitor_id;
  const conversationId = candidate.conversation_id;
  const surface = candidate.surface;
  const mode = candidate.mode;

  if (
    typeof visitorId !== "string" ||
    typeof conversationId !== "string" ||
    !UUID_RE.test(visitorId) ||
    !UUID_RE.test(conversationId) ||
    (surface !== "home" && surface !== "resume") ||
    (mode !== "plain" && mode !== "goblin") ||
    (expectedMode && mode !== expectedMode)
  ) {
    return null;
  }

  return {
    visitorId,
    conversationId,
    surface: surface as ChatSurface,
    mode: mode as ChatMode,
  };
}

/**
 * Chat persistence is best effort. The conversation should still work during
 * a database incident, while every configured server records the failure in
 * its logs without exposing the visitor's message.
 */
export async function recordChatMessage(
  context: ChatPersistenceContext,
  role: ChatRole,
  content: string,
  status: ChatStatus,
  metadata: Record<string, unknown> = {},
) {
  const client = supabaseServer();
  if (!client) return;

  try {
    const { error } = await client.from("portfolio_chat_messages").insert({
      visitor_id: context.visitorId,
      conversation_id: context.conversationId,
      surface: context.surface,
      mode: context.mode,
      role,
      content: content.slice(0, MAX_CHAT_CONTENT),
      status,
      metadata,
    });

    if (error) {
      console.error("[chat] persistence failed:", error.message);
    }
  } catch (error) {
    console.error(
      "[chat] persistence failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }
}

export async function recordAgentEvent(
  context: ChatPersistenceContext,
  event: AgentEventName,
  metadata: Record<string, unknown> = {},
) {
  const client = supabaseServer();
  if (!client) return;

  try {
    const { error } = await client.from("portfolio_agent_events").insert({
      visitor_id: context.visitorId,
      conversation_id: context.conversationId,
      surface: context.surface,
      mode: context.mode,
      event_type: event,
      metadata,
    });

    if (error) {
      console.error("[chat] event persistence failed:", error.message);
    }
  } catch (error) {
    console.error(
      "[chat] event persistence failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }
}
