import { brand } from "@/config/brand";
import { devToolsEnabled } from "@/lib/env";
import { emailChannel } from "@/lib/notify/channels";

/**
 * Swappable OTP delivery. To go live with SMS, implement OtpProvider for a
 * DLT-registered Indian SMS provider (e.g. MSG91) and return it from smsProvider().
 */
export interface OtpProvider {
  readonly channel: "sms" | "email";
  readonly isMock: boolean;
  send(destination: string, code: string): Promise<void>;
}

/** Development provider: logs the code. The UI also shows it (dev tools only). */
export const mockSmsProvider: OtpProvider = {
  channel: "sms",
  isMock: true,
  async send(destination, code) {
    console.info(`[otp:mock-sms] ${destination} → ${code}`);
  },
};

export const emailOtpProvider: OtpProvider = {
  channel: "email",
  isMock: false,
  async send(destination, code) {
    const text = `Your ${brand.name} sign-in code is ${code}. It expires in 10 minutes. If you didn't ask for this, you can ignore this email.`;
    const r = await emailChannel.send(destination, {
      subject: `${code} is your ${brand.name} sign-in code`,
      text,
      html: `<p style="font-family:Arial,sans-serif;font-size:16px">Your ${brand.name} sign-in code is</p><p style="font-family:Arial,sans-serif;font-size:32px;letter-spacing:6px"><b>${code}</b></p><p style="font-family:Arial,sans-serif;font-size:14px">It expires in 10 minutes. If you didn't ask for this, you can ignore this email.</p>`,
    });
    if (r.status === "failed") throw new Error(r.error);
    if (r.status === "skipped") console.info(`[otp:email-skipped] ${destination} → ${code}`);
  },
};

/** The active SMS provider. Mock only outside production; null means phone login is unavailable. */
export function smsProvider(): OtpProvider | null {
  return devToolsEnabled() ? mockSmsProvider : null;
}
