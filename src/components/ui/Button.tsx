import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "accent" | "outline" | "outline-light" | "link" | "link-light";
type Size = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  // Ink fill on paper surfaces: the main commerce action.
  primary: "bg-ink text-paper hover:bg-ink-soft border border-ink",
  // Gold fill with ink text (6.3:1) — only on ink surfaces.
  accent: "bg-accent text-ink hover:bg-paper border border-accent",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border border-accent text-paper hover:bg-accent hover:text-ink",
  link: "text-ink underline decoration-accent decoration-1 underline-offset-[6px] hover:decoration-ink",
  "link-light": "text-paper underline decoration-accent decoration-1 underline-offset-[6px] hover:decoration-paper",
};

const sizes: Record<Size, string> = {
  sm: "min-h-12 px-5 text-[0.875rem]",
  md: "min-h-13 px-7 text-[0.9375rem]",
  lg: "min-h-14 px-9 text-[1rem]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: Size = "md", full = false) {
  const isLink = variant === "link" || variant === "link-light";
  return [
    "inline-flex items-center justify-center gap-2 font-sans font-medium uppercase tracking-[0.12em] transition-colors duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    variants[variant],
    isLink ? "min-h-11 px-0 text-[0.9375rem]" : sizes[size],
    full ? "w-full" : "",
  ].join(" ");
}

type CommonProps = { variant?: ButtonVariant; size?: Size; full?: boolean; children: ReactNode; className?: string };

type AsButton = CommonProps & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type AsLink = CommonProps & Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant, size, full, className = "", children, ...rest } = props;
  const cls = `${buttonClasses(variant, size, full)} ${className}`;
  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={cls} {...(rest as Omit<AsLink, keyof CommonProps>)}>
        {children}
      </Link>
    );
  }
  const { type = "button", ...buttonRest } = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button type={type} className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
