import { brand } from "@/config/brand";

/**
 * Brand story, told around artistry (rewritten for the final name; the
 * original storyboard was built on an "alchemy" idea). Keep it free of
 * ingredient, sourcing, allergen, health or history claims.
 */
/**
 * Sister-brand lineage (same owner as the brand in config). Original wording:
 * do not paste text from the sister brand's site, and keep it free of
 * ingredient claims about either kitchen.
 */
export const family = brand.family
  ? {
      eyebrow: `From the house of ${brand.family.shortName}`,
      title: `A sister to ${brand.family.name}.`,
      body: [
        `${brand.shortName} comes from the same family as ${brand.family.name}, and shares its founder, ${brand.family.founder}.`,
        `${brand.family.shortName} is named for the mentor who taught him that good food can't be hurried: give every step the time it asks for, and let the ingredients lead. ${brand.shortName} takes that lesson and gives it to a single craft: the cake.`,
      ],
      beats: [
        { title: "The mentor", body: `Learning beside Chef ${brand.family.shortName}, in a kitchen where patience came before everything.` },
        { title: "The café", body: `${brand.family.name}, built as a tribute to that way of working.` },
        { title: "The cake studio", body: `${brand.shortName}: the same care, given entirely to made-to-order cakes.` },
      ],
      link: { href: brand.family.storyUrl, label: `Read the ${brand.family.shortName} story` },
    }
  : null;

export const about = {
  eyebrow: "Our story",
  title: brand.belief,
  intro: "There was a time when a cake wasn't just baked. It was composed.",

  sections: [
    {
      id: "house",
      eyebrow: "The Atelier",
      title: "Imagined, composed and finished with care.",
      body: [
        "A great cake starts the way a painting does: with an idea, a sketch and a sense of what it should make you feel.",
        "Ours are made to order, for one table and one moment at a time. This is where our house begins.",
      ],
      art: "Engraving · The artist at the easel",
    },
    {
      id: "origin",
      eyebrow: "The Idea",
      title: "A cake is not decorated. It is composed.",
      body: [
        "The house was founded on a single belief: that a cake can be a work of art. Like an artist at the easel, we take shape, colour, texture and flavour and compose them into something worth remembering.",
        "Not desserts. Not products. Edible works of art.",
      ],
      art: "Engraving · A sketchbook open on a cake drawing",
    },
  ],

  principles: {
    eyebrow: "The Philosophy",
    title: "Every creation follows three principles.",
    items: [
      { title: "Vision", body: "Every cake starts with an idea worth making." },
      { title: "Balance", body: "Flavour, texture and form held in harmony." },
      { title: "Finish", body: "Nothing leaves the studio until it feels complete." },
    ],
    closing: "This is not baking. This is art, made with discipline.",
  },

  experience: {
    eyebrow: "The Experience",
    title: "It reveals itself slowly.",
    items: ["In the first look, before the first slice.", "In the finish of every surface.", "In the flavour that stays with you after the last bite."],
    closing: "Every piece is designed to feel like a discovery, not a purchase.",
    art: "Engraving · Brushes and a palette knife",
  },

  positioning: {
    quote: "This is not dessert. This is art.",
    body: "Not a cake shop. A studio where cakes are imagined, composed and finished.",
  },
};
