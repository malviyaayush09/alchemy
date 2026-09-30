import { brand, deliveryAreaLabel } from "@/config/brand";

/** Section label for the story; a concept word, not the brand name. */
export const storyEyebrow = "The Alchemy";

export const orderingSteps = [
  { no: "1", title: "Choose", body: "A cake and a weight, 500 g or 1 kg." },
  { no: "2", title: "We craft", body: "Made in our kitchen for your order." },
  { no: "3", title: "Delivered", body: `To your door in ${deliveryAreaLabel}.` },
];

/** The Codex chapters (story lives on Home and About only). Deliberately free of ingredient claims. */
export const chapters = [
  {
    numeral: "I",
    title: "The Pod",
    body: "It begins with cacao, bitter and raw, still in its shell.",
    art: "Engraving · Cacao pod, split open",
  },
  {
    numeral: "II",
    title: "The Measure",
    body: "Every element weighed with care, nothing left to chance.",
    art: "Engraving · Brass scales",
  },
  {
    numeral: "III",
    title: "The Fire",
    body: "Heat, patience and a steady hand turn it glossy and smooth.",
    art: "Engraving · Copper pot over a low flame",
  },
  {
    numeral: "IV",
    title: "The Cake",
    body: `${brand.heroLine} ${brand.tagline}`,
    art: "Engraving · Finished cake beneath a glass dome",
  },
];

export const splitFeatures = [
  {
    eyebrow: "The Alchemy",
    title: brand.storyLine,
    body: brand.belief,
    cta: { href: "/about", label: "Our story", variant: "link" as const },
    art: "Engraving · The alchemist at his bench",
    image: "/images/interim/truffle.jpg",
  },
  {
    eyebrow: "Gift Box · Hampers",
    title: "Ready to be given.",
    body: "Our cakes in the signature box, with a gift note card if you'd like one.",
    cta: { href: "/gift-box", label: "Shop gift box", variant: "primary" as const },
    art: "Photo · The signature gift box",
    image: null,
  },
];
