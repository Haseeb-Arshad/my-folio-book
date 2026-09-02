# Phase 7: Review

Run every check. Report the result to the user as a list, including what failed and what
could not be verified. Do not report "done" on a checklist you did not actually run.

## Sourcing

- [ ] Every factual sentence traces to a row in `evidence.md`, `metrics.md`, `interview.md`,
      or `research.md`.
- [ ] Every number carries a label: measured, reported, or estimated.
- [ ] Every measured number carries method, environment, and date.
- [ ] No percentage appears without its absolute values, or a stated reason it cannot.
- [ ] No business outcome is attributed to the work without a named mechanism.
- [ ] Design claims and production outcomes are visibly separate.

## Clearance

- [ ] Re-read `clearance.md` against the finished draft, line by line.
- [ ] No item from the never-publish list appears in prose, assets, captions, snippets,
      file names, or the evidence ledger that will ship.
- [ ] Tier 3 pieces name no company, product, client, or city that identifies the client.
- [ ] If the tier requires sign-off, the draft has been sent and the reply recorded, or the
      user has been told explicitly that this is still outstanding.

## Assets

- [ ] Every asset opened at full size and visually inspected in this pass, not just at
      capture time.
- [ ] No real names, emails, phone numbers, addresses, or avatars.
- [ ] No internal hostnames, tenant subdomains, tokens, or IDs in a visible URL bar.
- [ ] No real business numbers in any chart, tile, or tooltip.
- [ ] Terminal captures: no internal paths, no env values, no client names in the prompt.
- [ ] Raw uncompressed originals removed or gitignored.
- [ ] Every asset has a caption and alt text.
- [ ] Total asset weight under 15MB; no still over 400KB; no video over 3MB.
- [ ] Videos are muted, looped, poster-backed, and honest about any speed-up.

## Secret scan

```bash
grep -rEni "api[_-]?key|secret|token|password|bearer |-----BEGIN|postgres://|mysql://|mongodb\+srv://" case-study/ | grep -v "captions.md"
grep -rEn "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}" case-study/ | grep -v example.com
git diff --cached --stat
```

Any hit gets resolved before commit, including in a code snippet that "is only an example".

## Honesty

- [ ] Ownership language is exact. "I" only where it was you.
- [ ] Team contributions are credited where they exist.
- [ ] The "what I would do differently" section contains a real, specific, technical
      admission, not a humblebrag.
- [ ] Tradeoffs are named for each major decision.
- [ ] Nothing in the piece would embarrass the user in a reference check.

## Craft

- [ ] The first two sentences state the problem concretely, with no adjectives.
- [ ] A reader can find the hard part within ten seconds of scrolling.
- [ ] No em-dashes anywhere.
- [ ] No banned word or construction from `references/writing.md`.
- [ ] No sentence that would be equally true of a different project.
- [ ] Prose is between 1,200 and 2,000 words.
- [ ] Headings are informative, not clever.
- [ ] Company, product, and technology names are spelled and cased correctly throughout.

## Links and build

```bash
# every external link resolves
grep -oE 'https?://[^ )"]+' case-study/README.md | sort -u | while read u; do
  code=$(curl -o /dev/null -s -w "%{http_code}" -L --max-time 15 "$u"); echo "$code $u";
done

# every referenced asset exists
grep -oE '\]\((\./)?assets/[^)]+\)' case-study/README.md | sed -E 's/.*\((.*)\)/\1/' | while read f; do
  [ -f "case-study/$f" ] && echo "ok $f" || echo "MISSING $f";
done
```

## Final gate

Ask the question directly and answer it in writing: *if my former manager and a teammate
both read this tomorrow, would either of them object to a single sentence?* If the answer
is anything other than a clear no, fix the sentence before publishing.
