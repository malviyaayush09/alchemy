import { inSeason, occasions } from "@/config/occasions";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { OccasionTiles } from "@/components/occasion/OccasionTiles";

/** Home: occasions in season, festivals first while they're on. */
export function ShopByOccasion() {
  const now = new Date();
  const items = occasions.filter((o) => inSeason(o, now)).sort((a, b) => Number(Boolean(b.season)) - Number(Boolean(a.season)));
  return (
    <section aria-labelledby="occasion-title" className="bg-paper-soft py-14 lg:py-24">
      <div className="container-x">
        <header className="mx-auto max-w-2xl text-center">
          <GinkgoMark className="mx-auto size-5 text-accent" />
          <h2 id="occasion-title" className="mt-3 text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem]">
            Shop by occasion
          </h2>
          <p className="mt-2 text-[1.0625rem] text-body sm:text-[1.125rem]">Every cake suits every celebration. Pick the moment and we&apos;ll set the scene.</p>
        </header>
        <div className="mt-10 lg:mt-14">
          <OccasionTiles items={items} />
        </div>
      </div>
    </section>
  );
}
