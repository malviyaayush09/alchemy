import type { Metadata } from "next";
import Link from "next/link";
import { brand, deliveryAreaLabel } from "@/config/brand";
import { collectionFilters, sortOptions, type SortKey } from "@/config/navigation";
import { getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/product/SortSelect";

type Search = Promise<{ tag?: string; sort?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { tag } = await searchParams;
  const f = collectionFilters.find((x) => x.tag === tag);
  const title = f?.tag ? `${f.label} cakes` : "All cakes";
  return {
    title,
    description: `${title} from ${brand.name}. Made to order in 500 g and 1 kg, delivered in ${deliveryAreaLabel}.`,
    alternates: { canonical: f?.tag ? `/collections?tag=${f.tag}` : "/collections" },
  };
}

/** Price 0 means "on request": those sort last in price sorts. */
const minPrice = (p: Product) => Math.min(...p.variants.map((v) => (v.pricePaise > 0 ? v.pricePaise : Number.MAX_SAFE_INTEGER)));

function sortProducts(list: Product[], sort: SortKey) {
  const out = [...list];
  if (sort === "price-asc") out.sort((a, b) => minPrice(a) - minPrice(b));
  else if (sort === "price-desc") out.sort((a, b) => (minPrice(b) === Number.MAX_SAFE_INTEGER ? -1 : minPrice(a) === Number.MAX_SAFE_INTEGER ? 1 : minPrice(b) - minPrice(a)));
  else if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
  else out.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder);
  return out;
}

export default async function CollectionsPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const all = (await getProducts()).filter((p) => p.kind === "cake");
  const active = collectionFilters.find((f) => f.tag === params.tag) ?? collectionFilters[0];
  const sort = (sortOptions.find((s) => s.value === params.sort)?.value ?? "featured") as SortKey;
  const list = sortProducts(active.tag ? all.filter((p) => p.tags.includes(active.tag!)) : all, sort);
  const count = (tag: string | null) => (tag ? all.filter((p) => p.tags.includes(tag)).length : all.length);
  const href = (tag: string | null) => {
    const q = new URLSearchParams();
    if (tag) q.set("tag", tag);
    if (sort !== "featured") q.set("sort", sort);
    const s = q.toString();
    return s ? `/collections?${s}` : "/collections";
  };

  return (
    <>
      <PageHeader crumb="Collections" title={active.tag ? `${active.label} cakes` : "Collections"} intro={`${all.length} cakes · each made in 500 g and 1 kg`} />

      <div className="container-x py-6 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10 lg:py-10">
        {/* Filters: sidebar on desktop, scrolling chips on phones. Plain links: work without JS. */}
        <nav aria-label="Filter cakes" className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow hidden text-body lg:block">Filter</p>
          <ul className="scroll-row -mx-4 px-4 lg:mx-0 lg:mt-3 lg:block lg:space-y-2 lg:px-0">
            {collectionFilters.map((f) => {
              const on = f.tag === active.tag;
              return (
                <li key={f.label} className="shrink-0">
                  <Link
                    href={href(f.tag)}
                    aria-current={on ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-between gap-3 border px-3.5 text-[0.875rem] transition-colors lg:w-full ${
                      on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink"
                    }`}
                  >
                    {f.label}
                    <span className={`text-[0.75rem] tabular-nums ${on ? "text-paper/80" : "text-body"}`}>{count(f.tag)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 hidden items-start gap-2 border-t border-line pt-4 text-[0.8125rem] text-body lg:flex">
            <GinkgoMark className="mt-0.5 size-3.5 shrink-0 text-accent" />
            Delivered in {deliveryAreaLabel}.
          </p>
        </nav>

        <div className="mt-5 lg:mt-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.875rem] text-body" role="status">
              {list.length} {list.length === 1 ? "cake" : "cakes"}
            </p>
            <SortSelect value={sort} tag={active.tag} />
          </div>
          <h2 className="sr-only">{active.tag ? `${active.label} cakes` : "All cakes"}</h2>
          {list.length ? (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
              {list.map((p, i) => (
                <li key={p.id} className="flex">
                  <ProductCard product={p} priority={i < 2} sizes="(min-width: 1280px) 240px, (min-width: 768px) 30vw, 50vw" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-center text-body">No cakes here yet. <Link href="/collections" className="text-ink underline decoration-accent underline-offset-4">See all cakes</Link>.</p>
          )}
        </div>
      </div>
    </>
  );
}
