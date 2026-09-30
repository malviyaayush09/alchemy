"use client";

import { useState } from "react";
import { cart, useCart, type CartLine } from "./cart-store";

type NewLine = Omit<CartLine, "key" | "quantity">;

/** Adds a line, asking for a pincode first if the customer hasn't checked one yet. */
export function useAddToCart() {
  const { area } = useCart();
  const [pending, setPending] = useState<NewLine | null>(null);

  return {
    add(line: NewLine) {
      if (area) cart.add(line);
      else setPending(line);
    },
    dialog: {
      open: pending !== null,
      onClose: () => setPending(null),
      onServiceable: () => {
        if (pending) cart.add(pending);
        setPending(null);
      },
    },
  };
}
