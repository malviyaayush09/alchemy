import { currentUser } from "@/lib/auth/session";
import { createCheckout, type CheckoutInput } from "@/lib/checkout";
import { isDbConfigured } from "@/lib/env";
import { clientIp, fail, json, rateLimit, readJson, sameOrigin } from "@/lib/http";
import { ValidationError } from "@/lib/validate";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Forbidden");
  if (!isDbConfigured()) return fail(503, "The store isn't connected to its database yet.");
  if (!(await rateLimit(`checkout:${clientIp(req)}`, 600, 20))) return fail(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson<CheckoutInput>(req);
  if (!body) return fail(400, "Bad request");
  try {
    const user = await currentUser();
    const result = await createCheckout(body, user?.id ?? null);
    return json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof ValidationError) return fail(422, e.message, e.field);
    console.error("[checkout]", e);
    return fail(500, "We couldn't start your payment. Please try again.");
  }
}
