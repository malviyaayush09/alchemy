export type TagSlug = string;

export type Variant = { id: string; weightGrams: number; pricePaise: number; isAvailable: boolean };

export type ProductImage = { id?: string; src: string; width: number; height: number; alt: string };

export type Product = {
  id: string;
  slug: string;
  displayNo: number | null;
  name: string;
  description: string;
  kind: "cake" | "gift_box";
  isActive: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  sortOrder: number;
  tags: TagSlug[];
  variants: Variant[];
  images: ProductImage[];
};

export type Tag = { id: string; slug: string; label: string; sortOrder: number };

export type StoreSettings = {
  cakeMessageMaxChars: number;
  giftNoteMaxChars: number;
  maxDaysAhead: number;
  pendingHoldMinutes: number;
  deliveryFeePaise: number;
  minOrderPaise: number;
  gstRateBps: number;
  pricesIncludeGst: boolean;
  hsnCode: string;
};

export type Slot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  sameDayCutoff: string;
  kind: "standard" | "midnight" | "express";
  isEnabled: boolean;
  sortOrder: number;
};

export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "confirmed"
  | "being_crafted"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const weightLabel = (g: number) => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);

/** A variant can be bought only when priced (0 = "Price on request") and available. */
export const isPurchasable = (p: Pick<Product, "isSoldOut" | "isActive">, v: Variant) =>
  p.isActive && !p.isSoldOut && v.isAvailable && v.pricePaise > 0;
