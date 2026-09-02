/**
 * Migrates the content that currently lives in app/data/*.ts into Supabase.
 *
 * Idempotent: every row is upserted on its natural key, so running this twice
 * changes nothing. Edits made in the Supabase dashboard are overwritten for the
 * seeded columns, so treat the static files as the source of truth until you
 * decide to edit in the dashboard instead.
 */
import { build } from "esbuild";
import pg from "pg";
import { loadEnv, resolveDatabaseUrl } from "./supabase-env.mjs";

loadEnv();

/** The data files are TypeScript, so bundle them before importing. */
async function loadModule(entry) {
  const bundled = await build({
    entryPoints: [entry],
    absWorkingDir: process.cwd(),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    write: false,
  });
  const source = bundled.outputFiles[0].text;
  return import(
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const { projects } = await loadModule("app/data/projects.ts");
const { experience } = await loadModule("app/data/experience.ts");
const { caseStudies } = await loadModule("app/data/case-studies.ts");
const { favorites, posts } = await loadModule("app/data/blogs.ts");
const { books } = await loadModule("app/data/books.ts");

const client = new pg.Client({
  connectionString: resolveDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});

await client.connect();

const counts = {};

try {
  await client.query("begin");

  // ── projects ────────────────────────────────────────────────
  for (const [index, p] of projects.entries()) {
    await client.query(
      `insert into public.projects
         (slug, name, tagline, year, stack, live_url, code_url, logo, letter,
          color, status, links, popup_image, popup_description, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15)
       on conflict (slug) do update set
         name = excluded.name,
         tagline = excluded.tagline,
         year = excluded.year,
         stack = excluded.stack,
         live_url = excluded.live_url,
         code_url = excluded.code_url,
         logo = excluded.logo,
         letter = excluded.letter,
         color = excluded.color,
         status = excluded.status,
         links = excluded.links,
         popup_image = excluded.popup_image,
         popup_description = excluded.popup_description,
         sort_order = excluded.sort_order`,
      [
        slugify(p.name),
        p.name,
        p.tagline,
        p.year,
        p.stack,
        p.live ?? null,
        p.code,
        p.logo ?? null,
        p.letter,
        p.color,
        p.status ?? null,
        JSON.stringify(p.links ?? []),
        p.popup?.image ?? null,
        p.popup?.description ?? null,
        index,
      ]
    );
  }
  counts.projects = projects.length;

  // ── experience ──────────────────────────────────────────────
  for (const [index, job] of experience.entries()) {
    await client.query(
      `insert into public.experience
         (slug, role, org, year, summary, stack, bullets, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (slug) do update set
         role = excluded.role,
         org = excluded.org,
         year = excluded.year,
         summary = excluded.summary,
         stack = excluded.stack,
         bullets = excluded.bullets,
         sort_order = excluded.sort_order`,
      [
        slugify(job.org),
        job.role,
        job.org,
        job.year,
        job.summary,
        job.stack,
        job.bullets,
        index,
      ]
    );
  }
  counts.experience = experience.length;

  // ── case_studies ────────────────────────────────────────────
  // `published` is deliberately left out of the update list. The column
  // defaults to false, and whether a write-up about employer work is live is
  // a decision made once in the dashboard, not something a re-seed should
  // silently flip back or forward.
  for (const [index, study] of caseStudies.entries()) {
    await client.query(
      `insert into public.case_studies
         (slug, title, summary, org, role, team, stack, scope,
          excerpt, sections, provenance, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
       on conflict (slug) do update set
         title = excluded.title,
         summary = excluded.summary,
         org = excluded.org,
         role = excluded.role,
         team = excluded.team,
         stack = excluded.stack,
         scope = excluded.scope,
         excerpt = excluded.excerpt,
         sections = excluded.sections,
         provenance = excluded.provenance,
         sort_order = excluded.sort_order`,
      [
        study.slug,
        study.title,
        study.summary,
        study.org,
        study.role,
        study.team,
        study.stack,
        study.scope,
        study.excerpt,
        JSON.stringify(study.sections ?? []),
        study.provenance ?? "",
        index,
      ]
    );
  }
  counts.case_studies = caseStudies.length;

  // ── blogs ───────────────────────────────────────────────────
  for (const [index, blog] of favorites.entries()) {
    await client.query(
      `insert into public.blogs (title, author, url, note, featured, sort_order)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (url) do update set
         title = excluded.title,
         author = excluded.author,
         note = excluded.note,
         featured = excluded.featured,
         sort_order = excluded.sort_order`,
      [blog.title, blog.author, blog.url, blog.note, blog.featured ?? false, index]
    );
  }
  counts.blogs = favorites.length;

  // ── posts ───────────────────────────────────────────────────
  for (const [index, post] of posts.entries()) {
    await client.query(
      `insert into public.posts (slug, title, label, url, summary, sort_order, published)
       values ($1,$2,$3,$4,$5,$6,true)
       on conflict (slug) do update set
         title = excluded.title,
         label = excluded.label,
         url = excluded.url,
         summary = excluded.summary,
         sort_order = excluded.sort_order`,
      [slugify(post.title), post.title, post.date, post.url, post.summary, index]
    );
  }
  counts.posts = posts.length;

  // ── books ───────────────────────────────────────────────────
  for (const [index, book] of books.entries()) {
    await client.query(
      `insert into public.books
         (slug, title, author, isbn13, genres, note, favorite, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (slug) do update set
         title = excluded.title,
         author = excluded.author,
         isbn13 = excluded.isbn13,
         genres = excluded.genres,
         note = excluded.note,
         favorite = excluded.favorite,
         sort_order = excluded.sort_order`,
      [
        slugify(`${book.title} ${book.author}`),
        book.title,
        book.author,
        book.isbn13 ?? null,
        book.genres,
        book.note,
        book.favorite ?? false,
        index,
      ]
    );
  }
  counts.books = books.length;

  // ── live_notes ──────────────────────────────────────────────
  // Nothing to migrate: this table has no static counterpart. Seed one row so
  // the agent path is exercised end to end and the shape is obvious in the
  // dashboard. Safe to edit or delete.
  await client.query(
    `insert into public.live_notes (label, value, sort_order)
     select 'Currently building',
            'The systems behind Summon Electronics, plus this site.',
            0
     where not exists (select 1 from public.live_notes)`
  );

  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}

console.log("Seeded:", counts);
