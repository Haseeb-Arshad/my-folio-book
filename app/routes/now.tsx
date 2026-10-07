import { useLoaderData } from "react-router";
import { managedContent } from "../editor/public.server";
import { seedState } from "../editor/seed";
import { BlurIn } from "../components/header";

export function meta() {
  return [{ title: "Now · Haseeb Arshad" }];
}

export async function loader() {
  const items = await managedContent("now");
  return {
    items:
      items ??
      seedState()
        .entries.filter((e) => e.draft.kind === "now")
        .map((e) => e.draft),
  };
}
export default function Now() {
  const { items } = useLoaderData<typeof loader>();
  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Now</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          What I&apos;m focused on right now
        </p>
      </BlurIn>

      <div className="max-w-xl space-y-6">
        {items.map((item, i) => (
          <BlurIn key={item.slug} delay={100 + i * 90}>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.summary}
              </p>
            </div>
          </BlurIn>
        ))}
      </div>
    </section>
  );
}
