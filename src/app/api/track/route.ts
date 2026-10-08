import { features } from "@/config/features";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import { clientIp, fail, json, rateLimit, readJson, sameOrigin } from "@/lib/http";
import { orderToken } from "@/lib/tokens";
import { cleanText, normalizePhone } from "@/lib/validate";

/** Guest tracking: order number + phone must both match. Returns a signed order link. */
export async function POST(req: Request) {
  if (!features.trackOrder) return fail(404, "Not found");
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!isDbConfigured()) return fail(503, "Tracking isn't available yet.");
  if (!(await rateLimit(`track:${clientIp(req)}`, 600, 10))) return fail(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson<{ orderNumber?: string; phone?: string }>(req);
  const number = cleanText(body?.orderNumber, 20).toUpperCase();
  const phone = normalizePhone(body?.phone);
  if (!number || !phone) return fail(422, "Enter your order ID and the phone number used for the order.");
  const { data } = await db().from("orders").select("order_number").eq("order_number", number).eq("phone", phone).neq("status", "pending_payment").maybeSingle();
  // Same message whether the order or the phone is wrong: no order enumeration.
  if (!data) return fail(404, "We couldn't find an order with those details. Check the order ID and phone number.");
  return json({ ok: true, url: `/order/${encodeURIComponent(data.order_number)}?t=${orderToken(data.order_number)}` });
}
