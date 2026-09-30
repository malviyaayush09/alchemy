import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import { clientIp, fail, json, rateLimit, readJson, sameOrigin } from "@/lib/http";
import { isPincode, normalizeEmail, normalizePhone } from "@/lib/validate";

/** Stores only what's needed to tell someone we've reached their pincode. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!(await rateLimit(`notify:${clientIp(req)}`, 3600, 10))) return fail(429, "Too many requests. Please try later.");
  const body = await readJson<{ pincode?: string; contact?: string }>(req);
  const pincode = String(body?.pincode ?? "").trim();
  const contact = normalizePhone(body?.contact) ?? normalizeEmail(body?.contact);
  if (!isPincode(pincode)) return fail(400, "Enter a 6-digit pincode.", "pincode");
  if (!contact) return fail(400, "Enter a valid phone number or email.", "contact");
  if (!isDbConfigured()) return fail(503, "Not available yet.");
  const { error } = await db().from("notify_requests").insert({ pincode, contact });
  if (error) return fail(500, "Couldn't save that. Please try again.");
  return json({ ok: true });
}
