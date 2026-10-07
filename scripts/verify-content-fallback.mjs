/**
 * The site must render correctly when Supabase is unreachable, misconfigured,
 * or simply absent (a fresh clone, CI, an incident). This asserts that every
 * content read degrades to the committed data files instead of throwing.
 *
 * Runs with deliberately broken credentials, so it never touches the real
 * project and needs no secrets.
 */
import assert from "node:assert/strict";
import { build } from "esbuild";

async function loadContent(env, emptyDatabase = false) {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("SUPABASE_")) delete process.env[key];
  }
  Object.assign(process.env, env);

  const bundled = await build({
    entryPoints: ["app/data/content.server.ts"],
    absWorkingDir: process.cwd(),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    write: false,
    banner: { js: 'import { createRequire as testCreateRequire } from "node:module"; const require = testCreateRequire(process.cwd()+"/package.json");' },
    plugins: emptyDatabase ? [{ name: "healthy-empty-database", setup(builder) {
      builder.onResolve({ filter: /supabase\.server$/ }, () => ({ path: "empty-database", namespace: "test" }));
      builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({ contents: `const query = { select: () => query, eq: () => query, order: () => query, then: resolve => Promise.resolve({ data: [], error: null, count: ${emptyDatabase === "unseeded" ? 0 : 1} }).then(resolve), maybeSingle: async () => ({ data: ${emptyDatabase === "unseeded" ? "null" : "{version:0,entries:[]}"}, error:null }) }; export const supabaseServer = () => ({ from: () => query });`, loader: "js" }));
    }}] : [],
    // Bust the module cache so each scenario re-evaluates the client singleton.
    define: { __SCENARIO__: JSON.stringify(String(Math.random())) },
  });

  const source = bundled.outputFiles[0].text;
  return import(
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  );
}

const staticCounts = {
  projects: 10,
  experience: 3,
  blogs: 8,
  books: 11,
  caseStudies: 1,
};

// ── Scenario 1: no Supabase configured at all ─────────────────
{
  const content = await loadContent({});
  const [projects, experience, blogs, books, caseStudies, liveNotes] =
    await Promise.all([
      content.getProjects(),
      content.getExperience(),
      content.getBlogs(),
      content.getBooks(),
      content.getCaseStudies(),
      content.getLiveNotes(),
    ]);

  assert.equal(projects.length, staticCounts.projects, "projects fell back");
  assert.equal(experience.length, staticCounts.experience, "experience fell back");
  assert.equal(blogs.length, staticCounts.blogs, "blogs fell back");
  assert.equal(books.length, staticCounts.books, "books fell back");
  assert.equal(
    caseStudies.length,
    staticCounts.caseStudies,
    "case studies fell back"
  );
  assert.deepEqual(liveNotes, [], "live notes are empty without a database");
  assert.ok(
    projects.every((p) => p.name && p.code),
    "fallback projects keep their shape"
  );
  assert.ok(
    books.every((b) => b.title && b.author && b.note),
    "fallback books keep their shape"
  );
  assert.ok(
    books.some((b) => b.favorite),
    "at least one fallback book is marked favourite"
  );
  console.log("  unconfigured        -> static data, no throw");
}

// ── Scenario 2: configured but unreachable ────────────────────
{
  const content = await loadContent({
    SUPABASE_URL: "https://offline.invalid",
    SUPABASE_SECRET_KEY: "sb_secret_not_a_real_key",
  });

  const [projects, blogs, caseStudies, liveNotes] = await Promise.all([
    content.getProjects(),
    content.getBlogs(),
    content.getCaseStudies(),
    content.getLiveNotes(),
  ]);

  assert.equal(projects.length, staticCounts.projects, "projects fell back");
  assert.equal(blogs.length, staticCounts.blogs, "blogs fell back");
  assert.equal(
    caseStudies.length,
    staticCounts.caseStudies,
    "case studies fell back"
  );
  assert.deepEqual(liveNotes, [], "live notes stay empty when unreachable");
  console.log("  unreachable host    -> static data, no throw");
}

// ── Scenario 3: the agent's chip lookup still resolves ─────────
{
  const content = await loadContent({});
  const links = await content.projectLinksFrom();
  assert.ok(links.length > 0, "project links resolve offline");
  assert.ok(
    links.every((l) => typeof l.href === "string" && l.href.length > 0),
    "every project link has a destination"
  );
  console.log("  project link table  -> resolves offline");
}

// Successful empty queries represent intentional unpublication, not an outage.
{
  const content = await loadContent({}, true);
  for (const name of ["getProjects", "getExperience", "getBlogs", "getBooks", "getCaseStudies"]) assert.deepEqual(await content[name](), [], `${name} respects an intentionally empty database`);
  console.log("  healthy empty store -> empty content, no resurrection");
}
{
  const content = await loadContent({}, "unseeded");
  assert.equal((await content.getCaseStudies()).length, staticCounts.caseStudies, "the original file-backed case study remains available before its legacy table is seeded");
  console.log("  unseeded legacy case -> original file-backed route retained");
}
console.log("Content fallback verified across 5 scenarios.");
