# AI usage Worker

This Worker is the small public edge service for the portfolio's AI activity
snapshot. The local publisher reads the local agent histories, reduces them to
daily aggregate usage, and sends one authenticated JSON snapshot to /sync.
The homepage reads /stats.

The Worker never receives raw prompts, project paths, session files, or local
authentication databases.

## First-time Cloudflare setup

1. Create two KV namespaces:

       npx wrangler kv namespace create AI_USAGE
       npx wrangler kv namespace create AI_USAGE --preview

2. Put the returned production and preview IDs into wrangler.toml.
3. Add the sync secret:

       npx wrangler secret put AI_USAGE_SYNC_TOKEN

4. Deploy from this directory:

       npx wrangler deploy

5. Set the portfolio server variable AI_USAGE_STATS_URL to the deployed
   Worker URL plus /stats.

The current deployed endpoints are:

       https://haseeb-ai-usage.chatgideon.workers.dev/stats
       https://haseeb-ai-usage.chatgideon.workers.dev/sync

Cloudflare KV is used for the one small public snapshot because it is globally
replicated and low-latency. The /stats response is cacheable for one minute,
with stale-while-revalidate for a fast public read.

## Local publisher

From the portfolio root, set these variables in the local environment:

       AI_USAGE_SYNC_URL=https://your-worker.example.workers.dev/sync
       AI_USAGE_SYNC_TOKEN=the-same-value-used-for-the-worker-secret

Then run:

       npm run stats:publish

To register the four-hour Windows schedule for the current user:

       powershell -ExecutionPolicy Bypass -File scripts/register-ai-usage-sync-task.ps1

The task runs while the user is logged in, so the local agent histories remain
available. Its output is appended to outputs/ai-usage/sync.log.

The publisher invokes the pinned slopmeter package once per supported provider,
keeps successful provider snapshots, computes the combined view locally, and
uploads only the sanitized result. Missing local providers remain visible in
the metadata so the UI does not imply that an absent source was zero usage.

To generate a local artifact without uploading it:

       npm run stats:publish:dry

The default local artifact is outputs/ai-usage/latest.json and is ignored by
Git.
