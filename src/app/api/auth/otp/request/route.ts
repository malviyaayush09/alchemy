import { requestOtp } from "@/lib/auth/otp";
import { isDbConfigured } from "@/lib/env";
import { clientIp, fail, json, readJson, sameOrigin } from "@/lib/http";
import { ValidationError } from "@/lib/validate";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!isDbConfigured()) return fail(503, "Sign-in isn't available yet.");
  const body = await readJson<{ channel?: string; destination?: string }>(req);
  const channel = body?.channel === "email" ? "email" : "sms";
  try {
    const r = await requestOtp(channel, body?.destination, clientIp(req));
    return json({ ok: true, devCode: r.devCode });
  } catch (e) {
    if (e instanceof ValidationError) return fail(422, e.message, e.field);
    console.error("[otp/request]", e);
    return fail(500, "We couldn't send a code. Please try again.");
  }
}
