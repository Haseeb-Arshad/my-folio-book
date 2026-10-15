export type AiUsageProviderId =
  | "amp"
  | "claude"
  | "codex"
  | "cursor"
  | "gemini"
  | "opencode"
  | "pi";

export type AiUsageSelection = AiUsageProviderId | "all";

export type AiUsageTokens = {
  input: number;
  output: number;
  cache: {
    input: number;
    output: number;
  };
  total: number;
};

export type AiUsageDaily = {
  date: string;
  input: number;
  output: number;
  cache: {
    input: number;
    output: number;
  };
  total: number;
};

export type AiUsageModel = {
  name: string;
  tokens: AiUsageTokens;
};

export type AiUsageInsights = {
  mostUsedModel?: AiUsageModel;
  recentMostUsedModel?: AiUsageModel;
  streaks: {
    longest: number;
    current: number;
  };
};

export type AiUsageProvider = {
  id: AiUsageSelection;
  label: string;
  color: string;
  daily: AiUsageDaily[];
  insights?: AiUsageInsights;
};

export type AiUsageAccount = {
  label: string;
  surface: "local";
  daily: AiUsageDaily[];
};

export type AiUsageSnapshot = {
  schemaVersion: 1 | 2;
  source: {
    name: "slopmeter";
    version: string;
  };
  generatedAt: string;
  range: {
    start: string;
    end: string;
  };
  all: AiUsageProvider;
  providers: AiUsageProvider[];
  missingProviders: AiUsageProviderId[];
  accounts?: AiUsageAccount[];
};

export const AI_USAGE_PROVIDER_ORDER: AiUsageProviderId[] = [
  "claude",
  "codex",
  "opencode",
  "cursor",
  "gemini",
  "amp",
  "pi",
];

export const AI_USAGE_PROVIDER_DEFINITIONS: Record<
  AiUsageProviderId | "all",
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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNonNegativeInteger(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.round(numeric);
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return null;
  }

  const parsed = Date.parse(value + "T00:00:00Z");

  return Number.isNaN(parsed) ? null : value;
}

function normalizeDaily(value: unknown): AiUsageDaily[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const daily: AiUsageDaily[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const date = normalizeDate(item.date);
    const input = toNonNegativeInteger(item.input);
    const output = toNonNegativeInteger(item.output);
    const total = toNonNegativeInteger(item.total);
    const cache = isRecord(item.cache) ? item.cache : {};
    const cacheInput = toNonNegativeInteger(cache.input);
    const cacheOutput = toNonNegativeInteger(cache.output);

    if (
      !date ||
      input === null ||
      output === null ||
      total === null ||
      cacheInput === null ||
      cacheOutput === null
    ) {
      continue;
    }

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

function normalizeModel(value: unknown): AiUsageModel | undefined {
  if (!isRecord(value) || typeof value.name !== "string") {
    return undefined;
  }

  const rawTokens = isRecord(value.tokens) ? value.tokens : {};
  const rawCache = isRecord(rawTokens.cache) ? rawTokens.cache : {};
  const input = toNonNegativeInteger(rawTokens.input);
  const output = toNonNegativeInteger(rawTokens.output);
  const total = toNonNegativeInteger(rawTokens.total);
  const cacheInput = toNonNegativeInteger(rawCache.input);
  const cacheOutput = toNonNegativeInteger(rawCache.output);

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

function normalizeInsights(value: unknown): AiUsageInsights | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const rawStreaks = isRecord(value.streaks) ? value.streaks : {};
  const longest = toNonNegativeInteger(rawStreaks.longest);
  const current = toNonNegativeInteger(rawStreaks.current);

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
  forcedId?: AiUsageSelection,
): AiUsageProvider | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = forcedId ?? value.id;
  const id =
    rawId === "all" || AI_USAGE_PROVIDER_ORDER.includes(rawId as AiUsageProviderId)
      ? (rawId as AiUsageSelection)
      : null;

  if (!id) {
    return null;
  }

  const definition = AI_USAGE_PROVIDER_DEFINITIONS[id];

  return {
    id,
    label: definition.label,
    color: definition.color,
    daily: normalizeDaily(value.daily),
    insights: normalizeInsights(value.insights),
  };
}

function normalizeAccounts(value: unknown): AiUsageAccount[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenLabels = new Set<string>();
  const accounts: AiUsageAccount[] = [];

  for (const item of value.slice(0, 20)) {
    if (!isRecord(item) || typeof item.label !== "string") {
      continue;
    }

    const label = item.label;
    if (
      (label !== "Unattributed history" &&
        !/^Codex account [1-9]\d{0,2}$/.test(label)) ||
      seenLabels.has(label)
    ) {
      continue;
    }

    const daily = normalizeDaily(item.daily);
    if (!daily) {
      continue;
    }

    seenLabels.add(label);
    accounts.push({ label, surface: "local", daily });
  }

  return accounts;
}

export function normalizeAiUsageSnapshot(
  value: unknown,
): AiUsageSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const generatedAt =
    typeof value.generatedAt === "string" &&
    !Number.isNaN(Date.parse(value.generatedAt))
      ? value.generatedAt
      : null;
  const range = isRecord(value.range) ? value.range : {};
  const start = normalizeDate(range.start);
  const end = normalizeDate(range.end);
  const all = normalizeProvider(value.all, "all");
  const rawProviders = Array.isArray(value.providers) ? value.providers : [];
  const providers = rawProviders
    .map((provider) => normalizeProvider(provider))
    .filter(
      (provider): provider is AiUsageProvider =>
        provider !== null && provider.id !== "all",
    )
    .slice(0, AI_USAGE_PROVIDER_ORDER.length);
  const missingProviders = Array.isArray(value.missingProviders)
    ? value.missingProviders.filter((provider): provider is AiUsageProviderId =>
        AI_USAGE_PROVIDER_ORDER.includes(provider),
      )
    : [];

  if (!generatedAt || !start || !end || !all || providers.length === 0) {
    return null;
  }

  return {
    schemaVersion: value.schemaVersion === 2 ? 2 : 1,
    source: {
      name: "slopmeter",
      version:
        isRecord(value.source) && typeof value.source.version === "string"
          ? value.source.version.slice(0, 40)
          : "unknown",
    },
    generatedAt,
    range: { start, end },
    all,
    providers,
    missingProviders: [...new Set(missingProviders)],
    accounts: normalizeAccounts(value.accounts),
  };
}
