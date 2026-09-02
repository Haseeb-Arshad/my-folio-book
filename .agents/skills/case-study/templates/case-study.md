# <Project name>

> <One line. What it is and who it was for, in the words a stranger would use.>

<!-- Word budgets are in references/writing.md. Delete every comment before shipping. -->

## At a glance

| | |
|---|---|
| **Role** | <Your title, and the scope you actually owned> |
| **Organization** | <Company, or the anonymized description for Tier 3> |
| **Period** | <Month Year to Month Year> |
| **Team** | <Size and shape. Name what others owned.> |
| **Stack** | <The 5 to 8 that matter. Not everything in package.json.> |
| **Status** | <Live / shipped and maintained by the team / internal> |
| **My scope** | <One sentence, precise. "I owned X and Y; Z was built by ...".> |

![<alt text>](assets/<slug>-01-hero.webp)
*<Caption: what this is and why it is the opening image.>*

## The problem

<!-- 150-250 words. Open on the state of the world and the friction, not on the company or
the stack. Who felt the pain, how often, and what it cost. End with the one sentence that
says what you set out to change. No adjectives in the first two sentences. -->

## Constraints

<!-- 80-150 words. What made it hard beyond the code: deadline and what forced it, legacy
systems you could not replace, headcount, budget, compliance, a vendor limit, a database
someone else owned. Constraints are what make decisions legible. -->

- **Deadline:** <what, and what forced it>
- **Inherited:** <what could not be changed>
- **Team:** <who was available>
- **Other:** <compliance, vendor limits, data volume, offline requirements>

## What I built

<!-- 400-700 words, 3 to 5 decisions. Each one: forcing condition, options, choice and
reasoning, tradeoff accepted, evidence. See the decision unit in references/writing.md. -->

### <Decision 1, named after the problem it solved, not the technology>

<Forcing condition. Options considered. What won and why. What it cost. Evidence ref.>

### <Decision 2>

### <Decision 3>

![<alt>](assets/<slug>-03-architecture.svg)
*<Caption: what the diagram shows. One idea, under twelve nodes.>*

## The hard part

<!-- 250-400 words. The single problem where the obvious approach failed. What you tried
first, why it broke, the insight, the fix, how you knew it worked. A short snippet or a
sequence diagram belongs here if anywhere. This is the section that gets read closely. -->

```<lang>
// 10-20 lines, your own code, showing the pattern rather than business logic.
// If the real code is proprietary, write it as pseudocode and say so.
```

<video src="assets/<slug>-04-<interaction>.mp4" poster="assets/<slug>-04-<interaction>.jpg" muted loop playsinline preload="none"></video>

*<Caption: what the clip shows. Real time, or state the speed-up.>*

## Results

<!-- 150-250 words. Only labeled numbers. Method and date for anything measured.
Attribution for anything reported. No business outcome without a mechanism. -->

| Metric | Before | After | Basis |
|---|---|---|---|
| <Admin dashboard p95> | <8.2s> | <1.4s> | measured, local, <date>, see metrics.md#M4 |
| <Shared components> | <0> | <34> | repo-verified |
| <Business metric> | | <relative change> | reported by the team, not independently verified |

<One paragraph on what changed for the people who use it. What the numbers meant in
practice. Where the improvement stopped mattering.>

## What I would do differently

<!-- 100-200 words. A real, specific, technical admission. Something you now know is
wrong, and what you would do instead. Not "I would add more tests". -->

## What this demonstrates

<!-- 80 words. Map skills to the evidence above, not to adjectives. Each line should point
back at a section a reader can check. -->

- **<Skill>:** <the specific thing above that proves it>
- **<Skill>:** <...>
- **<Skill>:** <...>

---

## Notes on this write-up

- All screenshots and recordings use seeded synthetic data. No real customer records,
  names, or business figures appear in any asset.
- Numbers labeled *measured* were benchmarked on <environment> on <date>; numbers labeled
  *reported* come from the team and are not independently verified.
- <Company> reviewed this write-up on <date>. / This write-up is anonymized at the
  company's request. / Published with permission from <name, role>.

**Evidence:** see `evidence.md`, `metrics.md`, `research.md` in this folder.
