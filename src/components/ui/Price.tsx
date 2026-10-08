const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatPaise(paise: number) {
  return inr.format(paise / 100);
}

/** A price of 0 means "not set in admin yet" and must never read as free. */
export function Price({ paise, className = "" }: { paise: number; className?: string }) {
  if (paise <= 0) {
    return <span className={`font-sans text-[1rem] text-body ${className}`}>Price on request</span>;
  }
  return <span className={`font-sans font-medium tabular-nums text-ink ${className}`}>{formatPaise(paise)}</span>;
}
