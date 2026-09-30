import { couponProblem, findCoupon } from "@/lib/checkout";
import { isDbConfigured } from "@/lib/env";
import { clientIp, fail, json, rateLimit, readJson, sameOrigin } from "@/lib/http";
import { couponDiscount } from "@/lib/pricing";

/** Preview only; the checkout re-validates the coupon against the server-priced subtotal. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!isDbConfigured()) return fail(503, "Coupons aren't available yet.");
  if (!(await rateLimit(`coupon:${clientIp(req)}`, 600, 30))) return fail(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson<{ code?: string; subtotalPaise?: number }>(req);
  const subtotal = Math.max(0, Math.floor(Number(body?.subtotalPaise) || 0));
  const coupon = await findCoupon(String(body?.code ?? ""));
  const problem = couponProblem(coupon, subtotal);
  if (problem || !coupon) return fail(422, problem ?? "That coupon code isn't valid.", "coupon");
  return json({ ok: true, code: coupon.code, discountPaise: couponDiscount(subtotal, coupon) });
}
