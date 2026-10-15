type ProviderId =
  | "amp"
  | "claude"
  | "codex"
  | "cursor"
  | "gemini"
  | "opencode"
  | "pi";

type Selection = ProviderId | "all";

type KvStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type Env = {
  AI_USAGE?: KvStore;
  AI_USAGE_SYNC_TOKEN?: string;
  AI_USAGE_ALLOWED_ORIGIN?: string;
  AI_USAGE_SUPABASE_URL?: string;
  AI_USAGE_SUPABASE_SECRET_KEY?: string;
};

type Daily = {
  date: string;
  input: number;
  output: number;
  cache: {
    input: number;
    output: number;
  };
  total: number;
};

type Model = {
  name: string;
  tokens: {
    input: number;
    output: number;
    cache: {
      input: number;
      output: number;
    };
    total: number;
  };
};

const STATS_KEY = "public";
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_DAILY_ROWS = 400;
const MAX_CODEX_ACCOUNTS = 20;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ACCOUNT_HASH_PATTERN = /^[a-f0-9]{64}$/;
const PROVIDER_ORDER: ProviderId[] = [
  "claude",
  "codex",
  "opencode",
  "cursor",
  "gemini",
  "amp",
  "pi",
];
const PROVIDER_DEFINITIONS: Record<
  Selection,
  { label: string; color: string }
> = {
  all: { label: "All tools", color: "#111827" },
  amp: { label: "Amp", color: "#be123c" },
  claude: { label: "Claude Code", color: "#d97706" },
  codex: { label: "Codex", color: "#4f46e5" },
  cursor: { label: "Cursor", color: "#111827" },
  gemini: { label: "Gemini CLI", color: "#0f766e" },
  opencode: { label: "Open Code", color: "#4b5563" },
  pi: { label: "Pi Coding Agent", color: "#7c3aed" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function nonNegativeInteger(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isSafeInteger(numeric) || numeric < 0) {
    return null;
  }

  return numeric;
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return null;
  }

  return Number.isNaN(Date.parse(value + "T00:00:00Z")) ? null : value;
}

function normalizeDaily(value: unknown): Daily[] | null {
  if (!Array.isArray(value) || value.length > MAX_DAILY_ROWS) {
    return null;
  }

  const daily: Daily[] = [];
  const seenDates = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const date = validDate(item.date);
    const input = nonNegativeInteger(item.input);
    const output = nonNegativeInteger(item.output);
    const total = nonNegativeInteger(item.total);
    const cache = isRecord(item.cache) ? item.cache : {};
    const cacheInput = nonNegativeInteger(cache.input);
    const cacheOutput = nonNegativeInteger(cache.output);

    if (
      !date ||
      input === null ||
      output === null ||
      total === null ||
      cacheInput === null ||
      cacheOutput === null ||
      seenDates.has(date)
    ) {
      return null;
    }

    seenDates.add(date);
    daily.push({
      date,
      input,
      output,
      cache: { input: cacheInput, output: cacheOutput },
      total,
    });
  }

  return daily.sort((left, right) => left.date.localeCompare(right.date));
}

function normalizeModel(value: unknown): Model | undefined {
  if (!isRecord(value) || typeof value.name !== "string") {
    return undefined;
  }

  const rawTokens = isRecord(value.tokens) ? value.tokens : {};
  const rawCache = isRecord(rawTokens.cache) ? rawTokens.cache : {};
  const input = nonNegativeInteger(rawTokens.input);
  const output = nonNegativeInteger(rawTokens.output);
  const total = nonNegativeInteger(rawTokens.total);
  const cacheInput = nonNegativeInteger(rawCache.input);
  const cacheOutput = nonNegativeInteger(rawCache.output);

  if (
    input === null ||
    output === null ||
    total === null ||
    cacheInput === null ||
    cacheOutput === null
  ) {
    return undefined;
  }

  return {
    name: value.name.slice(0, 120),
    tokens: {
      input,
      output,
      total,
      cache: { input: cacheInput, output: cacheOutput },
    },
  };
}

function normalizeInsights(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const rawStreaks = isRecord(value.streaks) ? value.streaks : {};
  const longest = nonNegativeInteger(rawStreaks.longest);
  const current = nonNegativeInteger(rawStreaks.current);

  if (longest === null || current === null) {
    return undefined;
  }

  return {
    mostUsedModel: normalizeModel(value.mostUsedModel),
    recentMostUsedModel: normalizeModel(value.recentMostUsedModel),
    streaks: { longest, current },
  };
}

