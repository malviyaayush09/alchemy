export type NavLink = { href: string; label: string };

export const primaryNav: NavLink[] = [
  { href: "/collections", label: "Collections" },
  { href: "/gift-box", label: "Gift Box" },
  { href: "/about", label: "About Us" },
  { href: "/faqs", label: "FAQs" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export const policyNav: NavLink[] = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/delivery-policy", label: "Shipping & Delivery" },
];

/** Collection filters are tag-driven; these are the entry points shown in the hero. */
export const collectionShortcuts: NavLink[] = [
  { href: "/collections?tag=eggless", label: "Eggless" },
  { href: "/collections?tag=egg", label: "With Egg" },
  { href: "/collections?tag=pull-up", label: "Pull-Up Cakes" },
  { href: "/collections?tag=sugar-free", label: "Sugar-Free" },
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
