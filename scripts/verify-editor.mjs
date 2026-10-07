import assert from "node:assert/strict";
import { build } from "esbuild";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

async function moduleFor(entry) {
  const output = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    banner: {
      js: 'import { createRequire as testCreateRequire } from "node:module"; const require = testCreateRequire(process.cwd()+"/package.json");',
    },
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(output.outputFiles[0].text).toString("base64")
  );
}
const types = await moduleFor("app/editor/types.ts");
const seed = await moduleFor("app/editor/seed.ts");
const store = await moduleFor("app/editor/store.server.ts");
const auth = await moduleFor("app/editor/auth.server.ts");
const publicAdapter = await moduleFor("app/editor/public.server.ts");
const projects = await moduleFor("app/data/projects.ts");
const books = await moduleFor("app/data/books.ts");
const experience = await moduleFor("app/data/experience.ts");
const caseStudies = await moduleFor("app/data/case-studies.ts");
let state = seed.seedState();
const publicSeed = types.publishedEntries(state);
const serializable = (value) => JSON.parse(JSON.stringify(value));
assert.deepEqual(
  serializable(
    publicSeed.filter((p) => p.kind === "project").map(publicAdapter.asProject),
  ),
  serializable(projects.projects),
  "original project cards keep names, destinations, logos and previews",
);
assert.deepEqual(
  serializable(
    publicSeed
      .filter((p) => p.kind === "experience")
      .map(publicAdapter.asExperience),
  ),
  serializable(experience.experience),
  "original experience presentation is preserved",
);
assert.deepEqual(
  serializable(
    publicSeed.filter((p) => p.kind === "book").map(publicAdapter.asBook),
  ),
  serializable(
    books.books.map((b) => ({ ...b, favorite: Boolean(b.favorite) })),
  ),
  "original books and ISBN covers are preserved",
);
assert.deepEqual(
  serializable(
    publicSeed
      .filter((p) => p.kind === "case-study")
      .map(publicAdapter.asCaseStudy),
  ),
  serializable(caseStudies.caseStudies),
  "original case study metrics, callouts and context survive unchanged",
);
assert.equal(
  publicSeed.filter((p) => p.kind === "post").length,
  0,
  "suggested writing remains unpublished",
);
for (const entry of state.entries) types.validatePayload(entry.draft);
assert.throws(
  () =>
    types.validatePayload({
      ...state.entries[0].draft,
      display: JSON.stringify({
        sections: [
          {
            id: "bad",
            title: "Bad",
            blocks: [{ kind: "metrics", rows: [{}] }],
          },
        ],
      }),
    }),
  /Invalid case study/,
);
assert.throws(
  () =>
    types.validatePayload({
      ...state.entries[0].draft,
      display: JSON.stringify({
        links: [{ label: "Bad", href: "javascript:alert(1)" }],
      }),
    }),
  /HTTPS/,
);
const original = state.entries.find((e) => e.draft.kind === "project");
assert.equal(
  types.publishedEntries(state).filter((e) => e.kind === "case-study").length,
  1,
);
const changed = {
  ...original.draft,
  title: "Unpublished edit",
  slug: "unpublished-edit",
};
state = store.applyCommand(state, {
  action: "save",
  id: original.id,
  version: 0,
  payload: changed,
});
assert.equal(
  types.publishedEntries(state).find((e) => e.id === original.id).updatedAt,
  original.publishedAt,
  "draft saves preserve publication dates",
);
assert.equal(
  types.publishedEntries(state).find((e) => e.id === original.id).title,
  original.draft.title,
  "saving a draft preserves published content",
);
assert.throws(
  () =>
    store.applyCommand(state, {
      action: "save",
      version: 0,
      payload: original.draft,
    }),
  /already uses/,
  "published slugs remain reserved when a draft changes slug",
);
assert.throws(
  () =>
    store.applyCommand(state, {
      action: "save",
      id: original.id,
      version: 0,
      payload: changed,
    }),
  /another tab/,
  "stale edits cannot overwrite newer content",
);
state = store.applyCommand(state, {
  action: "publish",
  id: original.id,
  version: 1,
  payload: changed,
});
assert.equal(
  types.publishedEntries(state).find((e) => e.id === original.id).title,
  "Unpublished edit",
);
state = store.applyCommand(state, {
  action: "unpublish",
  id: original.id,
  version: 2,
});
assert.ok(!types.publishedEntries(state).some((e) => e.id === original.id));
state = store.applyCommand(state, {
  action: "revision",
  id: original.id,
  version: 3,
  revision: 2,
});
assert.equal(
  state.entries.find((e) => e.id === original.id).draft.title,
  original.draft.title,
);
assert.ok(
  !types.publishedEntries(state).some((e) => e.id === original.id),
  "restoring history does not republish",
);
assert.throws(
  () =>
    store.applyCommand(state, {
      action: "publish",
      version: 0,
      payload: {
        ...types.emptyPayload("knowledge"),
        title: "Private fact",
        body: "Private",
        visibility: "private",
        agentApproved: true,
      },
    }),
  /Private/,
);
assert.throws(
  () => types.validatePayload({ ...changed, url: "javascript:alert(1)" }),
  /HTTPS/,
);
assert.throws(
  () =>
    types.validatePayload({
      ...changed,
      image: "//untrusted.example/image.png",
    }),
  /HTTPS/,
);
assert.ok(types.safeUrl("mailto:owner@example.com"));
assert.equal(
  types.safeUrl("mailto:owner@example.com", true),
  false,
  "email destinations are not valid image URLs",
);
assert.throws(
  () =>
    store.applyCommand(state, {
      action: "publish",
      version: 0,
      payload: {
        ...types.emptyPayload("resume"),
        title: "Another CV",
        url: "/other.pdf",
      },
    }),
  /Only one/,
  "a second published CV cannot silently override the current one",
);
assert.throws(
  () =>
    store.applyCommand(state, {
      action: "save",
      version: 0,
      payload: state.entries.find((e) => e.draft.kind === "project").draft,
    }),
  /already uses/,
);
for (const entry of [...state.entries].filter((e) => e.published))
  state = store.applyCommand(state, {
    action: "unpublish",
    id: entry.id,
    version: entry.version,
  });
