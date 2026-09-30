import { brand } from "@/config/brand";

/**
 * Brand story, adapted from the client's storyboard ("alchemy story board.pdf").
 * Keep it free of ingredient, sourcing, allergen or health claims.
 */
export const about = {
  eyebrow: "Our story",
  title: brand.belief,
  intro: "There was a time when chocolate wasn't confection. It was ritual.",

  sections: [
    {
      id: "house",
      eyebrow: "The Alchemist House",
      title: "Crafted, studied and elevated.",
      body: [
        "On the old trade routes between South America, Arabia and India, cacao was treated like gold: rare, powerful and transformative.",
        "It wasn't consumed casually. It was crafted, studied and elevated. This is where our house begins.",
      ],
      art: "Engraving · The alchemist at his bench",
    },
    {
      id: "origin",
      eyebrow: "The Origin",
      title: "Luxury is not created. It is transformed.",
      body: [
        "The house was founded on a single belief. Like an alchemist turning base metal into gold, we take cacao, textures and flavours and transmute them into experiences.",
        "Not desserts. Not products. Objects of indulgence.",
      ],
      art: "Engraving · Cacao branch with pods",
    },
  ],

  principles: {
    eyebrow: "The Philosophy",
    title: "Every creation follows three principles.",
    items: [
      { title: "Transformation", body: "Ordinary beginnings become extraordinary forms." },
      { title: "Balance", body: "Sweetness, bitterness and texture held in harmony." },
      { title: "Obsession", body: "Nothing leaves the atelier until it feels complete." },
    ],
    closing: "This is not baking. This is craft under discipline.",
  },

  experience: {
    eyebrow: "The Experience",
    title: "It reveals itself slowly.",
    items: ["In the weight of the box.", "In the finish of the chocolate.", "In the aftertaste that lingers longer than expected."],
    closing: "Every piece is designed to feel like a discovery, not a purchase.",
    art: "Engraving · Brass scales",
  },

  positioning: {
    quote: "This is not dessert. This is alchemy.",
    body: "Not a cake shop. Not a chocolate store. A house where indulgence is studied, refined and elevated.",
  },
};
