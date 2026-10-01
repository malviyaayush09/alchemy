import Link from "next/link";
import { primaryNav } from "@/config/navigation";
import { Logo } from "@/components/brand/Logo";
import { CartCount } from "@/components/cart/CartCount";
import { BagIcon } from "@/components/ui/Icons";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="container-x flex h-16 items-center gap-2 lg:h-[4.5rem]">
        <MobileMenu />
        <span className="lg:hidden">
          <Logo size="sm" />
        </span>
        <span className="hidden lg:block">
          <Logo size="md" />
        </span>

        <nav aria-label="Primary" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-[0.875rem] tracking-[0.04em] text-ink underline-offset-[6px] hover:underline hover:decoration-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/account" className="ml-auto hidden min-h-11 items-center px-3 text-[0.875rem] text-ink hover:underline hover:decoration-accent lg:inline-flex">
          Account
        </Link>
        <Link
          href="/cart"
          className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-2 bg-ink px-3 text-paper hover:bg-ink-soft lg:ml-0 lg:px-5"
        >
          <BagIcon className="size-[1.125rem]" />
          <span className="eyebrow hidden !text-[0.75rem] lg:inline">Cart ·</span>
          <span className="sr-only lg:hidden">Cart,</span>
          <CartCount />
        </Link>
      </div>
    </header>
  );
}