assert.deepEqual(
  types.publishedEntries(state),
  [],
  "intentional empty publication remains empty",
);
console.log(
  "Draft/publish isolation, revision restore, slug validation, URL validation and optimistic concurrency passed.",
);

const directory = await mkdtemp(
  path.join(os.tmpdir(), "portfolio-editor-test-"),
);
process.env.PORTFOLIO_EDITOR_DRIVER = "file";
process.env.PORTFOLIO_EDITOR_FILE = path.join(directory, "editor.json");
process.env.NODE_ENV = "development";
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SECRET_KEY;
try {
  const payload = {
    ...types.emptyPayload("knowledge"),
    title: "Approved public fact",
    summary: "This fact is approved for publication.",
    agentApproved: true,
  };
  let entry = await store.writeEditor({ action: "save", version: 0, payload });
  assert.deepEqual(
    await store.approvedAgentNotes(),
    [],
    "draft facts stay out of agent context",
  );
  entry = await store.writeEditor({
    action: "publish",
    id: entry.id,
    version: entry.version,
    payload: entry.draft,
  });
  assert.equal((await store.approvedAgentNotes())[0].label, payload.title);
  entry = await store.writeEditor({
    action: "unpublish",
    id: entry.id,
    version: entry.version,
  });
  assert.deepEqual(
    await store.approvedAgentNotes(),
    [],
    "unpublished facts disappear without cache lag",
  );
  const raw = JSON.parse(
    await readFile(process.env.PORTFOLIO_EDITOR_FILE, "utf8"),
  );
  assert.ok(
    raw.entries.some((e) => e.id === entry.id),
    "file storage survives rereads",
  );
  assert.ok(
    !JSON.stringify(await store.getPublicContent()).includes(
      "Approved public fact",
    ),
    "private editor content is absent from public loaders",
  );
  const content = await moduleFor("app/data/content.server.ts");
  const project = (await store.readEditor()).entries.find(
    (e) => e.draft.kind === "project",
  );
  const nextDraft = { ...project.draft, title: "Isolated publication check" };
  let edited = await store.writeEditor({
    action: "save",
    id: project.id,
    version: project.version,
    payload: nextDraft,
  });
  assert.ok(
    (await content.getProjects()).some((p) => p.name === project.draft.title),
    "draft save leaves original Work content public",
  );
  edited = await store.writeEditor({
    action: "publish",
    id: edited.id,
    version: edited.version,
    payload: edited.draft,
  });
  assert.ok(
    (await content.getProjects()).some((p) => p.name === nextDraft.title),
    "publish reaches the original Work content reader",
  );
  await store.writeEditor({
    action: "unpublish",
    id: edited.id,
    version: edited.version,
  });
  assert.ok(
    !(await content.getProjects()).some((p) => p.name === nextDraft.title),
    "unpublish removes the item from the original Work content reader",
  );
  console.log(
    "Durable local storage and published-only agent knowledge passed.",
  );
} finally {
  const target = path.resolve(directory);
  assert.ok(
    target.startsWith(path.resolve(os.tmpdir()) + path.sep) &&
      path.basename(target).startsWith("portfolio-editor-test-"),
  );
  await rm(target, { recursive: true, force: true });
}

