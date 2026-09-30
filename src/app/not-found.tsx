import type { Metadata } from "next";
import { GoldRule } from "@/components/brand/GoldRule";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="container-x py-20 text-center lg:py-28">
      <GoldRule />
      <p className="eyebrow mt-6 text-body">Error 404</p>
      <h1 className="mt-2 text-[2.5rem] sm:text-[3.25rem]">This page has not been crafted yet.</h1>
      <p className="mx-auto mt-3 max-w-md text-body">The link may be old, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/collections">Shop all cakes</Button>
        <Button href="/" variant="outline">
          Back to home
        </Button>
      </div>
    </section>
  );
}
