import { getSettings } from "@/lib/catalog";
import { isClosedDate } from "@/lib/closed-dates";
import { fail, json } from "@/lib/http";
import { bookableDates, getSlotAvailability } from "@/lib/slots";
import { isIsoDate } from "@/lib/time";

/** GET /api/slots → bookable dates; GET /api/slots?date=YYYY-MM-DD → slots for that date. */
export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date");
  const settings = await getSettings();
  if (!date) return json({ ok: true, dates: bookableDates(settings.maxDaysAhead) });
  if (!isIsoDate(date)) return fail(400, "Invalid date");
  const slots = await getSlotAvailability(date, settings.maxDaysAhead);
  return json({
    ok: true,
    date,
    closed: await isClosedDate(date),
    slots: slots.map((s) => ({ id: s.id, label: s.label, kind: s.kind, available: s.available, reason: s.reason })),
  });
}
