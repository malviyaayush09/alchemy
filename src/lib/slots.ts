import { db, must } from "./db";
import { isDbConfigured } from "./env";
import { addDays, nowMinutesIST, timeToMinutes, todayIST } from "./time";
import type { Slot } from "./types";

export type SlotAvailability = Slot & { remaining: number; available: boolean; reason: null | "full" | "cutoff" | "past" };

type SlotRow = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  capacity: number;
  same_day_cutoff: string;
  kind: Slot["kind"];
  is_enabled: boolean;
  sort_order: number;
};

export const mapSlot = (r: SlotRow): Slot => ({
  id: r.id,
  label: r.label,
  startTime: r.start_time.slice(0, 5),
  endTime: r.end_time.slice(0, 5),
  capacity: r.capacity,
  sameDayCutoff: r.same_day_cutoff.slice(0, 5),
  kind: r.kind,
  isEnabled: r.is_enabled,
  sortOrder: r.sort_order,
});

export async function getAllSlots(): Promise<Slot[]> {
  const rows = must(await db().from("delivery_slots").select("*").order("sort_order").order("start_time"), "getAllSlots") as SlotRow[];
  return rows.map(mapSlot);
}

/** Bookable dates: today through today + maxDaysAhead (IST). */
export function bookableDates(maxDaysAhead: number, now = new Date()) {
  const today = todayIST(now);
  return Array.from({ length: maxDaysAhead + 1 }, (_, i) => addDays(today, i));
}

/**
 * Availability for one date. Only enabled slots are listed, so midnight or
 * express slots appear only when admin enables them. A slot is disabled when
 * it is full, or (for today) when its same-day cutoff or start time has passed.
 */
export async function getSlotAvailability(date: string, maxDaysAhead: number, now = new Date()): Promise<SlotAvailability[]> {
  if (!isDbConfigured()) return [];
  const dates = bookableDates(maxDaysAhead, now);
  if (!dates.includes(date)) return [];

  const slots = (await getAllSlots()).filter((s) => s.isEnabled);
  const nowIso = now.toISOString();
  const booked = must(
    await db()
      .from("orders")
      .select("slot_id")
      .eq("delivery_date", date)
      .or(`status.in.(placed,confirmed,being_crafted,out_for_delivery,delivered),and(status.eq.pending_payment,hold_expires_at.gt.${nowIso})`),
    "bookedCounts",
  ) as { slot_id: string }[];
  const counts = new Map<string, number>();
  for (const b of booked) counts.set(b.slot_id, (counts.get(b.slot_id) ?? 0) + 1);

  const isToday = date === todayIST(now);
  const nowMin = nowMinutesIST(now);

  return slots.map((s) => {
    const remaining = Math.max(0, s.capacity - (counts.get(s.id) ?? 0));
    let reason: SlotAvailability["reason"] = null;
    if (isToday && nowMin >= timeToMinutes(s.startTime)) reason = "past";
    else if (isToday && nowMin >= timeToMinutes(s.sameDayCutoff)) reason = "cutoff";
    else if (remaining === 0) reason = "full";
    return { ...s, remaining, available: reason === null, reason };
  });
}
