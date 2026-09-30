import { brand } from "@/config/brand";
import { WhatsAppIcon } from "@/components/ui/Icons";

/** Floating click-to-chat. Renders nothing until a number is set in brand config. */
export function WhatsAppButton() {
  const number = brand.contact.whatsapp.replace(/\D/g, "");
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${brand.name} on WhatsApp`}
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--sticky-bar-h,0px))] z-30 inline-flex size-14 items-center justify-center rounded-full border border-accent bg-ink text-paper shadow-[0_6px_20px_-6px_rgb(0_0_0/0.45)] hover:bg-ink-soft"
    >
      <WhatsAppIcon />
    </a>
  );
}
