import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { isDbConfigured } from "@/lib/env";
import { getOrderByNumber } from "@/lib/orders";
import { orderToken, verifyOrderToken } from "@/lib/tokens";
import { GoldRule } from "@/components/brand/GoldRule";
import { OrderDetails } from "@/components/order/OrderDetails";
import { PaymentWatcher } from "@/components/order/PaymentWatcher";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> };

/** Order confirmation + tracking. Access: signed link (emails, checkout) or the signed-in owner. */
export default async function OrderPage({ params, searchParams }: Props) {
  if (!isDbConfigured()) notFound();
  const number = decodeURIComponent((await params).number);
  const { t } = await searchParams;
  const order = await getOrderByNumber(number);
  if (!order) notFound();

  const user = await currentUser();
  const owns = user && (order.userId === user.id || (user.phone && user.phone === order.phone));
  if (!verifyOrderToken(number, t) && !owns) notFound();

  const token = orderToken(number);
  const paid = order.paymentStatus === "paid";

  return (
    <div className="container-x py-8 lg:py-12">
      <header className="text-center">
        <GoldRule />
        <p className="eyebrow mt-4 text-body">Order {order.orderNumber}</p>
        <h1 className="mt-2 text-[2.25rem] sm:text-[3rem]">{paid ? "Thank you. Your order is placed." : "Almost there."}</h1>
        {paid ? <p className="mt-2 text-body">We&apos;ve emailed your confirmation to {order.email}. Bookmark this page to track your order.</p> : null}
      </header>
      <div className="mx-auto mt-6 max-w-2xl">
        <PaymentWatcher orderNumber={order.orderNumber} token={token} paid={paid} />
      </div>
      <div className="mt-8">
        <OrderDetails order={order} invoiceHref={paid ? `/api/invoices/${encodeURIComponent(order.orderNumber)}?t=${token}` : null} />
      </div>
      <div className="mt-10 text-center">
        <Button href="/collections" variant="outline">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