function normalizeProvider(
  value: unknown,
  forcedId?: Selection,
): Record<string, unknown> | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = forcedId ?? value.id;
  const id =
    rawId === "all" || PROVIDER_ORDER.includes(rawId as ProviderId)
      ? (rawId as Selection)
      : null;
  const daily = normalizeDaily(value.daily);

  if (!id || !daily) {
    return null;
  }

  const definition = PROVIDER_DEFINITIONS[id];

  return {
    id,
    label: definition.label,
    color: definition.color,
    daily,
    insights: normalizeInsights(value.insights),
  };
}

type CodexAccount = {
  accountId: string;
  label: string;
  daily: Daily[];
};

function normalizeCodexAccounts(
  value: unknown,
  fallbackDaily: Daily[],
): CodexAccount[] | null {
  if (value === undefined) {
    return fallbackDaily.length > 0
      ? [{ accountId: "unattributed", label: "Unattributed history", daily: fallbackDaily }]
      : [];
  }

  if (!Array.isArray(value) || value.length > MAX_CODEX_ACCOUNTS) {
    return null;
  }

  const accounts: CodexAccount[] = [];
  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const accountId = item.accountHash;
    const label = item.label;
    const daily = normalizeDaily(item.daily);
    const validUnattributed = accountId === "unattributed" && label === "Unattributed history";
    const validAccount =
      typeof accountId === "string" &&
      ACCOUNT_HASH_PATTERN.test(accountId) &&
      typeof label === "string" &&
      /^Codex account [1-9]\d{0,2}$/.test(label);

    if (
      (!validUnattributed && !validAccount) ||
      !daily ||
      seenIds.has(accountId as string) ||
      seenLabels.has(label as string)
    ) {
      return null;
    }

    seenIds.add(accountId as string);
    seenLabels.add(label as string);
    accounts.push({ accountId: accountId as string, label: label as string, daily });
  }

  return accounts;
}

function normalizePublicAccounts(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenLabels = new Set<string>();
  const accounts: Array<Record<string, unknown>> = [];

  for (const item of value.slice(0, MAX_CODEX_ACCOUNTS)) {
    if (!isRecord(item) || typeof item.label !== "string") {
      continue;
    }

    const label = item.label;
    const validLabel =
      label === "Unattributed history" ||
      /^Codex account [1-9]\d{0,2}$/.test(label);
    const daily = normalizeDaily(item.daily);

    if (!validLabel || !daily || seenLabels.has(label)) {
      continue;
    }

    seenLabels.add(label);
    accounts.push({ label, surface: "local", daily });
  }

  return accounts;
}

function normalizeSnapshot(value: unknown): Record<string, unknown> | null {
  if (
    !isRecord(value) ||
    (value.schemaVersion !== 1 && value.schemaVersion !== 2)
  ) {
    return null;
  }

  const source = isRecord(value.source) ? value.source : {};
  const range = isRecord(value.range) ? value.range : {};
  const generatedAt =
    typeof value.generatedAt === "string" &&
    !Number.isNaN(Date.parse(value.generatedAt))
      ? value.generatedAt
      : null;
  const start = validDate(range.start);
  const end = validDate(range.end);
  const all = normalizeProvider(value.all, "all");
  const rawProviders = Array.isArray(value.providers) ? value.providers : [];
  const providers = rawProviders
    .map((provider) => normalizeProvider(provider))
    .filter((provider): provider is Record<string, unknown> => {
      return Boolean(provider && provider.id !== "all");
    });
  const missingProviders = Array.isArray(value.missingProviders)
    ? value.missingProviders.filter((provider): provider is ProviderId =>
        PROVIDER_ORDER.includes(provider as ProviderId),
      )
    : [];

  if (
    source.name !== "slopmeter" ||
    typeof source.version !== "string" ||
    !generatedAt ||
    !start ||
    !end ||
    !all ||
    providers.length === 0 ||
    providers.length > PROVIDER_ORDER.length
  ) {
    return null;
  }

  const codexProvider = providers.find((provider) => provider.id === "codex");
  const accounts = normalizePublicAccounts(value.accounts);
  const legacyAccounts =
    accounts.length > 0
      ? accounts
      : codexProvider && Array.isArray(codexProvider.daily)
        ? normalizePublicAccounts([
            { label: "Unattributed history", daily: codexProvider.daily },
          ])
        : [];

  return {
    schemaVersion: 2,
    source: { name: "slopmeter", version: source.version.slice(0, 40) },
    generatedAt,
    range: { start, end },
    all,
    providers,
    missingProviders: [...new Set(missingProviders)],
    accounts: legacyAccounts,
  };
}

