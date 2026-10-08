import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth/session";
import { dbSupports } from "@/lib/capabilities";
import { isDbConfigured } from "@/lib/env";
import { getReminderForOrder } from "@/lib/reminders";
import { longDate } from "@/lib/time";
import { getOrderByNumber } from "@/lib/orders";
import { orderToken, verifyOrderToken } from "@/lib/tokens";
import { GoldRule } from "@/components/brand/GoldRule";
import { OrderDetails } from "@/components/order/OrderDetails";
import { PaymentWatcher } from "@/components/order/PaymentWatcher";
import { RemindMe } from "@/components/order/RemindMe";
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
  // "Settled" = nothing left to wait for (paid, or closed by the bakery).
  const paid = order.paymentStatus === "paid" || ["cancelled", "refunded"].includes(order.status);
  const canRemind = order.paymentStatus === "paid" && !["cancelled", "refunded"].includes(order.status) && (await dbSupports("reminders"));
  const reminder = canRemind ? await getReminderForOrder(order.id) : null;
  const headline: Partial<Record<typeof order.status, string>> = {
    placed: "Thank you. Your order is placed.",
    confirmed: "Your order is confirmed.",
    being_crafted: "Your cake is being crafted.",
    out_for_delivery: "Your order is on its way.",
    delivered: "Delivered. Enjoy!",
    cancelled: "This order was cancelled.",
    refunded: "This order was refunded.",
  };

  return (
    <div className="container-x py-8 lg:py-12">
      <header className="text-center">
        <GoldRule />
        <p className="eyebrow mt-4 text-body">Order {order.orderNumber}</p>
        <h1 className="mt-2 text-[2.25rem] sm:text-[3rem]">{paid ? (headline[order.status] ?? "Your order") : "Almost there."}</h1>
        {order.status === "placed" ? <p className="mt-2 text-body">We&apos;ve emailed your confirmation to {order.email}. Bookmark this page to track your order.</p> : null}
      </header>
      <div className="mx-auto mt-6 max-w-2xl">
        <PaymentWatcher orderNumber={order.orderNumber} token={token} paid={paid} />
      </div>
      <div className="mt-8">
        <OrderDetails order={order} invoiceHref={paid ? `/api/invoices/${encodeURIComponent(order.orderNumber)}?t=${token}` : null} />
      </div>
      {canRemind ? (
        <RemindMe
          orderNumber={order.orderNumber}
          token={token}
          email={order.email}
          defaultDate={order.deliveryDate}
          existing={
            reminder && !reminder.cancelled
              ? { occasion: reminder.occasion, person: reminder.person, date: reminder.celebrateOn, remindOnLabel: longDate(reminder.remindOn), celebrateOnLabel: longDate(reminder.celebrateOn) }
              : null
          }
        />
      ) : null}
      <div className="mt-10 text-center">
        <Button href="/collections" variant="outline">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
