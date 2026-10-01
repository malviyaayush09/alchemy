"use client";

import { useId, useState } from "react";
import { isPurchasable, weightLabel, type Variant } from "@/lib/types";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { buttonClasses } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    isSoldOut: boolean;
    isActive: boolean;
    variants: Variant[];
    image: { src: string; width: number; height: number } | null;
  };
};

/** Weight toggle + quick add. Cake message and gift note live on the product page. */
export function CardPurchase({ product }: Props) {
  const id = useId();
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const { add } = useAddToCart();
  if (!variant) return null;
  const buyable = isPurchasable(product, variant);

  return (
    <div className="mt-auto pt-1">
      <Price paise={variant.pricePaise} />
      <fieldset className="mt-3">
        <legend className="sr-only">Weight for {product.name}</legend>
        <div className="grid border border-ink" style={{ gridTemplateColumns: `repeat(${product.variants.length}, minmax(0, 1fr))` }}>
          {product.variants.map((v, i) => (
            <label key={v.id} className="relative cursor-pointer">
              <input
                type="radio"
                name={`${id}-w`}
                value={v.id}
                checked={v.id === variant.id}
                onChange={() => setVariantId(v.id)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-11 items-center justify-center px-2 text-[0.8125rem] text-ink transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                  i > 0 ? "border-l border-ink" : ""
                }`}
              >
                {weightLabel(v.weightGrams)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        disabled={!buyable}
        onClick={() =>
          add({
            productId: product.id,
            variantId: variant.id,
            slug: product.slug,
            name: product.name,
            weightGrams: variant.weightGrams,
            unitPaise: variant.pricePaise,
            cakeMessage: "",
            giftNote: "",
            image: product.image,
          })
        }
        className={`${buttonClasses("primary", "sm", true)} mt-2 px-2! tracking-[0.08em]! sm:tracking-[0.16em]!`}
      >
        {product.isSoldOut ? "Sold out" : buyable ? "Add to cart" : "Coming soon"}
        <span className="sr-only">
          {" "}
          {product.name}, {weightLabel(variant.weightGrams)}
        </span>
      </button>
    </div>
  );
}
