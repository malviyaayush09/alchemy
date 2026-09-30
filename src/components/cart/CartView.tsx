"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { weightLabel } from "@/lib/types";
import { Artwork } from "@/components/brand/Artwork";
import { Button, buttonClasses } from "@/components/ui/Button";
import { formatPaise } from "@/components/ui/Price";
import { stickyBarRef } from "@/components/ui/useStickyBar";
import { cart, cartSubtotal, useCart } from "./cart-store";
import { PincodeChecker } from "./PincodeChecker";

export function CartView({ minOrderPaise }: { minOrderPaise: number }) {
  const state = useCart();
  const [notice, setNotice] = useState("");
  const [checked, setChecked] = useState(false);
  const subtotal = cartSubtotal(state);
  const belowMin = minOrderPaise > 0 && subtotal < minOrderPaise;

  // Re-price from the server once; drop anything no longer purchasable.
  const ids = state.lines.map((l) => l.variantId).join(",");
  useEffect(() => {
    if (!ids || checked) return;
    setChecked(true);
    fetch("/api/cart/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantIds: ids.split(",") }) })
      .then((r) => r.json())
      .then((d: { prices?: Record<string, number> }) => {
        if (!d.prices) return;
        const before = state.lines.length;
        const changed = state.lines.some((l) => d.prices![l.variantId] !== undefined && d.prices![l.variantId] !== l.unitPaise);
        cart.reconcile(d.prices);
        const dropped = before - state.lines.filter((l) => l.variantId in d.prices!).length;
        if (dropped) setNotice(`${dropped} item${dropped > 1 ? "s are" : " is"} no longer available and ${dropped > 1 ? "were" : "was"} removed.`);
        else if (changed) setNotice("Prices were updated to the latest.");
      })
      .catch(() => {});
  }, [ids, checked, state.lines]);

  if (!state.lines.length) {
    return (
      <div className="container-x py-16 text-center lg:py-24">
        <h1 className="text-[2.25rem]">Your cart is empty</h1>
        <p className="mt-2 text-body">Every cake is made to order, in 500 g or 1 kg.</p>
        <div className="mt-6">
          <Button href="/collections">Shop all cakes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pt-6 pb-36 md:pb-16 lg:pt-10">
      <h1 className="text-[2.25rem] lg:text-[2.75rem]">Your cart</h1>
      {notice ? (
        <p role="status" className="mt-3 border border-detail bg-paper-soft px-3 py-2 text-[0.875rem] text-ink">
          {notice}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <ul className="divide-y divide-line border-y border-line">
          {state.lines.map((l) => (
            <li key={l.key} className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 sm:grid-cols-[7rem_1fr]">
              <Link href={`/cakes/${l.slug}`} className="relative block aspect-square overflow-hidden border border-line bg-paper-soft" tabIndex={-1} aria-hidden="true">
                {l.image ? <Image src={l.image.src} alt="" fill sizes="112px" className="object-cover" /> : <Artwork label="Photo" shape="rect" className="size-full border-0" />}
              </Link>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/cakes/${l.slug}`} className="font-display text-[1.25rem] leading-snug text-ink hover:underline">
                      {l.name}
                    </Link>
                    <p className="text-[0.875rem] text-body">{weightLabel(l.weightGrams)}</p>
                  </div>
                  <p className="shrink-0 font-medium tabular-nums text-ink">{formatPaise(l.unitPaise * l.quantity)}</p>
                </div>
                {l.cakeMessage ? <p className="mt-1 text-[0.8125rem] text-body">Message: “{l.cakeMessage}”</p> : null}
                {l.giftNote ? <p className="mt-0.5 line-clamp-2 text-[0.8125rem] text-body">Gift note: “{l.giftNote}”</p> : null}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center border border-ink" role="group" aria-label={`Quantity for ${l.name}`}>
                    <button type="button" className="inline-flex size-11 items-center justify-center text-[1.25rem] text-ink disabled:opacity-40" onClick={() => cart.setQuantity(l.key, l.quantity - 1)} disabled={l.quantity <= 1} aria-label="Decrease quantity">
                      −
                    </button>
                    <span className="w-8 text-center tabular-nums" aria-live="polite">
                      {l.quantity}
                    </span>
                    <button type="button" className="inline-flex size-11 items-center justify-center text-[1.25rem] text-ink disabled:opacity-40" onClick={() => cart.setQuantity(l.key, l.quantity + 1)} disabled={l.quantity >= cart.MAX_QTY} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <button type="button" className="min-h-11 text-[0.8125rem] text-body underline underline-offset-4 hover:text-ink" onClick={() => cart.remove(l.key)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <PincodeChecker />
          <div className="border border-line bg-paper-soft p-5">
            <div className="flex justify-between text-ink">
              <span>Subtotal</span>
              <span className="font-medium tabular-nums">{formatPaise(subtotal)}</span>
            </div>
            <p className="mt-2 text-[0.8125rem] text-body">Delivery charge and coupons are applied at checkout.</p>
            {belowMin ? <p className="mt-3 text-[0.875rem] text-danger">Minimum order is {formatPaise(minOrderPaise)}.</p> : null}
            <Link
              href="/checkout"
              aria-disabled={!state.area || belowMin || undefined}
              className={`${buttonClasses("primary", "lg", true)} mt-4 hidden md:inline-flex`}
            >
              Checkout
            </Link>
            {!state.area ? <p className="mt-2 hidden text-[0.8125rem] text-body md:block">Check your pincode to continue.</p> : null}
          </div>
        </aside>
      </div>

      <div ref={stickyBarRef} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] md:hidden">
        <div className="mb-2 flex justify-between text-[0.9375rem] text-ink">
          <span>Subtotal</span>
          <span className="font-medium tabular-nums">{formatPaise(subtotal)}</span>
        </div>
        <Link href="/checkout" aria-disabled={!state.area || belowMin || undefined} className={buttonClasses("primary", "lg", true)}>
          {state.area ? "Checkout" : "Check pincode to continue"}
        </Link>
      </div>
    </div>
  );
}
