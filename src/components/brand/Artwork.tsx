import Image from "next/image";
import { GinkgoMark } from "./GinkgoMark";

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
 * can never block LCP. Until final art exists it renders a zero-byte stand-in.
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

  // Until the commissioned art arrives: a soft backdrop with the engraved ginkgo.
  // The caption stays in the markup (data-art) so the brief for each slot isn't lost.
  return (
    <div
      className={`${frame} grid place-items-center ${
        tone === "ink"
          ? "bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--brand-ink)_88%,white)_0%,var(--brand-ink)_75%)]"
          : "bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--brand-paper)_var(--brand-soft,55%),white)_0%,var(--brand-paper)_55%,color-mix(in_oklab,var(--brand-paper)_90%,var(--brand-detail))_100%)]"
      }`}
      aria-hidden="true"
      data-art={label}
    >
      <GinkgoMark variant="engraved" className="h-auto w-[28%] max-w-24 min-w-10 text-accent opacity-80" />
    </div>
  );
}
