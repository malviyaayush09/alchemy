import { isPurchasable, type Product } from "./types";

/** A second-cake suggestion shown in the Glimpse ("Bigger celebration?"). */
export type Pairing = {
  id: string;
  slug: string;
  name: string;
  image: { src: string; width: number; height: number } | null;
  variant: { id: string; weightGrams: number; pricePaise: number };
};

/**
 * Pick one other cake that can actually be bought right now, preferring ones
 * with a photo. Deterministic (the next suitable cake after this one in the
 * catalogue order), so it doesn't pretend to be a ranking or a "best seller".
 */
export function pairingFor(product: Product, all: Product[]): Pairing | null {
  if (!product.variants.some((v) => isPurchasable(product, v))) return null;
  const pool = all
    .filter((p) => p.id !== product.id && p.kind === "cake" && p.variants.some((v) => isPurchasable(p, v)))
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0) || a.sortOrder - b.sortOrder);
  if (!pool.length) return null;
  const withPhoto = pool.filter((p) => p.images.length > 0);
  const ring = (withPhoto.length ? withPhoto : pool).sort((a, b) => a.sortOrder - b.sortOrder);
  const pick = ring.find((p) => p.sortOrder > product.sortOrder) ?? ring[0];
  const variant = pick.variants.filter((v) => isPurchasable(pick, v)).sort((a, b) => a.weightGrams - b.weightGrams)[0];
  const img = pick.images[0];
  return {
    id: pick.id,
    slug: pick.slug,
    name: pick.name,
    image: img ? { src: img.src, width: img.width, height: img.height } : null,
    variant: { id: variant.id, weightGrams: variant.weightGrams, pricePaise: variant.pricePaise },
  };
}
