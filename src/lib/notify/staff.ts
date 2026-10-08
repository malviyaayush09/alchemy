import { brand } from "@/config/brand";
import { getSettings } from "@/lib/catalog";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getOrderById } from "@/lib/orders";
import { longDate } from "@/lib/time";
import { weightLabel } from "@/lib/types";
import { displayPhone } from "@/lib/validate";
import { emailChannel } from "./channels";

const inr = (p: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p / 100);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Email every staff alert address (Admin → Settings). Never throws. */
export async function emailStaff(subject: string, text: string, html: string, log?: { orderId: string; template: string }) {
  try {
    const { alertEmails } = await getSettings();
    for (const to of alertEmails) {
      const r = await emailChannel.send(to, { subject, text, html });
      if (log) await db().from("notification_log").insert({ order_id: log.orderId, channel: "email", template: log.template, recipient: to, status: r.status, error: r.error ?? null });
    }
  } catch (e) {
    console.error("[staff-alert] failed", e);
  }
}

/** "New paid order" alert for the bakery, with everything the kitchen needs. */
export async function notifyStaffNewOrder(orderId: string) {
  const o = await getOrderById(orderId);
  if (!o) return;
  const adminUrl = `${env.siteUrl}/admin/orders/${encodeURIComponent(o.orderNumber)}`;
  const where = `${o.addressLine1}${o.addressLine2 ? `, ${o.addressLine2}` : ""}${o.landmark ? ` (${o.landmark})` : ""}, ${o.areaName} ${o.pincode}`;
  const subject = `${o.isSurprise ? "SURPRISE · " : ""}New order ${o.orderNumber} · ${longDate(o.deliveryDate)}, ${o.slotLabel} · ${inr(o.totalPaise)}`;

  const text = [
    `New paid order for ${brand.name}.`,
    "",
    `Delivery: ${longDate(o.deliveryDate)}, ${o.slotLabel}`,
    "",
    ...o.items.map(
      (i) =>
        `${i.quantity} × ${i.productName} (${weightLabel(i.weightGrams)})` +
        (i.cakeMessage ? `\n   Message on cake: "${i.cakeMessage}"` : "") +
        (i.giftNote ? `\n   Gift note: "${i.giftNote}"` : ""),
    ),
    "",
    ...(o.isSurprise ? [`SURPRISE for ${o.recipientName ?? "someone"}: seal the gift note in an envelope; rider calls the customer, not the recipient`] : []),
    `Customer: ${o.customerName}, ${displayPhone(o.phone)}`,
    `Address: ${where}`,
    `Total paid: ${inr(o.totalPaise)}${o.couponCode ? ` (coupon ${o.couponCode})` : ""}`,
    "",
    `Open in admin: ${adminUrl}`,
  ].join("\n");

  const items = o.items
    .map(
      (i) =>
        `<li>${i.quantity} × ${esc(i.productName)} (${esc(weightLabel(i.weightGrams))})` +
        (i.cakeMessage ? `<br><b>Message on cake:</b> “${esc(i.cakeMessage)}”` : "") +
        (i.giftNote ? `<br><b>Gift note:</b> “${esc(i.giftNote)}”` : "") +
        `</li>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222">
<p style="font-size:18px;margin:0 0 12px"><b>New order ${esc(o.orderNumber)}</b> · ${esc(inr(o.totalPaise))}</p>
<p style="margin:0 0 12px"><b>Delivery:</b> ${esc(longDate(o.deliveryDate))}, ${esc(o.slotLabel)}</p>
<ul style="padding-left:18px;margin:0 0 12px">${items}</ul>
${o.isSurprise ? `<p style="margin:0 0 12px;padding:8px 10px;border:2px solid #222"><b>SURPRISE</b> for ${esc(o.recipientName ?? "someone")}: seal the gift note in an envelope; the rider calls the customer, not the recipient.</p>` : ""}
<p style="margin:0 0 4px"><b>Customer:</b> ${esc(o.customerName)}, <a href="tel:${o.phone}">${esc(displayPhone(o.phone))}</a></p>
<p style="margin:0 0 12px"><b>Address:</b> ${esc(where)}</p>
<p><a href="${adminUrl}" style="background:${brand.colors.ink};color:#ffffff;padding:10px 16px;text-decoration:none">Open in admin</a></p></div>`;

  await emailStaff(subject, text, html, { orderId, template: "staff_new_order" });
}
