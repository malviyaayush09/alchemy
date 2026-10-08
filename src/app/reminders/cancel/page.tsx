import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { dbSupports } from "@/lib/capabilities";
import { cancelReminder, reminderToken } from "@/lib/reminders";
import { safeEqualHex } from "@/lib/tokens";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Cancel reminder", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string; t?: string; done?: string }> };

/**
 * Cancel link from a reminder email. Cancelling needs a button press (a POST),
 * so mail scanners that open links can't cancel anything by accident.
 */
export default async function CancelReminderPage({ searchParams }: Props) {
  const { id = "", t = "", done } = await searchParams;
  const valid = Boolean(id && t && (await dbSupports("reminders")) && safeEqualHex(t, reminderToken(id)));

  async function cancel() {
    "use server";
    if (!valid) return;
    await cancelReminder(id);
    redirect(`/reminders/cancel?id=${encodeURIComponent(id)}&t=${encodeURIComponent(t)}&done=1`);
  }

  return (
    <>
      <PageHeader crumb="Reminder" title={done ? "Reminder cancelled" : "Cancel this reminder?"} intro={done ? "We won't email you about it again." : valid ? "We'll stop the email we were going to send you before your celebration." : "This link isn't valid any more."} />
      <div className="container-x py-10 text-center">
        {!done && valid ? (
          <form action={cancel}>
            <button type="submit" className="min-h-13 bg-ink px-7 text-[0.9375rem] font-medium tracking-[0.12em] text-paper uppercase">
              Cancel reminder
            </button>
          </form>
        ) : (
          <Button href="/collections" variant="outline">
            Shop all cakes
          </Button>
        )}
      </div>
    </>
  );
}
