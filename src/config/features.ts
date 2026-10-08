/**
 * Customer-facing features that can be switched off without deleting code.
 * Off means: no links to it, the page 404s and its API refuses requests.
 */
export const features = {
  /** Guest "Track Order" (order ID + phone). Off at the bakery's request; the order link in emails still works. */
  trackOrder: false,
} as const;
