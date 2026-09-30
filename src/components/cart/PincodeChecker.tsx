"use client";

import { useId, useState } from "react";
import { deliveryAreaLabel } from "@/config/brand";
import { buttonClasses } from "@/components/ui/Button";
import { cart, useCart, type ServiceArea } from "./cart-store";

type Status = "idle" | "checking" | "no" | "error";

/**
 * Pincode serviceability check. The result is remembered in the cart so the
 * customer checks once. Unserviceable pincodes get a polite notify-me option.
 */
export function PincodeChecker({ onServiceable, compact = false, autoFocus = false }: { onServiceable?: (a: ServiceArea) => void; compact?: boolean; autoFocus?: boolean }) {
  const { area } = useCart();
  const id = useId();
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setStatus("error");
      setError("Enter a 6-digit pincode.");
      return;
    }
    setStatus("checking");
    try {
      const res = await fetch("/api/serviceability", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pincode }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.serviceable) {
        const a = { pincode, area: data.area as string };
        cart.setArea(a);
        setStatus("idle");
        setEditing(false);
        onServiceable?.(a);
      } else {
        setStatus("no");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (area && !editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border border-line bg-paper-soft px-3 py-2">
        <p className="text-[0.875rem] text-ink">
          Delivering to <b className="font-medium">{area.area}</b> · {area.pincode}
        </p>
        <button type="button" className="min-h-11 text-[0.8125rem] text-ink underline decoration-accent underline-offset-4" onClick={() => setEditing(true)}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={check} noValidate>
        <label htmlFor={`${id}-pin`} className={compact ? "sr-only" : "mb-1.5 block text-[0.875rem] font-medium text-ink"}>
          Check delivery to your pincode
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-pin`}
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="Pincode"
            autoFocus={autoFocus}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (status !== "checking") setStatus("idle");
            }}
            aria-invalid={status === "error" || undefined}
            aria-describedby={`${id}-msg`}
            className="min-h-12 w-full min-w-0 flex-1 border border-ink/40 bg-paper-soft px-3.5 text-ink placeholder:text-body/70 focus:border-ink focus:outline-2 focus:outline-accent"
          />
          <button type="submit" className={buttonClasses("primary", "md")} disabled={status === "checking"}>
            {status === "checking" ? "Checking…" : "Check"}
          </button>
        </div>
        <p id={`${id}-msg`} role="status" className="mt-1.5 text-[0.8125rem] text-body">
          {status === "error" ? <span className="text-danger">{error}</span> : `We deliver in ${deliveryAreaLabel}.`}
        </p>
      </form>
      {status === "no" ? <NotYetHere pincode={pincode} /> : null}
    </div>
  );
}

function NotYetHere({ pincode }: { pincode: string }) {
  const id = useId();
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/notify-me", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pincode, contact }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else {
      setState("error");
      setMsg(data.error ?? "Couldn't save that.");
    }
  }

  return (
    <div className="border border-line bg-paper-soft p-4" role="region" aria-label="Not yet delivering here">
      <p className="font-display text-[1.25rem] text-ink">Not yet delivering to {pincode}.</p>
      <p className="mt-1 text-[0.875rem] text-body">For now we deliver only in {deliveryAreaLabel}. Leave a phone number or email and we&apos;ll let you know when we reach you.</p>
      {state === "done" ? (
        <p className="mt-3 text-[0.875rem] font-medium text-ink" role="status">
          Thank you. We&apos;ll be in touch.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <label htmlFor={`${id}-c`} className="sr-only">
            Phone number or email
          </label>
          <input
            id={`${id}-c`}
            type="text"
            inputMode="email"
            autoComplete="email"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
            className="min-h-12 w-full min-w-0 flex-1 border border-ink/40 bg-paper px-3.5 text-ink focus:border-ink focus:outline-2 focus:outline-accent"
          />
          <button type="submit" className={buttonClasses("outline", "md")} disabled={state === "sending"}>
            Notify me
          </button>
        </form>
      )}
      {state === "error" ? <p className="mt-2 text-[0.8125rem] text-danger">{msg}</p> : null}
    </div>
  );
}
