# Testing guide

A walkthrough of everything the site does and how to check each part. Tick the boxes as you go. For setup details see [README.md](README.md).

> **Nothing here uses real money.** Razorpay stays in **test mode**. Until the Razorpay keys are added, checkout shows a **Simulate successful payment** button instead.

---

## What we have

### Customer site
- **Home**: brand story (chapters), featured cakes, how ordering works
- **Collections**: all 15 cakes, filters (All / Eggless / With Egg / Pull-Up / Sugar-Free) with counts, and sorting
- **Product page**: 500 g / 1 kg, message on cake, optional gift note card, pincode check, sticky Add to Cart bar on phones
- **Pincode check** before the first add to cart. Only HSR Layout (560102) at launch; other pincodes get "Not yet delivering here" plus a notify-me form
- **Cart**: quantities, remove, and prices re-checked with the server
- **Checkout**: guest checkout (login never required); delivery date + time slot (full or closed slots disabled); coupon; prepaid only
- **Order page**: live status timeline, delivery slot and rider details, reached from the confirmation or a signed link in the email
- **Track Order**: guests enter order ID + phone
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

- [ ] Open a cake and choose **1 kg**: the price changes
- [ ] Type a **message on cake** and tick **Add a gift note card**: counters count down
- [ ] Tap **Add to cart**: "Where should we deliver?" appears
- [ ] Enter **560001**: "Not yet delivering to 560001" plus notify-me. Submit an email: "Thank you"
- [ ] Enter **560102**: "added to your cart", and the cart count goes up
- [ ] **Cart**: + / −, remove, subtotal updates
- [ ] **Checkout**: the phone field opens a number keypad, and inputs don't zoom on iPhone
- [ ] Pick **today**: slots past their cutoff show "Closed for today" and can't be tapped
- [ ] Pick **tomorrow** and a slot
- [ ] Apply a coupon (create one in admin first): the discount shows in the total
- [ ] Tap **Pay** → **Simulate successful payment**: "Thank you. Your order is placed", the status is **Placed**, and the cart is empty
- [ ] The terminal prints the "Order … received" email

## 2. Tracking

- [ ] `/track-order` with the order ID and a **wrong** phone: "We couldn't find an order…"
- [ ] The same with the **right** phone: the order page opens
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
