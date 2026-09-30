import type { Metadata } from "next";
import { brand, deliveryAreaLabel } from "@/config/brand";
import { about } from "@/content/about";
import { Artwork } from "@/components/brand/Artwork";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { GoldRule } from "@/components/brand/GoldRule";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description: `The story of ${brand.name}: ${brand.belief} Luxury cakes made to order in ${deliveryAreaLabel}.`,
};

export default function AboutPage() {
  return (
    <>
      {/* Hero: text only, so the H1 is the LCP element */}
      <section className="on-ink bg-ink text-paper">
        <div className="container-x py-14 text-center sm:py-20 lg:py-24">
          <GinkgoMark variant="engraved" className="mx-auto size-12 text-accent" />
          <p className="eyebrow mt-5 text-accent">{about.eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-[2.25rem] leading-tight text-paper sm:text-[3rem] lg:text-[3.5rem]">{about.title}</h1>
          <p className="mx-auto mt-5 max-w-xl font-display text-[1.25rem] italic text-paper/85">{about.intro}</p>
        </div>
      </section>

      {about.sections.map((s, i) => (
        <section key={s.id} aria-labelledby={`${s.id}-title`} className={i % 2 ? "bg-paper-soft" : ""}>
          <div className={`container-x grid items-center gap-8 py-14 md:gap-14 lg:py-20 ${i % 2 ? "md:grid-cols-[16rem_1fr] lg:grid-cols-[20rem_1fr]" : "md:grid-cols-[1fr_16rem] lg:grid-cols-[1fr_20rem]"}`}>
            <div className={i % 2 ? "md:order-2" : ""}>
              <p className="eyebrow text-body">{s.eyebrow}</p>
              <h2 id={`${s.id}-title`} className="mt-2 text-[2rem] leading-tight lg:text-[2.5rem]">
                {s.title}
              </h2>
              <div className="mt-4 max-w-xl space-y-4 text-[1rem] text-body">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <Artwork label={s.art} className={`mx-auto aspect-[4/5] w-full max-w-[14rem] md:max-w-none ${i % 2 ? "md:order-1" : ""}`} />
          </div>
        </section>
      ))}

      <section aria-labelledby="principles-title" className="on-ink bg-ink text-paper">
        <div className="container-x py-14 lg:py-20">
          <p className="eyebrow text-center text-accent">{about.principles.eyebrow}</p>
          <h2 id="principles-title" className="mt-2 text-center text-[2rem] text-paper lg:text-[2.5rem]">
            {about.principles.title}
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {about.principles.items.map((p, i) => (
              <li key={p.title} className="border border-accent/50 p-6 text-center">
                <span className="font-display text-[1.5rem] text-accent" aria-hidden="true">
                  {["I", "II", "III"][i]}
                </span>
                <h3 className="mt-2 text-[1.625rem] text-paper">{p.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-paper/85">{p.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center font-display text-[1.25rem] italic text-paper/90">{about.principles.closing}</p>
        </div>
      </section>

      <section aria-labelledby="experience-title">
        <div className="container-x grid items-center gap-8 py-14 md:grid-cols-[16rem_1fr] md:gap-14 lg:grid-cols-[20rem_1fr] lg:py-20">
          <Artwork label={about.experience.art} className="mx-auto aspect-[4/5] w-full max-w-[14rem] md:max-w-none" />
          <div>
            <p className="eyebrow text-body">{about.experience.eyebrow}</p>
            <h2 id="experience-title" className="mt-2 text-[2rem] lg:text-[2.5rem]">
              {about.experience.title}
            </h2>
            <ul className="mt-5 space-y-2">
              {about.experience.items.map((item) => (
                <li key={item} className="flex items-start gap-3 font-display text-[1.25rem] text-ink">
                  <GinkgoMark className="mt-1.5 size-3.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[1rem] text-body">{about.experience.closing}</p>
          </div>
        </div>
      </section>

      <section aria-label="Positioning" className="bg-paper-soft">
        <div className="container-x py-16 text-center lg:py-24">
          <GoldRule />
          <blockquote className="mx-auto mt-6 max-w-2xl">
            <p className="font-display text-[2rem] italic leading-tight text-ink sm:text-[2.75rem]">“{about.positioning.quote}”</p>
          </blockquote>
          <p className="mx-auto mt-5 max-w-lg text-[1rem] text-body">{about.positioning.body}</p>
          <div className="mt-8">
            <Button href="/collections">Enter the collection</Button>
          </div>
        </div>
      </section>
    </>
  );
}
