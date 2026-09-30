"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/account", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav aria-label="Account" className="mt-6 border-b border-line">
      <ul className="scroll-row">
        {tabs.map((t) => {
          const on = t.href === "/account" ? path === "/account" || path.startsWith("/account/orders") : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={on ? "page" : undefined} className={`-mb-px inline-flex min-h-12 items-center border-b-2 px-4 text-[0.9375rem] ${on ? "border-ink text-ink" : "border-transparent text-body hover:text-ink"}`}>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
