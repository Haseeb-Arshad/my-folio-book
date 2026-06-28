/* ───────────────────────────────────────────────────────────
   Favorite blogs & writing.
   Add a favorite by dropping a new object into `favorites`.
   Add your own post by dropping one into `posts`.
   ─────────────────────────────────────────────────────────── */

export type Blog = {
  title: string;
  author: string;
  url: string;
  /* one line on why it's worth reading */
  note: string;
  /* surface this one on the home page */
  featured?: boolean;
};

export type Post = {
  title: string;
  date: string; // "Jun 2026"
  url: string;
  summary: string;
};

/* ─── Blogs I keep coming back to ─── */
export const favorites: Blog[] = [
  {
    title: "Overreacted",
    author: "Dan Abramov",
    url: "https://overreacted.io",
    note: "First-principles mental models for React and JS internals.",
    featured: true,
  },
  {
    title: "Lethain",
    author: "Will Larson",
    url: "https://lethain.com",
    note: "Engineering strategy and the craft of scaling teams.",
    featured: true,
  },
  {
    title: "Simon Willison",
    author: "Simon Willison",
    url: "https://simonwillison.net",
    note: "The clearest running log of what's real in LLMs and agents.",
    featured: true,
  },
  {
    title: "Joel on Software",
    author: "Joel Spolsky",
    url: "https://www.joelonsoftware.com",
    note: "Timeless essays on shipping software people actually use.",
  },
  {
    title: "The Pragmatic Engineer",
    author: "Gergely Orosz",
    url: "https://blog.pragmaticengineer.com",
    note: "How big engineering orgs actually build and operate.",
  },
];

/* ─── Things I've written ─── */
export const posts: Post[] = [
  // {
  //   title: "Building software that disappears",
  //   date: "Jun 2026",
  //   url: "#",
  //   summary: "On the invisible details that make an interface feel inevitable.",
  // },
];
