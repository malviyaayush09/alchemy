import { Hero } from "@/components/home/Hero";
import { HowOrderingWorks } from "@/components/home/HowOrderingWorks";
import { SignatureCakes } from "@/components/home/SignatureCakes";
import { SplitFeatures } from "@/components/home/SplitFeatures";
import { StoryChapters } from "@/components/home/StoryChapters";
import { BakeryJsonLd } from "@/components/seo/BakeryJsonLd";

export const revalidate = 300;

export const metadata = { alternates: { canonical: "/" } };

/** Hybrid home: D's conversion-first counter above the fold, C's story below it. */
export default function HomePage() {
  return (
    <>
      <BakeryJsonLd />
      <Hero />
      <SignatureCakes />
      <HowOrderingWorks />
      <StoryChapters />
      <SplitFeatures />
    </>
  );
}
