"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

const input = "block w-full min-h-12 border border-ink/40 bg-paper-soft px-3.5 py-2.5 text-ink focus:border-ink focus:outline-2 focus:outline-accent";

export function TrackOrderForm() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderNumber, phone }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && d.url) router.push(d.url);
    else setError(d.error ?? "Something went wrong.");
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="t-order" className="block text-[1rem] font-medium text-ink">
          Order ID
        </label>
        <input id="t-order" className={`${input} uppercase`} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} placeholder="e.g. ALC-001001" autoCapitalize="characters" autoComplete="off" required />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="t-phone" className="block text-[1rem] font-medium text-ink">
          Phone number
        </label>
        <input id="t-phone" type="tel" inputMode="tel" autoComplete="tel" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      {error ? (
        <p role="alert" className="text-[1rem] text-danger">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className={buttonClasses("primary", "lg", true)}>
        {busy ? "Finding your order…" : "Track order"}
      </button>
    </form>
  );
}
