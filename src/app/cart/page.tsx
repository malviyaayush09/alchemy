import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage() {
  const s = await getSettings();
  return <CartView minOrderPaise={s.minOrderPaise} />;
}
