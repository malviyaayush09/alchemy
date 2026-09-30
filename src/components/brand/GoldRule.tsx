import { GinkgoMark } from "./GinkgoMark";

/** Hairline divider with a centred ginkgo, as used on the packaging. Decorative. */
export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-accent ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-current opacity-70" />
      <GinkgoMark className="size-4" />
      <span className="h-px w-12 bg-current opacity-70" />
    </div>
  );
}
