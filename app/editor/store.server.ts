import { readFile, mkdir, writeFile, rename, unlink } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { supabaseServer } from "../lib/supabase.server";
import { seedState } from "./seed";
import {
  publishedEntries,
  validatePayload,
  type ContentEntry,
  type EditorState,
  type ContentPayload,
} from "./types";

const table = "portfolio_editor_state";
const local = () =>
  process.env.PORTFOLIO_EDITOR_DRIVER === "file" &&
  process.env.NODE_ENV !== "production";
const filename = () =>
  path.resolve(process.env.PORTFOLIO_EDITOR_FILE ?? ".portfolio/editor.json");
let queue = Promise.resolve();
export function storageLabel() {
  return local()
    ? "Local development file"
    : supabaseServer()
      ? "Supabase"
      : "Not configured";
}

export async function readEditor(): Promise<EditorState> {
  if (local()) {
    try {
      return JSON.parse(await readFile(filename(), "utf8")) as EditorState;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        return seedState();
      throw error;
    }
  }
  const client = supabaseServer();
  if (!client)
    throw new Error(
      "Configure Supabase storage, or enable the local development file driver.",
    );
  const { data, error } = await client
    .from(table)
    .select("version,entries")
    .eq("id", "portfolio")
    .maybeSingle();
  if (error)
    throw new Error(
      "The editor database is unavailable. Apply the portfolio_editor migration and check the server connection.",
    );
  return data ? { version: data.version, entries: data.entries } : seedState();
}

export async function getPublicContent() {
  return publishedEntries(await readEditor());
}

export type EditorCommand = {
  action: "save" | "publish" | "unpublish" | "archive" | "restore" | "revision";
  id?: string;
  version: number;
  payload?: ContentPayload;
  revision?: number;
};
export function applyCommand(
  state: EditorState,
  command: EditorCommand,
): EditorState {
  const next = structuredClone(state);
  let existing = next.entries.find((e) => e.id === command.id);
  if (command.id && !existing)
    throw new Error("This item no longer exists. Reload the editor.");
  if (existing && existing.version !== command.version)
    throw new Error("This item changed in another tab. Reload before saving.");
  if (!existing) {
    if (command.action !== "save" && command.action !== "publish")
      throw new Error("Save this item first.");
    if (!command.payload) throw new Error("Content is required.");
    const draft = validatePayload(command.payload);
    existing = {
      id: randomUUID(),
      draft,
      published: null,
      archived: false,
      version: 0,
      updatedAt: new Date().toISOString(),
      revisions: [],
    };
    next.entries.push(existing);
  }
  const at = new Date().toISOString();
  if (existing.published && !existing.publishedAt)
    existing.publishedAt =
      existing.revisions.find((r) => r.action === "publish")?.at ??
      existing.updatedAt;
  const revision = {
    at,
    action: command.action,
    draft: structuredClone(existing.draft),
    published: structuredClone(existing.published),
  };
  if (command.action === "save" || command.action === "publish") {
    existing.draft = validatePayload(command.payload);
  }
  if (command.action === "publish") {
    if (
      existing.draft.visibility !== "public" ||
      existing.draft.kind === "note"
    )
      throw new Error(
        "Private notes stay private. Choose a public content type and visibility before publishing.",
      );
    if (
      ["case-study", "post"].includes(existing.draft.kind) &&
      !existing.draft.body
    )
      throw new Error("Add the article body before publishing.");
    if (
      ["contact", "resume", "link"].includes(existing.draft.kind) &&
      !existing.draft.url
    )
      throw new Error("Add a destination URL before publishing.");
    if (
      existing.draft.kind === "resume" &&
      !/^https:\/\/|^\//.test(existing.draft.url)
    )
      throw new Error("The CV must link to an HTTPS document or a site file.");
    if (
      ["profile", "resume"].includes(existing.draft.kind) &&
      next.entries.some(
        (e) =>
          e.id !== existing!.id &&
          !e.archived &&
          e.published?.kind === existing!.draft.kind,
      )
    )
      throw new Error(
        "Only one homepage and one CV can be published. Edit the existing item, or unpublish it first.",
      );
    existing.published = structuredClone(existing.draft);
    existing.publishedAt = at;
    existing.archived = false;
  }
  if (command.action === "unpublish") existing.published = null;
  if (command.action === "archive") {
    existing.archived = true;
    existing.published = null;
  }
  if (command.action === "restore") existing.archived = false;
  if (command.action === "revision") {
    const previous = existing.revisions[command.revision ?? -1];
    if (!previous) throw new Error("Choose an existing revision.");
    existing.draft = structuredClone(previous.draft);
  }
  if (!existing.archived) {
    const candidates = [existing.draft, existing.published].filter(
      (p): p is ContentPayload => Boolean(p),
    );
    if (
      next.entries.some(
        (e) =>
          e.id !== existing!.id &&
          !e.archived &&
          [e.draft, e.published].some(
            (other) =>
              other &&
              candidates.some(
                (candidate) =>
                  candidate.kind === other.kind &&
                  candidate.slug === other.slug,
              ),
          ),
      )
    )
      throw new Error(
        "An item of this type already uses that slug. Check its draft and published versions.",
      );
  }
  existing.revisions.unshift(revision);
  existing.revisions = existing.revisions.slice(0, 25);
  existing.version++;
  existing.updatedAt = at;
  next.version++;
  return next;
}

