import { brand } from "@/config/brand";
import { chapters, storyEyebrow } from "@/content/home";
import { Artwork } from "@/components/brand/Artwork";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { Button } from "@/components/ui/Button";

/**
 * The Codex narrative (Direction C) folded into the D system. A single gold
 * thread runs down the chapters; on desktop they alternate either side of it.
 * All artwork is decorative, lazy and below the fold.
 */
export function StoryChapters() {
  return (
    <section aria-labelledby="story-title" className="relative overflow-hidden bg-paper-soft py-14 lg:py-24">
      <div className="container-x">
        <header className="mx-auto max-w-xl text-center">
          <GinkgoMark variant="engraved" className="mx-auto size-10 text-accent" />
          <p className="eyebrow mt-4 text-body">{storyEyebrow}</p>
          <h2 id="story-title" className="mt-2 text-[2.25rem] leading-tight sm:text-[3rem]">
            {brand.storyLine}
          </h2>
          <p className="mt-3 font-display text-[1.25rem] text-body">{brand.belief}</p>
        </header>

        <ol className="relative mx-auto mt-12 max-w-4xl lg:mt-16">
          {/* the thread */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.4375rem] w-px bg-line lg:left-1/2" />
          {chapters.map((c, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={c.numeral} className="relative pb-12 pl-10 last:pb-0 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-16 lg:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 size-[0.9375rem] rounded-full border border-accent bg-paper-soft lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
                />
                <div className={`${flip ? "lg:order-2" : "lg:text-right"}`}>
                  <p className="eyebrow text-body">Chapter {c.numeral}</p>
                  <h3 className="mt-1 text-[1.75rem] lg:text-[2.125rem]">{c.title}</h3>
                  <p className="mt-2 max-w-sm text-[0.9375rem] text-body lg:inline-block">{c.body}</p>
                </div>
                <div className={`mt-5 lg:mt-0 ${flip ? "lg:order-1 lg:justify-self-end" : ""}`}>
                  <Artwork label={c.art} className="aspect-[4/5] w-full max-w-[9.5rem] sm:max-w-[13rem] lg:max-w-[17rem]" />
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 text-center">
          <Button href="/collections" variant="primary">
            Enter the collection
          </Button>
        </div>
      </div>
    </section>
  );
}
