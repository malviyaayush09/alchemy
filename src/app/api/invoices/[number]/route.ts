import { currentUser, isStaff } from "@/lib/auth/session";
import { isDbConfigured } from "@/lib/env";
import { fail } from "@/lib/http";
import { ensureInvoiceNumber, invoiceAvailable, renderInvoice } from "@/lib/invoice";
import { getOrderByNumber } from "@/lib/orders";
import { verifyOrderToken } from "@/lib/tokens";

/** GST invoice PDF. Access: signed order link, the signed-in owner, or staff. Hidden when no GSTIN is configured. */
export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  if (!isDbConfigured()) return fail(404, "Not found");
  const number = decodeURIComponent((await params).number);
  const order = await getOrderByNumber(number);
  if (!order) return fail(404, "Not found");
  const user = await currentUser();
  const allowed = verifyOrderToken(number, new URL(req.url).searchParams.get("t")) || isStaff(user) || (user && (order.userId === user.id || user.phone === order.phone));
  if (!allowed || !invoiceAvailable(order)) return fail(404, "Not found");

  const { invoiceNo, invoiceDate } = await ensureInvoiceNumber(order);
  const pdf = renderInvoice(order, invoiceNo, invoiceDate);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="invoice-${invoiceNo.replace(/\//g, "-")}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
