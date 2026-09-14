# Work showcase: implementation and evidence

The user requested the Work redesign, ChatGideon addition, official branding and visual project demonstrations, then authorized implementation with “do it”. This change is local and has not been deployed.

## Content and assets

- Incillum: public website at https://incillum.com, inspected in the browser. The logo matches `E:/projects/incillum/public/logo.png` by SHA-256. Screenshots cover the public introduction and its illustrative cost/margin example. All scenario figures remain explicitly illustrative. No internal platform screens or customer records are included.
- ChatGideon: logo from `E:/projects/ChatGideon/chat-gideon/public/gideon-192.png`. Screenshots captured from the local app using a sample compiler/interpreter question, with voice muted. The typed turn returned an answer. The timing panel shows that one run only; it is not a voice benchmark. The question image was captured as a staged input state after resetting the same sample conversation, not a second completed turn.
- Lead Truth Engine: existing public case-study copy and diagrams retained. No additional employer claims or internal assets added.
- All six screenshot assets are JPEG, approximately 30–60 KB each. No generated product screenshots, invented testimonials or outcome figures.

## Content behavior

`project-stories.ts` owns the two new product overviews and three featured presentations. Product overviews are released with their local media. Existing database-backed engineering stories remain database-first. A missing ChatGideon project is supplemented from the static entry; existing CMS projects and the earlier Gideon entry remain intact. No database writes or schema changes were needed.

## Verification

- Production build and TypeScript checks passed.
- Content verifier covers absent credentials, unreachable database, agent project links and a populated mock CMS.
- Fixed the verifier's pre-existing ineffective cache-busting: an unused esbuild define was removed, so repeated imports reused the initial client singleton. A unique source suffix now actually isolates scenarios.
- Browser checks: Work → ChatGideon navigation, walkthrough step changes, native image dialog opening, close focus, Escape dismissal and focus restoration.
- Mobile (390px) pages checked for horizontal overflow; desktop and tablet layouts inspected.

## Scope

Existing `app/components/agent-box.tsx` edits were present before this task and were not modified. No commit, push or deployment was performed. The new demonstrations are interactive screenshot walkthroughs, not recordings of voice playback. The Incillum overview describes public product intent, not production runtime proof.

Browser console note: the inspected Chrome session injects `cz-shortcut-listen` on the body, producing a React hydration warning attributed to the browser extension. This was not suppressed in application code. Walkthrough and dialog interactions still passed.

The public ChatGideon URL was verified separately: `https://chatgideon.com` returned HTML with the title `GIDEON — Voice Presence`. A direct visit link is included. This establishes the destination, not an end-to-end production voice test.
