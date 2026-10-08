import type { CSSProperties } from "react";
import type { Motif } from "@/config/occasions";

/**
 * Decorative, slowly moving pattern for an occasion hero (confetti, petals,
 * diyas…). Pure SVG + CSS keyframes (see globals.css "motif-*"): no JS, no
 * downloads, aria-hidden, and frozen by the global reduced-motion rule.
 * Positions come from a fixed table so server and client render identically.
 */

// [left %, start delay s, duration s, size px, drift px]
const field: [number, number, number, number, number][] = [
  [4, 0, 13, 14, 30], [12, 4.5, 16, 10, -20], [21, 1.5, 12, 16, 25], [29, 7, 15, 9, -30], [37, 2.5, 14, 13, 20],
  [45, 9, 17, 11, -25], [53, 0.8, 13, 15, 30], [61, 5.5, 15, 10, -20], [69, 3, 12, 14, 25], [77, 8, 16, 12, -30],
  [85, 1, 14, 16, 20], [93, 6, 13, 10, -25], [8, 10, 15, 12, 25], [49, 11, 14, 9, -20], [73, 12, 16, 13, 30],
];

const GINKGO = "M16 18.2C11.8 17.7 5.4 14.2 3.3 8.6 6.9 5 11.5 3.5 14.8 5.1L16 9.2 17.2 5.1C20.5 3.5 25.1 5 28.7 8.6 26.6 14.2 20.2 17.7 16 18.2Z M16 18.2C16.1 22.2 15.6 26.1 14.3 29.6";

function Piece({ motif, i, size }: { motif: Motif; i: number; size: number }) {
  const tone = i % 3 === 0 ? "var(--brand-paper)" : i % 3 === 1 ? "var(--brand-accent)" : "var(--brand-detail)";
  switch (motif) {
    case "confetti":
      return i % 2 ? (
        <svg width={size} height={size * 0.45} viewBox="0 0 20 9">
          <rect width="20" height="9" rx="1.5" fill={tone} />
        </svg>
      ) : (
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="5" fill={tone} />
        </svg>
      );
    case "petals":
      return (
        <svg width={size * 1.3} height={size} viewBox="0 0 26 20">
          <path d="M2 10C6 1 18 0 24 6 19 15 8 19 2 10Z" fill={i % 2 ? "var(--brand-accent)" : "var(--brand-detail)"} opacity="0.85" />
          <path d="M3 10C9 8 16 7 23 6.5" stroke="var(--brand-paper)" strokeWidth="0.6" opacity="0.5" fill="none" />
        </svg>
      );
    case "ribbons":
      return (
        <svg width={size * 1.4} height={size * 2.2} viewBox="0 0 14 22">
          <path d="M7 1C1 5 13 8 7 12S1 18 7 21" stroke={tone} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "leaves":
      return (
        <svg width={size * 1.4} height={size * 1.4} viewBox="0 0 32 32">
          <path d={GINKGO} fill={i % 2 ? "var(--brand-accent)" : "none"} stroke="var(--brand-accent)" strokeWidth="1" />
        </svg>
      );
    case "stars":
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <path d="M10 0 12 8 20 10 12 12 10 20 8 12 0 10 8 8Z" fill={i % 2 ? "var(--brand-accent)" : "var(--brand-paper)"} />
        </svg>
      );
    case "diyas":
      return (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="2" fill="var(--brand-accent)" />
          <circle cx="5" cy="5" r="5" fill="var(--brand-accent)" opacity="0.25" />
        </svg>
      );
  }
}

/** A diya with a flickering flame (the diyas motif's foreground row). */
function Diya({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 60 50" className="h-auto w-full" aria-hidden="true">
      <g className="motif-flicker" style={{ animationDelay: `${delay}s`, transformOrigin: "30px 22px" } as CSSProperties}>
        <ellipse cx="30" cy="16" rx="11" ry="14" fill="var(--brand-accent)" opacity="0.18" />
        <path d="M30 4C35 11 36 17 30 23 24 17 25 11 30 4Z" fill="var(--brand-accent)" />
        <path d="M30 11C32.5 15 32.5 18 30 21 27.5 18 27.5 15 30 11Z" fill="var(--brand-paper)" opacity="0.85" />
      </g>
      <path d="M6 26H54C52 38 42 46 30 46S8 38 6 26Z" fill="var(--brand-detail)" />
      <path d="M6 26H54" stroke="var(--brand-accent)" strokeWidth="2.5" />
      <path d="M14 33C20 37 40 37 46 33" stroke="var(--brand-paper)" strokeWidth="1.2" opacity="0.55" fill="none" strokeDasharray="2 3" />
    </svg>
  );
}

/** `compact`: tiles, where the diya row would sit on top of the text. */
export function OccasionMotif({ motif, compact = false }: { motif: Motif; compact?: boolean }) {
  const kind = motif === "stars" || motif === "diyas" ? "twinkle" : "fall";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {field.map(([left, delay, dur, size, drift], i) =>
        kind === "fall" ? (
          <span
            key={i}
            className="motif-fall absolute -top-10"
            style={{ left: `${left}%`, animationDelay: `-${delay}s`, animationDuration: `${dur}s`, "--drift": `${drift}px` } as CSSProperties}
          >
            <span className="motif-sway block" style={{ animationDelay: `-${delay / 2}s` } as CSSProperties}>
              <Piece motif={motif} i={i} size={size} />
            </span>
          </span>
        ) : (
          <span
            key={i}
            className="motif-twinkle absolute"
            style={{ left: `${left}%`, top: `${(i * 37) % 70 + 5}%`, animationDelay: `-${delay / 3}s`, animationDuration: `${dur / 4}s` } as CSSProperties}
          >
            <Piece motif={motif} i={i} size={size} />
          </span>
        ),
      )}
      {motif === "diyas" && !compact ? (
        <div className="absolute inset-x-0 bottom-0 flex justify-around px-4 opacity-90">
          {[0, 0.7, 0.3, 1.1, 0.5].map((d, i) => (
            <div key={i} className={`w-12 sm:w-16 ${i > 2 ? "hidden sm:block" : ""}`}>
              <Diya delay={d} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
