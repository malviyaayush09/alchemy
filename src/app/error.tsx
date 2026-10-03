"use client";

import { GoldRule } from "@/components/brand/GoldRule";
import { Button } from "@/components/ui/Button";

/** Friendly fallback when a page fails to render. Staff are emailed via instrumentation. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-x py-20 text-center lg:py-28">
      <GoldRule />
      <h1 className="mt-6 text-[2.25rem] sm:text-[3rem]">Something went wrong.</h1>
      <p className="mx-auto mt-3 max-w-md text-body">We&apos;ve been notified. Please try again; your cart is safe.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button href="/" variant="outline">
          Back to home
        </Button>
      </div>
    </section>
  );
}