function normalizeIncomingSnapshot(value: unknown): {
  snapshot: Record<string, unknown>;
  accounts: CodexAccount[];
} | null {
  if (!isRecord(value)) {
    return null;
  }

  const snapshot = normalizeSnapshot(value);
  if (!snapshot) {
    return null;
  }

  const codex = (snapshot.providers as Array<Record<string, unknown>>).find(
    (provider) => provider.id === "codex",
  );
  const codexDaily = codex && Array.isArray(codex.daily) ? (codex.daily as Daily[]) : [];
  const accounts = normalizeCodexAccounts(value.codexAccounts, codexDaily);

  if (!accounts) {
    return null;
  }

  snapshot.accounts = accounts.map(({ label, daily }) => ({
    label,
    surface: "local",
    daily,
  }));

  return { snapshot, accounts };
}

function corsHeaders(env: Env): Headers {
  const headers = new Headers();
  headers.set(
    "Access-Control-Allow-Origin",
    env.AI_USAGE_ALLOWED_ORIGIN?.trim() || "*",
  );
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Vary", "Origin");
  return headers;
}

function jsonResponse(
  body: unknown,
  status: number,
  env: Env,
  extraHeaders: Record<string, string> = {},
) {
  const headers = corsHeaders(env);
  headers.set("Content-Type", "application/json; charset=utf-8");

  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(body) + "\n", { status, headers });
}

async function digestHex(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function matchesSecret(request: Request, secret: string) {
  const header = request.headers.get("Authorization") ?? "";
  const prefix = "Bearer ";

  if (!header.startsWith(prefix)) {
    return false;
  }

  const [expected, received] = await Promise.all([
    digestHex(secret),
    digestHex(header.slice(prefix.length)),
  ]);

  return expected === received;
}

async function getStats(request: Request, env: Env) {
  if (!env.AI_USAGE) {
    return jsonResponse({ error: "stats_storage_not_configured" }, 503, env);
  }

  const stored = await env.AI_USAGE.get(STATS_KEY);

  if (!stored) {
    return jsonResponse({ error: "stats_not_published" }, 404, env);
  }

  let snapshot: Record<string, unknown> | null = null;

  try {
    snapshot = normalizeSnapshot(JSON.parse(stored));
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return jsonResponse({ error: "stored_stats_invalid" }, 500, env);
  }

  const etag = '"' + (await digestHex(stored)).slice(0, 32) + '"';
  const headers = {
    "Cache-Control": "no-store, max-age=0",
    ETag: etag,
  };

  const requestedEtag = request.headers.get("If-None-Match")?.trim();

  if (requestedEtag === etag || requestedEtag === "W/" + etag) {
    const responseHeaders = corsHeaders(env);
    Object.entries(headers).forEach(([key, value]) =>
      responseHeaders.set(key, value),
    );
    return new Response(null, { status: 304, headers: responseHeaders });
  }

  if (request.method === "HEAD") {
    const responseHeaders = corsHeaders(env);
    Object.entries(headers).forEach(([key, value]) =>
      responseHeaders.set(key, value),
    );
    responseHeaders.set("Content-Type", "application/json; charset=utf-8");
    return new Response(null, { status: 200, headers: responseHeaders });
  }

  return jsonResponse(snapshot, 200, env, headers);
}

type SupabaseUsageRow = {
  surface: "local";
  account_id: string;
  account_label: string;
  provider_id: ProviderId;
  usage_date: string;
  input_tokens: number;
  output_tokens: number;
  cache_input_tokens: number;
  cache_output_tokens: number;
  total_tokens: number;
  updated_at: string;
};

function createSupabaseRows(
  snapshot: Record<string, unknown>,
  accounts: CodexAccount[],
): SupabaseUsageRow[] {
  const rows: SupabaseUsageRow[] = [];
  const updatedAt = new Date().toISOString();

  for (const account of accounts) {
    for (const day of account.daily) {
      rows.push({
        surface: "local",
        account_id: account.accountId,
        account_label: account.label,
        provider_id: "codex",
        usage_date: day.date,
        input_tokens: day.input,
        output_tokens: day.output,
        cache_input_tokens: day.cache.input,
        cache_output_tokens: day.cache.output,
        total_tokens: day.total,
        updated_at: updatedAt,
      });
    }
  }

  for (const provider of snapshot.providers as Array<Record<string, unknown>>) {
    if (provider.id === "codex" || !Array.isArray(provider.daily)) {
      continue;
    }

    for (const value of provider.daily) {
      const day = value as Daily;
      rows.push({
        surface: "local",
        account_id: "shared",
        account_label: "Other AI tools",
        provider_id: provider.id as ProviderId,
        usage_date: day.date,
        input_tokens: day.input,
        output_tokens: day.output,
        cache_input_tokens: day.cache.input,
        cache_output_tokens: day.cache.output,
        total_tokens: day.total,
        updated_at: updatedAt,
      });
    }
  }

  return rows;
}

async function persistSupabaseRows(
  rows: SupabaseUsageRow[],
  env: Env,
): Promise<void> {
  if (!env.AI_USAGE_SUPABASE_URL || !env.AI_USAGE_SUPABASE_SECRET_KEY) {
    throw new Error("supabase_not_configured");
  }

  const endpoint = new URL(
    "/rest/v1/ai_usage_daily",
    env.AI_USAGE_SUPABASE_URL,
  );
  endpoint.searchParams.set(
    "on_conflict",
    "surface,account_id,provider_id,usage_date",
  );

  for (let offset = 0; offset < rows.length; offset += 500) {
    const batch = rows.slice(offset, offset + 500);
    let response: Response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: env.AI_USAGE_SUPABASE_SECRET_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(batch),
      });
    } catch {
      console.error(
        JSON.stringify({ event: "ai_usage_supabase_upsert_failed", reason: "network_error" }),
      );
      throw new Error("supabase_upsert_failed");
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const upstreamCode =
        isRecord(errorBody) &&
        typeof errorBody.code === "string" &&
        /^[A-Z0-9]{4,8}$/.test(errorBody.code)
          ? errorBody.code
          : undefined;
      console.error(
        JSON.stringify({
          event: "ai_usage_supabase_upsert_failed",
          status: response.status,
          code: upstreamCode,
          batchSize: batch.length,
        }),
      );
      const error = new Error("supabase_upsert_failed") as Error & {
        upstreamStatus?: number;
        upstreamCode?: string;
      };
      error.upstreamStatus = response.status;
      error.upstreamCode = upstreamCode;
      throw error;
    }
  }
}

