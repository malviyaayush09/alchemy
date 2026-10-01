"use client";

import { cart, useCart } from "./cart-store";
import { PincodeDialog } from "./PincodeDialog";

/** One pincode dialog for the whole site (mounted in the root layout). */
export function PincodeGate() {
  const { pendingAdd } = useCart();
  return <PincodeDialog open={pendingAdd !== null} onClose={cart.cancelPending} onServiceable={() => {}} />;
}
