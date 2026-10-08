import { db, must } from "./db";
import type { OrderStatus, PaymentStatus } from "./types";

export type OrderItem = {
  id: string;
  productName: string;
  weightGrams: number;
  unitPaise: number;
  quantity: number;
  cakeMessage: string | null;
  giftNote: string | null;
};

export type OrderEvent = { id: string; fromStatus: OrderStatus | null; toStatus: OrderStatus; note: string | null; createdAt: string };

export type Order = {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  pincode: string;
  areaName: string;
  deliveryDate: string;
  slotId: string | null;
  slotLabel: string;
  subtotalPaise: number;
  discountPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  couponCode: string | null;
  gstRateBps: number;
  pricesIncludeGst: boolean;
  hsnCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  riderName: string | null;
  riderPhone: string | null;
  trackingUrl: string | null;
  invoiceNo: string | null;
  invoiceDate: string | null;
  razorpayOrderId: string | null;
  /** Surprise delivery (migration 0003): the address is the recipient's; the rider calls the orderer. */
  isSurprise: boolean;
  recipientName: string | null;
  recipientPhone: string | null;
  createdAt: string;
  items: OrderItem[];
  events: OrderEvent[];
};

export const ORDER_SELECT =
  "*, order_items(id, product_name, weight_grams, unit_paise, quantity, cake_message, gift_note), order_status_events(id, from_status, to_status, note, created_at)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrder(r: any): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    phone: r.phone,
    email: r.email,
    addressLine1: r.address_line1,
    addressLine2: r.address_line2,
    landmark: r.landmark,
    pincode: r.pincode,
    areaName: r.area_name,
    deliveryDate: r.delivery_date,
    slotId: r.slot_id,
    slotLabel: r.slot_label,
    subtotalPaise: r.subtotal_paise,
    discountPaise: r.discount_paise,
    deliveryFeePaise: r.delivery_fee_paise,
    totalPaise: r.total_paise,
    couponCode: r.coupon_code,
    gstRateBps: r.gst_rate_bps,
    pricesIncludeGst: r.prices_include_gst,
    hsnCode: r.hsn_code,
    status: r.status,
    paymentStatus: r.payment_status,
    paidAt: r.paid_at,
    riderName: r.rider_name,
    riderPhone: r.rider_phone,
    trackingUrl: r.tracking_url,
    invoiceNo: r.invoice_no,
    invoiceDate: r.invoice_date,
    razorpayOrderId: r.razorpay_order_id,
    isSurprise: r.is_surprise === true,
    recipientName: r.recipient_name ?? null,
    recipientPhone: r.recipient_phone ?? null,
    createdAt: r.created_at,
    items: (r.order_items ?? []).map((i: any) => ({
      id: i.id,
      productName: i.product_name,
      weightGrams: i.weight_grams,
      unitPaise: i.unit_paise,
      quantity: i.quantity,
      cakeMessage: i.cake_message,
      giftNote: i.gift_note,
    })),
    events: (r.order_status_events ?? [])
      .map((e: any) => ({ id: e.id, fromStatus: e.from_status, toStatus: e.to_status, note: e.note, createdAt: e.created_at }))
      .sort((a: OrderEvent, b: OrderEvent) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const res = await db().from("orders").select(ORDER_SELECT).eq("order_number", orderNumber).maybeSingle();
  if (res.error) throw new Error(`getOrderByNumber: ${res.error.message}`);
  return res.data ? mapOrder(res.data) : null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const res = await db().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (res.error) throw new Error(`getOrderById: ${res.error.message}`);
  return res.data ? mapOrder(res.data) : null;
}

/** Orders for a signed-in customer: their own, plus guest orders placed with their verified phone. */
export async function getOrdersForUser(userId: string, phone: string | null): Promise<Order[]> {
  let q = db().from("orders").select(ORDER_SELECT).neq("status", "pending_payment").order("created_at", { ascending: false }).limit(50);
  q = phone ? q.or(`user_id.eq.${userId},phone.eq.${phone}`) : q.eq("user_id", userId);
  return (must(await q, "getOrdersForUser") as unknown[]).map(mapOrder);
}

/** Customer-facing lifecycle, in order. */
export const LIFECYCLE: OrderStatus[] = ["placed", "confirmed", "being_crafted", "out_for_delivery", "delivered"];

export const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  placed: "Placed",
  confirmed: "Confirmed",
  being_crafted: "Being Crafted",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Which statuses admin may move an order to next. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  placed: ["confirmed", "cancelled"],
  confirmed: ["being_crafted", "cancelled"],
  being_crafted: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};
