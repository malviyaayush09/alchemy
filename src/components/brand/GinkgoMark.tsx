type Props = {
  className?: string;
  /** "solid" for small UI marks; "engraved" adds veins for display sizes. */
  variant?: "solid" | "engraved";
  title?: string;
};

const LEAF =
  "M16 18.2C11.8 17.7 5.4 14.2 3.3 8.6 6.9 5 11.5 3.5 14.8 5.1L16 9.2 17.2 5.1C20.5 3.5 25.1 5 28.7 8.6 26.6 14.2 20.2 17.7 16 18.2Z";
const STEM = "M16 18.2C16.1 22.2 15.6 26.1 14.3 29.6";
const VEINS = [
  "M16 18.2 6.2 8.9",
  "M16 18.2 9.4 6.6",
  "M16 18.2 12.9 5.6",
  "M16 18.2 19.1 5.6",
  "M16 18.2 22.6 6.6",
  "M16 18.2 25.8 8.9",
];

/** The ginkgo leaf, drawn in currentColor so it takes the surrounding text colour. */
export function GinkgoMark({ className, variant = "solid", title }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {variant === "solid" ? (
        <path d={LEAF} fill="currentColor" />
      ) : (
        <>
          <path d={LEAF} fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
          {VEINS.map((d) => (
            <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="0.45" opacity="0.7" />
          ))}
        </>
      )}
      <path d={STEM} fill="none" stroke="currentColor" strokeWidth={variant === "solid" ? 1.4 : 0.9} strokeLinecap="round" />
    </svg>
  );
}
