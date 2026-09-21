import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
try {
  loadEnvFile(resolve(root, ".env.ai-usage.local"));
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}
const slopmeterVersion =
  process.env.AI_USAGE_SLOPMETER_VERSION?.trim() || "0.5.1";

if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(slopmeterVersion)) {
  throw new Error(
    "AI_USAGE_SLOPMETER_VERSION must be a semantic version such as 0.5.1.",
  );
}
const providerOrder = [
  "claude",
  "codex",
  "opencode",
  "cursor",
  "gemini",
  "amp",
  "pi",
];
const providerLabels = {
  amp: "Amp",
  claude: "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
  gemini: "Gemini CLI",
  opencode: "Open Code",
  pi: "Pi Coding Agent",
};
const providerColors = {
  amp: "#be123c",
  claude: "#d97706",
  codex: "#4f46e5",
  cursor: "#111827",
  gemini: "#0f766e",
  opencode: "#4b5563",
  pi: "#7c3aed",
};

function nonNegativeInteger(value) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : 0;
}

function normalizeModel(value) {
  if (!value || typeof value.name !== "string" || !value.tokens) {
    return undefined;
  }

  const cache = value.tokens.cache || {};

  return {
    name: value.name.slice(0, 120),
    tokens: {
      input: nonNegativeInteger(value.tokens.input),
      output: nonNegativeInteger(value.tokens.output),
      cache: {
        input: nonNegativeInteger(cache.input),
        output: nonNegativeInteger(cache.output),
      },
      total: nonNegativeInteger(value.tokens.total),
    },
  };
}

function normalizeInsights(value) {
  if (!value || !value.streaks) {
    return undefined;
  }

  return {
    mostUsedModel: normalizeModel(value.mostUsedModel),
    recentMostUsedModel: normalizeModel(value.recentMostUsedModel),
    streaks: {
      longest: nonNegativeInteger(value.streaks.longest),
      current: nonNegativeInteger(value.streaks.current),
    },
  };
}

function normalizeProvider(providerId, payload) {
  const source = payload?.providers?.find(
    (provider) => provider.provider === providerId,
  );

  if (!source || !Array.isArray(source.daily)) {
    return null;
  }

  const daily = source.daily
    .filter((day) => typeof day?.date === "string")
    .map((day) => ({
      date: day.date.slice(0, 10),
      input: nonNegativeInteger(day.input),
      output: nonNegativeInteger(day.output),
      cache: {
        input: nonNegativeInteger(day.cache?.input),
        output: nonNegativeInteger(day.cache?.output),
      },
      total: nonNegativeInteger(day.total),
      breakdown: Array.isArray(day.breakdown)
        ? day.breakdown.map(normalizeModel).filter(Boolean)
        : [],
    }));

  if (daily.length === 0) {
    return null;
  }

  return {
    id: providerId,
    label: providerLabels[providerId],
    color: providerColors[providerId],
    daily,
    insights: normalizeInsights(source.insights),
  };
}

