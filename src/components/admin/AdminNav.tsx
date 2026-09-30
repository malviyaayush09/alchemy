"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/slots", label: "Slots" },
  { href: "/admin/pincodes", label: "Pincodes" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="sticky top-16 z-30 border-b border-line bg-ink text-paper lg:top-[4.5rem]">
      <ul className="container-x scroll-row gap-0!">
        {tabs.map((t) => {
          const on = path.startsWith(t.href);
          return (
            <li key={t.href} className="shrink-0">
              <Link href={t.href} aria-current={on ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 px-4 text-[0.875rem] ${on ? "border-accent text-paper" : "border-transparent text-paper/75 hover:text-paper"}`}>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
