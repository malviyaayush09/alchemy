"use client";

import { useRouter } from "next/navigation";
import { sortOptions, type SortKey } from "@/config/navigation";
import { ChevronDownIcon } from "@/components/ui/Icons";

/** Native select (best on phones). Falls back to a GET form without JS. */
export function SortSelect({ value, tag }: { value: SortKey; tag: string | null }) {
  const router = useRouter();
  return (
    <form action="/collections" method="get" className="flex items-center gap-2">
      {tag ? <input type="hidden" name="tag" value={tag} /> : null}
      <label htmlFor="sort" className="text-[0.9375rem] text-body">
        Sort
      </label>
      <span className="relative">
        <select
          id="sort"
          name="sort"
          defaultValue={value}
          onChange={(e) => {
            const q = new URLSearchParams();
            if (tag) q.set("tag", tag);
            if (e.target.value !== "featured") q.set("sort", e.target.value);
            router.push(q.size ? `/collections?${q}` : "/collections", { scroll: false });
          }}
          className="min-h-11 appearance-none border border-line bg-paper py-2 pr-9 pl-3 text-ink focus:border-ink focus:outline-2 focus:outline-accent"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink" />
      </span>
      <noscript>
        <button type="submit" className="min-h-11 border border-ink px-3 text-[0.9375rem]">
          Apply
        </button>
      </noscript>
    </form>
  );
}
