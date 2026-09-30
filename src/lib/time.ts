/** All delivery logic runs in India Standard Time (UTC+5:30, no DST). */
const TZ = "Asia/Kolkata";

const partsFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function istParts(d = new Date()) {
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/** Today's date in IST as YYYY-MM-DD. */
export const todayIST = (now = new Date()) => istParts(now).date;

/** Minutes since midnight, IST. */
export const nowMinutesIST = (now = new Date()) => istParts(now).minutes;

/** "HH:MM[:SS]" → minutes since midnight. */
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

const dayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const weekdayShort = (date: string) => dayFmt.format(new Date(`${date}T00:00:00Z`));
export const dayMonth = (date: string) => dateFmt.format(new Date(`${date}T00:00:00Z`));
export const longDate = (date: string) => longFmt.format(new Date(`${date}T00:00:00Z`));

const stampFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const formatStamp = (iso: string) => stampFmt.format(new Date(iso));

/** Indian financial year label for a date, e.g. 2026-27. */
export function financialYear(date: string) {
  const [y, m] = date.split("-").map(Number);
  const start = m >= 4 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}
