"use client";

import { cart } from "./cart-store";

/** Adds a line straight to the cart. The delivery pincode is asked for once, in the checkout address. */
export function useAddToCart() {
  return { add: (line: Parameters<typeof cart.add>[0]) => cart.add(line) };
}
