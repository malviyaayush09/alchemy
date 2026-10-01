import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

export async function SignatureCakes() {
  const products = await getProducts();
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  return (
    <section aria-labelledby="signature-title" className="py-12 lg:py-16">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4">
          <div className="sm:flex sm:items-baseline sm:gap-4">
            <h2 id="signature-title" className="text-[2rem] lg:text-[2.5rem]">
              Signature Cakes
            </h2>
            <p className="hidden text-[0.875rem] text-body sm:block">Choose a weight and add to cart</p>
          </div>
          <Link
            href="/collections"
            className="eyebrow inline-flex min-h-11 shrink-0 items-center text-ink underline decoration-accent underline-offset-[6px]"
          >
            View all {products.length}
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {featured.map((p, i) => (
            <li key={p.slug} className="flex">
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
