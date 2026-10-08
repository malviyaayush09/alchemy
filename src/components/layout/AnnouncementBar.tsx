import { deliveryAreaLabel } from "@/config/brand";
import { GinkgoMark } from "@/components/brand/GinkgoMark";

export function AnnouncementBar() {
  return (
    <div className="on-ink bg-ink pt-[env(safe-area-inset-top)] text-paper">
      <p className="container-x flex min-h-9 items-center justify-center gap-2.5 text-center">
        <GinkgoMark className="size-3.5 shrink-0 text-accent" />
        <span className="text-[0.875rem] tracking-[0.06em] sm:text-[0.9375rem] sm:tracking-[0.12em]">
          <span className="hidden xs:inline">Made to order · </span>Delivered in {deliveryAreaLabel}
        </span>
      </p>
    </div>
  );
}
