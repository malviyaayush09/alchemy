import Link from "next/link";
import { currentUser } from "@/lib/auth/session";
import { getOrdersForUser, statusLabel } from "@/lib/orders";
import { dayMonth } from "@/lib/time";
import { Button } from "@/components/ui/Button";
import { formatPaise } from "@/components/ui/Price";

export default async function AccountOrdersPage() {
  const user = (await currentUser())!;
  const orders = await getOrdersForUser(user.id, user.phone);
  if (!orders.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-body">No orders yet.</p>
        <div className="mt-4">
          <Button href="/collections">Shop all cakes</Button>
        </div>
      </div>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${encodeURIComponent(o.orderNumber)}`} className="block border border-line bg-paper-soft p-4 hover:border-ink">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{o.orderNumber}</p>
                <p className="text-[0.875rem] text-body">
                  {dayMonth(o.deliveryDate)} · {o.slotLabel}
                </p>
              </div>
              <span className={`border px-2 py-0.5 text-[0.75rem] font-medium uppercase tracking-[0.1em] ${o.status === "cancelled" || o.status === "refunded" ? "border-danger text-danger" : "border-ink text-ink"}`}>
                {statusLabel[o.status]}
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-[0.875rem] text-body">{o.items.map((i) => i.productName).join(", ")}</p>
            <p className="mt-1 text-[0.9375rem] tabular-nums text-ink">{formatPaise(o.totalPaise)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
