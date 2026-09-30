import type { Product, ProductImage, StoreSettings, Tag } from "@/lib/types";

/**
 * Fallback catalogue, mirroring supabase/seed.sql. Used ONLY when the database
 * is not configured yet, so the storefront can still render. Prices are 0
 * ("Price on request"). Never add ingredient, allergen or health claims here.
 */

export const fallbackTags: Tag[] = [
  { id: "t-eggless", slug: "eggless", label: "Eggless", sortOrder: 1 },
  { id: "t-egg", slug: "egg", label: "Egg", sortOrder: 2 },
  { id: "t-pull-up", slug: "pull-up", label: "Pull-Up", sortOrder: 3 },
  { id: "t-sugar-free", slug: "sugar-free", label: "Sugar-Free", sortOrder: 4 },
  { id: "t-gift-box", slug: "gift-box", label: "Gift Box", sortOrder: 5 },
];

export const defaultSettings: StoreSettings = {
  cakeMessageMaxChars: 30,
  giftNoteMaxChars: 200,
  maxDaysAhead: 14,
  pendingHoldMinutes: 15,
  deliveryFeePaise: 0,
  minOrderPaise: 0,
  gstRateBps: 0,
  pricesIncludeGst: true,
  hsnCode: "",
};

/** INTERIM photos from /design: rights and product mapping unconfirmed. Must not ship to production. */
const interim = (file: string, alt: string): ProductImage => ({ src: `/images/interim/${file}`, width: 1280, height: 1600, alt });

const rows: [number, string, string, string[], boolean, ProductImage?][] = [
  [1, "signature-belgian-chocolate", "Signature Belgian Chocolate Cake", ["eggless"], true],
  [2, "chocolate-pistachio", "Chocolate Pistachio Cake", ["eggless"], true, interim("chocolate-pistachio.jpg", "Chocolate Pistachio Cake on a white stand")],
  [3, "hazelnut", "Hazelnut Cake", ["egg"], true, interim("hazelnut.jpg", "Hazelnut Cake on a white stand")],
  [4, "nutella-fudge", "Nutella Fudge Cake", ["eggless"], false],
  [5, "blueberry-rare-cheesecake", "Blueberry Rare Cheesecake", ["egg"], false],
  [6, "coconut-pineapple", "Coconut Pineapple Cake", ["eggless"], false],
  [7, "salted-caramel", "Salted Caramel Cake", ["egg"], false],
  [8, "sugar-free-truffle", "Sugar-Free Truffle Cake", ["eggless", "sugar-free"], true, interim("truffle.jpg", "Truffle Cake on a white stand")],
  [9, "white-chocolate-raspberry", "White Chocolate Raspberry Cake", ["eggless"], false],
  [10, "berry-heart", "Berry Heart Cake", ["eggless"], false],
  [11, "russian-medovik", "Russian Medovik Cake", ["eggless"], false],
  [12, "rasmalai-tres-leches", "Rasmalai Tres Leches Cake", ["eggless"], false],
  [13, "red-velvet-pull-up", "Red Velvet Pull-Up Cake", ["eggless", "pull-up"], false],
  [14, "raspberry-pistachio-pull-up", "Raspberry Pistachio Pull-Up Cake", ["eggless", "pull-up"], false],
  [15, "chocolate-pull-up", "Chocolate Pull-Up Cake", ["eggless", "pull-up"], false],
];

export const fallbackProducts: Product[] = rows.map(([displayNo, slug, name, tags, featured, image]) => ({
  id: `seed-${slug}`,
  slug,
  displayNo,
  name,
  description: "[PLACEHOLDER: description to be written by the bakery]",
  kind: "cake",
  isActive: true,
  isSoldOut: false,
  isFeatured: featured,
  sortOrder: displayNo,
  tags,
  variants: [500, 1000].map((w) => ({ id: `seed-${slug}-${w}`, weightGrams: w, pricePaise: 0, isAvailable: true })),
  images: image ? [image] : [],
}));

/** Mood image for the desktop hero. Interim; see note above. */
export const heroImage = interim("hero-chocolate.jpg", "A glazed chocolate cake topped with two chocolate bears");
