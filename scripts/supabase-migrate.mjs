/**
 * Applies every SQL file in supabase/migrations, in filename order, inside a
 * single transaction per file.
 *
 * Uses a direct Postgres connection because the REST API cannot run DDL.
 * Requires SUPABASE_DB_URL (or SUPABASE_DB_PASSWORD + SUPABASE_URL) in .env.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadEnv, resolveDatabaseUrl } from "./supabase-env.mjs";

loadEnv();

const migrationsDir = path.resolve("supabase/migrations");
const files = (await readdir(migrationsDir))
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("No migrations found.");
  process.exit(0);
}

const client = new pg.Client({
  connectionString: resolveDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});

await client.connect();
console.log("Connected.");

try {
  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    process.stdout.write(`  ${file} ... `);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("commit");
      console.log("ok");
    } catch (error) {
      await client.query("rollback");
      console.log("FAILED");
      throw error;
    }
  }
  console.log(`Applied ${files.length} migration(s).`);
} finally {
  await client.end();
}
