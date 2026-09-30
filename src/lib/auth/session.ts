import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import { randomToken, sha256Hex } from "@/lib/tokens";

export const SESSION_COOKIE = "sid";
const SESSION_DAYS = 30;

export type User = { id: string; phone: string | null; email: string | null; name: string | null; role: "customer" | "staff" | "admin" };

/** Opaque random token in an httpOnly cookie; only its SHA-256 is stored. */
export async function createSession(userId: string) {
  const token = randomToken(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const { error } = await db().from("sessions").insert({ id: sha256Hex(token), user_id: userId, expires_at: expires.toISOString() });
  if (error) throw new Error(`createSession: ${error.message}`);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export const currentUser = cache(async (): Promise<User | null> => {
  if (!isDbConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const { data } = await db()
    .from("sessions")
    .select("expires_at, users(id, phone, email, name, role)")
    .eq("id", sha256Hex(token))
    .maybeSingle();
  const u = data?.users as unknown as User | null;
  if (!data || !u || new Date(data.expires_at) <= new Date()) return null;
  return u;
});

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured()) await db().from("sessions").delete().eq("id", sha256Hex(token));
  jar.delete(SESSION_COOKIE);
}

export const isStaff = (u: User | null) => u?.role === "staff" || u?.role === "admin";
