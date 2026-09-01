import { supabaseServer } from "../lib/supabase.server";
import { projects as staticProjects, type Project } from "./projects";
import { experience as staticExperience, type Experience } from "./experience";
import {
  favorites as staticFavorites,
  posts as staticPosts,
  type Blog,
  type Post,
} from "./blogs";
import type { LiveNote } from "../agent/prompt.server";

/* ───────────────────────────────────────────────────────────
   Content reads, Supabase first and the committed data files
   second.

   The fallback is the point. This is a portfolio: it should
   render correctly on a laptop with no credentials, during a
   Supabase incident, and in CI. A failed query is logged and
   the static copy is served, never an error page.

   Rows are mapped back onto the existing types so nothing
   downstream has to know where the data came from.
   ─────────────────────────────────────────────────────────── */

const CACHE_MS = 60_000;

type Entry<T> = { value: T; at: number };
const cache = new Map<string, Entry<unknown>>();

async function read<T>(key: string, load: () => Promise<T>, fallback: T) {
  const hit = cache.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const client = supabaseServer();
  if (!client) return fallback;

  try {
    const value = await load();
    cache.set(key, { value, at: Date.now() });
    return value;
  } catch (error) {
    console.error(
      `[content] ${key} fell back to static data:`,
      error instanceof Error ? error.message : error
    );
    return fallback;
  }
}

/** Supabase returns { data, error }; make the error a throw so `read` catches it. */
async function rows<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>) {
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProjects(): Promise<Project[]> {
  return read(
    "projects",
    async () => {
      const data = await rows(
        supabaseServer()!
          .from("projects")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
      );
      if (data.length === 0) return staticProjects;

      return data.map((row: Record<string, any>): Project => {
        const popup =
          row.popup_image && row.popup_description
            ? { image: row.popup_image, description: row.popup_description }
            : undefined;
        const links = Array.isArray(row.links) && row.links.length > 0
          ? (row.links as { label: string; href: string }[])
          : undefined;

        return {
          name: row.name,
          tagline: row.tagline,
          year: row.year,
          stack: row.stack ?? [],
          live: row.live_url ?? null,
          code: row.code_url,
          logo: row.logo ?? undefined,
          letter: row.letter,
          color: row.color,
          status: row.status ?? undefined,
          links,
          popup,
        };
      });
    },
    staticProjects
  );
}

export async function getExperience(): Promise<Experience[]> {
  return read(
    "experience",
    async () => {
      const data = await rows(
        supabaseServer()!
          .from("experience")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
      );
      if (data.length === 0) return staticExperience;

      return data.map((row: Record<string, any>): Experience => ({
        role: row.role,
        org: row.org,
        year: row.year,
        summary: row.summary,
        stack: row.stack ?? [],
        bullets: row.bullets ?? [],
      }));
    },
    staticExperience
  );
}

export async function getBlogs(): Promise<Blog[]> {
  return read(
    "blogs",
    async () => {
      const data = await rows(
        supabaseServer()!
          .from("blogs")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
      );
      if (data.length === 0) return staticFavorites;

      return data.map((row: Record<string, any>): Blog => ({
        title: row.title,
        author: row.author,
        url: row.url,
        note: row.note,
        featured: row.featured ?? false,
      }));
    },
    staticFavorites
  );
}

export async function getPosts(): Promise<Post[]> {
  return read(
    "posts",
    async () => {
      const data = await rows(
        supabaseServer()!
          .from("posts")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
      );
      /* Unlike the others an empty result is meaningful here: nothing is
         published yet. Do not fall back. */
      return data.map((row: Record<string, any>): Post => ({
        title: row.title,
        date: row.label,
        url: row.url,
        summary: row.summary,
      }));
    },
    staticPosts
  );
}

/**
 * The lookup table the agent's reply chips match against, derived from the same
 * source as the Work page so a project added in Supabase gets a working chip
 * without a second copy drifting out of sync.
 */
export async function projectLinksFrom(): Promise<
  { name: string; href: string; live: boolean }[]
> {
  const all = await getProjects();
  return all.map((project) => ({
    name: project.name,
    href: project.live ?? project.code,
    live: Boolean(project.live),
  }));
}

/**
 * Facts that change faster than a deploy, handed to the conversation agent as
 * data. Never falls back to anything: if the table is unreachable the agent
 * simply answers from the published notes, which is the correct degradation.
 */
export async function getLiveNotes(): Promise<LiveNote[]> {
  return read(
    "live_notes",
    async () => {
      const data = await rows(
        supabaseServer()!
          .from("live_notes")
          .select("label,value")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .limit(12)
      );
      return data.map((row: Record<string, any>): LiveNote => ({
        label: row.label,
        value: row.value,
      }));
    },
    []
  );
}
