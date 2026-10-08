/**
 * Shop by occasion. Each occasion re-themes its page by overriding the four
 * --brand-* colour variables on a wrapper (every token in globals.css derives
 * from them), plus a decorative motif. These are the ONLY off-brand colours in
 * the codebase, and they never leave an occasion page or tile.
 *
 * Cakes tagged with the occasion's slug (in admin → Products → Tags) are shown
 * first; every cake suits every occasion, so the rest follow.
 *
 * Copy rules as elsewhere: no ingredient, health or delivery-time claims.
 */

export type Motif = "confetti" | "petals" | "ribbons" | "leaves" | "diyas" | "stars";

export type Occasion = {
  slug: string;
  name: string;
  /** Short label for tiles and menus. */
  short: string;
  eyebrow: string;
  title: string;
  intro: string;
  /** One-tap message suggestions (keep each within the cake-message limit, 30 by default). */
  messages: string[];
  motif: Motif;
  theme: { ink: string; accent: string; paper: string; detail: string };
  /** Festivals appear on the home page only inside this window ("MM-DD", inclusive, wraps over New Year). */
  season?: { from: string; to: string };
};

export const occasions: Occasion[] = [
  {
    slug: "birthday",
    name: "Birthday",
    short: "Birthdays",
    eyebrow: "Birthdays",
    title: "Make a wish worth keeping.",
    intro: "Choose their cake, add their name, and we'll make it for the day.",
    messages: ["Happy Birthday", "Many happy returns", "Cheers to you", "Happy Birthday, love"],
    motif: "confetti",
    theme: { ink: "#3a1d2e", accent: "#d9a441", paper: "#f4e6dc", detail: "#c99068" },
  },
  {
    slug: "anniversary",
    name: "Anniversary",
    short: "Anniversaries",
    eyebrow: "Anniversaries",
    title: "Another year, beautifully kept.",
    intro: "A cake for the two of you, made to order with a message of your own.",
    messages: ["Happy Anniversary", "Forever & always", "Here's to us", "Still you, always you"],
    motif: "petals",
    theme: { ink: "#4a1420", accent: "#c99a7b", paper: "#f3e3df", detail: "#cb9480" },
  },
  {
    slug: "congratulations",
    name: "Congratulations",
    short: "Congratulations",
    eyebrow: "Milestones",
    title: "Here's to the moment.",
    intro: "New job, new home, a result worth sharing. Mark it with a cake.",
    messages: ["Congratulations", "Well done", "So proud of you", "Onwards & upwards"],
    motif: "ribbons",
    theme: { ink: "#14263f", accent: "#c8a85e", paper: "#e9e4d8", detail: "#b39a63" },
  },
  {
    slug: "just-because",
    name: "Just because",
    short: "Just because",
    eyebrow: "Just because",
    title: "Some days need no reason.",
    intro: "A thank-you, a hello, a little something for someone you love.",
    messages: ["Thank you", "Thinking of you", "With love", "You're the best"],
    motif: "leaves",
    theme: { ink: "#1f3a33", accent: "#c2a465", paper: "#ebe6d7", detail: "#b2a172" },
  },
  {
    slug: "diwali",
    name: "Diwali",
    short: "Diwali",
    eyebrow: "Festival of lights",
    title: "Light up the table.",
    intro: "Cakes made to order for Diwali gatherings, gifts and the sweetest evenings.",
    messages: ["Happy Diwali", "Shubh Deepavali", "Light & love", "Happy Diwali, family"],
    motif: "diyas",
    theme: { ink: "#3d0f14", accent: "#e2a72e", paper: "#f5e5cc", detail: "#cf9142" },
    season: { from: "10-01", to: "11-15" },
  },
  {
    slug: "christmas",
    name: "Christmas",
    short: "Christmas",
    eyebrow: "The festive season",
    title: "Every gathering needs a centrepiece.",
    intro: "Cakes made to order for Christmas tables and the people around them.",
    messages: ["Merry Christmas", "Season's greetings", "Joy to you", "Merry & bright"],
    motif: "stars",
    theme: { ink: "#13302a", accent: "#cba65c", paper: "#efe7da", detail: "#b49b63" },
    season: { from: "12-01", to: "12-31" },
  },
];

/** Cake-message ideas used outside any occasion (cards and product pages). */
export const defaultMessages = ["Happy Birthday", "Happy Anniversary", "Congratulations", "Thank you"];

export const getOccasion = (slug: string | undefined | null) => occasions.find((o) => o.slug === slug) ?? null;

/** True when `date` (default: now, in India) falls inside the festival window. Non-festivals are always "in season". */
export function inSeason(o: Occasion, date = new Date()) {
  if (!o.season) return true;
  const md = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", month: "2-digit", day: "2-digit" }).format(date); // "MM-DD"
  const { from, to } = o.season;
  return from <= to ? md >= from && md <= to : md >= from || md <= to;
}

/** CSS variables that re-theme everything inside the wrapper (add the "occasion-theme" class too, for dark mode). */
export const themeVars = (o: Occasion) =>
  ({
    "--occ-ink": o.theme.ink,
    "--occ-paper": o.theme.paper,
    "--brand-ink": o.theme.ink,
    "--brand-accent": o.theme.accent,
    "--brand-paper": o.theme.paper,
    "--brand-detail": o.theme.detail,
  }) as React.CSSProperties;
