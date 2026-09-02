# Phase 5: Screenshots, recordings, and diagrams

Visuals are what make a case study get read. They are also the most common way confidential
data leaks into a public portfolio. Plan the shot list, seed fake data, capture, redact,
compress, caption. In that order.

## 1. Shot list first

Decide before capturing. Six to ten assets is the right size for one case study. More than
twelve and the reader scrolls past all of them.

The list that works for almost every project:

| # | Asset | Type | Why it earns its place |
|---|-------|------|------------------------|
| 01 | Hero: the main screen at its best | still | Establishes what the thing is in one glance |
| 02 | The hard screen | still | The surface with the real complexity, annotated |
| 03 | Architecture diagram | SVG | Shows systems thinking, not just UI |
| 04 | The key interaction | video, 5-10s | Motion, state, and responsiveness that a still cannot show |
| 05 | Before and after | still pair or video | The single most persuasive asset in any case study |
| 06 | Data or flow diagram | SVG | Schema, pipeline, or state machine |
| 07 | Evidence shot | still | Query plan, dashboard, load-test output, CI run |
| 08 | Mobile or responsive | still | Only if responsive work was part of the story |

For a backend-only project, swap the UI shots for: a terminal capture of the load test, a
before-and-after `EXPLAIN ANALYZE`, a queue-depth graph, a sequence diagram.

## 2. Seed synthetic data before you open the app

Non-negotiable for Tier 2 and Tier 3. Never screenshot real records.

- Use the repo's own seed script if one exists (`npm run db:seed`, fixtures, factories).
- Otherwise write a throwaway seed that mirrors the shape of the real data with generated
  values: `@faker-js/faker`, `Faker` in Python, or hand-written fixtures.
- Match realistic *shape*: row counts, name lengths, currency magnitudes, date ranges.
  Empty states and three-row tables look like a toy. Fifty plausible rows look like a
  product.
- Replace logos of real customers with generated placeholder marks.
- Set the demo user to something obviously fictional and consistent: "Dana Whitfield,
  dana@example.com".

If seeding is impossible, capture the layout and blur the content in post, or rebuild the
screen as a static mock. A blurred screenshot is weak; a seeded one is strong. Prefer the
work.

## 3. Prepare the browser

Before the first capture:

- Fresh, empty browser profile. No bookmarks bar, no extensions, no other tabs, no
  personal avatar in the corner.
- Hide or trim the URL bar if it shows an internal host. Prefer capturing the viewport
  only, not the browser chrome.
- Disable notifications and clear any badge counts.
- Standard viewport: 1440x900 for desktop, 390x844 for mobile, at deviceScaleFactor 2.
- Light and dark: capture the hero in both if the product supports both.
- Freeze anything non-deterministic: mock the clock, stub charts to a fixed dataset,
  disable entry animations for stills so nothing is caught mid-fade.

## 4. Capture: which tool

**Browser pane tools (in-session, fastest).** Start the app with `preview_start`, drive it
with `computer` and `form_input`, take stills with `computer {action: "screenshot"}`, and
switch viewport with `resize_window`. Best for exploratory capture and for verifying the
app runs at all. Ask before installing anything or before capturing a screen behind a
login the user has to authenticate.

**Playwright (repeatable, preferred for the final set).** Deterministic, scriptable, gives
video and full-page shots, and can be re-run when the UI changes. A ready script is in
`assets/capture.spec.ts` of this skill; copy it into the project, adapt the routes, run it.

```bash
npm i -D @playwright/test && npx playwright install chromium
npx playwright test case-study/capture.spec.ts
```

**OS screen recording.** For anything Playwright cannot drive: a desktop app, a terminal
session, a hardware interaction. On Windows, Xbox Game Bar (Win+Alt+R) or ShareX. Record
at 1080p or higher, then trim and convert with ffmpeg below.

