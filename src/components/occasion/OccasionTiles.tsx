import Link from "next/link";
import { inSeason, themeVars, type Occasion } from "@/config/occasions";
import { OccasionMotif } from "./OccasionMotif";

/**
 * One tile per occasion, each already wearing its own theme and motif, so the
 * grid previews the change the page will make.
 */
export function OccasionTiles({ items, headingLevel = "h3" }: { items: Occasion[]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {items.map((o) => (
        <li key={o.slug} style={themeVars(o)} className="occasion-theme">
          <Link
            href={`/occasions/${o.slug}`}
            className="on-ink group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-ink p-4 text-paper transition-transform duration-500 hover:-translate-y-1 sm:aspect-[5/4] sm:p-7"
          >
            <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,color-mix(in_oklab,var(--brand-accent)_35%,transparent),transparent_60%)]" />
            <OccasionMotif motif={o.motif} compact />
            <span aria-hidden="true" className="absolute inset-2 border border-accent/40 transition-colors duration-500 group-hover:border-accent sm:inset-3" />
            <span className="relative">
              {o.season && inSeason(o) ? (
                <span className="mb-2 inline-block bg-accent px-2 py-0.5 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase">In season</span>
              ) : null}
              <H className="font-display text-[1.75rem] leading-none text-paper sm:text-[2.5rem]">{o.name}</H>
              <span className="mt-2 hidden text-[1rem] text-paper/85 sm:block">{o.title}</span>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.8125rem] tracking-[0.14em] text-accent uppercase">
                Explore
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
