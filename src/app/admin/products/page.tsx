import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { weightLabel } from "@/lib/types";
import { adminInput } from "@/components/admin/AdminForm";
import { buttonClasses } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { createProduct } from "../actions";

export default async function AdminProductsPage() {
  const products = await getProducts({ includeInactive: true });
  return (
    <div>
      <h1 className="text-[2rem]">Products</h1>
      <ul className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="flex gap-3 border border-line bg-paper p-3 hover:border-ink">
              <span className="relative size-16 shrink-0 overflow-hidden bg-paper-deep">
                {p.images[0] ? <Image src={p.images[0].src} alt="" fill sizes="64px" className="object-cover" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{p.name}</span>
                <span className="block text-[0.8125rem] text-body">
                  {p.variants.map((v) => (
                    <span key={v.id} className="mr-2">
                      {weightLabel(v.weightGrams)}: <Price paise={v.pricePaise} className="text-[0.8125rem]!" />
                    </span>
                  ))}
                </span>
                <span className="mt-0.5 block text-[0.75rem] uppercase tracking-[0.08em] text-body">
                  {[!p.isActive && "Hidden", p.isSoldOut && "Sold out", p.isFeatured && "Featured", p.kind === "gift_box" && "Gift box", !p.images.length && "No photo"].filter(Boolean).join(" · ") || "Live"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <form action={createProduct} className="mt-8 max-w-lg space-y-3 border border-line bg-paper p-4">
        <h2 className="text-[1.25rem]">New product</h2>
        <p className="text-[0.8125rem] text-body">Created hidden, with 500 g and 1 kg at ₹0 (&quot;Price on request&quot;). Add prices and a photo, then make it visible.</p>
        <input name="name" required minLength={2} placeholder="Name" className={adminInput} />
        <select name="kind" className={adminInput} defaultValue="cake">
          <option value="cake">Cake</option>
          <option value="gift_box">Gift box / hamper</option>
        </select>
        <button className={buttonClasses("primary", "sm")}>Create</button>
      </form>
    </div>
  );
}
