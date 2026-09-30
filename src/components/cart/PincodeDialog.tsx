"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui/Icons";
import type { ServiceArea } from "./cart-store";
import { PincodeChecker } from "./PincodeChecker";

/** Bottom sheet on phones, centred dialog on desktop. Opens before the first add-to-cart. */
export function PincodeDialog({ open, onClose, onServiceable }: { open: boolean; onClose: () => void; onServiceable: (a: ServiceArea) => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="pin-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-0 mt-auto mb-0 w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/60 sm:m-auto sm:max-w-md"
    >
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="pin-title" className="text-[1.625rem]">
              Where should we deliver?
            </h2>
            <p className="mt-1 text-[0.875rem] text-body">Every cake is made to order for local delivery, so we check your pincode first.</p>
          </div>
          <button type="button" onClick={onClose} className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4">{open ? <PincodeChecker compact autoFocus onServiceable={onServiceable} /> : null}</div>
      </div>
    </dialog>
  );
}
