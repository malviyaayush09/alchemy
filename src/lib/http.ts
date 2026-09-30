import { NextResponse } from "next/server";
import { db } from "./db";
import { isDbConfigured } from "./env";

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

export const fail = (status: number, error: string, field?: string) => json({ ok: false, error, field }, status);

/** Rejects cross-site POSTs to our JSON endpoints (server actions have this built in). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetch from some browsers omits Origin on same-site; cookies are SameSite=Lax
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** Postgres-backed fixed-window limiter. Fails open only when the DB is not configured (local preview). */
export async function rateLimit(key: string, windowSeconds: number, max: number) {
  if (!isDbConfigured()) return true;
  const { data, error } = await db().rpc("hit_rate_limit", { p_key: key, p_window_seconds: windowSeconds, p_max: max });
  if (error) throw new Error(`rateLimit: ${error.message}`);
  return data === true;
}
