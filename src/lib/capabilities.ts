import { db } from "./db";
import { isDbConfigured } from "./env";

/**
 * Features that need a later migration switch themselves on only once its
 * columns/tables exist, so the site never breaks before the SQL is run.
 * A positive answer is cached for the process; a negative one is re-checked
 * every minute (so running the migration takes effect without a restart).
 */
type Feature = "surprise" | "reminders";

const probes: Record<Feature, () => PromiseLike<{ error: unknown }>> = {
  surprise: () => db().from("orders").select("is_surprise").limit(1),
  reminders: () => db().from("celebration_reminders").select("id").limit(1),
};

const cache = new Map<Feature, { ok: boolean; at: number }>();

export async function dbSupports(feature: Feature): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const hit = cache.get(feature);
  if (hit && (hit.ok || Date.now() - hit.at < 60_000)) return hit.ok;
  let ok = false;
  try {
    ok = !(await probes[feature]()).error;
  } catch {
    ok = false;
  }
  cache.set(feature, { ok, at: Date.now() });
  return ok;
}
