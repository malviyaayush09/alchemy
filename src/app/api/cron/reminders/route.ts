import { dbSupports } from "@/lib/capabilities";
import { devToolsEnabled } from "@/lib/env";
import { fail, json } from "@/lib/http";
import { sendDueReminders } from "@/lib/reminders";
import { safeEqualHex } from "@/lib/tokens";

/**
 * Daily job (vercel.json → crons): emails every celebration reminder that is due.
 * Vercel sends "Authorization: Bearer $CRON_SECRET". Locally, with dev tools on
 * and no CRON_SECRET set, it can be opened directly to test.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const ok = secret ? safeEqualHex(auth, `Bearer ${secret}`) : devToolsEnabled();
  if (!ok) return fail(401, "Unauthorized");
  if (!(await dbSupports("reminders"))) return json({ ok: true, skipped: "migration 0003 not run" });
  return json({ ok: true, ...(await sendDueReminders()) });
}