function strippedProvider(provider) {
  return {
    id: provider.id,
    label: provider.label,
    color: provider.color,
    daily: provider.daily.map(({ breakdown, ...day }) => day),
    insights: provider.insights,
  };
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getStreaks(daily, start, end) {
  const activeDates = new Set(
    daily.filter((day) => day.total > 0).map((day) => day.date),
  );
  const first = new Date(start + "T00:00:00Z");
  const last = new Date(end + "T00:00:00Z");
  let longest = 0;
  let run = 0;

  for (
    const cursor = new Date(first);
    cursor <= last;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    if (activeDates.has(dateKey(cursor))) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  let current = 0;

  for (
    const cursor = new Date(last);
    activeDates.has(dateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  ) {
    current += 1;
  }

  return { longest, current };
}

function aggregateProviders(providers, start, end) {
  const dailyByDate = new Map();
  const models = new Map();
  const recentStart = new Date(end + "T00:00:00Z");
  recentStart.setUTCDate(recentStart.getUTCDate() - 29);

  for (const provider of providers) {
    for (const day of provider.daily) {
      const current = dailyByDate.get(day.date) || {
        date: day.date,
        input: 0,
        output: 0,
        cache: { input: 0, output: 0 },
        total: 0,
      };

      current.input += day.input;
      current.output += day.output;
      current.cache.input += day.cache.input;
      current.cache.output += day.cache.output;
      current.total += day.total;
      dailyByDate.set(day.date, current);

      for (const model of day.breakdown) {
        const key = provider.id + ":" + model.name;
        const existing = models.get(key) || {
          name: provider.label + " / " + model.name,
          tokens: {
            input: 0,
            output: 0,
            cache: { input: 0, output: 0 },
            total: 0,
          },
          recent: 0,
        };

        existing.tokens.input += model.tokens.input;
        existing.tokens.output += model.tokens.output;
        existing.tokens.cache.input += model.tokens.cache.input;
        existing.tokens.cache.output += model.tokens.cache.output;
        existing.tokens.total += model.tokens.total;

        if (new Date(day.date + "T00:00:00Z") >= recentStart) {
          existing.recent += model.tokens.total;
        }

        models.set(key, existing);
      }
    }
  }

  const daily = [...dailyByDate.values()].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
  const modelValues = [...models.values()];
  const mostUsedModel = modelValues
    .slice()
    .sort((left, right) => right.tokens.total - left.tokens.total)[0];
  const recentMostUsedModel = modelValues
    .slice()
    .sort((left, right) => right.recent - left.recent)[0];

  return {
    id: "all",
    label: "All tools",
    color: "#111827",
    daily,
    insights: {
      mostUsedModel: mostUsedModel
        ? {
            name: mostUsedModel.name,
            tokens: mostUsedModel.tokens,
          }
        : undefined,
      recentMostUsedModel: recentMostUsedModel
        ? {
            name: recentMostUsedModel.name,
            tokens: recentMostUsedModel.tokens,
          }
        : undefined,
      streaks: getStreaks(daily, start, end),
    },
  };
}

async function runSlopmeter(providerId, outputPath) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";

  try {
    await execFileAsync(
      executable,
      [
        "--yes",
        "slopmeter@" + slopmeterVersion,
        "--" + providerId,
        "--format",
        "json",
        "--output",
        outputPath,
      ],
      {
        cwd: root,
        // Windows exposes npx as a .cmd shim; Node needs a shell to launch it.
        shell: process.platform === "win32",
        windowsHide: true,
        maxBuffer: 4 * 1024 * 1024,
      },
    );

    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch (error) {
    if (process.env.AI_USAGE_VERBOSE === "1") {
      console.error(
        "slopmeter failed for " +
          providerId +
          ": " +
          (error instanceof Error ? error.message : String(error)),
      );
    } else {
      console.error("No usable local data for " + providerLabels[providerId]);
    }

    return null;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const outputPath = resolve(
    process.env.AI_USAGE_OUTPUT ||
      resolve(root, "outputs", "ai-usage", "latest.json"),
  );
  const configuredProviders =
    process.env.AI_USAGE_PROVIDERS?.trim().toLowerCase() || "all";
  const requestedProviders =
    configuredProviders === "all"
      ? providerOrder
      : configuredProviders
          .split(",")
          .map((provider) => provider.trim())
          .filter(Boolean);

  if (requestedProviders.some((provider) => !providerOrder.includes(provider))) {
    throw new Error(
      "AI_USAGE_PROVIDERS contains an unsupported provider. Supported values: " +
        providerOrder.join(", "),
    );
  }

  const workDir = await mkdtemp(
    resolve(tmpdir(), "portfolio-ai-usage-"),
  );

  try {
    const successful = [];
    let range = null;

    for (const providerId of requestedProviders) {
      const payload = await runSlopmeter(
        providerId,
        resolve(workDir, providerId + ".json"),
      );
      const provider = payload ? normalizeProvider(providerId, payload) : null;

      if (provider) {
        successful.push(provider);
        range ||= {
          start: payload.start,
          end: payload.end,
        };
      }
    }

    if (successful.length === 0 || !range?.start || !range?.end) {
      throw new Error("No provider usage data was available to publish.");
    }

    successful.sort(
      (left, right) =>
        providerOrder.indexOf(left.id) - providerOrder.indexOf(right.id),
    );

    const snapshot = {
      schemaVersion: 1,
      source: { name: "slopmeter", version: slopmeterVersion },
      generatedAt: new Date().toISOString(),
      range,
      all: aggregateProviders(successful, range.start, range.end),
      providers: successful.map(strippedProvider),
      missingProviders: requestedProviders.filter(
        (providerId) =>
          !successful.some((provider) => provider.id === providerId),
      ),
    };

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      JSON.stringify(snapshot, null, 2) + "\n",
      "utf8",
    );

    const syncUrl = process.env.AI_USAGE_SYNC_URL?.trim();

    if (!dryRun && !syncUrl) {
      throw new Error(
        "AI_USAGE_SYNC_URL is required unless the publisher is run with --dry-run.",
      );
    }

    if (!dryRun) {
      const syncToken = process.env.AI_USAGE_SYNC_TOKEN?.trim();

      if (!syncToken) {
        throw new Error("AI_USAGE_SYNC_TOKEN is required for a live sync.");
      }

      const response = await fetch(syncUrl, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + syncToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(snapshot),
      });

      if (!response.ok) {
        throw new Error(
          "AI usage Worker rejected the snapshot: " + response.status,
        );
      }
    }

    console.log(
      JSON.stringify(
        {
          output: outputPath,
          uploaded: !dryRun,
          providers: successful.map((provider) => provider.id),
          missingProviders: snapshot.missingProviders,
          generatedAt: snapshot.generatedAt,
        },
        null,
        2,
      ),
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
