import { deliveryAreaLabel } from "@/config/brand";
import { GinkgoMark } from "@/components/brand/GinkgoMark";

export function AnnouncementBar() {
  return (
    <div className="on-ink bg-ink pt-[env(safe-area-inset-top)] text-paper">
      <p className="container-x flex min-h-8 items-center justify-center gap-2 text-center">
        <GinkgoMark className="size-3 shrink-0 text-accent" />
        <span className="eyebrow text-[0.6875rem]! tracking-[0.1em]! sm:text-[0.75rem]! sm:tracking-[0.2em]!">
          <span className="hidden xs:inline">Now d</span>
          <span className="xs:hidden">D</span>elivering in {deliveryAreaLabel}
        </span>
      </p>
    </div>
  );
}
