/**
 * Server-side environment access. None of these are NEXT_PUBLIC_, so they are
 * never bundled into client code. Names match .env.example.
 */
export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  siteUrl: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  isProd: process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview",
};

export const isDbConfigured = () => Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const isRazorpayConfigured = () => Boolean(env.razorpayKeyId && env.razorpayKeySecret && env.razorpayWebhookSecret);

/** Dev-only helpers (simulated payments, on-screen OTP) are never available in a production deployment. */
export const devToolsEnabled = () => process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_TOOLS === "1";

/** Guard: Razorpay must stay in TEST mode for this build. */
export function assertRazorpayTestMode() {
  if (env.razorpayKeyId && !env.razorpayKeyId.startsWith("rzp_test_")) {
    throw new Error("Razorpay live keys detected. This build only runs in TEST mode.");
  }
}
