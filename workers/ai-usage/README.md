# AI usage Worker

This Worker is the small public edge service for the portfolio's AI activity
snapshot. The local publisher reads local agent histories, reduces them to
daily aggregate usage, and sends one authenticated JSON snapshot to `/sync`.
The Worker upserts those daily rows to Supabase, reads saved Codex account rows
to build a durable account summary, then updates its public KV snapshot. The
homepage reads `/stats`.

The Worker never receives raw prompts, project paths, session files, raw
account identifiers, or local authentication databases. Codex account IDs are
SHA-256 hashed locally; the hash is used only as a private Supabase key and is
removed from the public snapshot. Account labels are stable generic labels
stored in `%LOCALAPPDATA%\HaseebAiUsage\account-labels.json`. Sessions without
one unambiguous `creator_account_id` are grouped as `Unattributed history`.

## First-time Cloudflare setup

1. Create two KV namespaces:

       npx wrangler kv namespace create AI_USAGE
       npx wrangler kv namespace create AI_USAGE --preview

2. Put the returned production and preview IDs into wrangler.toml.
3. Add the sync secret:

       npx wrangler secret put AI_USAGE_SYNC_TOKEN

   Add the Supabase secret key used by the Worker:

       npx wrangler secret put AI_USAGE_SUPABASE_SECRET_KEY

   Set the `AI_USAGE_SUPABASE_URL` variable in `wrangler.toml`. Apply the
   focused `supabase/migrations/20261015120000_ai_usage_daily.sql` migration
   to the configured Supabase project before deploying this Worker.

4. Deploy from this directory:

       npx wrangler deploy

5. Set the portfolio server variable AI_USAGE_STATS_URL to the deployed
   Worker URL plus /stats.

The current deployed endpoints are:

       https://haseeb-ai-usage.chatgideon.workers.dev/stats
       https://haseeb-ai-usage.chatgideon.workers.dev/sync

Cloudflare KV is used for the one small public snapshot because it is globally
replicated and low-latency. The `/stats` response is served with `no-store` so
the homepage can show the most recently published summary.

## Local publisher

From the portfolio root, set these variables in the local environment:

       AI_USAGE_SYNC_URL=https://your-worker.example.workers.dev/sync
       AI_USAGE_SYNC_TOKEN=the-same-value-used-for-the-worker-secret

Then run:

       npm run stats:publish

To register the hourly Windows schedule for the current user:

       powershell -ExecutionPolicy Bypass -File scripts/register-ai-usage-sync-task.ps1

The task runs while the user is logged in, so the local agent histories remain
available. Its output is appended to `outputs/ai-usage/sync.log`.

The publisher invokes the pinned Slopmeter package for each account-partitioned
Codex session set and once per other supported provider. It keeps successful
provider snapshots, computes the combined view locally, and uploads daily token
counts plus generic account labels. Raw identities, prompts, and session
contents stay on the local machine. Older sessions that cannot be assigned to
one account remain in the unattributed row. Missing local providers remain
visible in the metadata so the UI does not imply that an absent source was zero
usage.

The Supabase table is `public.ai_usage_daily`. It contains one row per source,
account, provider, and date. Row-level security is forced, and anonymous and
authenticated roles have no table grants. The Worker uses its server-only
Supabase secret to write rows and read the saved Codex account rows. `/sync`
publishes the KV snapshot only after the Supabase upserts and account-history
read succeed. This keeps previously recorded accounts visible after the local
Codex account changes. The hourly job collects from local session files and
sends aggregates to Cloudflare and Supabase.

To generate a local artifact without uploading it:

       npm run stats:publish:dry

The default local artifact is outputs/ai-usage/latest.json and is ignored by
Git.
