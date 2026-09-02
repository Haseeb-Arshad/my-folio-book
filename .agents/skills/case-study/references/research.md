# Phase 4: External research

A number on its own is inert. "p95 went from 8.2s to 1.4s" is good; "p95 went from 8.2s to
1.4s, which moves it from four times Google's 2.5s LCP threshold to comfortably inside it"
is a case study. External research is what supplies the yardstick.

## Sanitize before searching

Ground rule 4 applies hardest here. Before any WebSearch or WebFetch:

- Strip company names, product names, customer names, internal codenames.
- Strip table names, service names, repo names, internal URLs.
- Generalize: not "why is our `tenant_billing_ledger` query slow", but "postgres composite
  index selection for a multi-tenant time-range query".

Search the *problem class*, never the *instance*.

## What to look for

**1. Thresholds and standards that make a number legible.**
Core Web Vitals thresholds (LCP, INP, CLS), the 100ms and 1s interaction rules, WCAG 2.2
contrast and target-size levels, HTTP caching semantics, OWASP guidance for whatever
security work was done. Cite the primary source: web.dev, W3C, the RFC, the vendor doc.

**2. Published benchmarks for the same tools.**
If the work chose Postgres over Mongo, Go over Node, SSR over CSR, virtualized lists over
pagination, find the public benchmark or the vendor's own documented limits. Two uses:
it validates the decision, and it shows the reader the decision was informed rather than
habitual.

**3. Standard practice for the problem.**
What is the textbook approach? Naming it lets the case study say "the usual answer is X;
here is why X did not fit and what I did instead", which is the most persuasive rhetorical
shape available to an engineer.

**4. Public product context.**
If the product is public and Tier 1, look at its own live site, its App Store or
marketplace listing, any press, and any public status page. Screenshot-worthy and citable.
Comparable public products are useful for positioning one sentence, not for a feature
matrix.

**5. Domain context.**
Real estate, electronics distribution, logistics, healthcare: two or three sentences of
industry context makes the problem legible to a reader who does not know the domain. Cite
an industry source, not a blog aggregating other blogs.

## Source quality

Prefer, in order: primary documentation and specs, the vendor's own engineering blog,
peer-reviewed or first-party benchmarks, well-known engineering blogs with methodology,
then everything else. Reject: content farms, undated posts, anything that cites no method,
and any statistic you cannot trace to its origin. If a statistic's origin cannot be found
in two hops, do not use it.

Check the date on everything. A 2019 benchmark of a database that has had four major
versions since is not evidence about today.

## Using sources in the prose

- Link inline, sparingly, and only where the link does work: a threshold, a benchmark, a
  spec.
- Never let a citation carry a claim about your own project. External sources establish
  context; your evidence ledger establishes what you did.
- Do not quote at length. One short quote per source at most, in quotation marks, with
  attribution. Summarize instead.

## Output

`case-study/research.md`:

```markdown
| # | Claim it supports | Source | URL | Published | Accessed |
|---|-------------------|--------|-----|-----------|----------|
| R1 | 2.5s is the "good" LCP threshold | web.dev, Largest Contentful Paint | https://... | 2024-06 | 2026-09-02 |
| R2 | Composite index order matters for range predicates | PostgreSQL 16 docs, Indexes and ORDER BY | https://... | 2023-09 | 2026-09-02 |
```

Every row must be reachable from a sentence in the finished case study, or it is research
that did not earn its place. Cut it.
