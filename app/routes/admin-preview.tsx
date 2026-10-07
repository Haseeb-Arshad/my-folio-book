import {
  Link,
  data,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import { requireOwner, privateHeaders } from "../editor/auth.server";
import { readEditor } from "../editor/store.server";
import { ArticleBody } from "../components/article-body";
import "../editor.css";
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireOwner(request);
  const entry = (await readEditor()).entries.find((e) => e.id === params.id);
  if (!entry)
    throw new Response("Not found", { status: 404, headers: privateHeaders });
  return data({ entry }, { headers: privateHeaders });
}
export function headers() {
  return privateHeaders;
}
export function meta() {
  return [
    { title: "Owner draft preview" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
export default function AdminPreview() {
  const { entry } = useLoaderData<typeof loader>();
  const item = entry.draft;
  return (
    <div className="owner-editor ph-no-capture">
      <main className="owner-preview">
        <Link
          to={`/admin?kind=${item.kind}&edit=${encodeURIComponent(entry.id)}`}
        >
          ← Back to editor
        </Link>
        <p className="owner-message">
          Saved draft · Only visible to the owner. Publishing uses the existing
          portfolio design.
        </p>
        <p className="owner-kicker">
          {item.kind} · {item.visibility}
        </p>
        <h1>{item.title}</h1>
        <p>{item.subtitle}</p>
        <p>{item.summary}</p>
        {item.image && <img src={item.image} alt={`${item.title} preview`} />}
        <ArticleBody body={item.body} />
        {item.evidence && (
          <aside>
            <h2>Evidence and scope</h2>
            <p>{item.evidence}</p>
          </aside>
        )}
      </main>
    </div>
  );
}
