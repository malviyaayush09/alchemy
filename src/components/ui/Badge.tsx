import { fallbackTags } from "@/data/catalog";

const styles: Record<string, string> = {
  eggless: "border-ink/70 text-ink",
  // Ink text on bronze: 5.0:1. Light text on bronze would fail AA.
  egg: "border-detail bg-detail text-ink",
};

const labelFor = (slug: string) => fallbackTags.find((t) => t.slug === slug)?.label ?? slug;

/** Diet/feature tag. Uses the brand badges (not FSSAI symbols): see open legal item. */
export function Badge({ tag, label }: { tag: string; label?: string }) {
  const isDiet = tag === "eggless" || tag === "egg";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-sans text-[0.8125rem] font-medium uppercase leading-6 tracking-[0.12em] ${styles[tag] ?? "border-line text-body"}`}
    >
      {isDiet ? (
        <span aria-hidden="true" className="grid size-2.5 place-items-center border border-current">
          <span className="size-1 bg-current" />
        </span>
      ) : null}
      {label ?? labelFor(tag)}
    </span>
  );
}
