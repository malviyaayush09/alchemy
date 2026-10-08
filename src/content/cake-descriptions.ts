/**
 * Draft cake descriptions, written for the bakery to approve or edit in
 * Admin → Products. Rules (from the brief): no ingredient, allergen or health
 * claims, no popularity or delivery promises. They describe only the flavour
 * named in each cake, its style, and the moment it suits.
 *
 * Applied to the database by `npm run db:descriptions`, which only fills
 * products whose description is still the placeholder, so edits made in
 * admin are never overwritten.
 */
export const cakeDescriptions: Record<string, string> = {
  "signature-belgian-chocolate":
    "The cake that carries our name. Deep, dark and quietly dramatic, it is chocolate at its most composed. Made for the moments that deserve a centrepiece.",
  "chocolate-pistachio":
    "Chocolate and pistachio, each bringing out the best in the other: the richness of one, the gentle nuttiness of the other. Elegant enough for an anniversary, easy to love at a birthday.",
  hazelnut:
    "A celebration of hazelnut, warm and toasty, finished with the polish of a patisserie cake. For everyone who saves the hazelnut chocolate for last.",
  "nutella-fudge":
    "Indulgent and unapologetic: a flavour so many of us grew up with, turned into a fudgy celebration cake. Made for children and grown-ups alike.",
  "blueberry-rare-cheesecake":
    "A rare cheesecake in the Japanese style, set rather than baked, so it stays cool, light and smooth. Blueberry gives it a bright, jewel-toned finish.",
  "coconut-pineapple":
    "Sunshine on a stand: pineapple and coconut in a cake that tastes like a holiday. Bright, fresh and made for long afternoons.",
  "salted-caramel":
    "The pull between sweet and salt, in a cake that rewards every slow forkful. Golden, mellow and hard to stop at one slice.",
  "sugar-free-truffle":
    "Our truffle cake in its sugar-free form: dark, smooth and every bit as special. If you have dietary needs, please ask us about it before ordering.",
  "white-chocolate-raspberry":
    "White chocolate and raspberry, a classic pairing of creamy and tart that is as pretty as it is balanced. Romantic without trying too hard.",
  "berry-heart":
    "A berry cake made for matters of the heart. For anniversaries, proposals and the people who make ordinary days feel like occasions.",
  "russian-medovik":
    "Our take on Russia's much-loved layer cake: many fine layers that soften as the cake rests, until every slice is tender. Old-world, comforting and best shared.",
  "rasmalai-tres-leches":
    "Two traditions in one cake: the soft, soaked sponge of a Latin American tres leches and the festive flavours of rasmalai. Made for Diwali tables, family evenings and everything in between.",
  "red-velvet-pull-up":
    "Red velvet with a reveal. It arrives in a clear sleeve; lift it at the table and let the topping flow. A little theatre for birthdays and surprises.",
  "raspberry-pistachio-pull-up":
    "Raspberry and pistachio, presented as a pull-up cake: lift the clear sleeve and watch it cascade. Bright, nutty and made for the camera.",
  "chocolate-pull-up":
    "Chocolate, with a moment. Lift the clear sleeve, let it flow, then pass the plates. The easiest way to make a table go quiet.",
};
