import { Allura, Cormorant_Garamond, Montserrat } from "next/font/google";

/**
 * Theme fonts. next/font downloads these at build time and serves them from
 * our own origin, so there is no render-blocking request to Google Fonts.
 * Roles: script = logo + hero only, display = headings, sans = body/UI/prices.
 */
export const fontScript = Allura({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  // Not preloaded: only the logo/hero use it, and preloads compete with the LCP image on slow 4G.
  preload: false,
  variable: "--ff-script",
});

export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  // 500 for headings and cake names: Cormorant's 400 is too thin to read at card sizes.
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--ff-display",
});

export const fontSans = Montserrat({
  subsets: ["latin"],
  // Only the two weights the design uses (smaller than the full 100–900 variable file).
  weight: ["400", "500"],
  display: "swap",
  variable: "--ff-sans",
});

export const fontVariables = [fontScript.variable, fontDisplay.variable, fontSans.variable].join(" ");
