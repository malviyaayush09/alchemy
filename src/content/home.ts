import { brand, deliveryAreaLabel } from "@/config/brand";

/** Section label for the story; a concept word, not the brand name. */
export const storyEyebrow = "The Craft";

/**
 * Home hero slideshow. Photos are INTERIM (see src/data/catalog.ts): rights
 * and product mapping unconfirmed, must be replaced before launch. Copy stays
 * factual: no claims about ingredients, ratings or delivery times.
 */
export const heroSlides = [
  {
    image: { src: "/images/interim/hero-chocolate.jpg", alt: "A glazed chocolate cake topped with two chocolate bears" },
    eyebrow: brand.name,
    title: brand.heroLine,
    script: true,
    body: brand.tagline,
    cta: { href: "/collections", label: "Shop all cakes" },
  },
  {
    image: { src: "/images/interim/hazelnut.jpg", alt: "Hazelnut Cake on a white stand" },
    eyebrow: "Made to order",
    title: "Hazelnut Cake",
    script: false,
    body: `In 500 g and 1 kg, delivered in ${deliveryAreaLabel}.`,
    cta: { href: "/cakes/hazelnut", label: "View the cake" },
  },
  {
    image: { src: "/images/interim/chocolate-pistachio.jpg", alt: "Chocolate Pistachio Cake on a white stand" },
    eyebrow: "Signature",
    title: "Chocolate Pistachio Cake",
    script: false,
    body: "Made for your order, in 500 g and 1 kg.",
    cta: { href: "/cakes/chocolate-pistachio", label: "View the cake" },
  },
  {
    image: { src: "/images/interim/truffle.jpg", alt: "Sugar-Free Truffle Cake on a white stand" },
    eyebrow: "Our cakes",
    title: "Sugar-Free Truffle Cake",
    script: false,
    body: "Made for your order, in 500 g and 1 kg.",
    cta: { href: "/cakes/sugar-free-truffle", label: "View the cake" },
  },
];

/** Photograph beside the story chapters. Interim (see src/data/catalog.ts). */
export const storyImage = { src: "/images/interim/truffle.jpg", alt: "A dark chocolate cake with chocolate curls on a white stand" };

export const orderingSteps = [
  { no: "1", title: "Choose", body: "A cake and a weight, 500 g or 1 kg." },
  { no: "2", title: "We craft", body: "Made in our kitchen for your order." },
  { no: "3", title: "Delivered", body: `To your door in ${deliveryAreaLabel}.` },
];

/** The story in four chapters, told as an artist's process (Home only). Deliberately free of ingredient claims. */
export const chapters = [
  {
    numeral: "I",
    title: "The Sketch",
    body: "Every cake begins as an idea: a shape, a colour, a feeling worth capturing.",
    art: "Engraving · A pencil sketch of a cake",
  },
  {
    numeral: "II",
    title: "The Palette",
    body: "Flavours chosen the way a painter chooses colours, each one for a reason.",
    art: "Engraving · A painter's palette",
  },
  {
    numeral: "III",
    title: "The Hand",
    body: "Patience and a steady hand turn the idea into form, one layer at a time.",
    art: "Engraving · Hands at work with a palette knife",
  },
  {
    numeral: "IV",
    title: "The Piece",
    body: `${brand.heroLine} ${brand.tagline}`,
    art: "Engraving · A finished cake on a stand",
  },
];

export const splitFeatures = [
  {
    eyebrow: "The Craft",
    title: brand.storyLine,
    body: brand.belief,
    cta: { href: "/about", label: "Our story", variant: "link" as const },
    art: "Engraving · The artist at the easel",
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
