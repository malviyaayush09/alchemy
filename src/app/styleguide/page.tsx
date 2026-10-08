import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { fallbackProducts as products } from "@/data/catalog";
import { Artwork } from "@/components/brand/Artwork";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { GoldRule } from "@/components/brand/GoldRule";
import { Logo } from "@/components/brand/Logo";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import { Price } from "@/components/ui/Price";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false, follow: false } };

/** Design-system review page. Development only; 404 in production builds. */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const swatches = Object.entries(brand.colors);

  return (
    <div className="container-x space-y-14 py-10">
      <h1 className="text-[2.5rem]">Design system</h1>

      <Section title="Colour tokens (from brand.ts)">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map(([name, hex]) => (
            <li key={name} className="border border-line">
              <span className="block h-20" style={{ background: hex }} />
              <span className="block p-2 text-[0.9375rem]">
                <b className="font-medium text-ink">{name}</b> {hex}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[1rem]">Accent (gold) on paper is 2.1:1: display/decoration only. Body text on paper uses body (6.6:1) or ink (13.2:1).</p>
      </Section>

      <Section title="Typography">
        <p className="font-script text-[3.5rem] leading-none text-ink">{brand.heroLine}</p>
        <p className="eyebrow mt-2 text-body">Allura · logo and hero only</p>
        <h2 className="mt-6 text-[2.5rem]">Signature Cakes</h2>
        <p className="eyebrow mt-1 text-body">Cormorant Garamond 400/600 · headings</p>
        <p className="mt-6 max-w-prose">Montserrat · body, UI, prices and buttons. {brand.tagline}</p>
      </Section>

      <Section title="Logo & ginkgo motif">
        <div className="flex flex-wrap items-center gap-8">
          <Logo asLink={false} size="lg" showSubline />
          <div className="on-ink bg-ink p-4">
            <Logo asLink={false} tone="paper" size="md" />
          </div>
          <GinkgoMark className="size-10 text-accent" />
          <GinkgoMark variant="engraved" className="size-16 text-accent" />
        </div>
        <GoldRule className="mt-6" />
      </Section>

      <Section title="Buttons (min 44px)">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="link">Text link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="on-ink mt-4 flex flex-wrap items-center gap-3 bg-ink p-4">
          <Button variant="accent">Accent on ink</Button>
          <Button variant="outline-light">Outline light</Button>
          <Button variant="link-light">Link light</Button>
        </div>
      </Section>

      <Section title="Badges & price">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tag="eggless" />
          <Badge tag="egg" />
          <Badge tag="pull-up" />
          <Badge tag="sugar-free" />
          <Price paise={0} />
          <Price paise={185000} />
        </div>
      </Section>

      <Section title="Form fields">
        <form className="grid max-w-md gap-5">
          <TextField id="sg-phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" hint="We'll only call about your delivery." />
          <TextField id="sg-pin" label="Pincode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" />
          <TextField id="sg-otp" label="One-time code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} error="That code didn't match. Try again." />
          <TextArea id="sg-msg" label="Message on cake" maxLength={30} placeholder="Happy birthday, Asha" />
          <SegmentedControl name="sg-weight" legend="Weight" hideLegend={false} options={[{ value: "500", label: "500 g" }, { value: "1000", label: "1 kg" }]} />
        </form>
      </Section>

      <Section title="Cards & artwork">
        <ul className="grid grid-cols-2 gap-3 sm:max-w-xl">
          {products.slice(0, 2).map((p) => (
            <li key={p.slug} className="flex">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-4">
          <Artwork label="Engraving · arch" className="aspect-[4/5] w-40" />
          <Artwork label="Engraving · circle" shape="circle" className="size-40" />
          <Artwork label="Engraving · on ink" tone="ink" shape="rect" className="aspect-square w-40" />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow mb-4 border-b border-line pb-2 text-body">{title}</h2>
      {children}
    </section>
  );
}
