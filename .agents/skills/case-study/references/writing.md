# Phase 6: Writing it

## The shape

A case study is an argument, not a report. The argument is: *this person can be trusted
with a hard problem, and here is the trace of them solving one.* Everything in the document
either advances that argument or gets cut.

Target length: 1,200 to 2,000 words of prose. Long enough to show depth, short enough that
a hiring manager reads it in one sitting. A 4,000-word case study is read by nobody.

Section budgets, in order. See `templates/case-study.md` for the fillable version.

| Section | Words | Job |
|---|---|---|
| Title and one-line | 25 | What it is, in the language a stranger uses |
| At a glance | 60 | Role, org, dates, team, stack, scope, status. Scannable |
| The problem | 150-250 | What was breaking, who felt it, what it cost |
| Constraints | 80-150 | What made it hard beyond the code |
| What I built | 400-700 | 3 to 5 decisions, each with its tradeoff |
| The hard part | 250-400 | One deep dive. The section people actually read |
| Results | 150-250 | Measured, labeled, with method |
| What I would do differently | 100-200 | Honest, specific, technical |
| What it demonstrates | 80 | Skills mapped to the evidence above |
| Assets, sources, notes | - | Captions, ledger link, redaction statement |

## The opening

The first two sentences decide whether the rest is read. Open on the problem in concrete
terms, not on the company, the stack, or your excitement.

Bad: "Harsukh Residences is a premium real-estate development in Galyat. I was excited to
work on this project using Next.js 14 and Framer Motion."

Good: "Buyers were choosing apartments from a PDF floor plan and a render. Sales could not
tell them which units on floor 7 still faced the valley, so every serious question became a
phone call. I built a 3D building explorer that answered it in the browser."

The pattern: *state of the world, the friction, what I built.* Three sentences, no
adjectives.

## The decision unit

The middle of the case study is a sequence of decisions. Each one follows the same shape,
in about 100 to 150 words:

1. **The forcing condition.** What made a decision necessary.
2. **The options.** Two or three real alternatives, named.
3. **The choice, and why.** The reasoning at the time, with the constraint that decided it.
4. **The tradeoff accepted.** What got worse. Always name it.
5. **The evidence.** A metric, a commit, a diagram, an asset.

Example:

> The order table had to filter on eight facets over 1.2M rows and stay interactive.
> Client-side filtering was simplest but meant shipping the dataset to the browser.
> Adding a search engine would have handled it, but the team was two people and nobody
> wanted a second datastore to operate. I kept it in Postgres and pushed the work into a
> composite index on the three columns every query filtered by, plus keyset pagination
> instead of OFFSET. That cost about 240MB of index and roughly 8% on write throughput,
> which was the right trade for a table read far more than written. p95 went from 8.2s to
> 1.4s (M4).

That paragraph does more for a reader than a page of architecture description.

## The hard part

One section, deeper than the rest, on the problem where the obvious approach failed.
Include: what you tried first, why it broke, the insight, the fix, and how you knew it
worked. This is where a code snippet or a sequence diagram belongs, if anywhere.

Snippets: ten to twenty lines, your own code, showing a pattern rather than business logic,
with two lines of setup before and one line of consequence after. Never paste a whole file.
If the real code is proprietary, write the pattern as pseudocode and say that is what it is.

## Voice

- First person singular for your work, plural for the team's. Be exact about which.
- Past tense throughout, except for the product's present state.
- Plain verbs: built, replaced, cut, moved, indexed, rewrote, measured, shipped, broke.
- Concrete nouns and real numbers over qualifiers.
- Vary sentence length. A short sentence after two long ones does the work of a paragraph
  break.
- Technical terms because they are precise, never because they are impressive.
- No em-dashes. Use a comma, a colon, or a full stop.

## Banned

Words: leveraged, utilized, seamless, robust, cutting-edge, state-of-the-art, best-in-class,
game-changing, revolutionized, passionate, synergy, spearheaded, orchestrated (unless
literally about an orchestrator), architected (say "designed" or "built"), "world-class",
"end-to-end solution".

Constructions: "not just X, but Y", "it is less about X and more about Y", "part X, part
Y", opening with "In today's fast-paced world", closing with "I'm excited to bring these
skills to". Rhetorical questions as section openers. Emoji in headings.

Patterns: listing a stack instead of explaining a decision. Describing a feature the user
can see instead of the problem behind it. Claiming impact without a mechanism. Any sentence
that would be equally true of a different project.

## The honesty passes

Run all three over the draft:

1. **The manager pass.** Would the person who managed this work read it and agree with
   every sentence? Anything they would push back on gets softened to what is true or cut.
2. **The teammate pass.** Would a teammate feel their work was described as yours? Fix the
   pronouns.
3. **The skeptic pass.** For every number and superlative, ask "how do you know?" If the
   answer is not in `evidence.md`, `metrics.md`, or `research.md`, cut it.

## Anonymized variants

If `clearance.md` set Tier 3, write the same document with the entity layer swapped:
company becomes "a B2B electronics distributor", product becomes "the internal sales
command center", customers become "enterprise accounts". Everything else, the decisions,
the tradeoffs, the metrics as relative changes, stays. Then re-read once specifically
asking: could a reader who knows the industry identify the company from a detail I left
in? A distinctive integration, a market, a headcount, a city, a launch date can all be
identifying in combination.
