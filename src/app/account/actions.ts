"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, destroySession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { cleanText, isPincode, isUuid, normalizeEmail, normalizePhone } from "@/lib/validate";

export type FormState = { ok?: boolean; error?: string } | null;

async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/login?next=/account");
  return u;
}

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const name = cleanText(fd.get("name"), 80);
  const emailRaw = String(fd.get("email") ?? "").trim();
  const email = emailRaw ? normalizeEmail(emailRaw) : null;
  if (emailRaw && !email) return { error: "Enter a valid email." };
  const { error } = await db().from("users").update({ name: name || null, email }).eq("id", u.id);
  if (error) return { error: error.code === "23505" ? "That email is used by another account." : "Couldn't save. Please try again." };
  revalidatePath("/account", "layout");
  return { ok: true };
}

export async function addAddress(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const name = cleanText(fd.get("name"), 80);
  const phone = normalizePhone(fd.get("phone"));
  const line1 = cleanText(fd.get("line1"), 160);
  const pincode = String(fd.get("pincode") ?? "").trim();
  if (name.length < 2 || !phone || line1.length < 3 || !isPincode(pincode)) return { error: "Please fill in name, a valid phone, address and a 6-digit pincode." };
  const { count } = await db().from("addresses").select("id", { count: "exact", head: true }).eq("user_id", u.id);
  if ((count ?? 0) >= 10) return { error: "You can save up to 10 addresses." };
  const { error } = await db()
    .from("addresses")
    .insert({
      user_id: u.id,
      label: cleanText(fd.get("label"), 40) || null,
      name,
      phone,
      line1,
      line2: cleanText(fd.get("line2"), 160) || null,
      landmark: cleanText(fd.get("landmark"), 120) || null,
      pincode,
      is_default: (count ?? 0) === 0,
    });
  if (error) return { error: "Couldn't save the address." };
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(fd: FormData) {
  const u = await requireUser();
  const id = fd.get("id");
  if (isUuid(id)) await db().from("addresses").delete().eq("id", id).eq("user_id", u.id);
  revalidatePath("/account/addresses");
}

export async function makeDefaultAddress(fd: FormData) {
  const u = await requireUser();
  const id = fd.get("id");
  if (!isUuid(id)) return;
  await db().from("addresses").update({ is_default: false }).eq("user_id", u.id);
  await db().from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", u.id);
  revalidatePath("/account/addresses");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
