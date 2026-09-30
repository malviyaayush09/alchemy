import { db } from "@/lib/db";
import { getOrderById } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";
import { channels } from "./channels";
import { orderMessage } from "./templates";

/**
 * Notify the customer that their order reached `status`, on every enabled
 * channel. Never throws: a failed email must not fail a payment or a status update.
 */
export async function notifyOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await getOrderById(orderId);
    if (!order) return;
    const msg = orderMessage(order, status);
    if (!msg) return;
    for (const ch of channels) {
      const to = ch.recipient(order);
      if (!to) continue;
      const r = await ch.send(to, msg);
      await db().from("notification_log").insert({ order_id: orderId, channel: ch.name, template: status, recipient: to, status: r.status, error: r.error ?? null });
    }
  } catch (e) {
    console.error("[notify] failed", orderId, status, e);
  }
}
