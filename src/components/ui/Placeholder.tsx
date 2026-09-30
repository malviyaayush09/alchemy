import type { ReactNode } from "react";

/**
 * Visibly labelled placeholder for facts we must not invent (phone, address,
 * licence numbers, legal copy). Easy to grep: "[PLACEHOLDER".
 */
export function Placeholder({ children, tone = "paper" }: { children: ReactNode; tone?: "paper" | "ink" }) {
  return (
    <span
      className={`inline-block border border-dashed px-1.5 font-sans text-[0.8125rem] ${
        tone === "ink" ? "border-accent/70 text-accent" : "border-detail text-body"
      }`}
    >
      [PLACEHOLDER: {children}]
    </span>
  );
}
