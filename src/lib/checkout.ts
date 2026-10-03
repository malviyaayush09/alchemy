import { brand } from "@/config/brand";
import { getProducts, getSettings } from "./catalog";
import { db } from "./db";
import { devToolsEnabled, isRazorpayConfigured } from "./env";
import { computeTotals, type CouponRule } from "./pricing";
import { createRazorpayOrder } from "./razorpay";
import { isClosedDate } from "./closed-dates";
import { checkPincode } from "./serviceability";
import { getSlotAvailability } from "./slots";
import { orderToken } from "./tokens";
import { isPurchasable } from "./types";
import { isIsoDate } from "./time";
import { cleanText, isUuid, normalizeEmail, normalizePhone, ValidationError } from "./validate";

export type CheckoutInput = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  line1?: unknown;
  line2?: unknown;
  landmark?: unknown;
  pincode?: unknown;
  date?: unknown;
  slotId?: unknown;
  couponCode?: unknown;
  saveAddress?: unknown;
  items?: unknown;
};

export type CheckoutResult = {
  orderNumber: string;
  token: string;
  totalPaise: number;
  razorpay: { keyId: string; orderId: string; amount: number } | null;
  devPayment: boolean;
  holdMinutes: number;
};

type Coupon = CouponRule & { id: string; usageLimit: number | null; usedCount: number; expiresAt: string | null; isActive: boolean };

