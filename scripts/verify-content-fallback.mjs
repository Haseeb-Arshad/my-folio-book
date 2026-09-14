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
  });

  // An unused esbuild define is stripped and cannot bust the module cache.
  // The unique source suffix gives every scenario a fresh client singleton.
  const source =
    bundled.outputFiles[0].text + `\n// scenario ${Math.random()}\n`;
  return import(
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  );
}

const staticCounts = {
  projects: 11,
  experience: 3,
  blogs: 8,
  books: 11,
  caseStudies: 3,
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
  assert.equal(
    experience.length,
    staticCounts.experience,
    "experience fell back",
  );
  assert.equal(blogs.length, staticCounts.blogs, "blogs fell back");
  assert.equal(books.length, staticCounts.books, "books fell back");
  assert.equal(
    caseStudies.length,
    staticCounts.caseStudies,
    "case studies fell back",
  );
  assert.deepEqual(liveNotes, [], "live notes are empty without a database");
  assert.ok(
    projects.every((p) => p.name && p.code),
    "fallback projects keep their shape",
  );
  assert.ok(
    books.every((b) => b.title && b.author && b.note),
    "fallback books keep their shape",
  );
  assert.ok(
    books.some((b) => b.favorite),
    "at least one fallback book is marked favourite",
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
    "case studies fell back",
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
    "every project link has a destination",
  );
  console.log("  project link table  -> resolves offline");
}

// A populated CMS must not hide release-owned product stories or ChatGideon.
{
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input instanceof Request ? input.url : input);
    const data = url.includes("/projects")
      ? [
          {
            name: "Existing CMS project",
            tagline: "Keep this copy",
            year: "2026",
            stack: [],
            code_url: "/work/existing",
            letter: "E",
            color: "bg-gray-900",
          },
        ]
      : [
          {
            slug: "existing-story",
            title: "CMS story",
            summary: "Keep this story",
            org: "Example",
            role: "Engineer",
            team: "",
            scope: "",
            excerpt: "",
            sections: [],
            stack: [],
          },
        ];
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const content = await loadContent({
      SUPABASE_URL: "https://cms.example.invalid",
      SUPABASE_SECRET_KEY: "sb_secret_fixture_only",
    });
    const projects = await content.getProjects();
    const studies = await content.getCaseStudies();
    assert.equal(projects.filter((p) => p.name === "ChatGideon").length, 1);
    assert.ok(
      projects.some(
        (p) =>
          p.name === "Existing CMS project" && p.tagline === "Keep this copy",
      ),
    );
    assert.deepEqual(studies.map((s) => s.slug).sort(), [
      "chatgideon",
      "existing-story",
      "incillum",
    ]);
    assert.equal(
      (await content.getCaseStudy("chatgideon")).title,
      "ChatGideon",
    );
    assert.equal(await content.getCaseStudy("missing-story"), undefined);
    console.log(
      "  populated CMS       -> existing content preserved, product stories available",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
}

console.log("Content fallback verified across 4 scenarios.");