process.env.PORTFOLIO_ADMIN_KEY = "disposable-test-access-key-for-editor-only";
const cookie = (await auth.signInCookie()).split(";")[0];
const request = new Request("http://localhost:5173/admin", {
  headers: { Cookie: cookie },
});
const session = await auth.ownerSession(request);
assert.ok(session?.csrf);
assert.equal(
  await auth.ownerSession(
    new Request("http://localhost:5173/admin", {
      headers: { Cookie: "portfolio_owner=tampered" },
    }),
  ),
  null,
);
assert.equal(auth.checkAdminKey("wrong"), false);
const form = new FormData();
form.set("csrf", session.csrf);
auth.checkCsrf(
  new Request("http://localhost:5173/admin", {
    headers: { Origin: "http://localhost:5173" },
  }),
  session,
  form,
);
assert.throws(() =>
  auth.checkCsrf(
    new Request("http://localhost:5173/admin", {
      headers: { Origin: "https://another.example" },
    }),
    session,
    form,
  ),
);
form.set("csrf", "wrong");
assert.throws(() =>
  auth.checkCsrf(
    new Request("http://localhost:5173/admin", {
      headers: { Origin: "http://localhost:5173" },
    }),
    session,
    form,
  ),
);
process.env.PORTFOLIO_ADMIN_KEY = "rotated-test-access-key-for-editor-only";
assert.equal(
  await auth.ownerSession(request),
  null,
  "key rotation invalidates old owner sessions",
);
console.log(
  "Signed owner sessions, key rotation, origin checks and CSRF rejection passed.",
);

const db = new PGlite();
try {
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls;",
  );
  const file = (await readdir("supabase/migrations")).find((f) =>
    f.endsWith("_portfolio_editor.sql"),
  );
  await db.exec(await readFile(path.join("supabase/migrations", file), "utf8"));
  await db.exec(
    "insert into public.portfolio_editor_state (id) values ('portfolio');",
  );
  const security = await db.query(
    "select relrowsecurity, relforcerowsecurity from pg_class where relname='portfolio_editor_state'",
  );
  assert.deepEqual(security.rows[0], {
    relrowsecurity: true,
    relforcerowsecurity: true,
  });
  await db.exec("set role anon;");
  await assert.rejects(
    () => db.query("select * from public.portfolio_editor_state"),
    /permission denied/,
  );
  await db.exec("reset role; set role authenticated;");
  await assert.rejects(
    () => db.query("select * from public.portfolio_editor_state"),
    /permission denied/,
  );
  await db.exec("reset role; set role service_role;");
  assert.equal(
    (
      await db.query(
        "select count(*)::int as n from public.portfolio_editor_state",
      )
    ).rows[0].n,
    1,
  );
  const first = await db.query(
    "update public.portfolio_editor_state set version=1 where id='portfolio' and version=0 returning version",
  );
  const stale = await db.query(
    "update public.portfolio_editor_state set version=2 where id='portfolio' and version=0 returning version",
  );
  assert.equal(first.rows.length, 1);
  assert.equal(stale.rows.length, 0);
  console.log(
    "Migration, forced RLS, closed anonymous/authenticated grants and atomic version guard passed.",
  );
} finally {
  await db.close();
}
console.log("Portfolio editor verification passed.");
