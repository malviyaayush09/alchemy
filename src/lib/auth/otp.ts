import { randomInt, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { devToolsEnabled, env } from "@/lib/env";
import { rateLimit } from "@/lib/http";
import { sha256Hex } from "@/lib/tokens";
import { normalizeEmail, normalizePhone, ValidationError } from "@/lib/validate";
import { emailOtpProvider, smsProvider } from "./otp-providers";
import { createSession } from "./session";

const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

const hashCode = (destination: string, code: string) => sha256Hex(`${env.supabaseServiceKey}:otp:${destination}:${code}`);

function destinationFor(channel: "sms" | "email", raw: unknown) {
  const d = channel === "sms" ? normalizePhone(raw) : normalizeEmail(raw);
  if (!d) throw new ValidationError("destination", channel === "sms" ? "Enter a valid 10-digit mobile number." : "Enter a valid email address.");
  return d;
}

export async function requestOtp(channel: "sms" | "email", raw: unknown, ip: string) {
  const destination = destinationFor(channel, raw);
  const provider = channel === "sms" ? smsProvider() : emailOtpProvider;
  if (!provider) throw new ValidationError("destination", "Phone sign-in isn't available yet. Please use email.");

  if (!(await rateLimit(`otp:dest:${destination}`, 600, 3))) throw new ValidationError("destination", "Too many codes requested. Please wait 10 minutes.");
  if (!(await rateLimit(`otp:ip:${ip}`, 3600, 15))) throw new ValidationError("destination", "Too many attempts. Please try again later.");

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { error } = await db()
    .from("otp_codes")
    .insert({ channel, destination, code_hash: hashCode(destination, code), expires_at: new Date(Date.now() + TTL_MIN * 60_000).toISOString() });
  if (error) throw new Error(`requestOtp: ${error.message}`);
  await provider.send(destination, code);

  // The mock provider's code is shown on screen, in development only.
  return { destination, devCode: provider.isMock && devToolsEnabled() ? code : undefined };
}

export async function verifyOtp(channel: "sms" | "email", raw: unknown, code: unknown) {
  const destination = destinationFor(channel, raw);
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) throw new ValidationError("code", "Enter the 6-digit code.");

  const { data: row } = await db()
    .from("otp_codes")
    .select("*")
    .eq("destination", destination)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) throw new ValidationError("code", "That code has expired. Please request a new one.");
  if (row.attempts >= MAX_ATTEMPTS) throw new ValidationError("code", "Too many wrong attempts. Please request a new code.");

  const a = Buffer.from(hashCode(destination, code));
  const b = Buffer.from(row.code_hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db().from("otp_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    throw new ValidationError("code", "That code didn't match. Please try again.");
  }
  await db().from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);

  const field = channel === "sms" ? "phone" : "email";
  let { data: user } = await db().from("users").select("id").eq(field, destination).maybeSingle();
  if (!user) {
    const ins = await db().from("users").insert(channel === "sms" ? { phone: destination } : { email: destination }).select("id").single();
    if (ins.error) throw new Error(`create user: ${ins.error.message}`);
    user = ins.data;
  }
  await createSession(user!.id);
  return user!.id;
}
