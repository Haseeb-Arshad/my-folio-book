import { BlurIn } from "../components/header";
import { favorites, posts } from "../data/blogs";

export function meta() {
  return [
    { title: "Blog — Haseeb Arshad" },
    {
      name: "description",
      content: "Writing, and a running list of the blogs I keep coming back to.",
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

export default function Blog() {
  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Blog</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          Writing, and the blogs I keep coming back to.
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

      {/* ─── Reading list ─── */}
      <BlurIn delay={posts.length > 0 ? 200 : 60}>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          Reading list
        </h3>
      </BlurIn>

      {favorites.map((blog, i) => (
        <BlurIn key={blog.url} delay={(posts.length > 0 ? 260 : 120) + i * 70}>
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
            <span className="text-gray-400 text-sm shrink-0 pt-0.5">
              {blog.author}
            </span>
          </a>
        </BlurIn>
      ))}
    </section>
  );
}
