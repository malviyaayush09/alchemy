import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { features } from "@/config/features";
import { currentUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrackOrderForm } from "@/components/account/TrackOrderForm";

export const metadata: Metadata = { title: "Track Order", description: `Track your ${brand.name} order with your order ID and phone number.` };
export const dynamic = "force-dynamic";

export default async function TrackOrderPage() {
  if (!features.trackOrder) notFound();
  const user = await currentUser();
  return (
    <>
      <PageHeader crumb="Track Order" title="Track your order" intro="Enter the order ID from your confirmation email and the phone number you ordered with." />
      <div className="container-x max-w-xl py-8 lg:py-12">
        <TrackOrderForm />
        <p className="mt-8 text-[0.9375rem] text-body">
          {user ? (
            <>
              Signed in?{" "}
              <Link href="/account" className="text-ink underline decoration-accent underline-offset-4">
                See all your orders
              </Link>
              .
            </>
          ) : (
            <>
              Have an account?{" "}
              <Link href="/login?next=/account" className="text-ink underline decoration-accent underline-offset-4">
                Sign in
              </Link>{" "}
              to see all your orders.
            </>
          )}
        </p>
      </div>
    </>
  );
}
