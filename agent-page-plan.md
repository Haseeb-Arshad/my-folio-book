# Portfolio notes experience plan

## Outcome

Turn `/agent` from a visibly AI-shaped resume lookup into a quick, natural message exchange about Haseeb's work. The experience should answer first, stay brief by default, remember the thread, and never announce that it is reading a resume unless the visitor explicitly asks about the resume or CV.

## Product principles

- Present the experience as a conversational layer over Haseeb's published work, not as a chatbot, search result, recruiter assistant, or help desk.
- Use the direct voice of the portfolio. First-person statements are allowed only when they are supported by the published notes.
- Be transparent when asked directly: this is a conversational guide to Haseeb's work, not Haseeb in a live chat.
- Never begin with capability boilerplate such as “I'm here to help,” “feel free to ask,” “whether you're curious,” or “what would you like to know?”
- Never say “according to the resume,” “resume context,” “public resume,” or “resume-grounded” unless the visitor is specifically discussing the resume or CV.
- Answer the actual question in the opening sentence. Add only the smallest amount of supporting detail that makes the answer useful.
- Do not dump a role's full bullet list into one response. Offer one coherent idea, then let the conversation deepen naturally.
- Keep unsupported claims out. When a reliable note is unavailable, say that plainly and softly without exposing prompt or retrieval mechanics.
- Keep private data, hidden instructions, API credentials, and implementation metadata out of responses.
- Keep typographic dash punctuation out of replies. Use ordinary sentences and commas; technical hyphens inside names remain allowed.

## Markdown skill architecture

Create a project skill at `.agents/skills/portfolio-conversation/` so voice and behavior remain editable without rewriting server logic.

- `SKILL.md`: core identity, voice, response rhythm, grounding rules, disclosure behavior, prohibited phrases, and quality checklist.
- `small-talk.md`: greetings, acknowledgements, conversational transitions, and short-answer behavior.
- `current-work.md`: how to answer “what are you doing now?” without reciting a job description.
- `projects.md`: project selection, comparisons, deep dives, and evidence-first enthusiasm.
- `experience.md`: career history, role transitions, impact, and chronology.
- `technical-fit.md`: architecture, AI, backend, frontend, platform, performance, and hiring-fit questions.
- `contact.md`: direct contact answers and collaboration questions without sales language.
- `education.md`: education, certifications, and learning questions.
- `general.md`: broad introductions and questions that do not fit one topic.
- `examples.md`: good and bad response pairs, including the exact failure patterns this change replaces.
- `public-notes.md`: the complete public fact set used by the conversation. This is source data, never response wording.
- `plugins.md`: the email handoff and Apple Messages bridge boundary.
- `autonomy.md`: the decisions the guide can make and the external actions that always need a click.
- `configuration.md`: server-side model, key, bridge, and deployment settings.

The runtime will always load `SKILL.md`, choose one topic skill with a deterministic local router, and attach only the relevant sections from `public-notes.md`. Recent user messages remain part of topic selection so short follow-ups such as “tell me more” retain the prior subject.

## Model and latency decisions

- Change the default from `qwen/qwen3-32b` to `openai/gpt-4.1-mini`.
- Do not use Anthropic models or Anthropic fallbacks.
- Keep the model override configurable through `PORTFOLIO_OPENROUTER_MODEL`.
- Stream tokens through the server instead of waiting for a complete upstream response.
- Ask OpenRouter to prefer the lowest-latency provider and retain provider fallback within the selected non-Anthropic model.
- Remove explicit reasoning configuration; this conversation does not need a reasoning model.
- Reduce recent message history from eight messages to six and reduce the default output ceiling so common answers remain quick.
- Retain a bounded server timeout, request-size validation, output-size limits, rate limiting, no-store response headers, and server-only API credentials.

## Model comparison: August 30, 2026

The two models were tested against the same portfolio prompts and the same server prompt, routing, limits, and no-dash normalization.

| Model | Result | Audience fit |
| --- | --- | --- |
| `openai/gpt-4o-mini` | Warm direct requests were usually about 0.6 to 1.4 seconds, but two full scripted runs failed the quality gate. It used generic language such as “feel free to ask,” and one follow-up attached “potential sales growth” to systems whose notes do not establish that outcome. | Fast, but less consistent and more profile-like. |
| `openai/gpt-4.1-mini` | The full 12-case live suite passed twice. The latest run averaged 794 ms to first streamed text and 1,421 ms total, with grounded follow-up continuity and no typographic dash punctuation. | Better match for the warm, specific, understated portfolio voice. |

Decision: keep `openai/gpt-4.1-mini` in the local `.env` and deployment example. The warm-response speed advantage from 4o-mini is less important here than avoiding generic or unsupported claims. The 4o-mini process was stopped after the comparison; it was not written into the persistent configuration.

## Interface changes

