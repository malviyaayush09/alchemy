/** Small hand-written validators (no schema library in the approved stack). */

/** Accepts "98765 43210", "+91 98765-43210", "098765…" → "+919876543210", else null. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? `+91${d}` : null;
}

export const displayPhone = (e164: string) => e164.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");

export const isPincode = (s: unknown): s is string => typeof s === "string" && /^\d{6}$/.test(s);

export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const e = input.trim().toLowerCase();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}

/** Trims, collapses whitespace, strips control characters, enforces max length. */
export function cleanText(input: unknown, max: number, { multiline = false } = {}): string {
  if (typeof input !== "string") return "";
  let s = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}

export const isUuid = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const isHttpsUrl = (s: string) => {
  try {
    return new URL(s).protocol === "https:";
  } catch {
    return false;
  }
};

/** Rupees string from admin forms ("1,850" / "1850.50") → paise integer, or null. */
export function rupeesToPaise(input: unknown): number | null {
  if (typeof input !== "string") return null;
  const s = input.replace(/[,\s₹]/g, "");
  if (s === "") return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

export class ValidationError extends Error {
  field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}
