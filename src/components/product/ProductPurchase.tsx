"use client";

import { useId, useState } from "react";
import { isPurchasable, weightLabel, type Variant } from "@/lib/types";
import { PincodeChecker } from "@/components/cart/PincodeChecker";
import { PincodeDialog } from "@/components/cart/PincodeDialog";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { buttonClasses } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { stickyBarRef } from "@/components/ui/useStickyBar";

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
  limits: { message: number; giftNote: number };
};

const field =
  "block w-full border border-ink/40 bg-paper-soft px-3.5 py-2.5 text-ink placeholder:text-body/70 focus:border-ink focus:outline-2 focus:outline-accent";

/**
 * Weight, message on cake, optional gift note. On phones the primary CTA is a
 * sticky bar in the thumb zone (with safe-area padding); on desktop it's inline.
 */
export function ProductPurchase({ product, limits }: Props) {
  const id = useId();
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [message, setMessage] = useState("");
  const [giftOn, setGiftOn] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const { add, dialog } = useAddToCart();

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  if (!variant) return null;
  const buyable = isPurchasable(product, variant);
  const label = product.isSoldOut ? "Sold out" : !variant.isAvailable ? "Unavailable" : variant.pricePaise <= 0 ? "Price on request" : "Add to cart";

  const onAdd = () =>
    add({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      weightGrams: variant.weightGrams,
      unitPaise: variant.pricePaise,
      cakeMessage: message.trim(),
      giftNote: giftOn ? giftNote.trim() : "",
      image: product.image,
    });

  return (
    <div className="mt-4 space-y-6">
      <Price paise={variant.pricePaise} className="text-[1.25rem]" />

      <fieldset>
        <legend className="mb-2 text-[0.875rem] font-medium text-ink">Weight</legend>
        <div className="grid max-w-sm grid-cols-2 border border-ink">
          {product.variants.map((v, i) => (
            <label key={v.id} className="relative cursor-pointer">
              <input type="radio" name={`${id}-w`} className="peer sr-only" checked={v.id === variant.id} onChange={() => setVariantId(v.id)} />
              <span
                className={`flex min-h-12 flex-col items-center justify-center px-2 text-[0.9375rem] text-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                  i ? "border-l border-ink" : ""
                }`}
              >
                {weightLabel(v.weightGrams)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {limits.message > 0 ? (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor={`${id}-msg`} className="text-[0.875rem] font-medium text-ink">
              Message on cake <span className="font-normal text-body">(optional)</span>
            </label>
            <span className="text-[0.8125rem] tabular-nums text-body" aria-live="polite">
              {message.length}/{limits.message}
            </span>
          </div>
          <input id={`${id}-msg`} className={`${field} min-h-12`} maxLength={limits.message} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Happy birthday, Asha" autoComplete="off" enterKeyHint="done" />
        </div>
      ) : null}

      {limits.giftNote > 0 ? (
        <div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink">
            <input type="checkbox" checked={giftOn} onChange={(e) => setGiftOn(e.target.checked)} className="size-5 accent-[var(--color-ink)]" />
            Add a gift note card
          </label>
          {giftOn ? (
            <div className="mt-2">
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor={`${id}-gift`} className="text-[0.875rem] font-medium text-ink">
                  Gift note
                </label>
                <span className="text-[0.8125rem] tabular-nums text-body">
                  {giftNote.length}/{limits.giftNote}
                </span>
              </div>
              <textarea id={`${id}-gift`} className={`${field} min-h-24`} maxLength={limits.giftNote} value={giftNote} onChange={(e) => setGiftNote(e.target.value)} />
            </div>
          ) : null}
        </div>
      ) : null}

      <PincodeChecker />

      <button type="button" onClick={onAdd} disabled={!buyable} className={`${buttonClasses("primary", "lg", true)} hidden md:inline-flex`}>
        {label}
      </button>

      {/* Sticky thumb-zone bar (phones) */}
      <div
        ref={stickyBarRef}
        className="fixed inset-x-0 bottom-0 z-30 m-0! flex items-center gap-3 border-t border-line bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] md:hidden"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] text-body">{weightLabel(variant.weightGrams)}</p>
          <Price paise={variant.pricePaise} />
        </div>
        <button type="button" onClick={onAdd} disabled={!buyable} className={`${buttonClasses("primary", "md")} flex-[1.4]`}>
          {label}
        </button>
      </div>

      <PincodeDialog {...dialog} />
    </div>
  );
}
