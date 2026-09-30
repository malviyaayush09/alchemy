import Image from "next/image";

type Shape = "arch" | "rect" | "circle";

type Props = {
  /** Caption shown on the placeholder, e.g. "Engraving · Cacao pod, split open". */
  label: string;
  shape?: Shape;
  tone?: "paper" | "ink";
  /** Real artwork. Omit to render the labelled hatched placeholder. */
  src?: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
};

const shapeClass: Record<Shape, string> = {
  arch: "rounded-t-full",
  rect: "",
  circle: "rounded-full",
};

/**
 * Decorative illustration slot (engravings). Always aria-hidden and lazy, so it
 * can never block LCP. Until final art exists it renders a zero-byte hatched
 * frame with a caption, matching the approved direction boards.
 */
export function Artwork({ label, shape = "arch", tone = "paper", src, width, height, sizes = "(min-width: 768px) 320px, 60vw", className = "" }: Props) {
  const frame = `relative overflow-hidden border border-line ${shapeClass[shape]} ${className}`;

  if (src && width && height) {
    return (
      <div className={frame} aria-hidden="true">
        <Image src={src} alt="" width={width} height={height} sizes={sizes} loading="lazy" className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${frame} ${tone === "ink" ? "hatch-ink" : "hatch"} grid place-items-center`} aria-hidden="true">
      <span
        className={`eyebrow mx-4 max-w-[16rem] border px-3 py-1.5 text-center !text-[0.625rem] !tracking-[0.18em] ${
          tone === "ink" ? "border-accent/70 bg-ink text-accent" : "border-line bg-paper text-body"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
