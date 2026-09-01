import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ───────────────────────────────────────────────────────────
   Server-only Supabase client.

   The .server.ts suffix keeps this out of the browser bundle,
   which matters: it holds the secret key, which authenticates
   as service_role and bypasses RLS. It must never be imported
   from a component that renders on the client.

   Returns null rather than throwing when the project is not
   configured, so a machine without credentials still runs the
   site off the static data files.
   ─────────────────────────────────────────────────────────── */

let cached: SupabaseClient | null | undefined;

export function supabaseServer(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "haseeb-portfolio" } },
  });
  return cached;
}

export function supabaseConfigured() {
  return supabaseServer() !== null;
}
