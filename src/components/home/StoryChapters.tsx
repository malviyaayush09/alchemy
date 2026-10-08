import Image from "next/image";
import { brand } from "@/config/brand";
import { chapters, storyEyebrow, storyImage } from "@/content/home";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { Button } from "@/components/ui/Button";

/**
 * The Codex narrative, told beside a photograph: four short chapters with
 * gold numerals instead of empty illustration frames.
 */
export function StoryChapters() {
  return (
    <section aria-labelledby="story-title" className="bg-paper-soft py-14 lg:py-24">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 xl:gap-24">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src={storyImage.src} alt={storyImage.alt} fill loading="lazy" sizes="(min-width: 1280px) 520px, (min-width: 1024px) 40vw, (min-width: 448px) 448px, 100vw" className="object-cover object-[50%_60%]" />
          </div>
          <span aria-hidden="true" className="pointer-events-none absolute -inset-2 border border-accent/60 sm:-inset-4" />
        </div>

        <div>
          <p className="eyebrow inline-flex items-center gap-2 text-body">
            <GinkgoMark className="size-4 text-accent" />
            {storyEyebrow}
          </p>
          <h2 id="story-title" className="mt-3 text-[2.5rem] leading-[1.05] sm:text-[3.25rem] lg:text-[3.75rem]">
            {brand.storyLine}
          </h2>
          <p className="mt-4 font-display text-[1.375rem] text-body italic sm:text-[1.5rem]">{brand.belief}</p>

          <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {chapters.map((c) => (
              <li key={c.numeral} className="border-t border-line pt-5">
                <p className="flex items-baseline gap-3">
                  <span aria-hidden="true" className="font-display text-[2rem] leading-none text-[color-mix(in_oklab,var(--brand-detail)_70%,var(--brand-ink))] italic">
                    {c.numeral}
                  </span>
                  <span className="sr-only">Chapter {c.numeral}:</span>
                  <span className="font-display text-[1.625rem] leading-tight font-medium text-ink">{c.title}</span>
                </p>
                <p className="mt-2 text-[1rem] text-body sm:text-[1.0625rem]">{c.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Button href="/collections" variant="primary" size="lg">
              Enter the collection
            </Button>
            <Button href="/about" variant="link">
              Our story
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
