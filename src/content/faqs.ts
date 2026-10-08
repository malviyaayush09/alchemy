import { brand, deliveryAreaLabel } from "@/config/brand";

export type Faq = { q: string; a: string; legalReview?: boolean };
export type FaqGroup = { title: string; items: Faq[] };

/**
 * FAQ copy. Answers describe how the site works; they make no promises about
 * delivery times and no ingredient/allergen/health claims. Items flagged
 * legalReview must be checked before launch.
 */
export const faqGroups: FaqGroup[] = [
  {
    title: "Ordering",
    items: [
      { q: "What sizes do your cakes come in?", a: "Every cake is made in two weights: 500 g and 1 kg. Choose yours on the cake's card or page." },
      {
        q: "Can you write a message on the cake?",
        a: "Yes. Add a short message when you choose your cake. The character limit is shown next to the field.",
      },
      { q: "Can I add a gift note?", a: "Yes. You can add an optional gift note card to any cake before you add it to your cart." },
      {
        q: "Do I need an account to order?",
        a: "No. You can check out as a guest. We only ask for your phone number so we can reach you about delivery.",
      },
      {
        q: "Which cakes are eggless?",
        a: "Each cake is labelled Eggless or Egg on its card and page. Use the Eggless filter in Collections to see only eggless cakes.",
      },
      {
        q: "Where can I find ingredient and allergen information?",
        a: "[PLACEHOLDER: ingredient and allergen information to be provided by the bakery.]",
        legalReview: true,
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "Where do you deliver?",
        a: `At the moment we deliver only in ${deliveryAreaLabel}. Your pincode is checked when you enter your delivery address at checkout.`,
      },
      {
        q: "How do I choose a delivery date and time?",
        a: "At checkout, pick a date and one of the available time slots. Slots that are full, or past their order cutoff, can't be selected.",
      },
      {
        q: "Can I order for today?",
        a: "Sometimes. Each slot has a same-day cutoff time. If the cutoff hasn't passed and the slot still has space, you can book it for today.",
      },
      { q: "Is there a delivery charge?", a: "Any delivery charge is shown in your order summary before you pay." },
      {
        q: "How do I track my order?",
        a: "Your confirmation email has a link to your order page, and signing in shows all your orders. Once your cake is out for delivery, the rider's details appear there. Our own team or a delivery partner may call you from a number you don't recognise.",
      },
    ],
  },
  {
    title: "Payment & changes",
    items: [
      { q: "How can I pay?", a: "All orders are prepaid online through Razorpay: UPI, cards or netbanking." },
      {
        q: "Can I cancel or change my order?",
        a: "Please see our Refund & Cancellation Policy, or contact us as soon as possible.",
        legalReview: true,
      },
      {
        q: "Do you provide a GST invoice?",
        a: `Where applicable, a GST invoice can be downloaded from your order page. For questions, contact ${brand.name}.`,
      },
    ],
  },
];