async function syncStats(request: Request, env: Env) {
  if (!env.AI_USAGE) {
    return jsonResponse({ error: "stats_storage_not_configured" }, 503, env);
  }

  if (!env.AI_USAGE_SYNC_TOKEN) {
    return jsonResponse({ error: "sync_secret_not_configured" }, 503, env);
  }

  if (!env.AI_USAGE_SUPABASE_URL || !env.AI_USAGE_SUPABASE_SECRET_KEY) {
    return jsonResponse({ error: "usage_database_not_configured" }, 503, env);
  }

  if (!(await matchesSecret(request, env.AI_USAGE_SYNC_TOKEN))) {
    return jsonResponse({ error: "unauthorized" }, 401, env);
  }

  const contentLength = Number(request.headers.get("Content-Length") ?? "0");

  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "payload_too_large" }, 413, env);
  }

  const body = await request.text();

  if (body.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: "payload_too_large" }, 413, env);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(body);
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400, env);
  }

  const normalized = normalizeIncomingSnapshot(parsed);

  if (!normalized) {
    return jsonResponse({ error: "invalid_stats_snapshot" }, 422, env);
  }

  const { snapshot, accounts } = normalized;

  try {
    await persistSupabaseRows(createSupabaseRows(snapshot, accounts), env);
  } catch (error) {
    const failure = error as Error & {
      upstreamStatus?: number;
      upstreamCode?: string;
    };
    return jsonResponse(
      {
        error: "usage_database_unavailable",
        upstreamStatus: failure.upstreamStatus,
        upstreamCode: failure.upstreamCode,
      },
      502,
      env,
    );
  }

  await env.AI_USAGE.put(STATS_KEY, JSON.stringify(snapshot));

  return jsonResponse(
    {
      ok: true,
      generatedAt: snapshot.generatedAt,
      providers: (snapshot.providers as unknown[]).length,
      codexAccounts: accounts.length,
    },
    200,
    env,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "ai-usage" }, 200, env);
    }

    if (url.pathname === "/stats" && ["GET", "HEAD"].includes(request.method)) {
      return getStats(request, env);
    }

    if (url.pathname === "/sync" && request.method === "POST") {
      return syncStats(request, env);
    }

    return jsonResponse({ error: "not_found" }, 404, env);
  },
};
