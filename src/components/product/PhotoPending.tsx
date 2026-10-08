import { CakeIllustration } from "./CakeIllustration";

/**
 * Stand-in for a cake that has no photograph yet: a drawn illustration of the
 * cake on a soft studio backdrop, labelled as an illustration so it is never
 * mistaken for a photo of the product.
 */
export function PhotoPending({ slug, className = "" }: { slug: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,color-mix(in_oklab,var(--brand-paper)_var(--brand-soft,55%),white)_0%,var(--brand-paper)_60%,color-mix(in_oklab,var(--brand-paper)_90%,var(--brand-detail))_100%)] ${className}`}
    >
      <CakeIllustration slug={slug} className="size-full" />
      <span className="absolute right-2 bottom-2 text-[0.6875rem] tracking-[0.14em] text-body/80 uppercase sm:right-3 sm:bottom-2.5">Illustration</span>
    </div>
  );
}
