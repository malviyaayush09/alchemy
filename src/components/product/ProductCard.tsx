import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";
import { CardPurchase } from "./CardPurchase";

type Props = { product: Product; /** Above-the-fold cards: preload + high fetch priority (LCP on phones). */ priority?: boolean; sizes?: string };

/** Boutique-counter card: gold hairline frame, diet badge, weight toggle, add to cart. */
export function ProductCard({ product, priority = false, sizes = "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw" }: Props) {
  const href = `/cakes/${product.slug}`;
  const diet = product.tags.find((t) => t === "eggless" || t === "egg");
  const image = product.images[0];

  return (
    <article className="flex w-full flex-col border border-line bg-paper p-2 sm:p-2.5">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden bg-paper-soft">
        {image ? (
          <Image
            src={image.src}
            alt=""
            fill
            sizes={sizes}
            preload={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover object-[50%_62%] transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : (
          <Artwork label={`Photo · ${product.name}`} shape="rect" className="size-full border-0" />
        )}
        {product.isSoldOut ? (
          <span className="eyebrow absolute top-2 left-2 bg-ink px-2 py-1 !text-[0.6875rem] text-paper">Sold out</span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <div className="flex flex-wrap gap-1.5">{diet ? <Badge tag={diet} /> : null}</div>
        <h3 className="mt-1 text-[1.125rem] leading-snug sm:text-[1.3rem]">
          <Link href={href} className="flex min-h-11 items-center hover:underline hover:decoration-accent hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <CardPurchase
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            isSoldOut: product.isSoldOut,
            isActive: product.isActive,
            variants: product.variants,
            image: image ? { src: image.src, width: image.width, height: image.height } : null,
          }}
        />
      </div>
    </article>
  );
}
