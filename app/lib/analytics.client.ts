import type { PostHogInterface } from "posthog-js";

type PostHogClient = PostHogInterface;
type PendingEvent = {
  event: string;
  properties: Record<string, unknown>;
};
type AgentEventContext = {
  surface: "home" | "resume";
  mode: "plain" | "goblin";
  conversationId: string;
};

const POSTHOG_API_HOST =
  import.meta.env.VITE_POSTHOG_API_HOST?.trim() || "https://us.i.posthog.com";
const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
const VISITOR_ID_KEY = "portfolio.analytics.visitor_id";

let posthogPromise: Promise<PostHogClient | null> | null = null;
let posthogClient: PostHogClient | null = null;
let posthogReady = false;
let fallbackVisitorId: string | undefined;
const pendingEvents: PendingEvent[] = [];

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function createAnalyticsId() {
  return newId();
}

export function getAnalyticsVisitorId() {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;

    const visitorId = newId();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  } catch {
    fallbackVisitorId ??= newId();
    return fallbackVisitorId;
  }
}

async function getPostHog() {
  if (typeof window === "undefined" || !POSTHOG_TOKEN) return null;
  if (posthogPromise) return posthogPromise;

  posthogPromise = import("posthog-js")
    .then(({ default: client }) => {
      client.init(POSTHOG_TOKEN, {
        api_host: POSTHOG_API_HOST,
        defaults: "2026-05-30",
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        request_batching: false,
        session_recording: {
          maskAllInputs: true,
        },
        loaded: (loadedClient) => {
          posthogClient = loadedClient;
          posthogReady = true;
          const visitorId = getAnalyticsVisitorId();
          if (visitorId) {
            loadedClient.register({ portfolio_visitor_id: visitorId });
          }

          while (pendingEvents.length > 0) {
            const pendingEvent = pendingEvents.shift();
            if (pendingEvent) {
              loadedClient.capture(pendingEvent.event, pendingEvent.properties);
            }
          }
        },
      });
      return client;
    })
    .catch(() => null);

  return posthogPromise;
}

export function capturePostHogEvent(
  event: string,
  properties: Record<string, unknown> = {},
) {
  if (posthogReady && posthogClient) {
    posthogClient.capture(event, properties);
    return;
  }

  if (typeof window === "undefined" || !POSTHOG_TOKEN) return;

  pendingEvents.push({ event, properties });
  void getPostHog();
}

export function captureAgentEvent(
  event: string,
  properties: Record<string, unknown>,
  context: AgentEventContext,
) {
  capturePostHogEvent(event, properties);

  const visitorId = getAnalyticsVisitorId();
  if (!visitorId) return;

  const metadata = Object.fromEntries(
    Object.entries(properties).filter(
      ([key]) => !["surface", "mode", "conversation_id"].includes(key),
    ),
  );

  void fetch("/api/agent-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      context: {
        visitor_id: visitorId,
        conversation_id: context.conversationId,
        surface: context.surface,
        mode: context.mode,
      },
      metadata,
    }),
  }).catch(() => undefined);
}
