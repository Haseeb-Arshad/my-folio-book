# Portfolio analytics and conversation storage

## What is captured

The browser initializes PostHog when `VITE_POSTHOG_PROJECT_TOKEN` is present.
It sends one `$pageview` event per client-side route, plus autocapture and
session replay. The app adds bounded events for:

- opening the agent;
- sending a message, with mode, surface, conversation ID, and character count;
- completed, failed, or reset conversations;
- Plain/Goblin mode changes;
- viewing the CV page, opening the PDF, and downloading the PDF.

Event properties never include the message text, CV text, API keys, or IP
addresses. The agent transcript is marked `ph-no-capture`, so PostHog replay
and autocapture do not record its visible contents. Inputs remain masked.

## What Supabase stores

The server writes one row per user turn and one row per assistant turn to
`public.portfolio_chat_messages`. Rows include the opaque visitor and
conversation IDs, `home` or `resume` surface, `plain` or `goblin` mode, role,
bounded message content, completion status, timing metadata, and timestamp.

It also writes one row per agent lifecycle event to
`public.portfolio_agent_events`, including opens, sends, replies, resets, and
Plain/Goblin mode transitions. Event metadata is allow-listed to counts,
durations, and mode transitions; message bodies are not copied into this
ledger.

Both tables have RLS enabled and forced, and all `anon` and `authenticated`
privileges revoked. Only the server-side Supabase secret-key client can read
or write them. If Supabase is unavailable, chat continues and the failed write
is logged server-side without logging the message body.

## Deployment settings

Set these variables in the production build environment:

```text
VITE_POSTHOG_PROJECT_TOKEN=<PostHog project token>
VITE_POSTHOG_API_HOST=https://us.i.posthog.com
```

The PostHog token is intentionally a public, write-only browser token. The
Supabase secret key and OpenRouter key remain server-only. Run `npm run
db:migrate` once against the production Supabase project before expecting chat
rows there.

## Limits of the claim

PostHog dashboards will show captured events, web traffic, and any enabled
replay recordings. It does not automatically become a copy of the chat
database. Supabase stores the transcript only after the new migration is
applied and the deployed server has its Supabase variables. The code and local
build cannot prove production delivery until a live visit and a real chat turn
are checked in both PostHog and Supabase.