async function mutate(command: EditorCommand): Promise<ContentEntry> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const state = await readEditor();
    const next = applyCommand(state, command);
    if (local()) {
      await mkdir(path.dirname(filename()), { recursive: true });
      const temporary = `${filename()}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(next, null, 2), {
        mode: 0o600,
      });
      try {
        for (let retry = 0; ; retry++) {
          try {
            await rename(temporary, filename());
            break;
          } catch (error) {
            if (
              retry >= 5 ||
              !["EPERM", "EBUSY", "EACCES"].includes(
                (error as NodeJS.ErrnoException).code ?? "",
              )
            )
              throw error;
            await delay(50 * (retry + 1));
          }
        }
      } catch {
        await unlink(temporary).catch(() => undefined);
        throw new Error(
          "The local development file is busy. Your changes were not saved; please retry.",
        );
      }
    } else {
      const client = supabaseServer()!;
      const { data: exists, error: readError } = await client
        .from(table)
        .select("version")
        .eq("id", "portfolio")
        .maybeSingle();
      if (readError)
        throw new Error("Storage is unavailable. Your changes were not saved.");
      if (!exists) {
        const { error } = await client
          .from(table)
          .insert({ id: "portfolio", ...next });
        if (error?.code === "23505") continue;
        if (error)
          throw new Error(
            "Storage rejected the save. Your changes were not saved.",
          );
      } else {
        const { data, error } = await client
          .from(table)
          .update({
            version: next.version,
            entries: next.entries,
            updated_at: new Date().toISOString(),
          })
          .eq("id", "portfolio")
          .eq("version", state.version)
          .select("version");
        if (error)
          throw new Error(
            "Storage rejected the save. Your changes were not saved.",
          );
        if (!data?.length) continue;
      }
    }
    return command.id
      ? next.entries.find((e) => e.id === command.id)!
      : next.entries.at(-1)!;
  }
  throw new Error(
    "Another save arrived at the same time. Reload and try again.",
  );
}
export async function writeEditor(command: EditorCommand) {
  if (!local()) return mutate(command);
  const task = queue.then(() => mutate(command));
  queue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

export async function approvedAgentNotes() {
  try {
    const state = await readEditor();
    return state.entries
      .flatMap((e) =>
        !e.archived &&
        e.published?.visibility === "public" &&
        e.published.agentApproved
          ? [
              {
                label: e.published.title.slice(0, 60),
                value: `${e.published.summary} ${e.published.body}`
                  .trim()
                  .slice(0, 240),
              },
            ]
          : [],
      )
      .slice(0, 12);
  } catch {
    return [];
  }
}
