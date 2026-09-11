import { readFile } from "node:fs/promises";
import path from "node:path";

const GOOGLE_DOC_ID = "11fFa_Vj2gVtl6JLyUPDLYhBf37DRUAlIkIwoafBogx4";
const EXPORT_URL = `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=pdf`;
const FALLBACK_PATH = path.join(
  process.cwd(),
  "app/data/assets/resume-fallback.pdf",
);
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { buffer: Buffer; fetchedAt: number } | null = null;
let inFlight: Promise<Buffer> | null = null;

async function fetchFromGoogleDocs(): Promise<Buffer> {
  const response = await fetch(EXPORT_URL);
  if (!response.ok) {
    throw new Error(`Google Docs export failed: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getCvPdf(): Promise<Buffer> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.buffer;
  }

  if (!inFlight) {
    inFlight = fetchFromGoogleDocs()
      .then((buffer) => {
        cache = { buffer, fetchedAt: Date.now() };
        return buffer;
      })
      .catch(async (error) => {
        console.error("cv-pdf: falling back to bundled résumé", error);
        if (cache) return cache.buffer;
        return readFile(FALLBACK_PATH);
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}
