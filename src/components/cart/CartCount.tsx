"use client";

import { cartCount, useCart } from "./cart-store";

export function CartCount() {
  const n = cartCount(useCart());
  return (
    <>
      <span className="text-[0.8125rem] tabular-nums" aria-hidden="true">
        {n}
      </span>
      <span className="sr-only">
        {n} {n === 1 ? "item" : "items"} in cart
      </span>
    </>
  );
}
