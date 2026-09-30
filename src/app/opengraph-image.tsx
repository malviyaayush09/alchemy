import { ImageResponse } from "next/og";
import { brand, deliveryAreaLabel } from "@/config/brand";

export const alt = `${brand.name}: ${brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card, generated from brand config (no image asset to keep in sync). */
export default function OpengraphImage() {
  const { ink, accent, paper } = brand.colors;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: ink, color: paper, border: `16px solid ${ink}`, outline: `2px solid ${accent}` }}>
        <svg width="96" height="96" viewBox="0 0 32 32">
          <path d="M16 18.2C11.8 17.7 5.4 14.2 3.3 8.6 6.9 5 11.5 3.5 14.8 5.1L16 9.2 17.2 5.1C20.5 3.5 25.1 5 28.7 8.6 26.6 14.2 20.2 17.7 16 18.2Z" fill={accent} />
          <path d="M16 18.2C16.1 22.2 15.6 26.1 14.3 29.6" stroke={accent} strokeWidth="1.4" fill="none" />
        </svg>
        <div style={{ fontSize: 88, marginTop: 24, fontFamily: "serif", letterSpacing: 1 }}>{brand.name}</div>
        <div style={{ fontSize: 34, marginTop: 16, color: accent, fontFamily: "serif" }}>{brand.tagline}</div>
        <div style={{ fontSize: 24, marginTop: 36, letterSpacing: 6, textTransform: "uppercase" }}>{`Now delivering in ${deliveryAreaLabel}`}</div>
      </div>
    ),
    size,
  );
}
