import { Hero } from "@/components/home/Hero";
import { HowOrderingWorks } from "@/components/home/HowOrderingWorks";
import { PromiseBand } from "@/components/home/PromiseBand";
import { ShopByOccasion } from "@/components/home/ShopByOccasion";
import { SignatureCakes } from "@/components/home/SignatureCakes";
import { SplitFeatures } from "@/components/home/SplitFeatures";
import { StoryChapters } from "@/components/home/StoryChapters";
import { BakeryJsonLd } from "@/components/seo/BakeryJsonLd";

export const revalidate = 300;

export const metadata = { alternates: { canonical: "/" } };

/** Photo-led home: hero, the cakes straight away, occasions, then the story and how ordering works. */
export default function HomePage() {
  return (
    <>
      <BakeryJsonLd />
      <Hero />
      <PromiseBand />
      <SignatureCakes />
      <ShopByOccasion />
      <StoryChapters />
      <HowOrderingWorks />
      <SplitFeatures />
    </>
  );
}
