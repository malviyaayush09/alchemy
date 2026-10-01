import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Browser-tab icon: the ginkgo on ink, generated from brand colours (rebrands automatically). */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: brand.colors.ink, borderRadius: 12 }}>
        <svg width="44" height="44" viewBox="0 0 32 32">
          <path d="M16 18.2C11.8 17.7 5.4 14.2 3.3 8.6 6.9 5 11.5 3.5 14.8 5.1L16 9.2 17.2 5.1C20.5 3.5 25.1 5 28.7 8.6 26.6 14.2 20.2 17.7 16 18.2Z" fill={brand.colors.accent} />
          <path d="M16 18.2C16.1 22.2 15.6 26.1 14.3 29.6" stroke={brand.colors.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
