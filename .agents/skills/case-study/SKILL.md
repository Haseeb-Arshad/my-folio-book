---
name: case-study
description: Build a portfolio-grade engineering case study for a project from inside that project's own repo. Runs a confidentiality clearance check, mines git and code for evidence, measures real numbers, captures screenshots and short screen recordings, researches external baselines, then writes the case study and packages assets for publishing. Use when asked to write a case study, document a project for a portfolio, turn work on a repo into a public write-up, or produce proof of what someone built and why.
---

# Engineering case study

## What this produces

A case study that survives a skeptical reader: a hiring manager, a former teammate, a
legal reviewer. Not a feature list. Not marketing copy. A document where every claim
points at evidence, every number states how it was measured, and every screenshot is
safe to publish.

Default deliverable set, written into `case-study/` at the repo root:

```
case-study/
  README.md              the case study itself
  clearance.md           what may be published, and who said so
  evidence.md            claim -> source ledger
  interview.md           questions asked, answers given
  metrics.md             each number, its method, its date
  research.md            external sources, with URLs and access dates
  assets/
    <slug>-01-<what>.webp        stills
    <slug>-02-<what>.mp4/.webm   short recordings
    <slug>-03-<what>.svg         diagrams
    captions.md                  one caption per asset, required
  portfolio/
    project.json         drop-in record for the portfolio site
    excerpt.md           the 150-word version for a project card
```

## Ground rules, all phases

1. **No claim without a source.** Every factual sentence in the case study traces to a
   line in `evidence.md`: a commit, a file path, a measured run, an interview answer, or
   a cited URL. If it traces to nothing, cut it.
2. **Never invent a number.** No invented percentages, user counts, revenue, latencies,
   or team sizes. A remembered number is labeled `reported, unverified`. A measured
   number carries its method and date. See `references/metrics.md`.
3. **Confidentiality gate comes first.** Do not write prose, capture a screenshot, or
   run a web search until Phase 0 is complete and recorded. See `references/clearance.md`.
4. **Nothing proprietary leaves the machine.** Never paste internal code, schema, table
   names, customer names, internal hostnames, or unreleased product names into a web
   search or any other outbound request. Rephrase into generic terms first.
5. **Separate what was designed from what was proven.** "Built for multi-tenant
   isolation" and "ran in production for 14 months across 40 tenants" are different
   claims. Never let the first imply the second.
6. **Credit honestly.** State scope precisely: "I owned the ingestion pipeline and the
   admin surface; two other engineers built the mobile client." Vague ownership reads as
   inflated ownership and is the fastest way to lose a reference check.
7. **House style.** First person, past tense, plain verbs. No em-dashes; use a comma,
   colon, or period. No "leveraged", "utilized", "seamless", "robust", "cutting-edge",
   "revolutionized". See `references/writing.md`.

## Phases

Work them in order. Each phase writes its file before the next begins, so an interrupted
run resumes cleanly.

### Phase 0 - Clearance

Read `references/clearance.md`. Establish the disclosure tier for this project, the
never-publish list, and whether employer sign-off is needed. Write `case-study/clearance.md`.
Ask the user the clearance questions directly, do not assume. Stop here until answered.

### Phase 1 - Evidence

Read `references/evidence.md`. Mine the repo: git history filtered to the author, commit
range and cadence, files and subsystems touched, PRs and reviews, architecture read out
of the code itself, schema, tests, CI, dependencies, deploy config, issue tracker if
reachable. Build `case-study/evidence.md` as a table of claim, source, confidence. Flag
every gap the repo cannot fill; those become Phase 2 questions.

### Phase 2 - Interview

Read `references/interview.md`. Ask the user only what the repo cannot answer: why the
project existed, what it cost the business to not fix it, constraints, team shape,
outcomes, what was rejected, what went wrong. Ask in one batched, numbered block, ten
questions maximum, and accept "don't know" as an answer. Record verbatim in
`case-study/interview.md`.

### Phase 3 - Measurement

Read `references/metrics.md`. Prefer measuring now over remembering. Run the benchmark,
the query plan, the bundle analysis, the Lighthouse pass. Where a before-state exists in
git history, check out the old commit and measure both sides. Write `case-study/metrics.md`
with method, environment, date, and raw output for every number.

### Phase 4 - External research

Read `references/research.md`. Use WebSearch and WebFetch to anchor the work against
public baselines: Core Web Vitals thresholds, published benchmarks for the same library
or database, standard practice for the problem, comparable public products. This is what
turns "it got faster" into "it moved from the bottom quartile to inside the recommended
threshold". Cite every source with URL and access date in `case-study/research.md`.
Sanitize every query first, per ground rule 4.

### Phase 5 - Visual capture

Read `references/capture.md`. Plan the shot list first, then capture. Run the app against
seeded or synthetic data, never a real customer dataset. Capture stills and two to four
short recordings of the interactions that are hard to convey in text. Redact, compress,
name, and caption. Every asset gets a caption saying what the reader is looking at and
why it matters.

### Phase 6 - Draft

Read `references/writing.md` and `templates/case-study.md`. Write `case-study/README.md`
against the template, filling only from the evidence, interview, metrics, research, and
asset files. Where a section has no evidence, write the section short rather than padding
it.

### Phase 7 - Review

Read `references/qa.md`. Run the full checklist: sourcing, numbers, clearance, asset leak
scan, ownership honesty, link check, style. Fix what fails. Report the checklist result to
the user, including anything that could not be verified.

### Phase 8 - Package for the portfolio

Read `references/portfolio-integration.md`. Produce `case-study/portfolio/project.json`
and `excerpt.md`, size and rename the assets for the site, and print the exact copy
commands needed to move the bundle into the portfolio repo.

## Modes

- **Default (deep).** All nine phases. Expect a long session and several tool-heavy
  passes. This is the intended mode.
- **`--fast`.** Phases 0, 1, 2, 6, 7. Skips measurement, research, and capture. Use only
  when the app cannot be run locally. The case study must then say plainly that its
  numbers are reported rather than measured.
- **`--assets-only`.** Phases 0 and 5. Use when the prose exists and only screenshots and
  recordings are missing.
- **`--refresh`.** Re-run Phases 3 and 7 against an existing `case-study/` to bring
  numbers and links up to date.

## Failure modes to avoid

- Writing the narrative first and hunting for evidence to fit it. Evidence first, always.
- A wall of stack names in place of a decision. Nobody is impressed by a list of
  technologies. They are impressed by a tradeoff that was reasoned about.
- Screenshots of a logged-in dashboard full of real names and real revenue.
- Claiming a percentage improvement with no baseline, no method, and no date.
- Describing the team's work in the first person singular.
- One long undifferentiated middle. A reader should find the hard part in ten seconds.
