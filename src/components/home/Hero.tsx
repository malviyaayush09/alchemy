import { getImageProps } from "next/image";
import { brand } from "@/config/brand";
import { heroImage } from "@/data/catalog";
import { Button } from "@/components/ui/Button";

/**
 * Split hero (Direction D). On phones the photo is not rendered at all — the
 * <picture> serves a 1×1 transparent source below 1024px — so mobile LCP is
 * the headline text and nothing decorative competes with it.
 */
export function Hero() {
  const {
    props: { srcSet, ...imgProps },
  } = getImageProps({
    src: heroImage.src,
    alt: heroImage.alt,
    width: heroImage.width,
    height: heroImage.height,
    sizes: "50vw",
  });

  return (
    <section className="on-ink bg-ink text-paper">
      <div className="lg:grid lg:grid-cols-2">
        <div className="container-x flex flex-col justify-center py-10 sm:py-14 lg:mr-0 lg:ml-auto lg:max-w-[38rem] lg:py-20 lg:pr-12">
          <h1 className="font-script text-[3.1rem] leading-[1.02] text-paper sm:text-[4rem] lg:text-[4.75rem]">{brand.heroLine}</h1>
          <p className="mt-4 font-display text-[1.25rem] text-paper/90 sm:text-[1.5rem]">{brand.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/collections" variant="accent" size="md">
              Shop all cakes
            </Button>
          </div>
        </div>

        <div className="relative hidden min-h-[30rem] lg:block">
          <picture>
            <source media="(min-width: 1024px)" srcSet={srcSet} sizes={imgProps.sizes} />
            <img
              {...imgProps}
              src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
              alt={heroImage.alt}
              fetchPriority="high"
              loading="eager"
              className="absolute inset-0 size-full object-cover object-[50%_58%]"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
