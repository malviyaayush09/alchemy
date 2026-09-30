import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/**
 * Signed, unguessable links to a single order (confirmation / tracking from
 * emails) so guests never need to put a phone number in a URL. The signing key
 * is derived from the service-role secret; rotating that key revokes links.
 */
function key() {
  const base = env.supabaseServiceKey || "dev-only-order-link-key";
  return createHash("sha256").update(`${base}:order-links:v1`).digest();
}

export const orderToken = (orderNumber: string) => createHmac("sha256", key()).update(orderNumber).digest("base64url").slice(0, 32);

export function verifyOrderToken(orderNumber: string, token: string | null | undefined) {
  if (!token) return false;
  const a = Buffer.from(orderToken(orderNumber));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const sha256Hex = (s: string) => createHash("sha256").update(s).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export function hmacHex(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}
