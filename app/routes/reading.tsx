import { useState } from "react";
import { useLoaderData } from "react-router";
import { BlurIn } from "../components/header";
import { getBooks, getBlogs, getPosts } from "../data/content.server";
import type { Book } from "../data/books";
import type { Blog } from "../data/blogs";

export async function loader() {
  const [books, favorites, posts] = await Promise.all([
    getBooks(),
    getBlogs(),
    getPosts(),
  ]);
  return { books, favorites, posts };
}

export function meta() {
  return [
    { title: "Reading · Haseeb Arshad" },
    {
      name: "description",
      content:
        "What I've read: science fiction, history, and the science behind the big inventions. Plus the essays I keep coming back to.",
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

function coverUrl(isbn13: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`;
}

/* ─── Book cover, with a plain letter tile if the isbn is missing or the
   cover fails to load at runtime. ─── */
function BookCover({ book }: { book: Book }) {
  const [broken, setBroken] = useState(false);

  if (!book.isbn13 || broken) {
    return (
      <div className="flex aspect-[2/3] w-full shrink-0 items-center justify-center rounded-md bg-gray-100 text-lg font-medium text-gray-400">
        {book.title.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={coverUrl(book.isbn13)}
      alt={`Cover of ${book.title}`}
      loading="lazy"
      onError={() => setBroken(true)}
      className="aspect-[2/3] w-full shrink-0 rounded-md bg-gray-100 object-cover shadow-sm"
    />
  );
}

function BookCard({ book, delay }: { book: Book; delay: number }) {
  return (
    <BlurIn delay={delay}>
      <div className="group flex gap-3.5 rounded-xl p-2 -m-2 transition-colors hover:bg-gray-50/60">
        <div className="w-[72px] shrink-0">
          <BookCover book={book} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[14px] font-medium text-gray-900">
              {book.title}
            </h3>
            {book.favorite && (
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-amber-600">
                Favourite
              </span>
            )}
          </div>
          <p className="text-[13px] text-gray-500">{book.author}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
            {book.note}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {book.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </BlurIn>
  );
}

/* ─── One external link, used for both essays and sites ─── */
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
        <span className="text-gray-400 text-sm shrink-0 pt-0.5">
          {blog.author}
        </span>
      </a>
    </BlurIn>
  );
}

export default function Reading() {
  const { books, favorites, posts } = useLoaderData<typeof loader>();
  const essays = favorites.filter((blog) => blog.kind !== "site");
  const sites = favorites.filter((blog) => blog.kind === "site");

  return (
    <section className="pb-24">
      <BlurIn>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Reading</h2>
        <p className="text-gray-500 text-sm mb-8 border-b border-gray-100 pb-6">
          Science fiction, history, and the science behind the big
          inventions, plus the essays I keep coming back to.
        </p>
      </BlurIn>

      {/* ─── Books ─── */}
      {books.length > 0 && (
        <div className="mb-14">
          <BlurIn delay={60}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
              Books
            </h3>
          </BlurIn>

          <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
            {books.map((book, i) => (
              <BookCard
                key={`${book.title}-${book.author}`}
                book={book}
                delay={100 + i * 60}
              />
            ))}
          </div>
        </div>
      )}

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

      {/* ─── Essays ─── */}
      {essays.length > 0 && (
        <div className="mb-12">
          <BlurIn delay={books.length * 60 + 160}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Essays I keep coming back to
            </h3>
          </BlurIn>

          {essays.map((blog, i) => (
            <LinkRow
              key={blog.url}
              blog={blog}
              delay={books.length * 60 + 220 + i * 70}
            />
          ))}
        </div>
      )}

      {/* ─── Sites ─── */}
      {sites.length > 0 && (
        <div>
          <BlurIn delay={books.length * 60 + 220 + essays.length * 70}>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Sites I keep open
            </h3>
          </BlurIn>

          {sites.map((blog, i) => (
            <LinkRow
              key={blog.url}
              blog={blog}
              delay={books.length * 60 + 280 + (essays.length + i) * 70}
            />
          ))}
        </div>
      )}
    </section>
  );
}
