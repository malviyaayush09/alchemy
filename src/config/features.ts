/**
 * Customer-facing features that can be switched off without deleting code.
 * Off means: no links to it, the page 404s and its API refuses requests.
 */
export const features = {
  /** The Track Order page (menu + footer link). Shows the delivery note; see trackOrderLookup for the form. */
  trackOrderPage: true,
  /** Guest order lookup on that page (order ID + phone). Off at the bakery's request; the order link in emails still works. */
  trackOrderLookup: false,
  /** Shop by occasion (menu, home section, /occasions pages). Off at the bakery's request; config kept in occasions.ts. */
  occasions: false,
} as const;
