# The standalone prompt

Use this when the skill is not installed in the target repo, or when you want to paste one
message into a fresh Claude Code session. It is the whole skill compressed into a single
prompt. Open Claude Code in the project's own repository, then paste everything below the
line, replacing the bracketed parts.

Fill in the four bracketed values first. Everything else works unchanged on any project.

---

You are writing a portfolio-grade engineering case study about my work on this repository.
I will publish it on my portfolio and I may show it to the company, so it has to be
accurate, evidence-backed, and safe to make public.

Context you need from me:
- My git author names/emails: [Haseeb Arshad / haseeb@example.com]
- What this project is, in one line: [one line]
- Who it was for: [company / client / internal team]
- How I can run it locally: [npm run dev, docker compose up, or "cannot run locally"]

Work through the following phases in order. Write each phase's output file before starting
the next one, so an interrupted run can resume. Do not skip ahead, and do not start writing
prose until Phase 6.

**Ground rules that apply to every phase.**
1. No claim without a source. Every factual sentence must trace to a commit, a file path, a
   measurement you ran, an answer I gave, or a cited URL, recorded in the evidence ledger.
2. Never invent a number. Label every figure as measured (you ran it, with method and
   date), reported (I told you, attribute it to me and mark it unverified), or estimated
   (show the derivation).
3. Never send anything proprietary outside this machine. Before any web search, strip
   company names, product names, client names, internal hostnames, table and service names.
   Search the problem class, never the instance.
4. Keep "designed for X" and "proven to do X in production" visibly separate.
5. Credit honestly. Say exactly what I owned and what other people built.
6. House style: first person, past tense, plain verbs, no em-dashes anywhere (use a comma,
   colon, or period). Banned words: leveraged, utilized, seamless, robust, cutting-edge,
   best-in-class, game-changing, revolutionized, passionate, spearheaded, architected.
   Banned constructions: "not just X but Y", "less about X and more about Y", rhetorical
   questions as headings.

**Phase 0, clearance.** Before anything else, ask me these and wait for answers: is this
public, internal, or client-confidential; does an NDA or employment agreement cover it;
has anyone approved a public write-up and who; may the company be named; may product
screens be shown; which numbers may be published (none, relative only, or absolute); and
what specifically must never appear. Then assign a tier: Public, Internal-safe (name the
company, describe architecture generically, redraw diagrams, screenshot only seeded
synthetic data, relative metrics), or Restricted (anonymize the company and product
entirely, no real screenshots). Default to Restricted if my answers are uncertain. Write
`case-study/clearance.md` with my verbatim answers, the tier, a never-publish list, and a
table of naming substitutions. Never publish, at any tier: credentials or `.env` values,
customer or end-user personal data, employee names without consent, internal hostnames or
URLs or ticket links, revenue and pricing and contract values, proprietary business logic,
unreleased features, security incidents, or substantial company-owned source code beyond
ten to twenty line illustrative snippets.

**Phase 1, evidence.** Mine the repo before asking me anything else. Establish my commit
range, count, and monthly cadence; the files and subsystems I touched ranked by frequency;
lines added and removed; the files where I am the majority author; the feature-shaped and
fix-shaped commits in chronological order; the largest single changes; tags and merges; and
merged PRs with their review threads if `gh` works here. Then derive the architecture from
the code itself, never from memory: entry points, services and boundaries, migrations in
order, schema and indexes, queues and cron, integrations, `.env.example` key names (names
only), retry/backoff/pagination/concurrency settings, and the test and CI setup. Write
`case-study/evidence.md` as a table of claim, source, and confidence (high for
repo-verified or measured, medium for inferred, reported for interview-only), plus a
timeline table, an ownership table, and an explicit list of what the repo cannot tell you.

**Phase 2, interview.** Ask me, in one numbered block of at most ten questions, only what
the repo cannot answer, and make every question specific to something you found in Phase 1.
Cover: what made someone fund this and what it cost to leave it alone; who used it and how
many; the deadline and what forced it; what I could not change; team shape and exactly what
was mine; the alternatives to the specific technical choice you found in the commits; the
hardest problem where the obvious approach failed; what changed after it shipped and which
numbers I may publish; and what I got wrong. Accept "don't know". Record my answers verbatim
in `case-study/interview.md`.

**Phase 3, measurement.** Measure now rather than trusting memory. Where a before-state
exists in git, use `git worktree add ../before <sha>` and benchmark both sides on the same
machine with the same data. Depending on the project: Lighthouse (median of three runs) and
bundle analysis for frontends; autocannon, k6, or hey with p50/p95/p99 and error rate for
APIs; `EXPLAIN (ANALYZE, BUFFERS)` before and after for database work; records per second,
queue depth, and retry rate for pipelines; `hyperfine` for build and CI time; and
repo-verifiable counts such as endpoints, migrations, components, and services for scope.
Seed a realistic synthetic dataset and state its size. Write `case-study/metrics.md` with,
for each number: label, before, after, method, environment, date, raw output, and caveats.
Always give absolutes alongside percentages, and always name what a change cost as well as
what it improved.

