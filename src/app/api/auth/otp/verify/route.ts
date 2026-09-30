import { verifyOtp } from "@/lib/auth/otp";
import { isDbConfigured } from "@/lib/env";
import { clientIp, fail, json, rateLimit, readJson, sameOrigin } from "@/lib/http";
import { ValidationError } from "@/lib/validate";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!isDbConfigured()) return fail(503, "Sign-in isn't available yet.");
  if (!(await rateLimit(`otp:verify:${clientIp(req)}`, 600, 30))) return fail(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson<{ channel?: string; destination?: string; code?: string }>(req);
  const channel = body?.channel === "email" ? "email" : "sms";
  try {
    await verifyOtp(channel, body?.destination, body?.code);
    return json({ ok: true });
  } catch (e) {
    if (e instanceof ValidationError) return fail(422, e.message, e.field);
    console.error("[otp/verify]", e);
    return fail(500, "Something went wrong. Please try again.");
  }
}
