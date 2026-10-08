"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { brand, deliveryAreaLabel } from "@/config/brand";
import { primaryNav } from "@/config/navigation";
import { Logo } from "@/components/brand/Logo";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";

/** Native <dialog>: focus trap, Esc to close and inert background come for free. */
export function MobileMenu() {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="-ml-2 inline-flex size-11 items-center justify-center text-ink lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <MenuIcon />
      </button>

      <dialog
        ref={ref}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-paper p-0 text-ink backdrop:bg-[#05070d]/60 open:flex open:flex-col"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4 pt-[env(safe-area-inset-top)]">
          <Logo size="sm" />
          <button type="button" className="inline-flex size-11 items-center justify-center" aria-label="Close menu" onClick={() => ref.current?.close()}>
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="divide-y divide-line/60">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex min-h-13 items-center font-display text-[1.375rem] text-ink" aria-current={pathname === item.href ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account" className="flex min-h-13 items-center font-display text-[1.375rem] text-ink">
                My Account
              </Link>
            </li>
          </ul>
        </nav>
        <p className="border-t border-line px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[0.9375rem] text-body">
          {brand.tagline}
          <br />
          Delivering in {deliveryAreaLabel}
        </p>
      </dialog>
    </>
  );
}
