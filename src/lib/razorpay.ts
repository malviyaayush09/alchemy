import { assertRazorpayTestMode, devToolsEnabled, env, isRazorpayConfigured } from "./env";
import { hmacHex, safeEqualHex } from "./tokens";

/** Used only when no webhook secret is configured, and only outside production. */
export const DEV_WEBHOOK_SECRET = "dev-webhook-secret";

export function webhookSecret(): string | null {
  if (env.razorpayWebhookSecret) return env.razorpayWebhookSecret;
  return devToolsEnabled() ? DEV_WEBHOOK_SECRET : null;
}

/** Verifies X-Razorpay-Signature: hex HMAC-SHA256 of the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = webhookSecret();
  if (!secret || !signature) return false;
  return safeEqualHex(hmacHex(secret, rawBody), signature);
}

/** Creates a Razorpay order (TEST mode only). Amount in paise. */
export async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  if (!isRazorpayConfigured()) throw new Error("Razorpay not configured");
  assertRazorpayTestMode();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Razorpay order failed: ${data?.error?.description ?? res.status}`);
  return data as { id: string; amount: number; currency: string };
}
