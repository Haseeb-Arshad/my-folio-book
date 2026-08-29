# Portfolio notes deployment

The `/agent` route runs on the existing stack. It is React Router 7 with server-side rendering, a Node runtime, and a server-only OpenRouter request. The repository Dockerfile builds the client and server bundles, then starts `react-router-serve`.

## Local configuration

Create an ignored `.env` file next to `package.json`:

```env
PORTFOLIO_OPENROUTER_API_KEY=replace-with-a-server-only-key
PORTFOLIO_OPENROUTER_MODEL=openai/gpt-4.1-mini
PORTFOLIO_SITE_URL=https://haseebarshad.me
```

The API key is read only by `app/routes/api.chat.ts`. It is never included in the browser bundle or sent to the conversation model as context. The route rejects Anthropic, Claude, auto-routing, and the previous slow Qwen default, then uses the approved fast model.

## Container run

```powershell
docker build -t haseeb-portfolio .
docker run --rm -p 3000:3000 `
  -e PORTFOLIO_OPENROUTER_API_KEY="replace-with-a-server-only-key" `
  -e PORTFOLIO_OPENROUTER_MODEL="openai/gpt-4.1-mini" `
  -e PORTFOLIO_SITE_URL="https://haseebarshad.me" `
  haseeb-portfolio
```

Use the platform's secret manager for the key in hosted environments. Do not bake it into an image, Dockerfile, Markdown file, client environment variable, or build log. Put HTTPS and the platform's rate limiting in front of the container.

## Virtual deployment checklist

- Build passes with `npm run build`.
- Start the generated server with `npm run start`.
- Set the three server environment values above.
- Confirm `GET /agent` returns the rendered page.
- Confirm `POST /api/chat` streams `text/plain` and never exposes provider headers or credentials.
- Confirm the deployed origin is listed in `PORTFOLIO_SITE_URL`.
- Confirm the 20 requests per 10 minute in-memory guard is supplemented by platform rate limiting when more than one instance runs.
- Confirm logs redact request bodies and authorization headers.
- Rotate the testing key before sharing the deployment.

This is deployment-ready at the application layer. No production host or domain deployment has been performed from this workspace, so production uptime, DNS, TLS, provider quota, and live external acceptance remain to be checked on the chosen host.

## Connections and autonomy

The visible Connections menu exposes two honest statuses:

- Email handoff is ready. It opens a visitor-owned `mailto:` draft and never sends automatically.
- Messages bridge needs setup. A browser cannot directly access Apple Messages, so a future user-owned macOS relay must provide the authenticated bridge and a visible preview plus confirmation for every outbound message.

The guide is autonomous inside the conversation: it selects the relevant topic, carries short context, chooses a concise answer, and can prepare a draft. It cannot silently send, read private systems, schedule, accept work, alter infrastructure, commit, or deploy.

