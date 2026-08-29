# Resume agent implementation plan

## Scope

Add a first-class `/agent` page to the portfolio: a conversational, editorially styled interface that lets visitors ask about Haseeb's verified resume, work, projects, skills, and contact route. Add `/resume` as a document route that opens the supplied CV PDF.

## Product decisions

- Treat `public/resume.pdf` and the structured `app/data/resume.ts` projection as the source of truth for the agent.
- Use a server-only `/api/chat` proxy to OpenRouter; never expose the API key to browser code or commit a real key.
- Use `qwen/qwen3-32b` by default for a natural, capable, low-cost conversation, with bounded message/output sizes, rate limiting, and reasoning disabled to keep requests economical.
- Keep provider fallback restricted to OpenRouter's no-data-collection routing preference, and return generic errors without leaking upstream details.
- Make the conversation useful on first load with a warm opening message, suggested prompts, and a visible scope note.
- Include loading, empty, and recoverable error states so the interaction feels complete.
- Keep Agent out of the primary navigation; the page remains directly reachable at `/agent` and links to `/resume`.
- Do not change the existing Work, Blog, Connect, or Now tab content in this slice.

## Visual direction

- Keep the portfolio's quiet typography and generous whitespace.
- Use an asymmetric split layout: agent framing on the left, conversation on the right.
- Give the agent a single muted terracotta accent over warm neutral surfaces.
- Use motion only for arrival, thinking dots, and message reveal; respect reduced-motion preferences.

## Verification

- Run `npm run typecheck`.
- Run `npm run build`.
- Start the local app with the explicitly authorized Altherail OpenRouter key in the server process only.
- Inspect `/agent` at desktop and mobile widths; verify the Agent tab is absent while the four existing tabs remain.
- Verify prompt buttons, live submit behavior, reset behavior, keyboard access, error handling, `/resume` redirect, and PDF content type.
- Commit and push this bounded slice before any later tab or feature work.
