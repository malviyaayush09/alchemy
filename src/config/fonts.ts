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
  variable: "--ff-script",
});

export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--ff-display",
});

export const fontSans = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-sans",
});

export const fontVariables = [fontScript.variable, fontDisplay.variable, fontSans.variable].join(" ");
