# Phase 8: Packaging for the portfolio

The case study lives in the project repo. The portfolio consumes a packaged copy. This
phase produces that copy so moving it across is a file copy and a data insert, not a
rewrite.

Target portfolio: `github.com/Haseeb-Arshad` portfolio, React Router 7 plus Tailwind, with
content in Supabase and `app/data/*.ts` as the static fallback. Static assets live under
`public/`.

## 1. The project record

Write `case-study/portfolio/project.json` matching the portfolio's `Project` type in
`app/data/projects.ts` and the `public.projects` table:

```json
{
  "slug": "summon-command-center",
  "name": "Summon Command Center",
  "tagline": "One-line pitch, under 220 characters, plain language, no adjectives.",
  "year": "2025",
  "stack": ["React", "Node.js", "Go", "PostgreSQL"],
  "live": null,
  "code": null,
  "logo": "/logos/summon.png",
  "letter": "S",
  "color": "bg-slate-700",
  "status": null,
  "links": [{ "label": "Case study", "href": "/work/summon-command-center" }],
  "popup": {
    "image": "/case-studies/summon-command-center/01-hero.webp",
    "description": "Two sentences for the hover card."
  },
  "caseStudy": {
    "slug": "summon-command-center",
    "role": "Founding Full-Stack Engineer",
    "org": "Summon Electronics",
    "period": "2025 - present",
    "team": "3 engineers, 1 designer",
    "tier": "internal-safe",
    "confidential": true,
    "excerpt": "150-word version, from excerpt.md",
    "body": "case-study/README.md, markdown",
    "assets": [
      {
        "file": "01-hero.webp",
        "type": "image",
        "alt": "Alt text, distinct from the caption",
        "caption": "Caption from captions.md"
      },
      {
        "file": "04-filters.mp4",
        "type": "video",
        "poster": "04-filters.jpg",
        "webm": "04-filters.webm",
        "alt": "...",
        "caption": "Real time, not sped up."
      }
    ],
    "metrics": [
      { "label": "Admin dashboard p95", "before": "8.2s", "after": "1.4s", "basis": "measured, local, 2026-09-02" }
    ]
  }
}
```

Notes on the fields the existing schema already enforces:

- `code_url` is `not null` in `public.projects`. For a company project with no public repo,
  point it at the case study route rather than inventing a repository link, and set `live`
  to the public product URL only if the product is public.
- `status` accepts only `null` or `"building"`.
- `links` must be a JSON array.
- Keep `letter` and `color` filled even when a logo exists; they are the fallback.

## 2. Excerpt

`case-study/portfolio/excerpt.md`, 150 words, standalone. It has to make sense with no
images and no surrounding page, because it is what appears in a card, a preview, and the
answer the site's conversational agent gives when someone asks about this project. Lead
with the problem, name the one number that matters, name the scope.

## 3. Assets

Rename to the site's convention and stage them:

```bash
mkdir -p case-study/portfolio/assets
cp case-study/assets/*.webp case-study/assets/*.mp4 case-study/assets/*.webm \
   case-study/assets/*.jpg case-study/assets/*.svg case-study/portfolio/assets/ 2>/dev/null
```

Then in the portfolio repo they belong at `public/case-studies/<slug>/`, keeping the
numeric prefixes. Print the exact commands for the user, with the real paths:

```bash
mkdir -p E:/projects/port/portfolio/public/case-studies/<slug>
cp -r case-study/portfolio/assets/* E:/projects/port/portfolio/public/case-studies/<slug>/
cp case-study/README.md E:/projects/port/portfolio/app/content/case-studies/<slug>.md
```

Also produce a card preview at `public/previews/<slug>.webp` sized like the existing ones,
since the hover popup uses that path.

## 4. Content pipeline

The portfolio reads content from Supabase with the `app/data/*.ts` files as fallback, so a
new case study needs both paths updated or it will render inconsistently depending on
whether Supabase is reachable.

1. Add or update the object in `app/data/projects.ts` (the fallback).
2. Add the row to Supabase, through the existing seed script rather than by hand:
   `npm run db:seed`.
3. If `case_studies` does not exist yet as a table, it needs a migration in
   `supabase/migrations/`. Follow the conventions already in `0001_content.sql`: RLS
   enabled and forced, no anon or authenticated policies, explicit revoke, `set_updated_at`
   trigger, `published` boolean, `sort_order`.

Suggested table, matching the house style of the existing schema:

```sql
create table if not exists public.case_studies (
  id           bigint generated always as identity primary key,
  slug         text not null unique references public.projects(slug) on update cascade,
  role         text not null,
  org          text not null,
  period       text not null,
  team         text,
  tier         text not null default 'internal-safe',
  confidential boolean not null default true,
  excerpt      text not null,
  body         text not null,
  assets       jsonb not null default '[]'::jsonb,
  metrics      jsonb not null default '[]'::jsonb,
  published    boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint case_studies_tier_known check (tier in ('public','internal-safe','restricted')),
  constraint case_studies_assets_is_array check (jsonb_typeof(assets) = 'array'),
  constraint case_studies_metrics_is_array check (jsonb_typeof(metrics) = 'array')
);
```

`published` defaults to false on purpose: a case study about employer work should not go
live by accident before clearance is settled.

## 5. Route

Case studies want a route of their own: `route("work/:slug", "routes/case-study.tsx")` in
`app/routes.ts`, loading the record by slug and falling back to the static file. If that
route does not exist yet, say so and offer to build it rather than silently producing
content with nowhere to render.

## 6. Feed the conversational agent

The site's chat answers questions about projects from the notes in
`.agents/skills/portfolio-conversation/`. A new case study should add two or three lines to
`projects.md` there: what the project is, the hard part, and the one number. Keep the
existing constraints in that skill, especially the rule that a designed property is not a
proven one, and do not paste confidential detail into notes the model will read aloud to
strangers.

## 7. Handoff summary

End the phase by printing, in the chat:

- Where the case study lives, and its word count.
- The asset list with total weight.
- Which numbers are measured and which are reported.
- The clearance tier and whether sign-off is still outstanding.
- The exact commands to move the bundle into the portfolio.
- Anything that still needs a human: a missing metric, a screenshot behind a login, a
  sentence that needs the manager's approval.
