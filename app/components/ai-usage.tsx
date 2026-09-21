import { useMemo, useState } from "react";
import {
  type AiUsageDaily,
  type AiUsageProvider,
  type AiUsageSelection,
  type AiUsageSnapshot,
} from "../data/ai-usage";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = ["Mon", "", "", "", "", "", "Sun"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseDateKey(value: string) {
  return new Date(value + "T00:00:00Z");
}

function formatDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatTokenCount(value: number) {
  const units = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const unit of units) {
    if (value >= unit.threshold) {
      const scaled = value / unit.threshold;
      const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return (
        scaled.toFixed(decimals).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1") +
        unit.suffix
      );
    }
  }

  return String(Math.round(value));
}

function formatSyncDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function sumProvider(provider: AiUsageProvider) {
  return provider.daily.reduce(
    (sum, day) => ({
      input: sum.input + day.input,
      output: sum.output + day.output,
      cache: {
        input: sum.cache.input + day.cache.input,
        output: sum.cache.output + day.cache.output,
      },
      total: sum.total + day.total,
    }),
    {
      input: 0,
      output: 0,
      cache: { input: 0, output: 0 },
      total: 0,
    },
  );
}

function buildCalendar(
  daily: AiUsageDaily[],
  range: AiUsageSnapshot["range"],
) {
  const first = parseDateKey(range.start);
  const last = parseDateKey(range.end);
  const firstDay = (first.getUTCDay() + 6) % 7;
  const lastDay = (last.getUTCDay() + 6) % 7;
  const gridStart = new Date(first.getTime() - firstDay * DAY_MS);
  const gridEnd = new Date(last.getTime() + (6 - lastDay) * DAY_MS);
  const dailyByDate = new Map(daily.map((day) => [day.date, day]));
  const days: Array<{ date: string; total: number }> = [];
  const cursor = new Date(gridStart);
  let maxTotal = 0;

  while (cursor <= gridEnd) {
    const date = formatDateKey(cursor);
    const total = dailyByDate.get(date)?.total ?? 0;
    days.push({ date, total });
    maxTotal = Math.max(maxTotal, total);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const columns = Math.ceil(days.length / 7);
  const monthLabels: Array<{ label: string; column: number }> = [];
  let previousMonth = -1;

  for (let column = 0; column < columns; column += 1) {
    const day = days[column * 7];

    if (!day) {
      continue;
    }

    const month = parseDateKey(day.date).getUTCMonth();

    if (month !== previousMonth || column === 0) {
      monthLabels.push({ label: MONTH_LABELS[month], column: column + 1 });
      previousMonth = month;
    }
  }

  return {
    days: days.map((day) => ({
      ...day,
      level:
        day.total <= 0 || maxTotal <= 0
          ? 0
          : Math.max(1, Math.ceil((day.total / maxTotal) * 4)),
    })),
    columns,
    monthLabels,
  };
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 text-base font-medium tabular-nums text-gray-900">
        {formatTokenCount(value)}
      </dd>
    </div>
  );
}

