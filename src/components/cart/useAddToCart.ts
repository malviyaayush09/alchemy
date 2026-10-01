"use client";

import { cart } from "./cart-store";

/** Adds a line; if no pincode is known yet, the shared PincodeGate asks first. */
export function useAddToCart() {
  return { add: cart.request };
}
