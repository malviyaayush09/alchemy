import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { features } from "@/config/features";
import { brand, deliveryAreaLabel } from "@/config/brand";
import { inSeason, occasions } from "@/config/occasions";
import { PageHeader } from "@/components/layout/PageHeader";
import { OccasionTiles } from "@/components/occasion/OccasionTiles";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop by occasion",
  description: `Cakes for birthdays, anniversaries, festivals and every day in between, from ${brand.name}. Delivered in ${deliveryAreaLabel}.`,
  alternates: { canonical: "/occasions" },
};

export default function OccasionsPage() {
  if (!features.occasions) notFound();
  // In-season festivals first, then the everyday occasions, then festivals that are coming later.
  const rank = (o: (typeof occasions)[number]) => (o.season ? (inSeason(o) ? 0 : 2) : 1);
  const items = [...occasions].sort((a, b) => rank(a) - rank(b));
  return (
    <>
      <PageHeader crumb="Occasions" title="Shop by occasion" intro="Pick the moment. Each one sets its own scene, with message ideas for the cake." />
      <div className="container-x py-10 lg:py-14">
        <OccasionTiles items={items} headingLevel="h2" />
      </div>
    </>
  );
}
