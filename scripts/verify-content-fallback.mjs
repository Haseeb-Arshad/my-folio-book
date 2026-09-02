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

async function loadContent(env) {
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
  blogs: 10,
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

console.log("Content fallback verified across 3 scenarios.");
