import { db } from "./db";
import { isDbConfigured } from "./env";
import { todayIST } from "./time";

export type ClosedDate = { date: string; reason: string | null };

/**
 * Upcoming days with no deliveries (Admin → Slots). Returns [] if the
 * 0002_operations.sql migration hasn't been run yet, so checkout keeps working.
 */
export async function getClosedDates(): Promise<ClosedDate[]> {
  if (!isDbConfigured()) return [];
  const { data, error } = await db().from("closed_dates").select("date, reason").gte("date", todayIST()).order("date");
  if (error) {
    if (!/closed_dates/.test(error.message)) console.error("[closed-dates]", error.message);
    return [];
  }
  return data ?? [];
}

export async function isClosedDate(date: string) {
  return (await getClosedDates()).some((d) => d.date === date);
}
