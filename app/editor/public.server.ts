import { safeUrl, type ContentPayload, type ContentKind } from "./types";
import { getPublicContent, storageLabel } from "./store.server";
import { sectionsBody } from "./seed";
import type { Project } from "../data/projects";
import type { Experience } from "../data/experience";
import type { Book } from "../data/books";
import type { Blog, Post } from "../data/blogs";
import type { Block, CaseStudy, CaseStudySection } from "../data/case-studies";

let pending: ReturnType<typeof getPublicContent> | undefined;
/** Coalesce concurrent loaders, while making every subsequent request read fresh publications. */
export async function managedContent(
  kind: ContentKind,
): Promise<ContentPayload[] | null> {
  if (storageLabel() === "Not configured") return null;
  try {
    pending ??= getPublicContent().finally(() => {
      pending = undefined;
    });
    return (await pending).filter((p) => p.kind === kind);
  } catch {
    return null;
  }
}
export function display<T>(p: ContentPayload): Partial<T> {
  try {
    return JSON.parse(p.display || "{}");
  } catch {
    return {};
  }
}
export function asProject(p: ContentPayload): Project {
  const base = display<Project>(p);
  return {
    ...base,
    name: p.title,
    tagline: p.summary,
    year: p.subtitle || base.year || "",
    stack: p.tags,
    live: p.url || null,
    code: p.code,
    letter: base.letter || p.title.charAt(0),
    color: base.color || "bg-gray-700",
    popup: p.image
      ? { image: p.image, description: base.popup?.description || p.summary }
      : undefined,
  };
}
export function asExperience(p: ContentPayload): Experience {
  const base = display<Experience>(p);
  return {
    org: p.title,
    role: p.subtitle,
    year: base.year || "",
    summary: p.summary,
    stack: p.tags,
    bullets: p.body
      .split("\n")
      .map((b) => b.replace(/^- /, "").trim())
      .filter(Boolean),
  };
}
export function asBook(p: ContentPayload): Book {
  const base = display<Book>(p);
  const originalImage = base.isbn13
    ? `https://covers.openlibrary.org/b/isbn/${base.isbn13}-M.jpg`
    : "";
  return {
    title: p.title,
    author: p.subtitle,
    isbn13: base.isbn13,
    genres: p.tags,
    note: p.summary,
    favorite: p.featured,
    ...(p.image !== originalImage ? { cover: p.image } : {}),
  };
}
export function asBlog(p: ContentPayload): Blog {
  return {
    title: p.title,
    author: p.subtitle,
    note: p.summary,
    url: p.url,
    featured: p.featured,
    kind: display<Blog>(p).kind,
  };
}
export function asPost(p: ContentPayload): Post {
  return {
    title: p.title,
    date: p.subtitle,
    url: p.url || `/writing/${p.slug}`,
    summary: p.summary,
  };
}
function bodySections(body: string): CaseStudySection[] {
  const sections: CaseStudySection[] = [];
  let section: CaseStudySection = {
    id: "overview",
    title: "Overview",
    blocks: [],
  };
  for (const text of body.split(/\n\s*\n/).filter(Boolean)) {
    if (text.startsWith("## ")) {
      if (section.blocks.length) sections.push(section);
      section = {
        id: `section-${sections.length}`,
        title: text.slice(3),
        blocks: [],
      };
      continue;
    }
    const image = /^!\[([^\]]+)\]\(([^)]+)\)$/.exec(text.trim());
    const block: Block =
      image && safeUrl(image[2], true)
        ? { kind: "figure", src: image[2], alt: image[1], caption: image[1] }
        : text.startsWith("### ")
          ? { kind: "h", text: text.slice(4) }
          : text.split("\n").every((l) => l.startsWith("- "))
            ? { kind: "list", items: text.split("\n").map((l) => l.slice(2)) }
            : { kind: "p", text };
    section.blocks.push(block);
  }
  if (section.blocks.length) sections.push(section);
  return sections;
}
export function asCaseStudy(p: ContentPayload): CaseStudy {
  const base = display<CaseStudy>(p);
  const sections =
    base.sections && p.body === sectionsBody(base.sections)
      ? base.sections
      : bodySections(p.body);
  return {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    org: base.org || "Independent work",
    role: p.subtitle,
    team: base.team || "",
    stack: p.tags,
    scope: base.scope || "",
    excerpt: base.excerpt || p.summary,
    sections,
    provenance: p.evidence,
  };
}
