export const contentKinds = [
  "project",
  "case-study",
  "post",
  "book",
  "link",
  "experience",
  "now",
  "profile",
  "contact",
  "resume",
  "note",
  "knowledge",
] as const;
export type ContentKind = (typeof contentKinds)[number];
export type ContentPayload = {
  kind: ContentKind;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  image: string;
  url: string;
  code: string;
  tags: string[];
  featured: boolean;
  order: number;
  visibility: "public" | "private";
  agentApproved: boolean;
  evidence: string;
  display: string;
};
export type ContentRevision = {
  at: string;
  action: string;
  draft: ContentPayload;
  published: ContentPayload | null;
};
export type ContentEntry = {
  id: string;
  version: number;
  draft: ContentPayload;
  published: ContentPayload | null;
  publishedAt?: string;
  archived: boolean;
  updatedAt: string;
  revisions: ContentRevision[];
};
export type EditorState = { version: number; entries: ContentEntry[] };
export type PublicContent = ContentPayload & { id: string; updatedAt: string };

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function emptyPayload(kind: ContentKind = "note"): ContentPayload {
  return {
    kind,
    slug: "",
    title: "",
    subtitle: "",
    summary: "",
    body: "",
    image: "",
    url: "",
    code: "",
    tags: [],
    featured: false,
    order: 0,
    visibility: "public",
    agentApproved: false,
    evidence: "",
    display: "",
  };
}

export function safeUrl(value: string, image = false) {
  if (!value) return true;
  if (
    !image &&
    /^mailto:[a-zA-Z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      value,
    )
  )
    return true;
  if (/^\/(?!\/)/.test(value) && !/[\\\s\x00-\x1f]/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validatePayload(input: unknown): ContentPayload {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Content must be an object.");
  const raw = input as Record<string, unknown>;
  if (!contentKinds.includes(raw.kind as ContentKind))
    throw new Error("Choose a content type.");
  const result = emptyPayload(raw.kind as ContentKind);
  const limits = {
    title: 160,
    subtitle: 240,
    summary: 1600,
    body: 40000,
    slug: 100,
    image: 2000,
    url: 2000,
    code: 2000,
    evidence: 1600,
    display: 60000,
  };
  for (const [key, max] of Object.entries(limits)) {
    const value = key === "display" ? (raw[key] ?? "") : raw[key];
    if (typeof value !== "string" || value.length > max)
      throw new Error(`${key} must be text under ${max} characters.`);
    (result as unknown as Record<string, unknown>)[key] = value.trim();
  }
  if (!result.title) throw new Error("Give this item a title.");
  result.slug ||= slugify(result.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug))
    throw new Error("Use lowercase letters, numbers and hyphens for the slug.");
  for (const key of ["url", "code", "image"] as const)
    if (!safeUrl(result[key], key === "image"))
      throw new Error(`${key} must be an HTTPS URL or a site path.`);
  if (
    !Array.isArray(raw.tags) ||
    raw.tags.length > 20 ||
    raw.tags.some((t) => typeof t !== "string" || t.length > 60)
  )
    throw new Error("Use up to 20 short tags.");
  result.tags = [
    ...new Set(raw.tags.map((t) => String(t).trim()).filter(Boolean)),
  ];
  result.featured = raw.featured === true;
  result.agentApproved = raw.agentApproved === true;
  result.visibility = raw.visibility === "private" ? "private" : "public";
  if (
    typeof raw.order !== "number" ||
    !Number.isInteger(raw.order) ||
    Math.abs(raw.order) > 100000
  )
    throw new Error("Order must be a whole number between -100000 and 100000.");
  result.order = raw.order;
  if (result.display) {
    let details: unknown;
    try {
      details = JSON.parse(result.display);
    } catch {
      throw new Error("Display details must be valid JSON.");
    }
    if (!details || typeof details !== "object" || Array.isArray(details))
      throw new Error("Display details must be a JSON object.");
    function check(value: unknown, key = "", depth = 0) {
      if (depth > 12) throw new Error("Display details are nested too deeply.");
      if (
        typeof value === "string" &&
        ["href", "src", "logo", "image", "url"].includes(key) &&
        !safeUrl(value, ["src", "logo", "image"].includes(key))
      )
        throw new Error(
          "Display image and link destinations must use HTTPS or a site path.",
        );
      if (value && typeof value === "object")
        for (const [k, v] of Object.entries(value)) check(v, k, depth + 1);
    }
    check(details);
    const d = details as Record<string, unknown>;
    for (const key of [
      "year",
      "isbn13",
      "letter",
      "color",
      "logo",
      "role",
      "org",
      "team",
      "scope",
      "excerpt",
      "author",
    ]) {
      if (d[key] !== undefined && typeof d[key] !== "string")
        throw new Error(`Display ${key} must be text.`);
    }
    if (d.kind !== undefined && !["site", "blog"].includes(String(d.kind)))
      throw new Error("Reading display kind must be site or blog.");
    if (d.status !== undefined && d.status !== "building")
      throw new Error("Project display status must be building.");
    if (
      d.links !== undefined &&
      (!Array.isArray(d.links) ||
        d.links.some(
          (l) =>
            !l || typeof l.label !== "string" || typeof l.href !== "string",
        ))
    )
      throw new Error("Display links need a label and href.");
    if (d.sections !== undefined) {
      if (!Array.isArray(d.sections))
        throw new Error("Case study sections must be an array.");
      for (const section of d.sections) {
        if (
          !section ||
          typeof section.id !== "string" ||
          typeof section.title !== "string" ||
          !Array.isArray(section.blocks)
        )
          throw new Error("Case study sections need an id, title and blocks.");
        for (const b of section.blocks) {
          if (!b || typeof b !== "object")
            throw new Error("Invalid case study block.");
          const text = (keys: string[]) =>
            keys.every((k) => typeof b[k] === "string");
          const valid =
            b.kind === "p" || b.kind === "h"
              ? text(["text"])
              : b.kind === "figure"
                ? text(["src", "alt", "caption"])
                : b.kind === "callout"
                  ? text(["title", "text"])
                  : b.kind === "list"
                    ? Array.isArray(b.items) &&
                      b.items.every((i: unknown) => typeof i === "string")
                    : b.kind === "deflist"
                      ? Array.isArray(b.items) &&
                        b.items.every(
                          (i: any) =>
                            i &&
                            typeof i.term === "string" &&
                            typeof i.detail === "string",
                        )
                      : b.kind === "metrics"
                        ? Array.isArray(b.rows) &&
                          b.rows.every(
                            (r: any) =>
                              r &&
                              ["label", "after", "basis"].every(
                                (k) => typeof r[k] === "string",
                              ) &&
                              (r.before === undefined ||
                                typeof r.before === "string"),
                          )
                        : false;
          if (!valid) throw new Error("Invalid case study block fields.");
        }
      }
    }
  }
  return result;
}

export function publishedEntries(state: EditorState): PublicContent[] {
  return state.entries
    .flatMap((entry) =>
      !entry.archived &&
      entry.published?.visibility === "public" &&
      !["note", "knowledge"].includes(entry.published.kind)
        ? [
            {
              ...entry.published,
              id: entry.id,
              updatedAt:
                entry.publishedAt ??
                entry.revisions.find((r) => r.action === "publish")?.at ??
                entry.updatedAt,
            },
          ]
        : [],
    )
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
