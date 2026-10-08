# Testing guide

A walkthrough of everything the site does and how to check each part. Tick the boxes as you go. For setup details see [README.md](README.md).

> **Nothing here uses real money.** Razorpay stays in **test mode**. Until the Razorpay keys are added, checkout shows a **Simulate successful payment** button instead.

---

## What we have

### Customer site
- **Home**: a hero slideshow (4 slides, changes every 4 s; pause button, dots, arrows on desktop, swipe on phones; stops while hovered), the cakes straight away, brand story (chapters), how ordering works
- **Glimpse (quick view)**: tap a cake photo or the eye button for a pop-up with the picture, description, both sizes with prices and the cake message. Whatever you type **appears on a chocolate plaque over the cake** as a preview. One-tap message ideas fill it in
- **Shop by occasion** (`/occasions`): Birthday, Anniversary, Congratulations, Just because, Diwali, Christmas. Each page **re-themes itself** (colours + a moving motif: confetti, petals, ribbons, ginkgo leaves, diyas, stars) and suggests messages for that occasion. Festivals appear on the home page only in season (Diwali 1 Oct–15 Nov, Christmas in December). Edit them in `src/config/occasions.ts`. Cakes tagged with an occasion's slug in admin show first
- **Pair it**: in the Glimpse, a tick-box offers one other available cake ("Bigger celebration? Add a second cake"); the button becomes **Add both · ₹total**
- **Dark mode**: moon icon in the header. Light is the default; the choice is remembered on that device. Occasion pages get an evening version of their own colours. Admin always stays light
- **Send as a surprise** (needs migration `0003_delight.sql`): a tick-box at checkout asks who it's for. Admin, the kitchen sheet and the new-order email show **SURPRISE**: seal the gift note in an envelope, and the rider calls the customer, not the recipient
- **Remind me next year** (needs `0003`): on a paid order page, pick the occasion, whose and the date. One email goes a week before the same day next year (daily job at 9 AM: `/api/cron/reminders`, scheduled in `vercel.json`, protected by `CRON_SECRET`). The email has a cancel link
- **Cake cards**: one **Add** button (single size: straight to cart; two sizes: opens the Glimpse to choose). Cakes without a photo show a drawn **illustration** (labelled as one)
- **Collections**: all 15 cakes, filter pills (All / Eggless / With Egg / Pull-Up / Sugar-Free) with counts, and sorting
- **Product page**: 500 g / 1 kg with the price on each size, message on cake, optional gift note card, sticky Add to Cart bar on phones
- **No pincode step while shopping**: Add goes straight to the cart. The pincode is part of the checkout address and is checked as you type. Only HSR Layout (560102) at launch; other pincodes get "We don't deliver to … yet" and the order can't be placed
- **Cart**: quantities, remove, and prices re-checked with the server
- **Checkout**: guest checkout (login never required); delivery date + time slot (full or closed slots disabled); coupon; prepaid only
- **Order page**: live status timeline, delivery slot and rider details, reached from the confirmation or a signed link in the email
- **Track Order** is switched off for now (bakery's request): `src/config/features.ts`. `/track-order` shows 404; the order link in emails still works
- **Login** by phone OTP (email as fallback), and **My Account** with orders, saved addresses and profile
- **Gift Box, About Us, FAQs, Contact, Privacy, Terms, Refund, Delivery policy** (policies are placeholders marked **[LEGAL REVIEW NEEDED]**)
- Consent banner (analytics load only after Accept), and a WhatsApp chat button (hidden until a number is set)

### Admin (`/admin`, staff only, works on phones)
- **Orders**: filter by date, slot and status; search by order ID or phone; move an order through **Placed → Confirmed → Being Crafted → Out for Delivery → Delivered**, plus **Cancelled / Refunded**; add rider name, phone and tracking link
- **Products**: prices, availability per weight, sold out, visible, featured, tags, description, photos; create new products and gift boxes
- **Slots**: time, capacity, same-day cutoff, enable/disable, midnight/express
- **Pincodes**: add, pause, remove; see notify-me requests
- **Coupons**: flat or %, minimum order, expiry, usage limit, active
- **Settings**: message and gift note limits, delivery fee, minimum order, how far ahead customers can book, GST, **alert emails**
- **Kitchen**: a printable day sheet: prep list, orders by slot, messages on cakes
- **Closed dates** (in Slots): holidays customers can't book

### Behind the scenes
- An order is marked **paid only after Razorpay's signed webhook is verified**, never from the browser
- Every price is recalculated on the server; editing the cart in the browser can't change what's charged
- Slot capacity is enforced even when two people check out at the same moment
- An email goes out on order placed and on every status change (printed in the terminal until the Resend key is added)
- The bakery gets a **new-order alert** email, and an **error alert** if the server breaks (max one per hour per error)
- Dev tools (simulated payment, on-screen OTP) are **locked off on the live site**
- GST invoice PDF (hidden until a GSTIN and GST rate are set)

---

## 0. Setup

1. `npm install`
2. Get **`.env.local`** from the project owner **over a private channel**. It is never in git. For local testing it must contain `ENABLE_DEV_TOOLS=1`, which turns on the on-screen OTP and the simulated payment. **Never** set it on Vercel.
3. Run the production build: `npm run build`, then `npm run start -- -p 3100`, and open http://localhost:3100.
4. **Become admin:** sign in at `/login` with your mobile number (the code appears on screen in dev), then ask the owner to run:
   ```sql
   update users set role = 'admin' where phone = '+91XXXXXXXXXX';
   ```
5. In `/admin/products`, give 2–3 cakes a price. Cakes at ₹0 show "Price on request" and can't be bought.

**Test on a real phone:** use the same Wi-Fi and open `http://<laptop IP>:3100` (shown as "Network" in the terminal). If office Wi-Fi blocks it, use a phone hotspot.

---

## 1. Customer journey (most important)

- [ ] On a cake card, tap the **photo** or the **eye**: the Glimpse opens. Type a message: it shows on the plaque. Tap a message idea, pick **1 kg**, **Add to cart**
- [ ] Open **Occasions → Anniversary**: the page turns wine and rose-gold with drifting petals, and the Glimpse there suggests anniversary messages
- [ ] Home: **Shop by occasion** shows Diwali marked "In season" (until 15 Nov)
- [ ] In the Glimpse for a priced cake, tick **Bigger celebration?**: the button says **Add both** with the combined price, and both cakes land in the cart
- [ ] Tap the **moon** in the header: the site turns navy; reload and it stays dark; tap again for light
- [ ] (after running `0003`) Checkout → tick **Send it as a surprise**, enter a name. After paying, the order page says "Surprise for …" and admin shows the SURPRISE banner
- [ ] (after running `0003`) On the paid order page, **Remind me next year** → Set reminder: "We'll email you on …". Locally, open `/api/cron/reminders` to run the daily job
- [ ] Open a cake and choose **1 kg**: the price changes
- [ ] Type a **message on cake** and tick **Add a gift note card**: counters count down
- [ ] Tap **Add to cart**: it goes straight into the cart (no pincode question) and the cart count goes up
- [ ] **Cart**: + / −, remove, subtotal updates
- [ ] **Checkout**: the phone field opens a number keypad, and inputs don't zoom on iPhone
- [ ] In the address, type pincode **560001**: "We don't deliver to 560001 yet" and Pay is refused. Change it to **560102**: "✓ We deliver to HSR Layout"
- [ ] Pick **today**: slots past their cutoff show "Closed for today" and can't be tapped
- [ ] Pick **tomorrow** and a slot
- [ ] Apply a coupon (create one in admin first): the discount shows in the total
- [ ] Tap **Pay** → **Simulate successful payment**: "Thank you. Your order is placed", the status is **Placed**, and the cart is empty
- [ ] The terminal prints the "Order … received" email

## 2. Tracking

- [ ] `/track-order` shows the 404 page (Track Order is switched off) and there's no Track Order link in the menu or footer
- [ ] Open the order link from the confirmation email: the order page opens
- [ ] Open the order link in incognito **without** the `?t=…` part: 404 (orders are private)

## 3. Account

- [ ] Log in with the phone used at checkout: that guest order appears in **My Account**
- [ ] A wrong OTP gives "That code didn't match"
- [ ] **Addresses**: add one, and it can be picked at checkout
- [ ] **Profile**: change the name and it saves
- [ ] **Sign out**, then open `/admin`: sent to login
- [ ] Log in as a normal customer and open `/admin`: 404

## 4. Admin: orders

- [ ] Filter by date, slot and status; search by order ID or phone
- [ ] Move an order to **Confirmed**, then **Being Crafted**: "Status updated and customer notified", and an email appears in the terminal each time
- [ ] **Out for Delivery** with the rider fields empty: error asking for the rider's name or phone
- [ ] A tracking link starting `http://`: error asking for `https://`
- [ ] Add rider name, phone and an `https://` link: the customer's order page shows a **Your rider** card
- [ ] **Out for Delivery (edit rider)** changes the rider without changing the status
- [ ] **Delivered**: the customer's timeline shows all 5 steps done
- [ ] **Refunded** (on a delivered order) or **Cancelled** (on a new one): the customer sees the order was refunded or cancelled
- [ ] The bottom of an order shows **History** and **Notifications**

## 5. Admin: products

- [ ] Leave 1 kg at `0`: 1 kg shows "Price on request" and 500 g is buyable
- [ ] Untick **Available** for one weight: that weight can't be bought
- [ ] **Sold out**: card shows "Sold out"
- [ ] Untick **Visible on site**: gone from Collections, and its page shows 404
- [ ] **Featured on home**: appears in Home → Signature Cakes
- [ ] Change **tags**: Collections filter counts change
- [ ] Upload a photo (at least 800 px wide): it appears on the site. Anything smaller is rejected
- [ ] **Make main** / **Remove** photo
- [ ] **New product → Gift box**: add a price, photo and Visible, and it shows on the **Gift Box** page

## 6. Admin: slots, pincodes, coupons, settings

- [ ] Slot **capacity 1**, then 1 order: the next customer sees **Full**
- [ ] Today's slot **cutoff** set in the past: "Closed for today"
- [ ] Untick **Enabled**: the slot is hidden. Enable **Midnight** (capacity above 0) and it appears
- [ ] Slot with end time before start time: error
- [ ] Add pincode **560034**: it passes the delivery check. **Pause** stops it, and **Remove** deletes it
- [ ] The notify-me list shows requests from outside the area
- [ ] Coupon: **flat ₹** works; **%** works; **minimum order** gives a message; **expired** gives "expired"; **usage limit** gives "fully used"; **inactive** gives "isn't valid"; a duplicate code gives "already exists"
- [ ] Settings: message max **0** hides the field; gift note max **0** hides the gift option
- [ ] **Delivery fee ₹50** is added in checkout; **minimum order** above the cart total blocks checkout
- [ ] **Book up to 3 days** shows only 4 dates

## 6b. Operations

- [ ] Settings → **Alert emails**: add your email (must be the Resend account email until a domain is verified)
- [ ] Place and pay a test order: you get the customer email **and** a "New order …" alert
- [ ] Signed in as admin, open `/api/dev/test-error` (local only): you get one "site error" email. Opening it again within an hour sends nothing
- [ ] Slots → **Closed dates**: close a date. In checkout it shows "Closed" and can't be picked. **Reopen** it
- [ ] **Kitchen**: Today / Tomorrow / pick a date. The prep list totals are right, messages are easy to read. **Print** shows only the sheet
- [ ] `npm run db:backup` creates a `backups/` folder with one JSON file per table

## 7. Phone checks (Android Chrome + iPhone Safari)

- [ ] No sideways scrolling on any page
- [ ] Sticky **Add to cart** and **Pay** bars sit above the iPhone home bar and are easy to reach with a thumb
- [ ] The consent banner doesn't cover the buttons, and **Decline** works
- [ ] The menu (☰) opens and closes, and the back gesture works
- [ ] Everything is easy to tap (nothing tiny)

---

## Not connected yet (expected gaps)

| Thing | Status |
|---|---|
| Real Razorpay payment (incl. UPI on phone) | Waiting for test keys; use the simulate button for now |
| Real emails | Waiting for `RESEND_API_KEY`; emails print in the terminal |
| Phone OTP in production | Needs an SMS provider (e.g. MSG91); production offers email login only until then |
| GST invoice | Hidden until a GSTIN (in `brand.ts`) and a GST rate (Settings) are set |
| Photos, engravings, contact/FSSAI details | Placeholders; interim photos must be replaced before launch |
| Policy pages | Placeholder text, **[LEGAL REVIEW NEEDED]** |

## Reporting a bug

Send: **page URL**, **phone model / browser**, **what you did**, **what you expected**, **what happened**, and a **screenshot**.