function Heatmap({
  provider,
  range,
}: {
  provider: AiUsageProvider;
  range: AiUsageSnapshot["range"];
}) {
  const calendar = useMemo(
    () => buildCalendar(provider.daily, range),
    [provider.daily, range],
  );

  return (
    <div className="ai-usage-calendar-wrap" tabIndex={0}>
      <div
        className="ai-usage-calendar"
        style={
          {
            "--ai-usage-accent": provider.color,
          } as React.CSSProperties
        }
      >
        <div
          className="ai-usage-calendar__months"
          style={{
            gridTemplateColumns:
              "repeat(" + calendar.columns + ", minmax(10px, 1fr))",
          }}
          aria-hidden="true"
        >
          {calendar.monthLabels.map((month) => (
            <span
              key={month.column + month.label}
              style={{ gridColumnStart: month.column }}
            >
              {month.label}
            </span>
          ))}
        </div>

        <div className="ai-usage-calendar__body">
          <div className="ai-usage-calendar__day-labels" aria-hidden="true">
            {DAY_LABELS.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>

          <div
            className="ai-usage-calendar__cells"
            style={{
              gridTemplateRows: "repeat(7, minmax(10px, 1fr))",
              gridTemplateColumns:
                "repeat(" + calendar.columns + ", minmax(10px, 1fr))",
            }}
            role="img"
            aria-label={
              provider.label +
              " daily token usage from " +
              formatSyncDate(range.start) +
              " to " +
              formatSyncDate(range.end)
            }
          >
            {calendar.days.map((day) => (
              <span
                key={day.date}
                className="ai-usage-cell"
                data-level={day.level}
                aria-label={day.date + ": " + formatTokenCount(day.total)}
                title={day.date + " · " + formatTokenCount(day.total) + " tokens"}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em] text-gray-400">
          <span>Less</span>
          <div className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="ai-usage-cell h-3 w-3"
                data-level={level}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function UsagePanel({
  provider,
  range,
  compact = false,
}: {
  provider: AiUsageProvider;
  range: AiUsageSnapshot["range"];
  compact?: boolean;
}) {
  const totals = sumProvider(provider);
  const insights = provider.insights;

  return (
    <article
      className={
        compact
          ? "ai-usage-panel ai-usage-panel--summary"
          : "ai-usage-panel"
      }
    >
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: provider.color }}
            aria-hidden="true"
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
              {compact ? "Combined usage" : "Coding agent"}
            </p>
            <h3 className="mt-1 text-[1.55rem] font-medium tracking-tight text-gray-900">
              {provider.label}
            </h3>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-5 md:gap-8">
          <Metric label="Input tokens" value={totals.input} />
          <Metric label="Output tokens" value={totals.output} />
          <Metric label="Total tokens" value={totals.total} />
        </dl>
      </header>

      <Heatmap provider={provider} range={range} />

      {insights && (
        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-100 pt-5 md:grid-cols-4">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
              Most used model
            </dt>
            <dd className="mt-1 truncate text-sm text-gray-900">
              {insights.mostUsedModel?.name ?? "—"}
              {insights.mostUsedModel && (
                <span className="ml-1 text-gray-400">
                  ({formatTokenCount(insights.mostUsedModel.tokens.total)})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
              Recent use
            </dt>
            <dd className="mt-1 truncate text-sm text-gray-900">
              {insights.recentMostUsedModel?.name ?? "—"}
              {insights.recentMostUsedModel && (
                <span className="ml-1 text-gray-400">
                  ({formatTokenCount(insights.recentMostUsedModel.tokens.total)})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
              Longest streak
            </dt>
            <dd className="mt-1 text-sm tabular-nums text-gray-900">
              {insights.streaks.longest} days
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
              Current streak
            </dt>
            <dd className="mt-1 text-sm tabular-nums text-gray-900">
              {insights.streaks.current} days
            </dd>
          </div>
        </dl>
      )}
    </article>
  );
}

export default function AiUsage({
  snapshot,
}: {
  snapshot: AiUsageSnapshot | null;
}) {
  const [selection, setSelection] = useState<AiUsageSelection>("all");
  const selectedProvider =
    selection === "all"
      ? null
      : snapshot?.providers.find((provider) => provider.id === selection);
  const visibleProviders =
    selection === "all"
      ? snapshot?.providers ?? []
      : selectedProvider
        ? [selectedProvider]
        : [];
  const summaryProvider =
    selection === "all" ? snapshot?.all : selectedProvider;

  return (
    <section className="pb-24 pt-8" id="ai-usage">
      <div className="mb-7 flex flex-col gap-4 border-t border-gray-100 pt-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            AI workbench
          </p>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-gray-500">
            A rolling snapshot of the tools I use to think, build, and ship.
            The source stays local; this page receives only the aggregate.
          </p>
        </div>

        {snapshot && (
          <label className="flex items-center gap-3 text-xs text-gray-500">
            <span>View</span>
            <select
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition-colors focus:border-gray-400"
              value={selection}
              onChange={(event) =>
                setSelection(event.target.value as AiUsageSelection)
              }
              aria-label="Choose an AI usage provider"
            >
              <option value="all">All tools</option>
              {snapshot.providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!snapshot ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-5 py-8 text-sm text-gray-500">
          The first local usage snapshot has not arrived yet.
        </div>
      ) : (
        <>
          {summaryProvider && (
            <UsagePanel
              provider={summaryProvider}
              range={snapshot.range}
              compact={selection === "all"}
            />
          )}
          {selection === "all" && (
            <div className="mt-3">
              {visibleProviders.map((provider) => (
                <UsagePanel
                  key={provider.id}
                  provider={provider}
                  range={snapshot.range}
                />
              ))}
            </div>
          )}
          <p className="mt-5 text-[11px] text-gray-400">
            Last synced {formatSyncDate(snapshot.generatedAt)} ·{" "}
            {snapshot.providers.length} provider
            {snapshot.providers.length === 1 ? "" : "s"} with data
            {snapshot.missingProviders.length > 0
              ? " · " + snapshot.missingProviders.length + " unavailable locally"
              : ""}
          </p>
        </>
      )}
    </section>
  );
}
