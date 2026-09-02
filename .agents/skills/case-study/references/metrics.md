# Phase 3: Measurement

Most portfolio case studies die here. They claim "40% faster" with no baseline, no method,
and no date, and any competent reader discounts the entire document. A single number with
a stated method is worth more than five confident percentages.

## The rule

Every number in the case study carries three things: **what was measured**, **how**, and
**when**. If any of the three is missing, the number is either fixed or cut.

Three labels, used consistently:

- **Measured.** You ran it during this session. Include the command and raw output.
- **Reported.** The user or a company document supplied it. Attribute it: "the team
  reported". Never present it as your own measurement.
- **Estimated.** Derived arithmetically from other numbers. Show the derivation.

## Measure the before-state, not just the after

Git makes the counterfactual available. This is the highest-value move in the whole phase.

```bash
git log --oneline --follow -- path/to/hot/file    # find the commit that changed it
git stash                                          # or use a worktree, cleaner
git worktree add ../before <commit-before-the-fix>
# run the same benchmark in ../before and in the current tree, same machine, same data
git worktree remove ../before
```

If the before-state does not build or run any more, say so and fall back to a reported
number with the label attached.

## What to measure, by project type

**Web frontend**
```bash
npx lighthouse http://localhost:3000/heavy-page --output json --output html \
  --output-path ./case-study/metrics/lighthouse --preset=desktop
npx vite-bundle-visualizer          # or `next build` output, or source-map-explorer
```
Capture: LCP, CLS, INP, TBT, JS transferred, largest chunks, route-level bundle size,
hydration time. Run three times and report the median; a single Lighthouse run is noise.

**API and backend**
```bash
npx autocannon -c 50 -d 20 http://localhost:8080/api/endpoint
# or: k6 run load.js   |   hey -z 20s -c 50 URL   |   wrk -t4 -c50 -d20s URL
```
Capture: p50, p95, p99, throughput, error rate, and the concurrency and duration used.
Averages hide the problem; always report a tail percentile.

**Database**
```sql
EXPLAIN (ANALYZE, BUFFERS) <the hot query>;
```
Capture: planning and execution time, rows scanned versus returned, whether it used the
index, and the same plan before the fix. A before-and-after query plan is the single most
persuasive artifact a backend case study can contain.

Also useful: `pg_stat_statements` top queries by total time, table and index sizes, cache
hit ratio.

**Data pipelines and workers**
Records per second, batch latency, queue depth over time, retry rate, cost per million
records. Run against a synthetic dataset of a realistic size and say what size it was.

**Build and developer experience**
Cold and warm build time, CI wall-clock, test count and runtime, type-check time, flake
rate. `hyperfine 'npm run build'` gives a clean statistical comparison.

**Quality**
Test count and coverage, error rate before and after in whatever monitoring exists,
incident count, Sentry issue volume. Only publish these if `clearance.md` allows.

**Correctness and scale of the work itself**
Files and services touched, migrations authored, endpoints built, components in the shared
library, tenants or locales supported. These are repo-verifiable and always publishable.

## Environment disclosure

Record the environment once and reference it everywhere:

```markdown
Environment: local, Windows 11, i7-11800H, 32GB, Node 20.11, Postgres 16 in Docker,
seeded dataset of 1.2M rows, no network calls to third parties (stubbed).
Each figure is the median of 3 runs.
```

Local numbers are legitimate as long as they are labeled local. Never present a local
benchmark as a production measurement.

## Honesty guards

- No number without a denominator. "Reduced errors by 90%" from 10 to 1 is not the same
  story as 10,000 to 1,000. Give both sides.
- Percentages and absolutes together where clearance allows: "8.2s to 1.4s, a 6x
  improvement".
- Do not attribute a business outcome to your change without a mechanism. "Revenue rose
  after launch" is a coincidence claim unless you can name the path from your work to the
  number, and even then say "contributed to".
- If a change had a cost, state it. "The index cut read latency 6x and added about 240MB
  to the table and roughly 8% to write time" reads as competence, not weakness.
- If a measurement contradicts what the user remembered, keep the measurement and tell the
  user. That is the whole point of this phase.

## Output

`case-study/metrics.md`, one block per number:

```markdown
### M4. Admin dashboard p95 load time

- Label: measured
- Before: 8.21s (commit `9f2a1c`, worktree `../before`)
- After: 1.38s (commit `a1b2c3d`)
- Method: autocannon -c 20 -d 30 against `/admin/orders`, median of 3 runs
- Environment: see env block above, date 2026-09-02
- Raw: [paste output]
- Caveat: local Postgres with a 1.2M-row seed, not the production dataset
```
