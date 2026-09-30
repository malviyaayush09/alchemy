import { clientIp, fail, json, rateLimit, readJson, sameOrigin } from "@/lib/http";
import { checkPincode } from "@/lib/serviceability";
import { isPincode } from "@/lib/validate";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!(await rateLimit(`svc:${clientIp(req)}`, 60, 30))) return fail(429, "Too many checks. Please wait a minute.");
  const body = await readJson<{ pincode?: string }>(req);
  const pincode = String(body?.pincode ?? "").trim();
  if (!isPincode(pincode)) return fail(400, "Enter a 6-digit pincode.", "pincode");
  const area = await checkPincode(pincode);
  return json({ ok: true, serviceable: Boolean(area), pincode, area });
}
