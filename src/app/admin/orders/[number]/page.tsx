import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { db } from "@/lib/db";
import { invoiceAvailable } from "@/lib/invoice";
import { getOrderByNumber, NEXT_STATUSES, statusLabel } from "@/lib/orders";
import { formatStamp } from "@/lib/time";
import { displayPhone } from "@/lib/validate";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { OrderDetails } from "@/components/order/OrderDetails";

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const order = await getOrderByNumber(decodeURIComponent((await params).number));
  if (!order) notFound();
  const { data: log } = await db().from("notification_log").select("channel, template, status, error, created_at").eq("order_id", order.id).order("created_at", { ascending: false }).limit(20);

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex min-h-11 items-center text-[0.875rem] text-ink underline underline-offset-4">
        ← Orders
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[2rem]">{order.orderNumber}</h1>
        <p className="text-[0.875rem] text-body">
          {statusLabel[order.status]} · payment {order.paymentStatus} · placed {formatStamp(order.createdAt)}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="border border-line bg-paper p-4">
          <h2 className="eyebrow text-body">Customer</h2>
          <p className="mt-2 text-ink">{order.customerName}</p>
          <p>
            <a href={`tel:${order.phone}`} className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">
              {displayPhone(order.phone)}
            </a>
          </p>
          <p className="text-[0.875rem] break-all text-body">{order.email}</p>
        </div>
        <div className="border border-line bg-paper p-4">
          <h2 className="eyebrow text-body">Update status</h2>
          {NEXT_STATUSES[order.status].length || order.status === "out_for_delivery" ? (
            <StatusUpdateForm
              key={order.status}
              orderId={order.id}
              current={order.status}
              options={NEXT_STATUSES[order.status].map((s) => ({ value: s, label: statusLabel[s] }))}
              rider={{ name: order.riderName ?? "", phone: order.riderPhone?.replace(/^\+91/, "") ?? "", url: order.trackingUrl ?? "" }}
            />
          ) : (
            <p className="mt-2 text-[0.875rem] text-body">No further status changes.</p>
          )}
          <p className="mt-3 text-[0.75rem] text-body">Refunds: issue the refund in the Razorpay dashboard first, then mark the order Refunded here.</p>
        </div>
      </section>

      <OrderDetails order={order} invoiceHref={invoiceAvailable(order) && brand.legal.gstin ? `/api/invoices/${encodeURIComponent(order.orderNumber)}` : null} />

      <section className="border border-line bg-paper p-4">
        <h2 className="eyebrow text-body">History</h2>
        <ul className="mt-2 space-y-1 text-[0.8125rem] text-ink">
          {order.events.map((e) => (
            <li key={e.id}>
              {formatStamp(e.createdAt)} · {e.fromStatus ? `${statusLabel[e.fromStatus]} → ` : ""}
              {statusLabel[e.toStatus]}
              {e.note ? ` · ${e.note}` : ""}
            </li>
          ))}
        </ul>
        <h2 className="eyebrow mt-4 text-body">Notifications</h2>
        <ul className="mt-2 space-y-1 text-[0.8125rem] text-ink">
          {(log ?? []).map((l, i) => (
            <li key={i}>
              {formatStamp(l.created_at)} · {l.channel} · {l.template} · {l.status}
              {l.error ? ` (${l.error.slice(0, 80)})` : ""}
            </li>
          ))}
          {!log?.length ? <li className="text-body">None yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
