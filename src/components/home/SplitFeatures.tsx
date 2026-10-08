import { splitFeatures } from "@/content/home";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { Button } from "@/components/ui/Button";

/** Gift box call-out: a full-width band, text-led until the box has its own photograph. */
export function SplitFeatures() {
  const gift = splitFeatures[1];
  return (
    <section aria-labelledby="gift-title" className="bg-paper-deep">
      <div className="container-x flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:py-16">
        <div className="max-w-2xl">
          <p className="eyebrow inline-flex items-center gap-2 text-body">
            <GinkgoMark className="size-4 text-accent" />
            {gift.eyebrow}
          </p>
          <h2 id="gift-title" className="mt-3 text-[2.25rem] leading-tight sm:text-[2.75rem]">
            {gift.title}
          </h2>
          <p className="mt-2 text-[1.0625rem] text-body sm:text-[1.125rem]">{gift.body}</p>
        </div>
        <Button href={gift.cta.href} variant="primary" size="lg" className="shrink-0">
          {gift.cta.label}
        </Button>
      </div>
    </section>
  );
}
