/**
 * Single source of truth for every brand string, logo and colour.
 * The name and logo WILL change — edit this file only. Nothing else in the
 * codebase may hardcode the brand name, tagline, colours or contact details.
 *
 * Empty strings are deliberate: they render as clearly labelled placeholders
 * (or hide the feature, e.g. WhatsApp) until real values are supplied.
 */

export type BrandColors = {
  /** Dominant dark. Actions, bands, headings on light. (Navy) */
  ink: string;
  /** Accent. Hairlines, CTAs on dark, display text. Never body text on paper. (Gold) */
  accent: string;
  /** Page background. (Cream) */
  paper: string;
  /** Secondary accent. Egg badge, engraving ink. (Bronze) */
  detail: string;
  /** Body copy and meta on paper. (Charcoal) */
  body: string;
};

type Contact = { whatsapp: string; phone: string; email: string; address: string; hours: string };
type Legal = { legalName: string; gstin: string; fssaiLicence: string };

export const brand = {
  name: "Alchemy Patisserie",
  /** Used where space is tight (browser tab suffix, order prefixes). */
  shortName: "Alchemy",
  tagline: "Crafted with intention. Savored forever.",
  heroLine: "Chocolate, transformed.",
  storyLine: "From raw to remarkable.",
  belief: "Born from the belief that indulgence can be transformed.",

  logo: {
    /** Script wordmark (Allura) and small-caps subline, used until a logo file exists. */
    wordmark: "Alchemy",
    subline: "Patisserie",
    /** Set to e.g. { src: "/brand/logo.svg", width: 180, height: 48 } to switch to an image logo. */
    image: null as null | { src: string; width: number; height: number },
  },

  colors: {
    ink: "#0E1A33",
    accent: "#B29959",
    paper: "#EBDFD1",
    detail: "#A68455",
    body: "#4B4B4B",
  } satisfies BrandColors,

  /** Sister brand (same owner). Shown on About. Set to null to remove the section. */
  family: {
    name: "Marseli Café Patisserie",
    shortName: "Marseli",
    founder: "Chef Suresh Kumar M",
    storyUrl: "https://marselicafe.com/story",
  } as null | { name: string; shortName: string; founder: string; storyUrl: string },

  delivery: {
    area: "HSR Layout",
    city: "Bengaluru",
  },

  contact: {
    /** E.164 without "+", e.g. "9198xxxxxxxx". Empty hides the WhatsApp button. */
    whatsapp: "",
    phone: "",
    email: "",
    address: "",
    hours: "",
  } as Contact,

  legal: {
    legalName: "",
    /** Empty hides GST invoices everywhere. */
    gstin: "",
    fssaiLicence: "",
  } as Legal,

  /** Prefix for human-readable order numbers, e.g. ALC-000123. */
  orderPrefix: "ALC",
} as const;

export const deliveryAreaLabel = `${brand.delivery.area}, ${brand.delivery.city}`;
