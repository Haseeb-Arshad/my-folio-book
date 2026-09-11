import { useLoaderData } from "react-router";
import { BlurIn } from "../components/header";
import { getBlogs, getPosts } from "../data/content.server";
import type { Blog } from "../data/blogs";

export async function loader() {
  const [favorites, posts] = await Promise.all([getBlogs(), getPosts()]);
  return { favorites, posts };
}

export function meta() {
  return [
    { title: "Blogs · Haseeb Arshad" },
    {
      name: "description",
      content:
        "Blogs and writing I keep coming back to, especially around software, AI, and the ideas behind the work.",
    },
  ];
}

/* ─── External-link arrow ─── */
function ArrowOut() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all"
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

/* ─── One external link, used for blogs and sites ─── */
function LinkRow({ blog, delay }: { blog: Blog; delay: number }) {
  return (
    <BlurIn delay={delay}>
      <a
        href={blog.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start justify-between gap-4 py-5 border-b border-gray-50 hover:bg-gray-50/50 -mx-3 px-3 rounded-lg transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium group-hover:underline underline-offset-2">
              {blog.title}
            </span>
            <ArrowOut />
          </div>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            {blog.note}
          </p>
        </div>
      </a>
    </BlurIn>
  );
}

export default function Reading() {
  const { favorites, posts } = useLoaderData<typeof loader>();
  const blogs = favorites.filter((blog) => blog.kind !== "site");
  const sites = favorites.filter((blog) => blog.kind === "site");

  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Blogs</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          Software, AI, and the ideas I keep coming back to.
        </p>
      </BlurIn>

      {/* ─── My writing ─── */}
      {posts.length > 0 && (
        <div className="mb-12">
          <BlurIn delay={60}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Writing
            </h3>
          </BlurIn>
          {posts.map((post, i) => (
            <BlurIn key={post.title} delay={120 + i * 80}>
              <a
                href={post.url}
                className="group block py-5 border-b border-gray-50 hover:bg-gray-50/50 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-gray-900 font-medium group-hover:underline underline-offset-2">
                    {post.title}
                  </span>
                  <span className="text-gray-400 text-xs shrink-0">
                    {post.date}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                  {post.summary}
                </p>
              </a>
            </BlurIn>
          ))}
        </div>
      )}

      {/* ─── Blogs ─── */}
      {blogs.length > 0 && (
        <div className="mb-12">
          <BlurIn delay={80}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Blogs I keep coming back to
            </h3>
          </BlurIn>

          {blogs.map((blog, i) => (
            <LinkRow
              key={blog.url}
              blog={blog}
              delay={140 + i * 70}
            />
          ))}
        </div>
      )}

      {/* ─── Sites ─── */}
      {sites.length > 0 && (
        <div>
          <BlurIn delay={140 + blogs.length * 70}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Sites I keep open
            </h3>
          </BlurIn>

          {sites.map((blog, i) => (
            <LinkRow
              key={blog.url}
              blog={blog}
              delay={200 + (blogs.length + i) * 70}
            />
          ))}
        </div>
      )}
    </section>
  );
}
