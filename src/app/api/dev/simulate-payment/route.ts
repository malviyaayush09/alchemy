import { db } from "@/lib/db";
import { devToolsEnabled } from "@/lib/env";
import { fail, json, readJson, sameOrigin } from "@/lib/http";
import { webhookSecret } from "@/lib/razorpay";
import { hmacHex, randomToken, verifyOrderToken } from "@/lib/tokens";

/**
 * DEV ONLY (404 in production). Builds a Razorpay-shaped `payment.captured`
 * event, signs it with the webhook secret, and POSTs it to our real webhook,
 * so signature verification and mark-as-paid run exactly as they would live.
 */
export async function POST(req: Request) {
  if (!devToolsEnabled()) return fail(404, "Not found");
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  const body = await readJson<{ orderNumber?: string; token?: string }>(req);
  const number = String(body?.orderNumber ?? "");
  if (!verifyOrderToken(number, body?.token)) return fail(404, "Not found");

  const { data: order } = await db().from("orders").select("razorpay_order_id, total_paise").eq("order_number", number).maybeSingle();
  if (!order?.razorpay_order_id) return fail(404, "Order not found");
  // Never "pay" a real Razorpay order: only orders created without Razorpay keys can be simulated.
  if (!order.razorpay_order_id.startsWith("order_dev_")) return fail(403, "Only development orders can be simulated");

  const payload = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: `pay_dev_${randomToken(8)}`, order_id: order.razorpay_order_id, amount: order.total_paise, status: "captured", method: "upi" } } },
    created_at: Math.floor(Date.now() / 1000),
  });
  const res = await fetch(new URL("/api/razorpay/webhook", req.url), {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": hmacHex(webhookSecret()!, payload), "x-razorpay-event-id": `evt_dev_${randomToken(8)}` },
    body: payload,
  });
  return json({ ok: res.ok, webhookStatus: res.status, webhook: await res.json().catch(() => null) });
}
