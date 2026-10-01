import { unstable_cache } from "next/cache";
import { cache } from "react";
import { defaultSettings, fallbackProducts, fallbackTags } from "@/data/catalog";
import { db, must } from "./db";
import { isDbConfigured } from "./env";
import type { Product, StoreSettings, Tag } from "./types";

type ProductRow = {
  id: string;
  slug: string;
  display_no: number | null;
  name: string;
  description: string;
  kind: "cake" | "gift_box";
  is_active: boolean;
  is_sold_out: boolean;
  is_featured: boolean;
  sort_order: number;
  product_variants: { id: string; weight_grams: number; price_paise: number; is_available: boolean }[];
  product_images: { id: string; src: string; width: number; height: number; alt: string; sort_order: number }[];
  product_tags: { tags: { slug: string } | null }[];
};

const PRODUCT_SELECT =
  "id, slug, display_no, name, description, kind, is_active, is_sold_out, is_featured, sort_order, " +
  "product_variants(id, weight_grams, price_paise, is_available), " +
  "product_images(id, src, width, height, alt, sort_order), " +
  "product_tags(tags(slug))";

export function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    displayNo: r.display_no,
    name: r.name,
    description: r.description,
    kind: r.kind,
    isActive: r.is_active,
    isSoldOut: r.is_sold_out,
    isFeatured: r.is_featured,
    sortOrder: r.sort_order,
    tags: r.product_tags.map((t) => t.tags?.slug).filter((s): s is string => Boolean(s)),
    variants: [...r.product_variants]
      .sort((a, b) => a.weight_grams - b.weight_grams)
      .map((v) => ({ id: v.id, weightGrams: v.weight_grams, pricePaise: v.price_paise, isAvailable: v.is_available })),
    images: [...r.product_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ id: i.id, src: i.src, width: i.width, height: i.height, alt: i.alt })),
  };
}

/**
 * Catalogue reads are cached across requests (tag "catalog") so storefront
 * pages don't wait on the database. Admin saves call updateTag("catalog").
 */
export const CATALOG_TAG = "catalog";
const cached = <A extends unknown[], R>(fn: (...a: A) => Promise<R>, key: string) => unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: 300 });

const fetchProducts = cached(async (includeInactive: boolean): Promise<Product[]> => {
  let q = db().from("products").select(PRODUCT_SELECT).order("sort_order").order("name");
  if (!includeInactive) q = q.eq("is_active", true);
  const rows = must(await q, "getProducts") as unknown as ProductRow[];
  return rows.map(mapProduct);
}, "products");

/** Active products for the storefront, sorted for "Featured". */
export const getProducts = cache(async (opts: { includeInactive?: boolean } = {}): Promise<Product[]> => {
  if (!isDbConfigured()) return fallbackProducts;
  return fetchProducts(Boolean(opts.includeInactive));
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isDbConfigured()) return fallbackProducts.find((p) => p.slug === slug) ?? null;
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
});

const fetchTags = cached(async (): Promise<Tag[]> => {
  const rows = must(await db().from("tags").select("id, slug, label, sort_order").order("sort_order"), "getTags");
  return rows.map((t) => ({ id: t.id, slug: t.slug, label: t.label, sortOrder: t.sort_order }));
}, "tags");

export const getTags = cache(async (): Promise<Tag[]> => (isDbConfigured() ? fetchTags() : fallbackTags));

const fetchSettings = cached(async (): Promise<StoreSettings> => {
  const r = must(await db().from("store_settings").select("*").eq("id", 1).single(), "getSettings");
  return {
    cakeMessageMaxChars: r.cake_message_max_chars,
    giftNoteMaxChars: r.gift_note_max_chars,
    maxDaysAhead: r.max_days_ahead,
    pendingHoldMinutes: r.pending_hold_minutes,
    deliveryFeePaise: r.delivery_fee_paise,
    minOrderPaise: r.min_order_paise,
    gstRateBps: r.gst_rate_bps,
    pricesIncludeGst: r.prices_include_gst,
    hsnCode: r.hsn_code,
  };
}, "settings");

export const getSettings = cache(async (): Promise<StoreSettings> => (isDbConfigured() ? fetchSettings() : defaultSettings));

export const tagLabel = (tags: Tag[], slug: string) => tags.find((t) => t.slug === slug)?.label ?? slug;
