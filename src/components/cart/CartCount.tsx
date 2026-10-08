"use client";

import { cartCount, useCart } from "./cart-store";

export function CartCount() {
  const n = cartCount(useCart());
  return (
    <>
      {n > 0 ? (
        <span
          className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.75rem] leading-5 font-medium text-ink tabular-nums"
          aria-hidden="true"
        >
          {n}
        </span>
      ) : null}
      <span className="sr-only">
        {n} {n === 1 ? "item" : "items"} in cart
      </span>
    </>
  );
}
