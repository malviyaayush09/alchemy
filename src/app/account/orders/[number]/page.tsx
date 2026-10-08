import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { getOrderByNumber } from "@/lib/orders";
import { orderToken } from "@/lib/tokens";
import { OrderDetails } from "@/components/order/OrderDetails";

export default async function AccountOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const user = (await currentUser())!;
  const number = decodeURIComponent((await params).number);
  const order = await getOrderByNumber(number);
  if (!order || order.status === "pending_payment" || !(order.userId === user.id || (user.phone && order.phone === user.phone))) notFound();
  return (
    <>
      <Link href="/account" className="inline-flex min-h-11 items-center text-[1rem] text-ink underline decoration-accent underline-offset-4">
        ← All orders
      </Link>
      <h2 className="mt-2 text-[1.875rem]">Order {order.orderNumber}</h2>
      <div className="mt-6">
        <OrderDetails order={order} invoiceHref={order.paymentStatus === "paid" ? `/api/invoices/${encodeURIComponent(order.orderNumber)}?t=${orderToken(order.orderNumber)}` : null} />
      </div>
    </>
  );
}
