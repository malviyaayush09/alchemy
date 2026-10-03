"use client";

import { useEffect, useState } from "react";

export type SlotOption = { id: string; label: string; kind: string; available: boolean; reason: null | "full" | "cutoff" | "past" };

const reasonText = { full: "Full", cutoff: "Closed for today", past: "Passed" } as const;

const dayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });
const dmFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

type Props = {
  dates: string[];
  /** Shown as "Closed" and not selectable. */
  closedDates?: string[];
  date: string | null;
  slotId: string | null;
  onChange: (v: { date: string; slotId: string | null; slotLabel: string | null }) => void;
  error?: string;
};

/** Horizontal date strip + slot grid. Full / past-cutoff slots are disabled, never hidden. */
export function SlotPicker({ dates, closedDates = [], date, slotId, onChange, error }: Props) {
  const [slots, setSlots] = useState<SlotOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    let live = true;
    setLoading(true);
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => live && setSlots(d.slots ?? []))
      .catch(() => live && setSlots([]))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [date]);

  const label = (d: string, i: number) => (i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayFmt.format(new Date(`${d}T00:00:00Z`)));

  return (
    <div className="space-y-4">
      {/* min-w-0: fieldsets default to min-content width and would widen the page */}
      <fieldset className="min-w-0">
        <legend className="mb-2 text-[0.875rem] font-medium text-ink">Delivery date</legend>
        <div className="scroll-row -mx-4 px-4 pb-1 sm:mx-0 sm:px-0">
          {dates.map((d, i) => {
            const on = d === date;
            const closed = closedDates.includes(d);
            return (
              <label key={d} className={`relative shrink-0 ${closed ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <input type="radio" name="delivery-date" value={d} checked={on} disabled={closed} onChange={() => onChange({ date: d, slotId: null, slotLabel: null })} className="peer sr-only" />
                <span className="flex min-h-16 w-[5.25rem] flex-col items-center justify-center border border-line bg-paper text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-disabled:border-dashed peer-disabled:bg-paper-deep peer-disabled:text-body peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  <span className="text-[0.75rem] font-medium uppercase tracking-[0.08em]">{closed ? "Closed" : label(d, i)}</span>
                  <span className="mt-0.5 text-[0.9375rem]">{dmFmt.format(new Date(`${d}T00:00:00Z`))}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {date ? (
        <fieldset aria-busy={loading} className="min-w-0">
          <legend className="mb-2 text-[0.875rem] font-medium text-ink">Time slot</legend>
          {loading && !slots ? (
            <p className="text-[0.875rem] text-body">Loading slots…</p>
          ) : slots && slots.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((s) => (
                <label key={s.id} className={`relative ${s.available ? "cursor-pointer" : "cursor-not-allowed"}`}>
                  <input
                    type="radio"
                    name="slot"
                    value={s.id}
                    disabled={!s.available}
                    checked={slotId === s.id}
                    onChange={() => onChange({ date, slotId: s.id, slotLabel: s.label })}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-14 flex-col items-center justify-center border border-line bg-paper px-2 text-center text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-disabled:border-dashed peer-disabled:bg-paper-deep peer-disabled:text-body peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                    <span className="text-[0.9375rem]">{s.label}</span>
                    {s.reason ? <span className="text-[0.75rem]">{reasonText[s.reason]}</span> : null}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-[0.875rem] text-body">No slots available on this date. Please pick another day.</p>
          )}
        </fieldset>
      ) : null}
      {error ? (
        <p className="text-[0.8125rem] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
