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
  /* "essay" is a piece to re-read; "site" is a place or tool to keep open.
     They render in separate sections on the Reading page. */
  kind?: "essay" | "site";
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
    title: "Simon Willison",
    author: "Simon Willison",
    url: "https://simonwillison.net",
    note: "The clearest running log of what's real in LLMs and agents.",
    featured: true,
  },
  {
    title: "How to Do Great Work",
    author: "Paul Graham",
    url: "https://www.paulgraham.com/greatwork.html",
    note: "The closest thing there is to a manual for work that matters.",
    featured: true,
  },
  {
    title: "The AI Revolution: Our Immortality or Extinction",
    author: "Tim Urban",
    url: "https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-2.html",
    note: "A patient, vivid walk to the edge of superintelligence.",
    featured: true,
  },
  {
    title: "Artificial Creativity Is Unstoppable",
    author: "Aeon",
    url: "https://aeon.co/videos/artificial-creativity-is-unstoppable-grappling-with-its-ethics-is-up-to-us",
    note: "A short film on machine creativity, and why the ethics are ours to settle.",
  },
  {
    title: "Biological Evolution and Information",
    author: "Brian Potter",
    url: "https://www.construction-physics.com/p/biological-evolution-and-information",
    note: "Evolution read as an information-processing system.",
  },
  {
    title: "Tensorlabbet",
    author: "Taro Langner",
    url: "https://tensorlabbet.com/",
    note: "A blog of deep learnings on where AI research actually stands.",
  },
  {
    title: "My Friend Aaron",
    author: "Rory McMeekin",
    url: "https://rorz.io/writing/my-friend-aaron",
    note: "A story about a friend, an internet audience, and a bet that goes too far.",
  },
  {
    title: "Text Is King",
    author: "Adam Mastroianni",
    url: "https://www.experimental-history.com/p/text-is-king",
    note: "The case that reading isn't dying, and still beats every other way of thinking hard.",
  },
  {
    title: "Prl Journal",
    author: "writewithprl.com",
    url: "https://www.writewithprl.com/",
    note: "The journaling app I actually keep up with. It reflects your own entries back at you.",
    kind: "site",
  },
  {
    title: "Alembic",
    author: "lauri",
    url: "https://alembic.space/",
    note: "A writing tool that treats how an idea looks as part of the idea itself.",
    kind: "site",
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
