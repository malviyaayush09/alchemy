"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cart } from "@/components/cart/cart-store";

/**
 * While payment is pending, poll until the verified webhook marks the order
 * paid, then refresh. Clears the cart once paid.
 */
export function PaymentWatcher({ orderNumber, token, paid }: { orderNumber: string; token: string; paid: boolean }) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (paid) {
      cart.clear();
      return;
    }
    let tries = 0;
    const id = setInterval(async () => {
      tries++;
      try {
        const r = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status?t=${token}`, { cache: "no-store" });
        const d = await r.json();
        if (d.paymentStatus === "paid") {
          clearInterval(id);
          router.refresh();
        }
      } catch {
        /* keep polling */
      }
      if (tries >= 45) {
        clearInterval(id);
        setTimedOut(true);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [paid, orderNumber, token, router]);

  if (paid) return null;
  return (
    <div role="status" className="border border-detail bg-paper-soft p-4 text-[0.9375rem] text-ink">
      {timedOut ? (
        <>We haven&apos;t received payment confirmation yet. If money was debited, it will update here shortly; refresh this page in a minute. No need to pay again.</>
      ) : (
        <>
          <span className="mr-2 inline-block size-3 animate-pulse rounded-full bg-accent align-middle" aria-hidden="true" />
          Confirming your payment with the bank…
        </>
      )}
    </div>
  );
}
