import Link from "next/link";
import type { ReactNode } from "react";

type Props = { title: string; eyebrow?: string; intro?: ReactNode; crumb: string };

/** Clean inner-page header (breadcrumb + H1), per Direction D's collection page. */
export function PageHeader({ title, eyebrow, intro, crumb }: Props) {
  return (
    <div className="border-b border-line">
      <div className="container-x py-8 lg:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex gap-1.5 text-[0.8125rem] text-body">
            <li>
              <Link href="/" className="inline-flex min-h-11 min-w-11 items-center hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="inline-flex items-center">
              /
            </li>
            <li aria-current="page" className="inline-flex items-center">
              {crumb}
            </li>
          </ol>
        </nav>
        {eyebrow ? <p className="eyebrow mt-2 text-body">{eyebrow}</p> : null}
        <h1 className="mt-1 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem]">{title}</h1>
        {intro ? <div className="mt-3 max-w-2xl text-[1rem] text-body">{intro}</div> : null}
      </div>
    </div>
  );
}
