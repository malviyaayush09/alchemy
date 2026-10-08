"use client";

import { useState } from "react";
import { GinkgoMark } from "@/components/brand/GinkgoMark";
import { buttonClasses } from "@/components/ui/Button";

type Saved = { remindOnLabel: string; celebrateOnLabel: string };

type Props = {
  orderNumber: string;
  token: string;
  email: string;
  defaultDate: string;
  existing: (Saved & { occasion: string; person: string; date: string }) | null;
};

const field = "block min-h-12 w-full border border-ink/40 bg-paper px-3.5 py-2.5 text-ink focus:border-ink focus:outline-2 focus:outline-accent";

/** "Remind me next year": one email a week before the same date next year. */
export function RemindMe({ orderNumber, token, email, defaultDate, existing }: Props) {
  const [saved, setSaved] = useState<Saved | null>(existing);
  const [editing, setEditing] = useState(!existing);
  const [f, setF] = useState({ occasion: existing?.occasion ?? "birthday", person: existing?.person ?? "", date: existing?.date ?? defaultDate });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/reminders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderNumber, token, ...f }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error ?? "Something went wrong. Please try again.");
    setSaved({ remindOnLabel: d.remindOnLabel, celebrateOnLabel: d.celebrateOnLabel });
    setEditing(false);
  }

  return (
    <section aria-labelledby="remind-title" className="mx-auto mt-10 max-w-2xl border border-line bg-paper-soft p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <GinkgoMark className="mt-1.5 size-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <h2 id="remind-title" className="text-[1.75rem] leading-tight">
            Remind me next year
          </h2>
          {saved && !editing ? (
            <div role="status">
              <p className="mt-2 text-[1rem] text-body">
                Done. We&apos;ll email <b className="font-medium text-ink">{email}</b> on <b className="font-medium text-ink">{saved.remindOnLabel}</b>, a week before {saved.celebrateOnLabel}.
              </p>
              <button type="button" onClick={() => setEditing(true)} className="mt-2 min-h-11 text-[0.9375rem] text-ink underline decoration-accent underline-offset-4">
                Change it
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-2">
              <p className="text-[1rem] text-body">One email a week before the same day next year, so there&apos;s time to order. Nothing else.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label htmlFor="rm-occasion" className="block text-[0.9375rem] font-medium text-ink">
                    Celebrating
                  </label>
                  <select id="rm-occasion" className={field} value={f.occasion} onChange={(e) => setF({ ...f, occasion: e.target.value })}>
                    <option value="birthday">A birthday</option>
                    <option value="anniversary">An anniversary</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="rm-person" className="block text-[0.9375rem] font-medium text-ink">
                    Whose? <span className="font-normal text-body">(optional)</span>
                  </label>
                  <input id="rm-person" className={field} value={f.person} maxLength={40} onChange={(e) => setF({ ...f, person: e.target.value })} placeholder="e.g. Riya" autoComplete="off" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="rm-date" className="block text-[0.9375rem] font-medium text-ink">
                    The date
                  </label>
                  <input id="rm-date" type="date" className={field} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} required />
                </div>
              </div>
              {error ? (
                <p role="alert" className="mt-3 text-[0.9375rem] text-danger">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={busy} className={`${buttonClasses("primary", "md")} mt-5`}>
                {busy ? "Saving…" : "Set reminder"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
