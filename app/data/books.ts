/* ───────────────────────────────────────────────────────────
   Reading history. Supabase is the primary source (editable from
   the dashboard, no deploy needed); this file is what the site
   falls back to if that table is unreachable or unconfigured.

   Covers load from Open Library's public covers CDN by ISBN-13,
   so no image asset lives in this repo. isbn13 is optional: a
   missing one falls back to a plain letter tile in the UI.
   ─────────────────────────────────────────────────────────── */

export type Book = {
  title: string;
  author: string;
  isbn13?: string;
  genres: string[];
  /* one line, in Haseeb's own words, not jacket copy */
  note: string;
  favorite?: boolean;
};

export const books: Book[] = [
  {
    title: "The Rosie Project",
    author: "Graeme Simsion",
    isbn13: "9781476729084",
    genres: ["Fiction"],
    note: "My favourite novel. Funny in a way that sneaks up on you.",
    favorite: true,
  },
  {
    title: "Life 3.0",
    author: "Max Tegmark",
    isbn13: "9781101946596",
    genres: ["Science", "AI"],
    note: "The clearest walk through what a post-AGI world could actually look like.",
  },
  {
    title: "The Singularity Is Near",
    author: "Ray Kurzweil",
    isbn13: "9780143037880",
    genres: ["Science", "AI"],
    note: "Read this one, then its 2024 sequel, back to back.",
  },
  {
    title: "The Singularity Is Nearer",
    author: "Ray Kurzweil",
    isbn13: "9780399562761",
    genres: ["Science", "AI"],
    note: "Kurzweil checking his own 2005 predictions against what actually happened.",
  },
  {
    title: "The Beginning of Infinity",
    author: "David Deutsch",
    isbn13: "9780143121350",
    genres: ["Science", "Philosophy"],
    note: "Dense, and worth the slow read. Changed how I think about explanation itself.",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    isbn13: "9781455586691",
    genres: ["Productivity"],
    note: "The book behind most of my actual work habits.",
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn13: "9781451648539",
    genres: ["Biography", "History"],
    note: "Not a hero story. That's what makes it worth reading.",
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    isbn13: "9781594631931",
    genres: ["Fiction"],
    note: "The one novel on this list that isn't here for the ideas in it.",
  },
];
