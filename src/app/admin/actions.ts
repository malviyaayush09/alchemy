"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { notFound, redirect } from "next/navigation";
import { currentUser, isStaff, type User } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { imageSize } from "@/lib/image-size";
import { notifyOrderStatus } from "@/lib/notify";
import { NEXT_STATUSES, getOrderById } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";
import { cleanText, isHttpsUrl, isPincode, isUuid, normalizePhone, rupeesToPaise } from "@/lib/validate";

export type AdminState = { ok?: boolean; error?: string; message?: string } | null;

async function requireStaff(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/login?next=/admin");
  if (!isStaff(u)) notFound();
  return u;
}

/** Storefront pages that show catalogue data. */
function refreshStorefront() {
  revalidatePath("/", "layout");
}

const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const int = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};
const hhmm = (v: FormDataEntryValue | null) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null);

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function updateOrderStatus(_: AdminState, fd: FormData): Promise<AdminState> {
  const staff = await requireStaff();
  const id = fd.get("orderId");
  const to = String(fd.get("status") ?? "") as OrderStatus;
  if (!isUuid(id)) return { error: "Bad order." };
  const order = await getOrderById(id);
  if (!order) return { error: "Order not found." };

  const riderName = cleanText(fd.get("riderName"), 80);
  const riderPhoneRaw = cleanText(fd.get("riderPhone"), 20);
  const riderPhone = riderPhoneRaw ? normalizePhone(riderPhoneRaw) : null;
  const trackingUrl = cleanText(fd.get("trackingUrl"), 500);
  if (riderPhoneRaw && !riderPhone) return { error: "Rider phone must be a valid 10-digit mobile number." };
  if (trackingUrl && !isHttpsUrl(trackingUrl)) return { error: "Tracking link must start with https://" };
  const note = cleanText(fd.get("note"), 300) || null;

  // Rider details only (no status change) while out for delivery.
  if (to === order.status && order.status === "out_for_delivery") {
    await db().from("orders").update({ rider_name: riderName || null, rider_phone: riderPhone, tracking_url: trackingUrl || null, updated_at: new Date().toISOString() }).eq("id", order.id);
    revalidatePath(`/admin/orders/${order.orderNumber}`);
    return { ok: true, message: "Rider details updated." };
  }

  if (!NEXT_STATUSES[order.status].includes(to)) return { error: `Can't move from ${order.status} to ${to}.` };
  if (to === "out_for_delivery" && !riderName && !riderPhone) return { error: "Add at least the rider's name or phone." };

  const patch: Record<string, unknown> = { status: to, updated_at: new Date().toISOString() };
  if (to === "out_for_delivery") Object.assign(patch, { rider_name: riderName || null, rider_phone: riderPhone, tracking_url: trackingUrl || null });
  if (to === "refunded") patch.payment_status = "refunded";

  // Optimistic concurrency: only apply if nobody else changed the status meanwhile.
  const { data, error } = await db().from("orders").update(patch).eq("id", order.id).eq("status", order.status).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "This order was just updated by someone else. Reload and try again." };
  await db().from("order_status_events").insert({ order_id: order.id, from_status: order.status, to_status: to, actor_id: staff.id, note });

  if (order.paymentStatus === "paid" || to === "refunded") after(() => notifyOrderStatus(order.id, to));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  return { ok: true, message: "Status updated and customer notified." };
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function saveProduct(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireStaff();
  const id = fd.get("id");
  if (!isUuid(id)) return { error: "Bad product." };
  const name = cleanText(fd.get("name"), 120);
  if (name.length < 2) return { error: "Name is required." };
  const sortOrder = int(fd, "sortOrder");
  const { error } = await db()
    .from("products")
    .update({
      name,
      description: cleanText(fd.get("description"), 2000, { multiline: true }),
      is_active: bool(fd, "isActive"),
      is_sold_out: bool(fd, "isSoldOut"),
      is_featured: bool(fd, "isFeatured"),
      sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  // Variants: price (₹) and availability.
  for (const key of fd.keys()) {
    const m = key.match(/^price:(.+)$/);
    if (!m || !isUuid(m[1])) continue;
    const paise = rupeesToPaise(fd.get(key));
    if (paise === null) return { error: "Prices must be numbers in rupees, e.g. 1850." };
    const r = await db().from("product_variants").update({ price_paise: paise, is_available: bool(fd, `available:${m[1]}`) }).eq("id", m[1]).eq("product_id", id);
    if (r.error) return { error: r.error.message };
  }

  // Tags: replace the set.
  const tagIds = fd.getAll("tags").filter(isUuid);
  await db().from("product_tags").delete().eq("product_id", id);
  if (tagIds.length) await db().from("product_tags").insert(tagIds.map((t) => ({ product_id: id, tag_id: t })));

  refreshStorefront();
  return { ok: true, message: "Saved." };
}

export async function createProduct(fd: FormData) {
  await requireStaff();
  const name = cleanText(fd.get("name"), 120);
  const kind = fd.get("kind") === "gift_box" ? "gift_box" : "cake";
  if (name.length < 2) return;
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "product";
  const slug = `${base}-${randomUUID().slice(0, 4)}`;
  const { data, error } = await db().from("products").insert({ name, slug, kind, is_active: false, description: "[PLACEHOLDER: description to be written by the bakery]" }).select("id").single();
  if (error || !data) throw new Error(error?.message);
  await db().from("product_variants").insert([500, 1000].map((w) => ({ product_id: data.id, weight_grams: w, price_paise: 0 })));
  if (kind === "gift_box") {
    const { data: tag } = await db().from("tags").select("id").eq("slug", "gift-box").single();
    if (tag) await db().from("product_tags").insert({ product_id: data.id, tag_id: tag.id });
  }
  redirect(`/admin/products/${data.id}`);
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadProductImage(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireStaff();
  const id = fd.get("productId");
  const file = fd.get("file");
  if (!isUuid(id) || !(file instanceof File) || file.size === 0) return { error: "Choose an image." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 5 MB." };
  const buf = Buffer.from(await file.arrayBuffer());
  const size = imageSize(buf);
  if (!size) return { error: "Use a JPEG, PNG or WebP image." };
  if (size.width < 800) return { error: `Image is ${size.width}px wide. Use at least 800px so it stays sharp on phones.` };

  const path = `products/${id}/${randomUUID()}.${size.type === "jpeg" ? "jpg" : size.type}`;
  const up = await db().storage.from("product-images").upload(path, buf, { contentType: `image/${size.type}`, cacheControl: "31536000", upsert: false });
  if (up.error) return { error: up.error.message };
  const { data: pub } = db().storage.from("product-images").getPublicUrl(path);
  const { count } = await db().from("product_images").select("id", { count: "exact", head: true }).eq("product_id", id);
  const ins = await db()
    .from("product_images")
    .insert({ product_id: id, src: pub.publicUrl, storage_path: path, width: size.width, height: size.height, alt: cleanText(fd.get("alt"), 160), sort_order: count ?? 0 });
  if (ins.error) return { error: ins.error.message };
  refreshStorefront();
  return { ok: true, message: "Image added." };
}

export async function deleteProductImage(fd: FormData) {
  await requireStaff();
  const id = fd.get("imageId");
  if (!isUuid(id)) return;
  const { data } = await db().from("product_images").select("storage_path, product_id").eq("id", id).single();
  if (data?.storage_path) await db().storage.from("product-images").remove([data.storage_path]);
  await db().from("product_images").delete().eq("id", id);
  refreshStorefront();
  if (data) revalidatePath(`/admin/products/${data.product_id}`);
}

export async function makePrimaryImage(fd: FormData) {
  await requireStaff();
  const id = fd.get("imageId");
  const productId = fd.get("productId");
  if (!isUuid(id) || !isUuid(productId)) return;
  const { data } = await db().from("product_images").select("id").eq("product_id", productId).order("sort_order");
  const order = [id, ...(data ?? []).map((r) => r.id).filter((x) => x !== id)];
  for (const [i, imgId] of order.entries()) await db().from("product_images").update({ sort_order: i }).eq("id", imgId);
  refreshStorefront();
  revalidatePath(`/admin/products/${productId}`);
}

// ─── Slots ──────────────────────────────────────────────────────────────────

export async function saveSlot(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireStaff();
  const id = fd.get("id");
  const label = cleanText(fd.get("label"), 40);
  const start = hhmm(fd.get("startTime"));
  const end = hhmm(fd.get("endTime"));
  const cutoff = hhmm(fd.get("sameDayCutoff"));
  const capacity = int(fd, "capacity");
  const kind = ["standard", "midnight", "express"].includes(String(fd.get("kind"))) ? String(fd.get("kind")) : "standard";
  if (!label || !start || !end || !cutoff) return { error: "Label, start, end and cutoff times are required (HH:MM)." };
  if (end <= start) return { error: "End time must be after start time." };
  if (!(capacity >= 0 && capacity <= 500)) return { error: "Capacity must be 0–500." };
  const row = { label, start_time: start, end_time: end, same_day_cutoff: cutoff, capacity, kind, is_enabled: bool(fd, "isEnabled"), sort_order: Number.isNaN(int(fd, "sortOrder")) ? 0 : int(fd, "sortOrder") };
  const res = isUuid(id) ? await db().from("delivery_slots").update(row).eq("id", id) : await db().from("delivery_slots").insert(row);
  if (res.error) return { error: res.error.message };
  revalidatePath("/admin/slots");
  return { ok: true, message: "Slot saved." };
}

// ─── Pincodes ───────────────────────────────────────────────────────────────

export async function addPincode(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireStaff();
  const pincode = String(fd.get("pincode") ?? "").trim();
  const area = cleanText(fd.get("area"), 80);
  if (!isPincode(pincode) || !area) return { error: "Enter a 6-digit pincode and an area name." };
  const { error } = await db().from("serviceable_pincodes").upsert({ pincode, area_name: area, is_active: true });
  if (error) return { error: error.message };
  revalidatePath("/admin/pincodes");
  return { ok: true, message: `${pincode} added.` };
}

export async function togglePincode(fd: FormData) {
  await requireStaff();
  const pincode = String(fd.get("pincode") ?? "");
  if (!isPincode(pincode)) return;
  await db().from("serviceable_pincodes").update({ is_active: fd.get("active") === "true" }).eq("pincode", pincode);
  revalidatePath("/admin/pincodes");
}

export async function removePincode(fd: FormData) {
  await requireStaff();
  const pincode = String(fd.get("pincode") ?? "");
  if (isPincode(pincode)) await db().from("serviceable_pincodes").delete().eq("pincode", pincode);
  revalidatePath("/admin/pincodes");
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export async function saveCoupon(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireStaff();
  const id = fd.get("id");
  const code = cleanText(fd.get("code"), 32).toUpperCase();
  const type = fd.get("type") === "percent" ? "percent" : "flat";
  const rawValue = String(fd.get("value") ?? "");
  const value = type === "percent" ? Math.round(Number(rawValue)) : rupeesToPaise(rawValue);
  const minOrder = rupeesToPaise(String(fd.get("minOrder") ?? "0"));
  const limitRaw = String(fd.get("usageLimit") ?? "").trim();
  const usageLimit = limitRaw ? Math.round(Number(limitRaw)) : null;
  const expiresRaw = String(fd.get("expiresAt") ?? "").trim();

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { error: "Code: 3–32 letters, numbers, - or _." };
  if (!value || value <= 0 || (type === "percent" && value > 100)) return { error: type === "percent" ? "Percent must be 1–100." : "Enter a flat amount in rupees." };
  if (minOrder === null) return { error: "Minimum order must be in rupees." };
  if (usageLimit !== null && !(usageLimit > 0)) return { error: "Usage limit must be a positive number, or empty for unlimited." };
  // Expiry is entered as an IST date; the coupon works through the end of that day.
  const expiresAt = expiresRaw && /^\d{4}-\d{2}-\d{2}$/.test(expiresRaw) ? new Date(`${expiresRaw}T23:59:59+05:30`).toISOString() : null;

  const row = { code, type, value, min_order_paise: minOrder, usage_limit: usageLimit, expires_at: expiresAt, is_active: bool(fd, "isActive") };
  const res = isUuid(id) ? await db().from("coupons").update(row).eq("id", id) : await db().from("coupons").insert(row);
  if (res.error) return { error: res.error.code === "23505" ? "That code already exists." : res.error.message };
  revalidatePath("/admin/coupons");
  return { ok: true, message: `Coupon ${code} saved.` };
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function saveSettings(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireStaff();
  const fee = rupeesToPaise(String(fd.get("deliveryFee") ?? "0"));
  const min = rupeesToPaise(String(fd.get("minOrder") ?? "0"));
  const gst = Number(String(fd.get("gstRate") ?? "0"));
  const nums = {
    cake_message_max_chars: int(fd, "cakeMessageMaxChars"),
    gift_note_max_chars: int(fd, "giftNoteMaxChars"),
    max_days_ahead: int(fd, "maxDaysAhead"),
    pending_hold_minutes: int(fd, "pendingHoldMinutes"),
  };
  if (fee === null || min === null) return { error: "Amounts must be in rupees." };
  if (!(gst >= 0 && gst <= 50)) return { error: "GST rate must be 0–50%." };
  if (Object.values(nums).some((n) => Number.isNaN(n))) return { error: "All limits must be numbers." };
  const { error } = await db()
    .from("store_settings")
    .update({ ...nums, delivery_fee_paise: fee, min_order_paise: min, gst_rate_bps: Math.round(gst * 100), prices_include_gst: bool(fd, "pricesIncludeGst"), hsn_code: cleanText(fd.get("hsnCode"), 12), updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message.includes("check") ? "One of the values is out of range." : error.message };
  refreshStorefront();
  return { ok: true, message: "Settings saved." };
}
