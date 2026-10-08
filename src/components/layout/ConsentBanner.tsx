"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Loaded only after consent, so the analytics code never ships to visitors who decline.
const Analytics = dynamic(() => import("@vercel/analytics/next").then((m) => m.Analytics), { ssr: false });

const KEY = "consent:analytics:v1";
type Choice = "granted" | "denied" | null;

function read(): Choice {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Opens the banner again from anywhere (footer link). */
export const openConsent = () => window.dispatchEvent(new Event("consent:open"));

/**
 * Analytics load ONLY after explicit consent. Declining is as easy as accepting.
 * Vercel Web Analytics is cookieless; we still ask, per the brief.
 */
export function ConsentBanner() {
  const [choice, setChoice] = useState<Choice>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = read();
    setChoice(c);
    setOpen(c === null);
    const reopen = () => setOpen(true);
    window.addEventListener("consent:open", reopen);
    return () => window.removeEventListener("consent:open", reopen);
  }, []);

  const decide = (c: "granted" | "denied") => {
    try {
      window.localStorage.setItem(KEY, c);
    } catch {
      /* still honour for this visit */
    }
    setChoice(c);
    setOpen(false);
  };

  return (
    <>
      {choice === "granted" ? <Analytics /> : null}
      {open ? (
        <div role="region" aria-label="Analytics consent" className="on-ink fixed inset-x-0 bottom-[var(--sticky-bar-h,0px)] z-50 border-t border-accent bg-ink px-4 pt-3 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)-var(--sticky-bar-h,0px)))] text-paper">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1rem] text-paper/90">
              May we use cookie-free analytics to improve this site?{" "}
              <Link href="/privacy-policy" className="text-accent underline underline-offset-4">
                Privacy policy
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => decide("denied")} className="min-h-11 flex-1 border border-accent px-5 text-[0.9375rem] font-medium uppercase tracking-[0.12em] text-paper sm:flex-none">
                Decline
              </button>
              <button type="button" onClick={() => decide("granted")} className="min-h-11 flex-1 bg-accent px-5 text-[0.9375rem] font-medium uppercase tracking-[0.12em] text-ink sm:flex-none">
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ConsentSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openConsent} className={className}>
      Analytics settings
    </button>
  );
}
