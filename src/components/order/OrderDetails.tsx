import { brand } from "@/config/brand";
import type { Order } from "@/lib/orders";
import { longDate } from "@/lib/time";
import { weightLabel } from "@/lib/types";
import { displayPhone } from "@/lib/validate";
import { formatPaise } from "@/components/ui/Price";
import { StatusTimeline } from "./StatusTimeline";

/** Shared order view: confirmation, guest tracking and My Account. */
export function OrderDetails({ order, invoiceHref }: { order: Order; invoiceHref?: string | null }) {
  const showRider = order.status === "out_for_delivery" && (order.riderName || order.riderPhone || order.trackingUrl);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div className="space-y-8">
        <section aria-labelledby="ot-status">
          <h2 id="ot-status" className="text-[1.5rem]">
            Status
          </h2>
          <div className="mt-4">
            <StatusTimeline order={order} />
          </div>
        </section>

        {showRider ? (
          <section aria-labelledby="ot-rider" className="border border-accent bg-paper-soft p-5">
            <h2 id="ot-rider" className="text-[1.375rem]">
              Your rider
            </h2>
            <dl className="mt-3 space-y-1 text-[0.9375rem] text-ink">
              {order.riderName ? (
                <div className="flex gap-2">
                  <dt className="text-body">Name</dt>
                  <dd>{order.riderName}</dd>
                </div>
              ) : null}
              {order.riderPhone ? (
                <div className="flex items-center gap-2">
                  <dt className="text-body">Phone</dt>
                  <dd>
                    <a href={`tel:${order.riderPhone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center underline decoration-accent underline-offset-4">
                      {displayPhone(order.riderPhone)}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            {order.trackingUrl ? (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex min-h-11 items-center bg-ink px-4 text-[0.9375rem] tracking-[0.12em] text-paper uppercase">
                Live tracking
              </a>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="ot-items">
          <h2 id="ot-items" className="text-[1.5rem]">
            Items
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-3">
                <div>
                  <p className="text-ink">
                    {i.quantity} × {i.productName} <span className="text-body">· {weightLabel(i.weightGrams)}</span>
                  </p>
                  {i.cakeMessage ? <p className="text-[0.9375rem] text-body">Message on cake: “{i.cakeMessage}”</p> : null}
                  {i.giftNote ? <p className="text-[0.9375rem] text-body">Gift note: “{i.giftNote}”</p> : null}
                </div>
                <span className="shrink-0 tabular-nums text-ink">{formatPaise(i.unitPaise * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <div className="border border-line bg-paper-soft p-5">
          <h2 className="eyebrow text-body">Delivery</h2>
          <p className="mt-2 font-display text-[1.25rem] text-ink">{longDate(order.deliveryDate)}</p>
          <p className="text-ink">{order.slotLabel}</p>
          {order.isSurprise ? (
            <p className="mt-3 border border-accent bg-paper px-3 py-2 text-[0.9375rem] text-ink">
              Surprise for <b className="font-medium">{order.recipientName}</b>. If the rider needs directions they&apos;ll call you, and your gift note goes in a sealed envelope.
            </p>
          ) : null}
          <address className="mt-3 text-[0.9375rem] not-italic text-body">
            {order.isSurprise && order.recipientName ? order.recipientName : order.customerName}
            <br />
            {order.addressLine1}
            {order.addressLine2 ? <>, {order.addressLine2}</> : null}
            {order.landmark ? (
              <>
                <br />
                {/^near\b/i.test(order.landmark) ? order.landmark : `Near ${order.landmark}`}
              </>
            ) : null}
            <br />
            {order.areaName} {order.pincode}
            <br />
            {displayPhone(order.phone)}
          </address>
        </div>
        <div className="border border-line bg-paper-soft p-5">
          <h2 className="eyebrow text-body">Payment</h2>
          <dl className="mt-2 space-y-1 text-[0.9375rem] text-ink">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPaise(order.subtotalPaise)}</dd>
            </div>
            {order.discountPaise ? (
              <div className="flex justify-between">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd className="tabular-nums">−{formatPaise(order.discountPaise)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="tabular-nums">{order.deliveryFeePaise ? formatPaise(order.deliveryFeePaise) : "Free"}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 font-medium">
              <dt>{order.paymentStatus === "paid" ? "Paid" : "Total"}</dt>
              <dd className="tabular-nums">{formatPaise(order.totalPaise)}</dd>
            </div>
          </dl>
          {invoiceHref && brand.legal.gstin && order.gstRateBps > 0 ? (
            <a href={invoiceHref} className="mt-4 inline-flex min-h-11 items-center text-[1rem] text-ink underline decoration-accent underline-offset-4">
              Download GST invoice (PDF)
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
