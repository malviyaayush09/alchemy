"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cart, useCart } from "./cart-store";

/** Polite confirmation after add-to-cart, clear of the sticky bar and safe areas. */
export function CartToast() {
  const { lastAdded } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(() => cart.dismissToast(), 5000);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const show = lastAdded && pathname !== "/cart";
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.5rem)] z-50 flex justify-center px-4">
      {show ? (
        <div className="on-ink pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 border border-accent bg-ink px-4 py-2 text-paper shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)]">
          <p className="text-[1rem]">
            <span className="font-medium">{lastAdded.name}</span> added to your cart.
          </p>
          <Link href="/cart" className="eyebrow inline-flex min-h-11 shrink-0 items-center text-accent underline underline-offset-4">
            View cart
          </Link>
        </div>
      ) : null}
    </div>
  );
}
