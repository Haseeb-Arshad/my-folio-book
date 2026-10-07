import { useLoaderData } from "react-router";
import { managedContent } from "../editor/public.server";
import { seedState } from "../editor/seed";
import { BlurIn } from "../components/header";

export function meta() {
  return [{ title: "Connect · Haseeb Arshad" }];
}

export async function loader() {
  const items = await managedContent("contact");
  return {
    items:
      items ??
      seedState()
        .entries.filter((e) => e.draft.kind === "contact")
        .map((e) => e.draft),
  };
}
export default function Connect() {
  const { items } = useLoaderData<typeof loader>();
  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect</h2>
        <p className="text-gray-500 text-sm mb-6">
          Feel free to reach out through any of these channels
        </p>
      </BlurIn>

      <BlurIn delay={100}>
        <div className="flex gap-6 mb-12">
          {items.map((item) => (
            <a
              key={item.slug}
              href={item.url}
              target={item.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={
                item.url.startsWith("mailto:")
                  ? undefined
                  : "noopener noreferrer"
              }
              className="text-gray-900 underline underline-offset-2 text-sm hover:text-gray-600 transition-colors"
            >
              {item.title}
            </a>
          ))}
        </div>
      </BlurIn>

      <BlurIn delay={200}>
        <div className="max-w-xl space-y-6">
          <p
            className="text-gray-700 leading-relaxed"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
            }}
          >
            I build with pure dedication and follow my curiosity wherever it
            leads, diving deep into problems until I understand them completely.
            That relentless drive to learn is what shapes everything I create.
          </p>
          <p
            className="text-gray-700 leading-relaxed"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
            }}
          >
            Crafting software that genuinely delights users is my thing. Whether
            it&apos;s a clean interface, a resilient backend, or an intelligent
            agent, I care about the details that make the difference.
          </p>
          <p
            className="text-gray-700 leading-relaxed"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
            }}
          >
            The beauty of building is that you can ship, learn, and iterate
            every single day. I believe the best work comes from putting things
            out there, listening closely, and refining until it feels right.
          </p>
        </div>
      </BlurIn>
    </section>
  );
}
