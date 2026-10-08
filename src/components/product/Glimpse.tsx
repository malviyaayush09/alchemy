"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Pairing } from "@/lib/pairing";
import { isPurchasable, weightLabel, type Variant } from "@/lib/types";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { formatPaise } from "@/components/ui/Price";
import { PhotoPending } from "./PhotoPending";

export type GlimpseProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  isSoldOut: boolean;
  isActive: boolean;
  variants: Variant[];
  image: { src: string; width: number; height: number; alt: string } | null;
};

type Props = {
  product: GlimpseProduct;
  open: boolean;
  onClose: () => void;
  messageMax: number;
  /** One-tap message ideas (from the occasion, or the defaults). */
  messages: string[];
  /** Carried to the full product page link so its message ideas match. */
  occasion?: string;
  /** Optional second-cake suggestion for bigger gatherings. */
  pairing?: Pairing | null;
};

/**
 * "Glimpse": a quick look at a cake without leaving the grid. Big picture,
 * description, sizes with prices, and the cake message, which appears live on
 * a plaque over the picture so the customer sees roughly how it will read.
 * (The plaque is a preview of the wording only, not of the decoration.)
 */
export function Glimpse({ product, open, onClose, messageMax, messages, occasion, pairing }: Props) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const { add } = useAddToCart();
  const buyable = product.variants.filter((v) => isPurchasable(product, v));
  const [variantId, setVariantId] = useState(buyable[0]?.id ?? product.variants[0]?.id);
  const [message, setMessage] = useState("");
  const [alsoAdd, setAlsoAdd] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const canBuy = variant ? isPurchasable(product, variant) : false;
  const diet = product.tags.includes("eggless") ? "Eggless" : product.tags.includes("egg") ? "With egg" : null;
  const hasDescription = product.description && !product.description.startsWith("[PLACEHOLDER");
  const href = `/cakes/${product.slug}${occasion ? `?occasion=${occasion}` : ""}`;

  function onAdd() {
    if (!variant || !canBuy) return;
    add({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      weightGrams: variant.weightGrams,
      unitPaise: variant.pricePaise,
      cakeMessage: message.trim(),
      giftNote: "",
      image: product.image ? { src: product.image.src, width: product.image.width, height: product.image.height } : null,
    });
    if (alsoAdd && pairing) {
      add({
        productId: pairing.id,
        variantId: pairing.variant.id,
        slug: pairing.slug,
        name: pairing.name,
        weightGrams: pairing.variant.weightGrams,
        unitPaise: pairing.variant.pricePaise,
        cakeMessage: "",
        giftNote: "",
        image: pairing.image,
      });
    }
    setMessage("");
    setAlsoAdd(false);
    onClose();
  }
  const showPairing = Boolean(pairing && canBuy);
  const total = (variant?.pricePaise ?? 0) + (alsoAdd && pairing ? pairing.variant.pricePaise : 0);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-0 mt-auto mb-0 max-h-[94dvh] w-full max-w-none overflow-y-auto bg-paper p-0 text-left text-ink backdrop:bg-[#05070d]/70 backdrop:backdrop-blur-[2px] open:animate-[glimpse-in_320ms_ease-out] sm:m-auto sm:max-h-[90dvh] sm:max-w-4xl"
    >
      {open ? (
        <div className="grid sm:grid-cols-2">
          {/* picture + live message plaque */}
          <div className="relative aspect-square bg-paper-soft sm:aspect-auto sm:min-h-[34rem]">
            {product.image ? (
              <Image src={product.image.src} alt={product.image.alt || product.name} fill sizes="(min-width: 896px) 448px, 100vw" className="object-cover object-[50%_60%]" />
            ) : (
              <PhotoPending slug={product.slug} className="absolute inset-0" />
            )}
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-6 flex justify-center transition-all duration-500 ${message.trim() ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              <div className="relative max-w-[85%] rounded-[50%] border-2 border-accent bg-[radial-gradient(ellipse_at_40%_30%,#5a3324,#2b160f)] px-8 py-3 text-center shadow-[0_12px_30px_-8px_rgb(0_0_0/0.55)]">
                <span className="block font-script text-[1.75rem] leading-tight break-words text-[#f6e7c8] sm:text-[2rem]">{message.trim() || " "}</span>
              </div>
            </div>
            {message.trim() ? (
              <span className="absolute top-3 right-3 bg-ink/80 px-2 py-1 text-[0.6875rem] tracking-[0.14em] text-paper uppercase">Message preview</span>
            ) : null}
          </div>

          {/* details */}
          <div className="relative p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
            <button type="button" onClick={onClose} className="absolute top-2 right-2 inline-flex size-11 items-center justify-center" aria-label="Close">
              <CloseIcon />
            </button>
            {diet ? <p className="eyebrow text-body">{diet}</p> : null}
            <h2 id={`${id}-title`} className="mt-2 pr-10 text-[2rem] leading-tight sm:text-[2.5rem]">
              {product.name}
            </h2>
            <p className="mt-3 text-[1rem] text-body sm:text-[1.0625rem]">
              {hasDescription ? product.description : "Made to order for you, in 500 g and 1 kg."}
            </p>

            <fieldset className="mt-6">
              <legend className="mb-2.5 text-[1rem] font-medium text-ink">Size</legend>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => {
                  const ok = isPurchasable(product, v);
                  return (
                    <label
                      key={v.id}
                      className={`flex min-h-16 cursor-pointer flex-col items-center justify-center border px-2 transition-colors has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${ok ? "border-ink/40" : "border-ink/20 text-body"}`}
                    >
                      <input type="radio" name={`${id}-w`} value={v.id} checked={v.id === variant?.id} onChange={() => setVariantId(v.id)} className="sr-only" />
                      <span className="font-display text-[1.5rem] leading-none">{weightLabel(v.weightGrams)}</span>
                      <span className="mt-1 text-[0.875rem] tabular-nums opacity-85">{v.pricePaise > 0 ? formatPaise(v.pricePaise) : "On request"}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {messageMax > 0 ? (
              <div className="mt-6">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor={`${id}-msg`} className="text-[1rem] font-medium text-ink">
                    Message on cake <span className="font-normal text-body">(optional)</span>
                  </label>
                  <span className="text-[0.875rem] tabular-nums text-body" aria-live="polite">
                    {message.length}/{messageMax}
                  </span>
                </div>
                <input
                  id={`${id}-msg`}
                  className="block min-h-12 w-full border border-ink/40 bg-paper-soft px-3.5 py-2.5 text-ink placeholder:text-body/70 focus:border-ink focus:outline-2 focus:outline-accent"
                  maxLength={messageMax}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type it and see it on the cake"
                  autoComplete="off"
                  enterKeyHint="done"
                />
                <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="Message ideas">
                  {messages
                    .filter((m) => m.length <= messageMax)
                    .map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMessage(m)}
                        className="min-h-10 rounded-full border border-ink/25 px-3.5 text-[0.9375rem] text-ink transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
                        aria-pressed={message === m}
                      >
                        {m}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}

            {showPairing && pairing ? (
              <label className="mt-6 flex cursor-pointer items-center gap-3 border border-ink/25 bg-paper-soft p-3 transition-colors has-checked:border-ink">
                <input type="checkbox" checked={alsoAdd} onChange={(e) => setAlsoAdd(e.target.checked)} className="size-5 shrink-0 accent-[var(--brand-ink)]" />
                <span className="relative size-14 shrink-0 overflow-hidden bg-paper">
                  {pairing.image ? <Image src={pairing.image.src} alt="" fill sizes="56px" className="object-cover object-[50%_60%]" /> : <PhotoPending slug={pairing.slug} className="absolute inset-0 [&>span]:hidden" />}
                </span>
                <span className="min-w-0 text-[0.9375rem] leading-snug">
                  <span className="block text-body">Bigger celebration? Add a second cake</span>
                  <span className="block font-medium text-ink">
                    {pairing.name} · {weightLabel(pairing.variant.weightGrams)} · {formatPaise(pairing.variant.pricePaise)}
                  </span>
                </span>
              </label>
            ) : null}

            <button type="button" onClick={onAdd} disabled={!canBuy} className={`${buttonClasses("primary", "lg", true)} mt-7`}>
              {product.isSoldOut ? "Sold out" : canBuy ? `${alsoAdd && showPairing ? "Add both" : "Add to cart"} · ${formatPaise(total)}` : "Coming soon"}
            </button>
            <p className="mt-4 text-center text-[0.9375rem]">
              <Link href={href} className="text-ink underline decoration-accent underline-offset-4">
                See full details and add a gift note
              </Link>
            </p>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
