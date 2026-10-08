import { currentUser } from "@/lib/auth/session";
import { dbSupports } from "@/lib/capabilities";
import { fail, json, rateLimit, readJson, clientIp, sameOrigin } from "@/lib/http";
import { getOrderByNumber } from "@/lib/orders";
import { reminderOccasions, saveReminder, type ReminderOccasion } from "@/lib/reminders";
import { isIsoDate, longDate } from "@/lib/time";
import { verifyOrderToken } from "@/lib/tokens";
import { cleanText } from "@/lib/validate";

/** "Remind me next year" from the order page. Same access rule as the page: signed link or the signed-in owner. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!(await dbSupports("reminders"))) return fail(503, "Reminders aren't available yet.");
  if (!(await rateLimit(`remind:${clientIp(req)}`, 600, 20))) return fail(429, "Too many requests. Please wait a few minutes.");
  const body = await readJson<{ orderNumber?: string; token?: string; occasion?: string; person?: string; date?: string }>(req);
  const number = cleanText(body?.orderNumber, 20);
  const order = number ? await getOrderByNumber(number) : null;
  if (!order) return fail(404, "Order not found.");
  const user = await currentUser();
  const owns = user && (order.userId === user.id || (user.phone && user.phone === order.phone));
  if (!verifyOrderToken(number, body?.token) && !owns) return fail(404, "Order not found.");
  if (order.paymentStatus !== "paid") return fail(409, "Reminders can be set once the order is paid.");

  const occasion = reminderOccasions.find((o) => o.value === body?.occasion)?.value as ReminderOccasion | undefined;
  if (!occasion) return fail(422, "Choose what you're celebrating.", "occasion");
  const date = String(body?.date ?? "");
  if (!isIsoDate(date)) return fail(422, "Choose the date you're celebrating.", "date");
  const person = cleanText(body?.person, 40);

  const r = await saveReminder({ orderId: order.id, email: order.email, name: order.customerName, occasion, person, date });
  return json({ ok: true, remindOn: r.remindOn, remindOnLabel: longDate(r.remindOn), celebrateOnLabel: longDate(r.celebrateOn), email: r.email });
}
