import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { env } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const statics = ["", "/collections", "/gift-box", "/about", "/faqs", "/contact", "/track-order", "/privacy-policy", "/terms", "/refund-policy", "/delivery-policy"];
  const tags = ["eggless", "egg", "pull-up", "sugar-free"];
  const products = await getProducts();
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...tags.map((t) => ({ url: `${base}/collections?tag=${t}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...products.map((p) => ({ url: `${base}/cakes/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
