import Link from "next/link";
import { db, must } from "@/lib/db";
import { mapOrder, ORDER_SELECT, statusLabel } from "@/lib/orders";
import { getAllSlots } from "@/lib/slots";
import { addDays, isIsoDate, longDate, todayIST } from "@/lib/time";
import { weightLabel } from "@/lib/types";
import { displayPhone } from "@/lib/validate";
import { PrintButton } from "@/components/admin/PrintButton";

/** Orders the kitchen still has to make or hand over (paid and not cancelled/refunded). */
const ACTIVE = ["placed", "confirmed", "being_crafted", "out_for_delivery", "delivered"] as const;

export default async function KitchenSheetPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const sp = await searchParams;
  const today = todayIST();
  const date = sp.date && isIsoDate(sp.date) ? sp.date : today;

  const [slots, rows] = await Promise.all([
    getAllSlots(),
    db().from("orders").select(ORDER_SELECT).eq("delivery_date", date).in("status", [...ACTIVE]).order("created_at"),
  ]);
  const orders = (must(rows, "kitchen orders") as unknown[]).map(mapOrder);
  const slotOrder = new Map(slots.map((s, i) => [s.id, i]));
  orders.sort((a, b) => (slotOrder.get(a.slotId ?? "") ?? 99) - (slotOrder.get(b.slotId ?? "") ?? 99));

  // Prep list: how many of each cake × weight to make today.
  const prep = new Map<string, number>();
  for (const o of orders) for (const i of o.items) prep.set(`${i.productName} · ${weightLabel(i.weightGrams)}`, (prep.get(`${i.productName} · ${weightLabel(i.weightGrams)}`) ?? 0) + i.quantity);
  const bySlot = new Map<string, typeof orders>();
  for (const o of orders) bySlot.set(o.slotLabel, [...(bySlot.get(o.slotLabel) ?? []), o]);

  const nav = (d: string, label: string) => (
    <Link href={`/admin/kitchen?date=${d}`} aria-current={d === date ? "page" : undefined} className={`inline-flex min-h-11 items-center border px-3 text-[0.875rem] ${d === date ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink"}`}>
      {label}
    </Link>
  );

  return (
    <div className="kitchen-sheet">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <h1 className="text-[2rem]">Kitchen sheet</h1>
        <PrintButton />
      </div>
      <form method="get" className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
        {nav(today, "Today")}
        {nav(addDays(today, 1), "Tomorrow")}
        <input type="date" name="date" defaultValue={date} className="min-h-11 border border-line bg-paper px-3 text-ink" aria-label="Pick a date" />
        <button className="min-h-11 border border-ink px-3 text-[0.875rem] text-ink">Show</button>
      </form>

      <h2 className="mt-6 text-[1.625rem]">
        {longDate(date)} <span className="text-[1rem] text-body">· {orders.length} {orders.length === 1 ? "order" : "orders"}</span>
      </h2>

      {orders.length === 0 ? (
        <p className="mt-4 text-body">No paid orders for this day.</p>
      ) : (
        <>
          <section aria-labelledby="prep" className="mt-4 border border-line bg-paper p-4 print:border-black">
            <h3 id="prep" className="eyebrow text-body">
              Prep list
            </h3>
            <ul className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {[...prep.entries()].map(([k, n]) => (
                <li key={k} className="flex justify-between gap-3 text-[1rem] text-ink">
                  <span>{k}</span>
                  <b className="font-medium tabular-nums">× {n}</b>
                </li>
              ))}
            </ul>
          </section>

          {[...bySlot.entries()].map(([slot, list]) => (
            <section key={slot} className="mt-6 break-inside-avoid" aria-labelledby={`s-${slot}`}>
              <h3 id={`s-${slot}`} className="border-b border-ink pb-1 text-[1.375rem]">
                {slot} <span className="text-[0.9375rem] text-body">({list.length})</span>
              </h3>
              <ol className="mt-3 grid gap-3 lg:grid-cols-2 print:grid-cols-1">
                {list.map((o) => (
                  <li key={o.id} className="break-inside-avoid border border-line bg-paper p-4 print:border-black">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`} className="font-medium text-ink underline underline-offset-4 print:no-underline">
                        {o.orderNumber}
                      </Link>
                      <span className="border border-ink px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink">{statusLabel[o.status]}</span>
                    </div>
                    <ul className="mt-2 space-y-2">
                      {o.items.map((i) => (
                        <li key={i.id}>
                          <p className="text-[1.0625rem] text-ink">
                            <b className="font-medium">{i.quantity} ×</b> {i.productName} <span className="text-body">· {weightLabel(i.weightGrams)}</span>
                          </p>
                          {i.cakeMessage ? (
                            <p className="mt-1 border-l-4 border-accent bg-paper-soft px-3 py-1.5 font-display text-[1.375rem] text-ink">“{i.cakeMessage}”</p>
                          ) : (
                            <p className="text-[0.8125rem] text-body">No message on cake</p>
                          )}
                          {i.giftNote ? <p className="mt-1 text-[0.875rem] text-ink">Gift note card: “{i.giftNote}”</p> : null}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 border-t border-line pt-2 text-[0.875rem] text-ink">
                      {o.isSurprise ? (
                        <p className="mb-1 font-medium uppercase tracking-[0.08em]">Surprise for {o.recipientName} · sealed envelope · rider calls customer</p>
                      ) : null}
                      <p>
                        {o.customerName} ·{" "}
                        <a href={`tel:${o.phone}`} className="underline underline-offset-2">
                          {displayPhone(o.phone)}
                        </a>
                      </p>
                      <p className="text-body">
                        {o.addressLine1}
                        {o.addressLine2 ? `, ${o.addressLine2}` : ""}
                        {o.landmark ? ` (${o.landmark})` : ""}, {o.areaName} {o.pincode}
                      </p>
                      {o.riderName || o.riderPhone ? (
                        <p className="mt-1">
                          Rider: {o.riderName ?? ""} {o.riderPhone ? displayPhone(o.riderPhone) : ""}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
