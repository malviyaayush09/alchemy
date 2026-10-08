import { features } from "./features";

export type NavLink = { href: string; label: string };

export const primaryNav: NavLink[] = [
  { href: "/collections", label: "Collections" },
  ...(features.occasions ? [{ href: "/occasions", label: "Occasions" }] : []),
  { href: "/gift-box", label: "Gift Box" },
  { href: "/about", label: "About Us" },
  { href: "/faqs", label: "FAQs" },
  ...(features.trackOrderPage ? [{ href: "/track-order", label: "Track Order" }] : []),
  { href: "/contact", label: "Contact" },
];

export const policyNav: NavLink[] = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/delivery-policy", label: "Shipping & Delivery" },
];

/** Collection filters are driven by product tags, not hardcoded product lists. */
export const collectionFilters: { tag: string | null; label: string }[] = [
  { tag: null, label: "All" },
  { tag: "eggless", label: "Eggless" },
  { tag: "egg", label: "With Egg" },
  { tag: "pull-up", label: "Pull-Up" },
  { tag: "sugar-free", label: "Sugar-Free" },
];

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];
