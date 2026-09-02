# Phase 2: The interview

The repo knows what was built. Only the user knows why it mattered, what it cost, and what
it felt like to build. This phase buys the parts of the case study that cannot be derived.

## Rules

- Ask **after** Phase 1, so questions are specific: "the commits show a rewrite of the
  sync worker in June, what forced that?" beats "tell me about the project".
- Ask **once**, in one numbered block. Ten questions maximum. A second short follow-up
  round is fine if answers open something important; a third is an interrogation.
- Accept "don't know" and "can't say" without pushing. Mark those in the ledger as
  unavailable and write around them.
- Record answers verbatim. Do not paraphrase into the ledger; the user's own phrasing
  often carries the best line in the finished piece.
- Never ask a question the repo already answered. That signals you did not read it.

## The question bank

Pick the ten that matter for this project. Rewrite each to name real things found in
Phase 1.

**Why it existed**
1. What was happening before this project that made someone decide to fund it? What was
   the cost of leaving it alone: money, hours, churn, incidents, blocked sales?
2. Who used it, roughly how many, and how often? Internal team, customers, both?
3. What did success look like to the person who approved the work?

**Constraints**
4. What was the deadline and what forced it: a launch, a contract, a compliance date, a
   funding round?
5. What could you not change? Legacy systems, a database you inherited, a vendor, a
   framework, a team convention, a budget.
6. How many people worked on it, in what roles, and which parts were specifically yours?

**Decisions**
7. The commits show `<specific technical choice found in Phase 1>`. What else was on the
   table, and why did that one win?
8. What was the hardest technical problem, the one where the obvious approach did not
   work? Walk through what failed first.

**Outcomes**
9. What changed after it shipped? Any numbers you can share, even rough ones, and can they
   be published as absolutes or only as relative changes?
10. What broke, what did you get wrong, and what would you build differently now?

**Optional, if the piece needs a human edge**
- What is the one detail about this project you still tell people about?
- Was there a moment where you thought it was not going to work?

## How to use the answers

- An outcome number from the interview is `reported, unverified` unless Phase 3 can measure
  it or a document backs it. Label it that way in the ledger and in the case study.
- A "what I got wrong" answer is not a weakness in the piece; it is the section experienced
  readers trust most. Do not soften it into a non-answer.
- If the user gives a number they are not sure they may publish, route it back through
  `clearance.md` before it goes in the draft.
- If the user cannot answer questions 1 to 3 at all, the case study should lead with the
  engineering problem rather than the business outcome. That is a valid shape; say so and
  move on rather than fabricating business context.

## Output

`case-study/interview.md`:

```markdown
# Interview, 2026-09-02

**Q1. What made someone fund this?**
> [verbatim answer]

Publishable: yes / relative only / no
Follow-up needed: -
```
