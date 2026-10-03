import { after } from "next/server";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import { fail, json } from "@/lib/http";
import { notifyOrderStatus } from "@/lib/notify";
import { notifyStaffNewOrder } from "@/lib/notify/staff";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sha256Hex } from "@/lib/tokens";

type PaymentEntity = { id: string; order_id: string; amount: number; status: string };
type WebhookBody = { event: string; payload?: { payment?: { entity?: PaymentEntity }; order?: { entity?: { id: string; amount_paid?: number } } } };

/**
 * Razorpay webhook. The ONLY place an order becomes paid.
 * 1. Verify HMAC signature over the raw body.  2. Deduplicate by event id.
 * 3. mark_order_paid() checks the amount and is idempotent.  4. Email after responding.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) return fail(401, "Invalid signature");
  if (!isDbConfigured()) return fail(503, "Not configured");

  let body: WebhookBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "Bad JSON");
  }

  const eventId = req.headers.get("x-razorpay-event-id") ?? `sha256:${sha256Hex(raw)}`;
  const ins = await db().from("payment_events").insert({ id: eventId, type: body.event, payload: body });
  if (ins.error) {
    if (ins.error.code === "23505") return json({ ok: true, duplicate: true }); // replay
    console.error("[webhook] store event", ins.error);
    return fail(500, "Store failed"); // Razorpay will retry
  }

  const payment = body.payload?.payment?.entity;
  if (!payment?.order_id) return json({ ok: true, ignored: body.event });

  if (body.event === "payment.captured" || body.event === "order.paid") {
    const { data: orderId, error } = await db().rpc("mark_order_paid", {
      p_razorpay_order_id: payment.order_id,
      p_payment_id: payment.id,
      p_amount: payment.amount,
    });
    if (error) {
      // Not found / amount mismatch will never succeed on retry: acknowledge and log loudly.
      console.error("[webhook] mark_order_paid", payment.order_id, error.message);
      return json({ ok: false, error: error.message });
    }
    if (orderId) {
      after(async () => {
        await notifyOrderStatus(orderId as string, "placed");
        await notifyStaffNewOrder(orderId as string);
      });
    }
    return json({ ok: true });
  }

  if (body.event === "payment.failed") {
    await db().from("orders").update({ payment_status: "failed", updated_at: new Date().toISOString() }).eq("razorpay_order_id", payment.order_id).eq("payment_status", "pending");
    return json({ ok: true });
  }

  return json({ ok: true, ignored: body.event });
}
