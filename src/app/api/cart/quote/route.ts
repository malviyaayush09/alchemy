import { getProducts } from "@/lib/catalog";
import { fail, json, readJson } from "@/lib/http";
import { isPurchasable } from "@/lib/types";

/** Current price of each purchasable variant in the cart. Missing = no longer purchasable. */
export async function POST(req: Request) {
  const body = await readJson<{ variantIds?: unknown }>(req);
  const ids = Array.isArray(body?.variantIds) ? body.variantIds.filter((x): x is string => typeof x === "string").slice(0, 50) : null;
  if (!ids) return fail(400, "Bad request");
  const prices: Record<string, number> = {};
  for (const p of await getProducts()) {
    for (const v of p.variants) if (ids.includes(v.id) && isPurchasable(p, v)) prices[v.id] = v.pricePaise;
  }
  return json({ ok: true, prices });
}
