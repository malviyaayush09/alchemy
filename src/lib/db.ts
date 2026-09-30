import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isDbConfigured } from "./env";

let client: SupabaseClient | null = null;

/**
 * Service-role client. SERVER ONLY. RLS is enabled with no policies, so this
 * is the only key that can read or write data.
 */
export function db(): SupabaseClient {
  if (!isDbConfigured()) throw new Error("Database not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  client ??= createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Unwraps a Supabase response, throwing on error. */
export function must<T>(res: { data: T; error: { message: string } | null }, what: string): NonNullable<T> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  if (res.data === null) throw new Error(`${what}: no data`);
  return res.data as NonNullable<T>;
}
