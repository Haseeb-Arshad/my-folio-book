import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import {
  requireOwner,
  checkCsrf,
  signOutCookie,
  privateHeaders,
} from "../editor/auth.server";
import {
  readEditor,
  writeEditor,
  storageLabel,
  type EditorCommand,
} from "../editor/store.server";
import {
  emptyPayload,
  contentKinds,
  slugify,
  type ContentKind,
  type ContentEntry,
  type ContentPayload,
} from "../editor/types";
import "../editor.css";

const labels: Record<ContentKind, string> = {
  project: "Projects",
  "case-study": "Case studies",
  post: "Writing",
  book: "Books",
  link: "Reading links",
  experience: "Experience",
  now: "Now",
  profile: "Homepage",
  contact: "Contact links",
  resume: "CV",
  note: "Notes",
  knowledge: "Agent knowledge",
};
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireOwner(request);
  try {
    return data(
      {
        state: await readEditor(),
        csrf: session.csrf,
        storage: storageLabel(),
        storageError: null as string | null,
      },
      { headers: privateHeaders },
    );
  } catch (error) {
    return data(
      {
        state: { version: 0, entries: [] as ContentEntry[] },
        csrf: session.csrf,
        storage: storageLabel(),
        storageError:
          error instanceof Error ? error.message : "Storage is unavailable.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}
function payload(form: FormData): ContentPayload {
  const kind = String(form.get("kind") ?? "note") as ContentKind;
  const value = (key: string) => String(form.get(key) ?? "");
  return {
    kind,
    title: value("title"),
    slug: value("slug"),
    subtitle: value("subtitle"),
    summary: value("summary"),
    body: value("body"),
    image: value("image"),
    url: value("url"),
    code: value("code"),
    evidence: value("evidence"),
    display: value("display"),
    tags: value("tags")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    order: Number(value("order") || 0),
    featured: form.get("featured") === "on",
    visibility: value("visibility") === "private" ? "private" : "public",
    agentApproved: form.get("agentApproved") === "on",
  };
}
export async function action({ request }: ActionFunctionArgs) {
  const session = await requireOwner(request);
  const form = await request.formData();
  checkCsrf(request, session, form);
  const intent = String(form.get("intent"));
  if (intent === "logout")
    return redirect("/admin/login", {
      headers: { ...privateHeaders, "Set-Cookie": await signOutCookie() },
    });
  const actions = [
    "save",
    "publish",
    "unpublish",
    "archive",
    "restore",
    "revision",
    "capture",
  ];
  if (!actions.includes(intent))
    return data(
      { error: "Unknown editor action." },
      { status: 400, headers: privateHeaders },
    );
  try {
    const input =
      intent === "capture"
        ? {
            ...emptyPayload("note"),
            title:
              String(form.get("title") ?? "").trim() ||
              String(form.get("body") ?? "")
                .split("\n")[0]
                .slice(0, 100),
            body: String(form.get("body") ?? ""),
            visibility: "private" as const,
            url: String(form.get("url") ?? ""),
          }
        : payload(form);
    const command: EditorCommand = {
      action:
        intent === "capture" ? "save" : (intent as EditorCommand["action"]),
      id: String(form.get("id") ?? "") || undefined,
      version: Number(form.get("version") ?? 0),
      ...(intent === "save" || intent === "publish" || intent === "capture"
        ? { payload: input }
        : {}),
      revision: Number(form.get("revision")),
    };
    const item = await writeEditor(command);
    return redirect(
      `/admin?kind=${item.draft.kind}&edit=${encodeURIComponent(item.id)}&saved=${intent}`,
      { headers: privateHeaders },
    );
  } catch (error) {
    return data(
      {
        error:
          error instanceof Error
            ? error.message
            : "Your changes were not saved.",
      },
      { status: 400, headers: privateHeaders },
    );
  }
}
export function meta() {
  return [
    { title: "Portfolio editor · Haseeb Arshad" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
export function headers() {
  return privateHeaders;
}
function Field({
  label,
  name,
  value,
  type = "text",
  help,
  multiline = false,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  help?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="owner-field">
      <label htmlFor={`field-${name}`}>{label}</label>
      {multiline ? (
        <textarea
          id={`field-${name}`}
          name={name}
          defaultValue={value}
          rows={rows}
        />
      ) : (
        <input
          id={`field-${name}`}
          name={name}
          type={type}
          defaultValue={value}
          required={name === "title"}
        />
      )}
      {help && <p className="owner-help mt-1">{help}</p>}
    </div>
  );
}
function status(entry: ContentEntry) {
  return entry.archived
    ? "Archived"
    : !entry.published
      ? "Draft"
      : JSON.stringify(entry.draft) !== JSON.stringify(entry.published)
        ? "Published · draft changes"
        : "Published";
}
function Actions({
  entry,
  csrf,
  busy,
}: {
  entry: ContentEntry;
  csrf: string;
  busy: boolean;
}) {
  return (
    <>
      <div className="owner-tools">
        {(entry.archived ? ["restore"] : ["unpublish", "archive"])
          .filter((a) => a !== "unpublish" || entry.published)
          .map((intent) => (
            <Form method="post" key={intent}>
              <input type="hidden" name="csrf" value={csrf} />
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="version" value={entry.version} />
              <input type="hidden" name="intent" value={intent} />
              <button className="owner-button" disabled={busy}>
                {intent === "unpublish"
                  ? "Unpublish"
                  : intent === "archive"
                    ? "Archive item"
                    : "Restore item"}
              </button>
            </Form>
          ))}
      </div>
      {entry.revisions.length > 0 && (
        <details className="owner-revisions">
          <summary>Revision history ({entry.revisions.length})</summary>
          <p className="owner-help mt-3">
            Restoring a revision updates the draft. Publish it separately when
            you’re ready.
          </p>
          {entry.revisions.map((revision, i) => (
            <div className="owner-revision" key={`${revision.at}-${i}`}>
              <span>
                {revision.action} ·{" "}
                {new Date(revision.at).toLocaleString("en", {
                  timeZone: "Asia/Karachi",
                })}
              </span>
              <Form method="post">
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={entry.id} />
                <input type="hidden" name="version" value={entry.version} />
                <input type="hidden" name="intent" value="revision" />
                <input type="hidden" name="revision" value={i} />
                <button className="owner-button" disabled={busy}>
                  Restore draft
                </button>
              </Form>
            </div>
          ))}
        </details>
      )}
    </>
  );
}
export default function Admin() {
  const { state, csrf, storage, storageError } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const busy = useNavigation().state !== "idle";
  const [params] = useSearchParams();
  const kind = contentKinds.includes(params.get("kind") as ContentKind)
    ? (params.get("kind") as ContentKind)
    : null;
  const selected = state.entries.find((e) => e.id === params.get("edit"));
  const draft = selected?.draft ?? emptyPayload(kind ?? "note");
  const search = (params.get("q") ?? "").toLowerCase();
  const show = params.get("show") ?? "active";
  const entries = state.entries.filter(
    (e) =>
      (!kind || e.draft.kind === kind) &&
      (show === "archive" ? e.archived : !e.archived) &&
      (show !== "draft" ||
        !e.published ||
        status(e).includes("draft changes")) &&
      `${e.draft.title} ${e.draft.summary}`.toLowerCase().includes(search),
  );
  const published = state.entries.filter(
    (e) => !e.archived && e.published,
  ).length;
  const publicPath = (entry: ContentEntry) =>
    entry.published?.kind === "case-study"
      ? `/work/${entry.published?.slug}`
      : entry.published?.kind === "post"
        ? `/writing/${entry.published?.slug}`
        : entry.published?.kind === "now"
          ? "/now"
          : entry.published?.kind === "book" || entry.published?.kind === "link"
            ? "/reading"
            : entry.published?.kind === "contact"
              ? "/connect"
              : entry.published?.kind === "resume"
                ? "/resume"
                : entry.published?.kind === "profile"
                  ? "/"
                  : "/work";
  return (
    <div className="owner-editor ph-no-capture">
      <header className="owner-bar">
        <Link className="owner-brand" to="/admin">
          The portfolio desk.
        </Link>
        <div className="owner-bar-links">
          <a href="/" target="_blank" rel="noopener noreferrer">
            View portfolio ↗
          </a>

          <Form method="post">
            <input type="hidden" name="csrf" value={csrf} />
            <button name="intent" value="logout">
              Sign out
            </button>
          </Form>
        </div>
      </header>
      <main id="main-content" className="owner-main" tabIndex={-1}>
        <div className="owner-heading">
          <div>
            <p className="owner-kicker">Your private workspace</p>
            <h1>{kind ? labels[kind] : "Make room for the next thing."}</h1>
            <p>Capture freely. Edit deliberately. Publish when it’s ready.</p>
          </div>
          <span className="owner-pill">{storage}</span>
        </div>
        <nav className="owner-nav" aria-label="Editor sections">
          <Link to="/admin" className={!kind ? "active" : ""}>
            Overview
          </Link>
          {contentKinds.map((k) => (
            <Link
              key={k}
              to={`/admin?kind=${k}`}
              className={kind === k ? "active" : ""}
              aria-current={kind === k ? "page" : undefined}
            >
              {labels[k]}
            </Link>
          ))}
        </nav>
        {storageError && (
          <p role="alert" className="owner-message error">
            {storageError}
          </p>
        )}
        {result?.error && (
          <p role="alert" className="owner-message error">
            {result.error}
          </p>
        )}
        {!result?.error && params.has("saved") && (
          <p role="status" className="owner-message">
            {params.get("saved") === "publish"
              ? "Published. The portfolio now uses this version."
              : params.get("saved") === "unpublish"
                ? "Unpublished. This item is no longer public."
                : params.get("saved") === "archive"
                  ? "Archived. You can restore it from the archive."
                  : "Saved. Your draft is ready to preview."}
          </p>
        )}
        {!kind && !selected ? (
          <>
            <div className="owner-stats">
              <div>
                <strong>{published}</strong>
                <span>Published items</span>
              </div>
              <div>
                <strong>
                  {
                    state.entries.filter((e) => !e.archived && !e.published)
                      .length
                  }
                </strong>
                <span>Unpublished drafts</span>
              </div>
              <div>
                <strong>
                  {
                    state.entries.filter(
                      (e) =>
                        !e.archived &&
                        e.published &&
                        status(e).includes("draft changes"),
                    ).length
                  }
                </strong>
                <span>Items with draft changes</span>
              </div>
              <div>
                <strong>
                  {state.entries.filter((e) => e.archived).length}
                </strong>
                <span>In the archive</span>
              </div>
            </div>
            <div className="owner-dashboard-grid">
              <section className="owner-panel">
                <h2>Catch an idea.</h2>
                <p className="owner-help mb-5">
                  A thought, a link, or something half-formed. Quick captures
                  are private drafts.
                </p>
                <Form method="post">
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="intent" value="capture" />
                  <Field name="title" label="A short title" value="" />
                  <Field
                    name="body"
                    label="What’s on your mind?"
                    value=""
                    multiline
                    rows={6}
                  />
                  <Field name="url" label="A link, if there is one" value="" />
                  <button
                    className="owner-button primary"
                    disabled={busy || Boolean(storageError)}
                  >
                    {busy ? "Saving…" : "Save private note"}
                  </button>
                </Form>
              </section>
              <section className="owner-panel">
                <h2>Everything suggested, in one place.</h2>
                <ul className="owner-preflight">
                  <li>
                    <strong>Homepage and selected work</strong>
                    <p>
                      Edit the homepage and use the order field to arrange your
                      strongest projects.
                    </p>
                    <Link
                      className="owner-button mt-3"
                      to="/admin?kind=profile"
                    >
                      Edit homepage
                    </Link>
                  </li>
                  <li>
                    <strong>Case studies and original writing</strong>
                    <p>
                      The original case study and suggested draft articles are
                      prepared. Add evidence, screenshots, and safe public
                      detail here.
                    </p>
                    <Link
                      className="owner-button mt-3"
                      to="/admin?kind=case-study"
                    >
                      Review case studies
                    </Link>
                  </li>
                  <li>
                    <strong>Current updates, books, and links</strong>
                    <p>
                      Keep Now specific and dated. Manage the reading shelf
                      without changing code.
                    </p>
                    <Link className="owner-button mt-3" to="/admin?kind=now">
                      Update Now
                    </Link>
                  </li>
                  <li>
                    <strong>Contact links and CV</strong>
                    <p>
                      Update your public contact destinations and choose the
                      current PDF for the CV page.
                    </p>
                    <Link
                      className="owner-button mt-3"
                      to="/admin?kind=contact"
                    >
                      Edit contact links
                    </Link>{" "}
                    <Link className="owner-button mt-3" to="/admin?kind=resume">
                      Edit CV
                    </Link>
                  </li>
                  <li>
                    <strong>Agent knowledge</strong>
                    <p>
                      Knowledge starts as a draft. Public visibility,
                      publication, and the agent approval checkbox are all
                      required before a fact reaches the guide.
                    </p>
                    <Link
                      className="owner-button mt-3"
                      to="/admin?kind=knowledge"
                    >
                      Manage public facts
                    </Link>
                  </li>
                  <li>
                    <strong>Keep the familiar portfolio</strong>
                    <p>
                      The public layout stays the same. Preview saved drafts
                      privately, then publish them into the existing pages.
                    </p>
                    <Link className="owner-button mt-3" to="/">
                      View portfolio
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
          </>
        ) : (
          <div className="owner-columns">
            <aside className="owner-panel">
              <div className="owner-actions mt-0 mb-5">
                <Link
                  className="owner-button primary"
                  to={`/admin?kind=${kind ?? draft.kind}&edit=new`}
                >
                  Add {kind === "knowledge" ? "fact" : "item"}
                </Link>
              </div>
              <Form method="get">
                <input type="hidden" name="kind" value={kind ?? draft.kind} />
                <label htmlFor="item-search">Find an item</label>
                <input
                  id="item-search"
                  name="q"
                  defaultValue={params.get("q") ?? ""}
                />
                <label htmlFor="item-show" className="mt-4">
                  Show
                </label>
                <select id="item-show" name="show" defaultValue={show}>
                  <option value="active">Active items</option>
                  <option value="draft">Drafts and draft changes</option>
                  <option value="archive">Archive</option>
                </select>
                <button className="owner-button mt-3">Filter</button>
              </Form>
              <div className="owner-content-list">
                {entries.map((item) => (
                  <Link
                    key={item.id}
                    className={selected?.id === item.id ? "selected" : ""}
                    to={`/admin?kind=${item.draft.kind}&edit=${encodeURIComponent(item.id)}&show=${show}`}
                  >
                    <strong>{item.draft.title}</strong>
                    <small>
                      {labels[item.draft.kind]} · Order {item.draft.order}
                    </small>
                    <span
                      className={`owner-pill ${!item.published ? "draft" : ""}`}
                    >
                      {status(item)}
                    </span>
                  </Link>
                ))}
                {!entries.length && (
                  <p className="owner-empty">No items match this view.</p>
                )}
              </div>
            </aside>
            <section className="owner-panel">
              {selected || params.get("edit") === "new" ? (
                <>
                  <h2>{selected ? "Shape this item." : "A fresh page."}</h2>
                  {selected && (
                    <p className="owner-help mb-5">
                      {status(selected)} · Version {selected.version}
                    </p>
                  )}
                  <Form
                    method="post"
                    key={`${selected?.id ?? "new"}:${selected?.version ?? 0}:${kind}`}
                  >
                    <input type="hidden" name="csrf" value={csrf} />
                    <input type="hidden" name="id" value={selected?.id ?? ""} />
                    <input
                      type="hidden"
                      name="version"
                      value={selected?.version ?? 0}
                    />
                    <div className="owner-field-grid">
                      <div className="owner-field">
                        <label htmlFor="field-kind">Content type</label>
                        <select
                          id="field-kind"
                          name="kind"
                          defaultValue={draft.kind}
                        >
                          {contentKinds.map((k) => (
                            <option key={k} value={k}>
                              {labels[k]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="owner-field">
                        <label htmlFor="field-visibility">Visibility</label>
                        <select
                          id="field-visibility"
                          name="visibility"
                          defaultValue={draft.visibility}
                        >
                          <option value="public">Public, when published</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                    <Field
                      name="title"
                      label={
                        draft.kind === "profile" ? "Homepage headline" : "Title"
                      }
                      value={draft.title}
                    />
                    <div className="owner-field-grid">
                      <Field
                        name="slug"
                        label="Page slug"
                        value={draft.slug}
                        help="Leave blank to derive it from the title."
                      />
                      <Field
                        name="order"
                        label="Display order"
                        value={draft.order}
                        type="number"
                        help="Lower numbers appear first."
                      />
                    </div>
                    <Field
                      name="subtitle"
                      label="Subtitle, role, or author"
                      value={draft.subtitle}
                    />
                    <Field
                      name="summary"
                      label="Short description"
                      value={draft.summary}
                      multiline
                    />
                    <Field
                      name="body"
                      label="Body or notes"
                      value={draft.body}
                      multiline
                      rows={14}
                      help="Plain text, ## headings, - lists, **emphasis**, and ![description](https://image-url) are supported."
                    />
                    <Field
                      name="image"
                      label="Cover or screenshot URL"
                      value={draft.image}
                      help="An HTTPS image URL or an existing site image path."
                    />
                    <div className="owner-field-grid">
                      <Field
                        name="url"
                        label="Destination URL"
                        help="HTTPS, a site path, or mailto:your@email.com for contact links."
                        value={draft.url}
                      />
                      <Field
                        name="code"
                        label="Source repository URL"
                        value={draft.code}
                      />
                    </div>
                    <Field
                      name="tags"
                      label="Tags / technologies"
                      value={draft.tags.join(", ")}
                      help="Separate tags with commas."
                    />
                    <Field
                      name="evidence"
                      label="Evidence and disclosure note"
                      value={draft.evidence}
                      multiline
                      rows={3}
                      help="Explain what is measured, reported, or still unverified."
                    />
                    <details className="owner-field">
                      <summary>Display details</summary>
                      <Field
                        name="display"
                        label="Additional display data (JSON)"
                        value={draft.display || ""}
                        multiline
                        rows={8}
                        help="Optional fields such as year, ISBN, logo, additional links, or case study context. Existing values keep the original presentation."
                      />
                    </details>
                    {["book", "link"].includes(draft.kind) && (
                      <label className="owner-check">
                        <input
                          type="checkbox"
                          name="featured"
                          defaultChecked={draft.featured}
                        />{" "}
                        {draft.kind === "book"
                          ? "Mark as a favorite book"
                          : "Feature this reading link on the homepage"}
                      </label>
                    )}
                    <label className="owner-check">
                      <input
                        type="checkbox"
                        name="agentApproved"
                        defaultChecked={draft.agentApproved}
                      />{" "}
                      Let the agent use this published public fact
                    </label>
                    <p className="owner-help">
                      Private content and unpublished drafts never enter the
                      agent’s public facts. Saving a draft keeps the current
                      published version in place.
                    </p>
                    <div className="owner-actions">
                      <button
                        className="owner-button"
                        name="intent"
                        value="save"
                        disabled={busy || Boolean(storageError)}
                      >
                        {busy ? "Saving…" : "Save draft"}
                      </button>
                      <button
                        className="owner-button primary"
                        name="intent"
                        value="publish"
                        disabled={
                          busy || Boolean(storageError) || selected?.archived
                        }
                      >
                        Publish version
                      </button>
                      {selected && (
                        <Link
                          className="owner-button"
                          to={`/admin/preview/${encodeURIComponent(selected.id)}`}
                          target="_blank"
                        >
                          Preview saved draft ↗
                        </Link>
                      )}
                      {selected?.published &&
                        !["knowledge", "note"].includes(
                          selected.draft.kind,
                        ) && (
                          <a
                            className="owner-button"
                            href={publicPath(selected)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View published ↗
                          </a>
                        )}
                    </div>
                  </Form>
                  {selected && (
                    <Actions entry={selected} csrf={csrf} busy={busy} />
                  )}
                </>
              ) : (
                <div className="owner-empty">
                  <h2>Choose something to shape.</h2>
                  <p>
                    Select an item on the left, or start with a fresh draft.
                  </p>
                  <Link
                    className="owner-button primary mt-5"
                    to={`/admin?kind=${kind}&edit=new`}
                  >
                    Add an item
                  </Link>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
