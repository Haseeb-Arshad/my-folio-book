import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getPublicContent } from "../editor/store.server";
import { ArticleBody } from "../components/article-body";
import { BlurIn } from "../components/header";
export async function loader({ params }: LoaderFunctionArgs) {
  const item = (await getPublicContent()).find(
    (p) => p.kind === "post" && p.slug === params.slug,
  );
  if (!item) throw new Response("Not found", { status: 404 });
  return { item };
}
export function meta({ data }: { data?: Awaited<ReturnType<typeof loader>> }) {
  return [
    { title: `${data?.item.title ?? "Writing"} · Haseeb Arshad` },
    { name: "description", content: data?.item.summary ?? "" },
  ];
}
export default function WritingPost() {
  const { item } = useLoaderData<typeof loader>();
  return (
    <BlurIn>
      <article className="pb-24 max-w-2xl">
        <Link
          to="/reading"
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          ← Reading
        </Link>
        <h1 className="text-[28px] font-semibold text-gray-900 mt-5">
          {item.title}
        </h1>
        <p className="text-gray-500 leading-relaxed my-6">{item.summary}</p>
        <div className="text-gray-700 leading-relaxed [&_p]:my-5 [&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_img]:rounded-xl">
          <ArticleBody body={item.body} />
        </div>
        {item.evidence && (
          <p className="text-sm text-gray-400 mt-12 border-t border-gray-100 pt-6">
            {item.evidence}
          </p>
        )}
      </article>
    </BlurIn>
  );
}
