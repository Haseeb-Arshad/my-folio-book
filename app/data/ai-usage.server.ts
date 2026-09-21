import {
  normalizeAiUsageSnapshot,
  type AiUsageSnapshot,
} from "./ai-usage";

const STATS_FETCH_TIMEOUT_MS = 900;

export async function getAiUsageSnapshot(): Promise<AiUsageSnapshot | null> {
  const endpoint = process.env.AI_USAGE_STATS_URL?.trim();

  if (!endpoint) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    STATS_FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[ai-usage] stats endpoint returned", response.status);
      return null;
    }

    return normalizeAiUsageSnapshot(await response.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.warn("[ai-usage] stats snapshot unavailable:", message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