export async function findCoupon(code: string): Promise<Coupon | null> {
  const c = cleanText(code, 32).toUpperCase();
  if (!c) return null;
  const { data, error } = await db().from("coupons").select("*").eq("code", c).maybeSingle();
  if (error) throw new Error(`findCoupon: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    code: data.code,
    type: data.type,
    value: data.value,
    minOrderPaise: data.min_order_paise,
    usageLimit: data.usage_limit,
    usedCount: data.used_count,
    expiresAt: data.expires_at,
    isActive: data.is_active,
  };
}

/** Why a coupon can't be used, or null if it can. */
export function couponProblem(c: Coupon | null, subtotalPaise: number): string | null {
  if (!c || !c.isActive) return "That coupon code isn't valid.";
  if (c.expiresAt && new Date(c.expiresAt) <= new Date()) return "That coupon has expired.";
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return "That coupon has been fully used.";
  if (subtotalPaise < c.minOrderPaise) return `This coupon needs a minimum order of ₹${Math.ceil(c.minOrderPaise / 100)}.`;
  return null;
}

/**
 * Server-authoritative checkout: validates everything, re-prices from the DB,
 * reserves the slot atomically, and opens a Razorpay (TEST) order.
 * The order is NOT paid until the verified webhook says so.
 */
export async function createCheckout(input: CheckoutInput, userId: string | null): Promise<CheckoutResult> {
  const settings = await getSettings();

  const name = cleanText(input.name, 80);
  if (name.length < 2) throw new ValidationError("name", "Please enter your name.");
  const phone = normalizePhone(input.phone);
  if (!phone) throw new ValidationError("phone", "Enter a valid 10-digit mobile number.");
  const email = normalizeEmail(input.email);
  if (!email) throw new ValidationError("email", "Enter a valid email for order updates.");

  const line1 = cleanText(input.line1, 160);
  if (line1.length < 3) throw new ValidationError("line1", "Enter your house or flat number and building.");
  const line2 = cleanText(input.line2, 160);
  const landmark = cleanText(input.landmark, 120);
  const pincode = String(input.pincode ?? "");
  const area = await checkPincode(pincode);
  if (!area) throw new ValidationError("pincode", "We don't deliver to this pincode yet.");

  const date = String(input.date ?? "");
  const slotId = String(input.slotId ?? "");
  if (!isIsoDate(date) || !isUuid(slotId)) throw new ValidationError("slot", "Choose a delivery date and time slot.");
  if (await isClosedDate(date)) throw new ValidationError("slot", "We're closed on that date. Please choose another day.");
  const slot = (await getSlotAvailability(date, settings.maxDaysAhead)).find((s) => s.id === slotId);
  if (!slot || !slot.available) throw new ValidationError("slot", "That slot is no longer available. Please choose another.");

  // Re-price every line from the database.
  const raw = Array.isArray(input.items) ? input.items.slice(0, 20) : [];
  if (!raw.length) throw new ValidationError("items", "Your cart is empty.");
  const products = await getProducts();
  const items = raw.map((r: Record<string, unknown>) => {
    const variantId = String(r?.variantId ?? "");
    const product = products.find((p) => p.variants.some((v) => v.id === variantId));
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant || !isPurchasable(product, variant)) throw new ValidationError("items", "An item in your cart is no longer available. Please review your cart.");
    const quantity = Math.max(1, Math.min(20, Math.floor(Number(r?.quantity) || 1)));
    return {
      product_id: product.id,
      variant_id: variant.id,
      product_name: product.name,
      weight_grams: variant.weightGrams,
      unit_paise: variant.pricePaise,
      quantity,
      cake_message: cleanText(r?.cakeMessage, settings.cakeMessageMaxChars),
      gift_note: cleanText(r?.giftNote, settings.giftNoteMaxChars, { multiline: true }),
    };
  });

  const lines = items.map((i) => ({ unitPaise: i.unit_paise, quantity: i.quantity }));
  const subtotal = lines.reduce((s, l) => s + l.unitPaise * l.quantity, 0);
  if (settings.minOrderPaise > 0 && subtotal < settings.minOrderPaise) {
    throw new ValidationError("items", `The minimum order is ₹${Math.ceil(settings.minOrderPaise / 100)}.`);
  }

  let coupon: Coupon | null = null;
  if (typeof input.couponCode === "string" && input.couponCode.trim()) {
    coupon = await findCoupon(input.couponCode);
    const problem = couponProblem(coupon, subtotal);
    if (problem) throw new ValidationError("coupon", problem);
  }
  const totals = computeTotals(lines, settings.deliveryFeePaise, coupon);
  if (totals.totalPaise < 100) throw new ValidationError("items", "Order total is too low to process.");

  const { data, error } = await db().rpc("create_pending_order", {
    p: {
      order_prefix: brand.orderPrefix,
      user_id: userId ?? "",
      customer_name: name,
      phone,
      email,
      address_line1: line1,
      address_line2: line2,
      landmark,
      pincode,
      area_name: area,
      delivery_date: date,
      slot_id: slotId,
      subtotal_paise: totals.subtotalPaise,
      discount_paise: totals.discountPaise,
      delivery_fee_paise: totals.deliveryFeePaise,
      total_paise: totals.totalPaise,
      coupon_id: coupon?.id ?? null,
      coupon_code: coupon?.code ?? "",
      gst_rate_bps: settings.gstRateBps,
      prices_include_gst: settings.pricesIncludeGst,
      hsn_code: settings.hsnCode,
      items,
    },
  });
  if (error) {
    const m = error.message;
    if (m.includes("SLOT_FULL") || m.includes("SLOT_UNAVAILABLE")) throw new ValidationError("slot", "That slot just filled up. Please choose another.");
    if (m.includes("COUPON")) throw new ValidationError("coupon", "That coupon can't be used right now.");
    if (m.includes("DATE_CLOSED")) throw new ValidationError("slot", "We're closed on that date. Please choose another day.");
    throw new Error(`create_pending_order: ${m}`);
  }
  const created = (data as { order_id: string; order_number: string }[])[0];

  let razorpay: CheckoutResult["razorpay"] = null;
  let rzpOrderId: string;
  if (isRazorpayConfigured()) {
    const rzp = await createRazorpayOrder(totals.totalPaise, created.order_number, { order_id: created.order_id });
    rzpOrderId = rzp.id;
    razorpay = { keyId: process.env.RAZORPAY_KEY_ID!, orderId: rzp.id, amount: rzp.amount };
  } else if (devToolsEnabled()) {
    rzpOrderId = `order_dev_${created.order_id.replace(/-/g, "").slice(0, 14)}`;
  } else {
    throw new Error("Payments are not configured.");
  }
  const upd = await db().from("orders").update({ razorpay_order_id: rzpOrderId }).eq("id", created.order_id);
  if (upd.error) throw new Error(`attach razorpay order: ${upd.error.message}`);

  if (userId) {
    // Signed-in extras: remember the name, and the address if asked. Never blocks payment.
    await db().from("users").update({ name }).eq("id", userId).is("name", null);
    if (input.saveAddress === true) {
      const { data: dup } = await db().from("addresses").select("id").eq("user_id", userId).eq("line1", line1).eq("pincode", pincode).maybeSingle();
      if (!dup) await db().from("addresses").insert({ user_id: userId, name, phone, line1, line2: line2 || null, landmark: landmark || null, pincode });
    }
  }

  return {
    orderNumber: created.order_number,
    token: orderToken(created.order_number),
    totalPaise: totals.totalPaise,
    razorpay,
    devPayment: !razorpay,
    holdMinutes: settings.pendingHoldMinutes,
  };
}