**Phase 4, external research.** Use web search to anchor my numbers against public
baselines: Core Web Vitals and interaction thresholds, WCAG levels, published benchmarks
for the same tools, the standard textbook approach to this problem class, and, only if the
product is public, its own live pages. Prefer primary docs and specs, check publication
dates, and reject any statistic you cannot trace to its origin in two hops. Sanitize every
query per ground rule 3. Write `case-study/research.md` as a table of claim supported,
source, URL, published date, and access date. Cut any source that does not end up
supporting a sentence in the final piece.

**Phase 5, visuals.** Plan a shot list of six to ten assets before capturing anything:
a hero still, the screen with the real complexity, an architecture diagram you draw
yourself (Mermaid or SVG, one idea, under twelve nodes), two to four recordings of five to
twelve seconds each showing interactions a still cannot convey, a before-and-after pair,
and one evidence shot such as a query plan or load-test output. For a backend project, swap
the UI shots for terminal captures, query plans, and sequence diagrams. Seed synthetic data
first with realistic shape and volume, never real records; use an obviously fictional demo
user; use a clean browser profile with no bookmarks, extensions, badges, or other tabs;
capture at 1440x900 desktop and 390x844 mobile at 2x. Prefer a Playwright script so the
shots are deterministic and repeatable: freeze the clock, disable animations for stills,
drive the app into the interesting state rather than screenshotting an empty default. For
recordings: one interaction per clip, pause about 400ms before each click, show the
transition, no audio, and never speed up a clip used as evidence of performance (if you
speed one up for length, say "2x" in the caption). Convert with ffmpeg to mp4 plus webm
plus a poster frame; convert stills to WebP at 2400px max and quality 85; keep stills under
400KB, videos under 3MB, and the folder under 15MB. Then do a redaction pass on every asset
at full size, checking for names, emails, avatars, internal hostnames or tokens in the URL
bar, tab titles, badge counts, real business numbers in charts, and internal paths in
terminal prompts. Redact with solid blocks, not blur. Write one caption per asset in
`case-study/assets/captions.md` saying what the reader is looking at and why it matters.

**Phase 6, draft.** Write `case-study/README.md`, 1,200 to 2,000 words, using only the
material in the phase files. Structure and budgets: title and one-line (25 words); an "at a
glance" table of role, org, period, team, stack, status, and my precise scope (60); the
problem (150 to 250) opening on the state of the world and the friction with no adjectives
in the first two sentences; constraints (80 to 150); what I built (400 to 700) as three to
five decisions, each written as forcing condition, alternatives considered, choice and
reasoning, tradeoff accepted, and evidence reference; the hard part (250 to 400) as one
deep dive on the problem where the obvious approach failed, including what broke first, the
insight, the fix, and how I knew it worked, with a ten to twenty line snippet or a sequence
diagram; results (150 to 250) as a table of metric, before, after, and basis, plus a
paragraph on what the numbers meant in practice; what I would do differently (100 to 200)
with a real technical admission; what this demonstrates (80) mapping each skill to a
section above; and a closing note stating that assets use seeded data, which numbers are
measured versus reported, and the clearance status. Where a section has no evidence, write
it short instead of padding it.

**Phase 7, review.** Run and report a checklist: every sentence traces to the ledger; every
number labeled with method and date; percentages carry absolutes; no business outcome
claimed without a mechanism; the clearance file re-read line by line against the draft;
every asset opened at full size and checked for leaks; a secret grep over `case-study/` for
keys, tokens, connection strings, and non-example email addresses; raw capture files
removed; ownership language exact; tradeoffs named; no em-dashes; no banned words; no
sentence that would be equally true of a different project; all external links resolving;
all referenced assets present. Tell me what failed and what you could not verify. Then
answer in writing: would my former manager and a teammate both read this tomorrow without
objecting to a single sentence?

**Phase 8, package.** Produce `case-study/portfolio/project.json` with slug, name, tagline
(under 220 characters), year, stack, live and code URLs, logo, letter, color, status,
links, a popup image and description, and a `caseStudy` object holding role, org, period,
team, tier, excerpt, body path, an assets array with file, type, alt, caption, poster and
webm for videos, and a metrics array of label, before, after, basis. Produce
`case-study/portfolio/excerpt.md`, exactly 150 words, standalone, leading with the problem
and naming the one number that matters. Stage renamed assets in
`case-study/portfolio/assets/`. Then print: where everything lives, the word count, the
asset list with total weight, which numbers are measured versus reported, the clearance
tier and whether sign-off is still outstanding, the exact shell commands to copy the bundle
into my portfolio repo, and anything still needing a human.

Start with Phase 0 now. Ask me the clearance questions and wait.
