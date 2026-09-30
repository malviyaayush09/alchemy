import Link from "next/link";
import { db, must } from "@/lib/db";
import { mapOrder, ORDER_SELECT, statusLabel } from "@/lib/orders";
import { getAllSlots } from "@/lib/slots";
import { dayMonth, isIsoDate, todayIST, weekdayShort } from "@/lib/time";
import type { OrderStatus } from "@/lib/types";
import { displayPhone, normalizePhone } from "@/lib/validate";
import { adminInput } from "@/components/admin/AdminForm";
import { buttonClasses } from "@/components/ui/Button";
import { formatPaise } from "@/components/ui/Price";

type Search = Promise<{ date?: string; slot?: string; status?: string; q?: string; view?: string }>;
const STATUSES = Object.keys(statusLabel) as OrderStatus[];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const slots = await getAllSlots();
  const today = todayIST();

  let q = db().from("orders").select(ORDER_SELECT).order("delivery_date").order("created_at").limit(200);
  if (sp.date && isIsoDate(sp.date)) q = q.eq("delivery_date", sp.date);
  else if (sp.view !== "all") q = q.gte("delivery_date", today);
  if (sp.slot && slots.some((s) => s.id === sp.slot)) q = q.eq("slot_id", sp.slot);
  if (sp.status && STATUSES.includes(sp.status as OrderStatus)) q = q.eq("status", sp.status);
  else q = q.neq("status", "pending_payment");
  const term = sp.q?.trim();
  if (term) {
    const phone = normalizePhone(term);
    q = phone ? q.eq("phone", phone) : q.ilike("order_number", `%${term.replace(/[%_,()]/g, "")}%`);
  }
  const orders = (must(await q, "admin orders") as unknown[]).map(mapOrder);

  // Group by delivery date for the kitchen/rider view.
  const byDate = new Map<string, typeof orders>();
  for (const o of orders) byDate.set(o.deliveryDate, [...(byDate.get(o.deliveryDate) ?? []), o]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[2rem]">Orders</h1>
        <p className="text-[0.875rem] text-body">{orders.length} shown{sp.view === "all" || sp.date ? "" : " · today onwards"}</p>
      </div>

      <form method="get" className="mt-4 grid grid-cols-2 gap-3 border border-line bg-paper p-3 sm:grid-cols-3 lg:grid-cols-6">
        <label className="col-span-2 space-y-1 sm:col-span-1">
          <span className="block text-[0.75rem] font-medium text-ink">Date</span>
          <input type="date" name="date" defaultValue={sp.date ?? ""} className={adminInput} />
        </label>
        <label className="space-y-1">
          <span className="block text-[0.75rem] font-medium text-ink">Slot</span>
          <select name="slot" defaultValue={sp.slot ?? ""} className={adminInput}>
            <option value="">All slots</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[0.75rem] font-medium text-ink">Status</span>
          <select name="status" defaultValue={sp.status ?? ""} className={adminInput}>
            <option value="">All paid</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 space-y-1 sm:col-span-1 lg:col-span-2">
          <span className="block text-[0.75rem] font-medium text-ink">Order ID or phone</span>
          <input type="search" name="q" defaultValue={sp.q ?? ""} className={adminInput} inputMode="search" />
        </label>
        <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
          <button className={buttonClasses("primary", "sm", true)}>Filter</button>
          <Link href="/admin/orders" className={buttonClasses("outline", "sm")}>
            Reset
          </Link>
        </div>
      </form>
      <p className="mt-2 text-[0.8125rem]">
        <Link href="/admin/orders?view=all" className="text-ink underline underline-offset-4">
          Include past dates
        </Link>
      </p>

      {orders.length === 0 ? <p className="mt-8 text-body">No orders match.</p> : null}
      {[...byDate.entries()].map(([date, list]) => (
        <section key={date} className="mt-6" aria-labelledby={`d-${date}`}>
          <h2 id={`d-${date}`} className="text-[1.375rem]">
            {date === today ? "Today" : weekdayShort(date)} · {dayMonth(date)} <span className="text-[0.9375rem] text-body">({list.length})</span>
          </h2>
          <ul className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {list.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`} className="block border border-line bg-paper p-3 hover:border-ink">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink">{o.orderNumber}</p>
                      <p className="text-[0.8125rem] text-body">{o.slotLabel}</p>
                    </div>
                    <span className={`shrink-0 border px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] ${o.status === "cancelled" || o.status === "refunded" ? "border-danger text-danger" : o.status === "placed" ? "border-ink bg-ink text-paper" : "border-ink text-ink"}`}>
                      {statusLabel[o.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-[0.875rem] text-ink">
                    {o.customerName} · {displayPhone(o.phone)}
                  </p>
                  <p className="line-clamp-2 text-[0.8125rem] text-body">{o.items.map((i) => `${i.quantity}× ${i.productName} ${i.weightGrams >= 1000 ? `${i.weightGrams / 1000}kg` : `${i.weightGrams}g`}`).join(", ")}</p>
                  <p className="mt-1 text-[0.875rem] tabular-nums text-ink">{formatPaise(o.totalPaise)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
