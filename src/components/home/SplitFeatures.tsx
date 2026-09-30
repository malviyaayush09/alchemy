import Image from "next/image";
import { splitFeatures } from "@/content/home";
import { Artwork } from "@/components/brand/Artwork";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { Button } from "@/components/ui/Button";

export function SplitFeatures() {
  return (
    <section aria-label="Our story and gift box" className="py-12 lg:py-16">
      <div className="container-x grid gap-5 lg:grid-cols-2">
        {splitFeatures.map((f) => (
          <article key={f.title} className="grid grid-cols-[40%_1fr] border border-line bg-paper sm:grid-cols-2">
            <div className="relative min-h-44 sm:min-h-64">
              {f.image ? (
                <Image src={f.image} alt="" fill sizes="(min-width: 1024px) 290px, 45vw" loading="lazy" className="object-cover object-[50%_60%]" />
              ) : (
                <div className="absolute inset-0">
                  <Artwork label={f.art} shape="rect" className="size-full border-0" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-4 sm:p-8">
              <GinkgoMark className="size-4 text-accent" />
              <p className="eyebrow mt-3 text-body">{f.eyebrow}</p>
              <h2 className="mt-2 text-[1.5rem] leading-tight sm:text-[2rem]">{f.title}</h2>
              <p className="mt-2 text-[0.875rem] text-body">{f.body}</p>
              <div className="mt-4">
                <Button href={f.cta.href} variant={f.cta.variant} size="sm">
                  {f.cta.label}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
