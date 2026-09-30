import { brand } from "@/config/brand";
import { env } from "@/lib/env";

export type Message = { subject: string; html: string; text: string };
export type SendResult = { status: "sent" | "skipped" | "failed"; error?: string };

/**
 * A delivery channel. Email is the only one wired at launch; SMS/WhatsApp
 * providers implement this same interface later and are added to `channels`.
 */
export interface NotificationChannel {
  readonly name: "email" | "sms" | "whatsapp";
  /** The recipient address for this channel, or null if the order has none. */
  recipient(order: { email: string; phone: string }): string | null;
  send(to: string, msg: Message): Promise<SendResult>;
}

export const emailChannel: NotificationChannel = {
  name: "email",
  recipient: (o) => o.email || null,
  async send(to, msg) {
    if (!env.resendApiKey) {
      // Local development: log instead of sending.
      console.info(`[email:skipped] to=${to} subject="${msg.subject}"\n${msg.text}`);
      return { status: "skipped", error: "RESEND_API_KEY not set" };
    }
    const from = brand.contact.email ? `${brand.name} <${brand.contact.email}>` : `${brand.name} <onboarding@resend.dev>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.resendApiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject: msg.subject, html: msg.html, text: msg.text }),
      });
      if (!res.ok) return { status: "failed", error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
      return { status: "sent" };
    } catch (e) {
      return { status: "failed", error: e instanceof Error ? e.message : String(e) };
    }
  },
};

/** Enabled channels. Add SMS / WhatsApp here when a provider is integrated. */
export const channels: NotificationChannel[] = [emailChannel];
