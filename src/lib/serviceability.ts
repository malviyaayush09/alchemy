import { db } from "./db";
import { isDbConfigured } from "./env";
import { isPincode } from "./validate";

/** Returns the area name if we deliver to this pincode, else null. */
export async function checkPincode(pincode: string): Promise<string | null> {
  if (!isPincode(pincode)) return null;
  if (!isDbConfigured()) return pincode === "560102" ? "HSR Layout" : null;
  const { data, error } = await db()
    .from("serviceable_pincodes")
    .select("area_name")
    .eq("pincode", pincode)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(`checkPincode: ${error.message}`);
  return data?.area_name ?? null;
}
