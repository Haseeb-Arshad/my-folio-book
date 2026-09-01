/**
 * Minimal .env reader for the Supabase scripts, so they can run with plain
 * `node` and no extra dependency. Never logs values.
 */
import { readFileSync, existsSync } from "node:fs";

export function loadEnv(file = ".env") {
  if (!existsSync(file)) return;

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

export function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.`);
    process.exit(1);
  }
  return value;
}

/**
 * Prefers an explicit SUPABASE_DB_URL. Otherwise builds the direct connection
 * string from the project ref and password, percent-encoding the password so
 * characters like @ do not break the URL.
 */
export function resolveDatabaseUrl() {
  const explicit = process.env.SUPABASE_DB_URL?.trim();
  if (explicit) return explicit;

  const url = requireEnv("SUPABASE_URL");
  const password = requireEnv("SUPABASE_DB_PASSWORD");
  const ref = new URL(url).hostname.split(".")[0];

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}
