import { createHmac } from "node:crypto";
import { brand } from "@/config/brand";
import { db } from "./db";
import { env } from "./env";
import { emailChannel, type Message } from "./notify/channels";
import { addDays, longDate, todayIST } from "./time";

/**
 * "Remind me next year": one email a week before the same date next year
 * (migration 0003). Created from the order page; sent by the daily cron at
 * /api/cron/reminders; cancellable from the link in the email.
 */

export const reminderOccasions = [
  { value: "birthday", label: "A birthday", occasionSlug: "birthday" },
  { value: "anniversary", label: "An anniversary", occasionSlug: "anniversary" },
  { value: "other", label: "Something else", occasionSlug: null },
] as const;
export type ReminderOccasion = (typeof reminderOccasions)[number]["value"];

export type Reminder = { id: string; occasion: ReminderOccasion; person: string; celebrateOn: string; remindOn: string; email: string; cancelled: boolean; sent: boolean };

const LEAD_DAYS = 7;

/** The next occurrence of `date`'s month and day whose reminder is still in the future. */
export function nextCelebration(date: string, today = todayIST()) {
  const [, m, d] = date.split("-");
  const day = m === "02" && d === "29" ? "28" : d; // a leap-day celebration is remembered on 28 Feb
  let year = Number(today.slice(0, 4));
  let on = `${year}-${m}-${day}`;
  while (addDays(on, -LEAD_DAYS) <= today) on = `${++year}-${m}-${day}`;
  return { celebrateOn: on, remindOn: addDays(on, -LEAD_DAYS) };
}

const key = () => createHmac("sha256", env.supabaseServiceKey || "dev-only-reminder-key").update("reminders:v1").digest();
export const reminderToken = (id: string) => createHmac("sha256", key()).update(id).digest("base64url").slice(0, 24);
export const cancelLink = (id: string) => `${env.siteUrl}/reminders/cancel?id=${id}&t=${reminderToken(id)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = (r: any): Reminder => ({
  id: r.id,
  occasion: r.occasion,
  person: r.person ?? "",
  celebrateOn: r.celebrate_on,
  remindOn: r.remind_on,
  email: r.email,
  cancelled: Boolean(r.cancelled_at),
  sent: Boolean(r.sent_at),
});

export async function getReminderForOrder(orderId: string): Promise<Reminder | null> {
  const { data } = await db().from("celebration_reminders").select("*").eq("order_id", orderId).maybeSingle();
  return data ? map(data) : null;
}

export async function saveReminder(input: { orderId: string; email: string; name: string; occasion: ReminderOccasion; person: string; date: string }) {
  const { celebrateOn, remindOn } = nextCelebration(input.date);
  const { data, error } = await db()
    .from("celebration_reminders")
    .upsert(
      { order_id: input.orderId, email: input.email, name: input.name, occasion: input.occasion, person: input.person, celebrate_on: celebrateOn, remind_on: remindOn, sent_at: null, cancelled_at: null },
      { onConflict: "order_id" },
    )
    .select("*")
    .single();
  if (error) throw new Error(`saveReminder: ${error.message}`);
  return map(data);
}

export async function cancelReminder(id: string) {
  const { error } = await db().from("celebration_reminders").update({ cancelled_at: new Date().toISOString() }).eq("id", id).is("cancelled_at", null);
  if (error) throw new Error(`cancelReminder: ${error.message}`);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function reminderMessage(r: Reminder & { name: string }): Message {
  const occ = reminderOccasions.find((o) => o.value === r.occasion);
  const what = r.occasion === "birthday" ? `${r.person ? `${r.person}'s` : "A"} birthday` : r.occasion === "anniversary" ? `${r.person ? `${r.person}'s` : "Your"} anniversary` : `${r.person ? `${r.person}'s` : "Your"} celebration`;
  const shop = `${env.siteUrl}${occ?.occasionSlug ? `/occasions/${occ.occasionSlug}` : "/collections"}`;
  const when = longDate(r.celebrateOn);
  const subject = `${what} is next week · ${brand.name}`;
  const hello = r.name ? `Hello ${r.name},` : "Hello,";
  const text = [
    hello,
    "",
    `You asked us to remind you: ${what} is on ${when}.`,
    "Every cake is made to order, so this is a good moment to choose one.",
    "",
    `Choose a cake: ${shop}`,
    "",
    `Don't want these reminders? ${cancelLink(r.id)}`,
  ].join("\n");
  const { ink, paper, accent } = brand.colors;
  const html = `<div style="font-family:Georgia,serif;background:${paper};padding:28px;color:${ink}">
<p style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:${ink};margin:0 0 12px">${esc(brand.name)}</p>
<h1 style="font-weight:normal;font-size:28px;margin:0 0 12px">${esc(what)} is next week.</h1>
<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;margin:0 0 6px">${esc(hello)}</p>
<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;margin:0 0 18px">You asked us to remind you: it's on <b>${esc(when)}</b>. Every cake is made to order, so this is a good moment to choose one.</p>
<p style="margin:0 0 24px"><a href="${shop}" style="background:${ink};color:${paper};padding:12px 20px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;letter-spacing:.12em;text-transform:uppercase;border-bottom:2px solid ${accent}">Choose a cake</a></p>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#555;margin:0">Don't want these reminders? <a href="${cancelLink(r.id)}" style="color:#555">Cancel this reminder</a>.</p></div>`;
  return { subject, html, text };
}

/** Send every reminder due today (or missed earlier). Returns counts for the cron log. */
export async function sendDueReminders(limit = 100) {
  const { data, error } = await db()
    .from("celebration_reminders")
    .select("*")
    .lte("remind_on", todayIST())
    .is("sent_at", null)
    .is("cancelled_at", null)
    .order("remind_on")
    .limit(limit);
  if (error) throw new Error(`dueReminders: ${error.message}`);
  let sent = 0;
  let failed = 0;
  for (const row of data ?? []) {
    const r = { ...map(row), name: row.name ?? "" };
    const res = await emailChannel.send(r.email, reminderMessage(r));
    if (res.status === "failed") {
      failed++;
      continue;
    }
    await db().from("celebration_reminders").update({ sent_at: new Date().toISOString() }).eq("id", r.id);
    sent++;
  }
  return { due: data?.length ?? 0, sent, failed };
}
