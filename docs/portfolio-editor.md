# Private portfolio editor

The portfolio keeps its original public design. `/admin` is the private editor, and `/admin/login` is its sign-in page. The experimental `/new` and `/page/new` routes have been removed.

## Storage and access

The editor has its own `public.portfolio_editor_state` table. It does not
write the original projects/books/experience tables. Apply only the
`portfolio_editor` migration for this feature. The table is closed to `anon`
and `authenticated`; only the server-side service role can use it.

Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and a random `PORTFOLIO_ADMIN_KEY`
of at least 32 characters in the hosting environment. The owner enters that key
at `/admin/login`. It is never included in loader data, client bundles, logs,
or page URLs. The signed HttpOnly, SameSite=Strict session expires after eight
hours. Production cookies are Secure. Rotating the key invalidates old sessions.
All mutations also check the request origin and the session CSRF token.

An owner access key has been generated in the local ignored `.env` if none
was already present. To configure hosting, copy that value through your
hosting provider's private environment settings. No hosting deployment or
environment update is performed by the editor itself.

For offline development, explicitly set `PORTFOLIO_EDITOR_DRIVER=file`. The
default state file is `.portfolio/editor.json`, ignored by Git. An optional
`PORTFOLIO_EDITOR_FILE` can choose a different development location. The file
driver is rejected in production; production must use persistent Supabase
storage. The editor reports storage failures and disables writes. Public pages retain the original committed-data fallback during a database outage. A successful empty editor read stays empty.

## Publishing

- Saving changes only the draft. The last published snapshot remains public.
- Preview shows the saved draft through an authenticated, no-store route.
- Publish validates the content and replaces the public snapshot atomically.
- Unpublish removes the snapshot. An empty published collection stays empty.
- Archive unpublishes and retains the document and its history.
- Restore an archived item to resume editing; publication remains explicit.
- Restore a revision into the draft, then publish separately if desired.
- A version check rejects an older tab's attempt to overwrite a newer save.
- Twenty-five revisions per item are retained. A database backup is still the
  appropriate way to retain longer history.

The editor starts with the original portfolio content. Two proposed project overviews and two engineering notes start as unpublished drafts. The first successful write initializes the separate store. An existing empty store is never re-seeded.

## Content

Use the content tabs for projects, case studies, writing, books, reading links,
experience, Now updates, and the homepage. Lower order numbers appear first.
Contact links and the CV document URL are editable in their own tabs. Contact
links can use a simple `mailto:address@example.com` URL. The CV can use an
existing site PDF path or a hosted HTTPS document URL. Only one homepage and
one CV can be published at a time.
Featured reading links appear on the homepage. Project order controls the Work list. Homepage title, introduction, and serif statement are editable; its existing company and current-project links retain their published copy. Optional display data preserves original project logos, extra links, years, ISBNs, and structured case study sections. Keep an existing case study body unchanged to retain its richer metrics and callouts; editing the body uses the supported heading, paragraph, list and image blocks. Cover images accept HTTPS URLs or
existing site asset paths. Bodies support plain text, `##` headings, lists,
emphasis, code spans and image syntax. Raw HTML is rendered as text.

Quick capture creates a private note draft. To turn it into an article, edit
the type, visibility, title, summary, and body, then preview and publish.

Agent knowledge requires all three: a published snapshot, public visibility,
and explicit agent approval. A fact's title and the first 240 characters of its
summary/body become a bounded live note. Put the complete short fact in the
summary field. Drafts, archived entries, and private notes are excluded.
These facts remain data rather than instructions, and existing public-note
disclosure boundaries still apply. Unpublishing removes the live note on the
next request. The existing conversational system remains separate.

Owner routes use no-store responses and noindex headers. Analytics and session
recording are suppressed on owner routes; draft surfaces are also blocked from
capture. No third-party analytics SDK is started on an initial owner page load.

## Verification

Run `npm run typecheck`, `npm run build`, `npm run verify:content`, and
`npm run verify:editor`. The editor verification covers publication isolation,
private facts, durable local saves, concurrency, session signatures, CSRF,
and the migration's SQL grants and RLS. It does not contact real providers.
