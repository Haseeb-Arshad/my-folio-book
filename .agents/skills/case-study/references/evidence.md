# Phase 1: Evidence from the repo

The repo is the primary witness. It knows what was actually built, when, by whom, and in
what order. Memory does not. Mine it before asking the user anything, so the interview
spends its budget on what only a human knows.

Run commands from the repo root. Adapt names to the project. Record raw output in
`case-study/evidence.md` under each claim it supports.

## Identity and time span

Establish the author identity first, since everything else filters on it.

```bash
git log --format='%an <%ae>' | sort | uniq -c | sort -rn | head -20
```

Pick the user's identities, including old ones, and set them as a grep alternation for the
rest of the phase.

```bash
AUTHOR='Haseeb\|haseeb'
git log --author="$AUTHOR" --format='%ad' --date=short | tail -1   # first commit
git log --author="$AUTHOR" --format='%ad' --date=short | head -1   # last commit
git log --author="$AUTHOR" --oneline | wc -l                       # commit count
git log --author="$AUTHOR" --format='%ad' --date=format:'%Y-%m' | sort | uniq -c
```

That last one is the cadence histogram. It shows when the work was intense and when it was
maintenance, which is usually the spine of the project timeline.

## Scope of ownership

```bash
# files this author touched, ranked by how often
git log --author="$AUTHOR" --name-only --format='' | sort | uniq -c | sort -rn | head -40

# subsystems, by top-level directory
git log --author="$AUTHOR" --name-only --format='' | cut -d/ -f1-2 | sort | uniq -c | sort -rn | head -25

# lines added and removed by this author
git log --author="$AUTHOR" --numstat --format='' | awk '{a+=$1; d+=$2} END {print a" added, "d" removed"}'

# files where this author is the dominant contributor
git ls-files | while read f; do
  top=$(git log --format='%an' -- "$f" | sort | uniq -c | sort -rn | head -1)
  echo "$top  $f"
done | grep -i haseeb | head -40
```

This is what turns "I worked on the platform" into "I wrote and owned the ingestion
workers, the admin command center, and the analytics schema, and I was the majority author
on 118 of the 340 files in the repo".

## The story in the commits

```bash
# feature-shaped commits, chronological, for the narrative
git log --author="$AUTHOR" --reverse --format='%ad %s' --date=short | head -120

# the biggest single changes, usually the architectural moments
git log --author="$AUTHOR" --shortstat --format='%h %ad %s' --date=short \
  | paste - - - | sort -t' ' -k6 -rn | head -20

# merges and releases
git log --merges --format='%ad %s' --date=short | head -40
git tag --sort=-creatordate | head -20
```

Read the messages, not just the counts. Commits like `fix: stop double-charging on retry`
or `perf: index (tenant_id, created_at)` are the case study's raw material. Note every
commit that names a bug, a performance fix, a migration, or a rollback.

## Pull requests and review, when a host is reachable

```bash
gh pr list --author "@me" --state merged --limit 60 \
  --json number,title,mergedAt,additions,deletions,reviews
gh pr view <n> --comments
```

PR descriptions and review threads are the best evidence of reasoning, because they usually
record the alternatives that were rejected. Harvest those; Phase 6 needs them.

## Architecture, read out of the code

Do not describe an architecture from memory. Derive it:

- Entry points: `package.json` scripts, `Dockerfile`, `docker-compose.yml`, `Procfile`,
  `main.go`, `manage.py`, `serverless.yml`, k8s manifests, CI workflow files.
- Services and boundaries: top-level directories, module graphs, internal HTTP or queue
  clients, generated API clients, protobuf or OpenAPI definitions.
- Data: migration files in order (they are a dated history of the data model), ORM models,
  indexes, constraints, materialized views, triggers, cron and queue definitions.
- Integrations: SDK imports, webhook handlers, `.env.example` keys (the key names, never
  the values).
- Scale hints: batch sizes, pagination defaults, rate limits, retry and backoff config,
  connection-pool sizes, cache TTLs, worker concurrency.
- Testing and quality: test file count, coverage config, lint and type config, CI gates.

```bash
ls -R migrations db/migrate supabase/migrations 2>/dev/null | head -60
grep -rn "createIndex\|CREATE INDEX\|@@index" --include=*.sql --include=*.ts --include=*.prisma . | head -40
grep -rn "setTimeout\|retry\|backoff\|concurrency\|batchSize" --include=*.ts --include=*.go . | head -40
cat .env.example 2>/dev/null | cut -d= -f1
```

Then draw the block diagram yourself in Phase 5. A diagram derived from the code is
accurate; one drawn from memory is a guess.

## The gap list

End the phase with an explicit list of what the repo could not tell you. Typical gaps:

- Why the project was funded, and what it replaced.
- Who the users were and how many.
- What the deadline was and what forced it.
- Business outcomes after launch.
- Which decisions were yours versus assigned.
- What broke in production and how it was handled.

Those questions go straight into Phase 2. Do not guess at any of them.

## Output format

`case-study/evidence.md` is a table plus raw appendices:

```markdown
| # | Claim | Source | Confidence |
|---|-------|--------|------------|
| 1 | I owned the ingestion pipeline end to end | majority author on 22 of 24 files in `services/ingest/`; commits 2024-03 to 2024-11 | high |
| 2 | Cut admin dashboard p95 from 8.2s to 1.4s | commit `a1b2c3d` "perf: composite index"; measured Phase 3, see metrics.md#m4 | high |
| 3 | Served roughly 40 tenants | interview answer 2026-09-02, not independently verified | reported |
```

Confidence values: `high` for repo-verified or measured, `medium` for inferred from code,
`reported` for interview-only. Anything that would be `low` does not go in the case study.