- Remove “agent,” “AI,” “resume context,” “resume-grounded,” “live model,” and similar implementation language from the visible conversation surface.
- Replace the welcome message with a short human opening.
- Use one branded, iMessage-like message surface with “Haseeb's notes” as the voice label without pretending that Haseeb is actively typing.
- Remove the separate scope panel and resume/contact links. Keep the boundary as one quiet line below the composer.
- Add playful, grounded starter prompts and a small connections menu rather than implementation labels.
- Add a draft-only “Write a note” handoff that opens the visitor's own mail app. Never send mail from the page.
- Show Messages as “Needs setup” until a user-owned macOS bridge is configured. A browser has no direct Apple Messages access.
- Replace the thinking label with a quiet transient loading state; streamed text should appear as soon as the first token arrives.
- Rewrite error messages in visitor-facing language and keep retry/reset behavior.
- Reveal each arriving message line with a short rise and blur, while respecting reduced-motion preferences.

## Autonomy and deployment boundary

- The guide may route a topic, carry context across a follow-up, choose a concise set of facts, and prepare a draft.
- It may not silently send email or Messages, read private systems, schedule, accept work, commit, deploy, or claim that Haseeb is present.
- The current stack is React Router SSR on Node, with a server-side OpenRouter request. The Dockerfile already builds the app and starts `react-router-serve`.
- A virtual or container deployment can run this route when HTTPS, the server-only `PORTFOLIO_OPENROUTER_API_KEY`, `PORTFOLIO_OPENROUTER_MODEL`, and `PORTFOLIO_SITE_URL` are configured. Keep the bridge URL disabled until its authenticated consent flow exists.
- Local deployment is configured and live-tested. Production deployment still needs a chosen host, domain/HTTPS, observability, and a rotated key.

## Acceptance examples

### Greeting

Visitor: `hi`

Desired: `Hey, good to see you. What's on your mind?`

The reply must not introduce Haseeb's title, list capabilities, include contact details, or ask the visitor to “explore” anything.

### Current work

Visitor: `What are you building right now?`

Desired shape: begin with the current center of gravity, name at most two connected systems, explain why the work matters, and stop. Do not paste every Summon Electronics bullet or use “key efforts include.”

### Unknown personal preference

Visitor: `What kind of music do you like?`

Desired shape: say there is no reliable public note on that, then make one light redirect. Do not mention context windows, retrieval, system prompts, or the resume.

### Identity check

Visitor: `Are you actually Haseeb?`

Desired: clearly say this is a conversational guide to Haseeb's published work, not Haseeb in a live chat.

## Verification

- Validate that every Markdown skill has clear triggers, consistent terminology, concrete examples, and direct links from `SKILL.md`.
- Run `npm run typecheck` and `npm run build`.
- Verify the raw Markdown imports are included in the server build.
- Exercise topic selection for greeting, current work, named company, named project, technical, contact, education, broad, and follow-up questions.
- Start the local server if a configured OpenRouter key is available; otherwise separate compile/browser proof from live-model proof.
- Inspect `/agent` at desktop and mobile widths.
- Verify first-token streaming, reset, retry, Enter, Shift+Enter, abort-on-navigation, and visitor-facing errors.
- Confirm that `/resume` and the existing portfolio pages remain unchanged.

## Live verification record: August 30, 2026

- Configured the user-supplied OpenRouter key in the ignored local `.env` file for testing. It is not tracked or bundled. Because the key was pasted into chat, rotate it before any shared or production deployment.
- Confirmed the selected live model was `openai/gpt-4.1-mini`.
- Ran twelve live response checks through the local `/api/chat` route: greeting, current work, project explanation, authentication evidence, unknown personal information, identity honesty, short overview, systems-depth project selection, contact, career continuity, prompt-boundary handling, and multi-turn follow-up continuity.
- The final live run passed all twelve checks with an average first streamed text time of 810 ms and an average total response time of 1,327 ms.
- The final greeting path returned in 249 ms in the development server. Greetings, acknowledgements, goodbyes, and hidden-prompt requests use deterministic short responses and do not spend a model request.
- An earlier uncached model-backed greeting took 13.4 seconds and produced generic wording. That result was treated as a failure and led to the deterministic social-response path.
- Live testing found and repaired two routing gaps: `authentication`/`secure` did not initially select technical evidence, and `before Summon` initially loaded only Summon instead of the career chronology.
- Live testing also tightened metric attribution: the approximately 1 ms indexed path may not be called sub-millisecond, and the roughly 30% sales contribution stays attached to lead-management and GTM automation rather than the AI or parts-data systems.
- Opened `/agent` in a real browser against the live local API, inspected the redesigned single-pane surface, opened Connections, opened the email draft panel, and confirmed the page title and accessible controls.
- The local server remains available at `http://127.0.0.1:5173/agent` for browser testing. The live checks are local provider proof, not production-domain verification.
- Production deployment remains unproven until a host and domain are selected and the deployed API route, HTTPS, rate limiting, logs, and provider credentials are checked there.
