# Storefront (working name: Alchemy Patisserie)

Made-to-order cake shop for HSR Layout, Bengaluru. Next.js (App Router) + TypeScript + Tailwind, Supabase Postgres + Storage, Razorpay (**test mode only**), Resend, Vercel.

**Testing:** see [TESTING.md](TESTING.md) for the full feature list and test checklist.

**Rebranding:** every brand string, colour, logo, contact detail, GSTIN and FSSAI number lives in [`src/config/brand.ts`](src/config/brand.ts). Page copy lives in `src/content/`. Nothing else hardcodes the brand.

## 1. Set up the database (once)

1. Create a Supabase project in the **Mumbai (ap-south-1)** region.
2. In **SQL Editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), then [`supabase/seed.sql`](supabase/seed.sql). The seed is safe to re-run.
3. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API). Set `SITE_URL=http://localhost:3000` locally.

All tables have row-level security on with **no policies**. Only the server, using the service-role key, can read or write.

## 2. Run

```bash
npm install
npm run dev          # development
npm run build && npm run start   # production build (use this for QA / Lighthouse)
```

Until `SUPABASE_*` is set, the storefront renders from the seed data in `src/data/catalog.ts`, and checkout is disabled.

## 3. Make yourself admin

1. Sign in at `/login`. In development the **mock SMS provider** shows the OTP on screen and in the server log.
2. In the SQL editor run: `update users set role = 'admin' where phone = '+91XXXXXXXXXX';`
3. Open `/admin`. Set prices (every cake starts at ₹0 = "Price on request"), photos, slots, pincodes and coupons.

## 4. Payments (Razorpay TEST mode)

- Add `RAZORPAY_KEY_ID` (must start with `rzp_test_`; live keys are refused), `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`.
- In the Razorpay dashboard (Test mode) → Webhooks, add `https://<your-public-url>/api/razorpay/webhook` with events `payment.captured`, `order.paid` and `payment.failed`. Razorpay can't reach `localhost`; use a Vercel preview or a tunnel.
- **An order becomes paid only when the signed webhook is verified** (`src/app/api/razorpay/webhook/route.ts`). The browser's payment success callback only redirects to the order page, which waits for the webhook.
- **No keys yet?** In development, checkout shows **Simulate successful payment**. It builds a Razorpay-shaped event, signs it and posts it to the real webhook, so signature verification and mark-as-paid run exactly as they will with Razorpay. This button and route return 404 in production.

## 5. Email

Set `RESEND_API_KEY`. Without it, emails are logged to the console and recorded as `skipped` in `notification_log`. Customers are emailed when an order is placed and on every status change. SMS/WhatsApp can be added as another `NotificationChannel` in `src/lib/notify/channels.ts`.

## 6. Sign-in (OTP)

Phone OTP is the primary method and email OTP the fallback. OTP delivery sits behind the `OtpProvider` interface in `src/lib/auth/otp-providers.ts`. The mock SMS provider is available only outside production. To go live with SMS, implement `OtpProvider` for a DLT-registered Indian provider (e.g. MSG91) and return it from `smsProvider()`. Codes and session tokens are stored only as SHA-256 hashes; sessions use an httpOnly cookie.

## 7. Invoices

GST invoice PDFs (`/api/invoices/<order>`) appear only when `brand.legal.gstin` is set **and** a GST rate above 0 is set in Admin → Settings. **[LEGAL REVIEW NEEDED]**: the CA must confirm the rate, HSN, place of supply and how delivery charges are taxed.

## Before launch checklist

- Replace the interim photos in `public/images/interim/`. Their rights and product mapping are unconfirmed, and one carries another bakery's branding.
- Fill in contact, legal and GST details in `brand.ts`.
- Have a lawyer review the policy pages (`src/content/legal.ts`), the FAQs marked `legalReview`, and the invoice format.
- Integrate a real SMS OTP provider, verify a Resend sending domain, and run Lighthouse on the production build.
