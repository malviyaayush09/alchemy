import { db } from "@/lib/db";
import { fail, json } from "@/lib/http";
import { verifyOrderToken } from "@/lib/tokens";

/** Lightweight poll for the confirmation page while the webhook lands. */
export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const t = new URL(req.url).searchParams.get("t");
  if (!verifyOrderToken(number, t)) return fail(404, "Not found");
  const { data } = await db().from("orders").select("status, payment_status").eq("order_number", number).maybeSingle();
  if (!data) return fail(404, "Not found");
  return json({ ok: true, status: data.status, paymentStatus: data.payment_status });
}