**Terminal captures.** `asciinema rec` for a replayable cast, or a plain screenshot of a
clean terminal at a large font. Clear scrollback and the prompt's directory path first; a
prompt showing `C:\clients\acme-bank\` leaks the client.

**Diagrams.** Draw them, do not screenshot an internal wiki. Mermaid rendered to SVG, or
Excalidraw, or hand-written SVG. Mermaid is preferred because it lives in the repo as text
and can be regenerated:

```bash
npx @mermaid-js/mermaid-cli -i diagram.mmd -o case-study/assets/slug-03-architecture.svg -b transparent
```

Keep diagrams to one idea and under about twelve nodes. A diagram that needs a legend has
already failed.

## 5. Recording rules for the videos

- 5 to 12 seconds each. Two to four total. Longer than 15s and nobody finishes it.
- One interaction per clip, shown once, cleanly. No cursor wandering, no mis-clicks, no
  dead time at the start. Trim to the frame before the first meaningful motion.
- Move the cursor deliberately and slowly enough to follow. Pause about 400ms before each
  click so the viewer sees where the click lands.
- Show the transition, that is the point: the loading state resolving, the drag landing,
  the filter reflowing the table, the 3D explorer rotating.
- No audio. These are silent loops.
- Where the clip proves a speed claim, keep it real time and say so in the caption. Never
  speed up a clip that is being used as evidence of performance. If a clip is sped up for
  length, the caption must say "2x".

## 6. Convert and compress

Ship `mp4` (h.264, widely compatible) plus `webm` (vp9, smaller), with a poster still. Skip
GIF: a 5-second GIF is often ten times the size of the same webm and looks worse.

```bash
# trim, resize, strip audio, web-optimize
ffmpeg -ss 00:00:02.5 -to 00:00:11.0 -i raw.mp4 -vf "scale=1440:-2,fps=30" -an \
  -c:v libx264 -crf 23 -preset slow -movflags +faststart slug-04-interaction.mp4

# webm sibling
ffmpeg -i slug-04-interaction.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -an slug-04-interaction.webm

# poster frame
ffmpeg -ss 00:00:01 -i slug-04-interaction.mp4 -frames:v 1 -q:v 2 slug-04-interaction.jpg

# if a GIF is genuinely required, do it with a palette or it will look terrible
ffmpeg -i in.mp4 -vf "fps=15,scale=800:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i in.mp4 -i palette.png -lavfi "fps=15,scale=800:-1:flags=lanczos [x]; [x][1:v] paletteuse" out.gif
```

Stills: convert to WebP, max width 2400px, quality 82 to 88.

```bash
npx sharp-cli -i raw.png -o slug-01-hero.webp resize 2400 --withoutEnlargement -f webp -q 85
# or: ffmpeg -i raw.png -vf scale='min(2400,iw)':-2 -quality 85 slug-01-hero.webp
```

Budgets: stills under 400KB, videos under 3MB, the whole asset folder under 15MB. A case
study that takes eight seconds to load does not get read.

## 7. Redaction pass, before anything is committed

Open every asset at full size and check, one by one:

- Names, emails, phone numbers, addresses, avatars, order contents.
- The URL bar: internal hostname, tenant subdomain, tokens or IDs in the query string.
- Tab titles, browser history dropdown, autocomplete suggestions.
- Sidebar counts, notification badges, unread indicators tied to real activity.
- Anything in a chart tooltip or axis that is a real business number.
- Terminal prompts, env var names with values, connection strings, stack traces with
  internal paths.
- Anything a colleague would recognize as a real customer.

Redact by re-seeding and re-capturing when possible. Where that is impossible, use a solid
block, not a blur: blur can be reversed on low-entropy content like numbers and short text.

Then run a final automated sweep for text accidentally rendered into an image name or an
adjacent file, and confirm no raw capture files are left in the repo:

```bash
git status --porcelain case-study/
ls case-study/assets/          # raw .png / .mp4 originals must be gone or gitignored
```

## 8. Caption everything

`case-study/assets/captions.md`, one entry per asset. A caption says what the reader is
looking at and why it matters. Without it, a screenshot is decoration.

```markdown
### slug-02-filters.webp
The order table under its heaviest filter combination: 8 facets, 1.2M rows behind it,
server-side pagination. This is the screen that took 8.2s before the index work.
Data is seeded; no real customer records appear in any asset.
```

Include the "data is seeded" sentence once in the assets section of the case study. It
tells a careful reader you thought about this, which is itself a signal.

## 9. Accessibility and presentation

- Every asset gets alt text in the finished document, distinct from the caption.
- Do not put essential information only in an image; the prose must stand alone.
- Videos: `muted`, `playsinline`, `loop`, and `preload="none"` with a poster, so a page
  with four clips does not cost the reader 12MB on load.
- Show light mode by default unless the product is dark-first.
