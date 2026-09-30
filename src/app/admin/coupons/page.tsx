import { db } from "@/lib/db";
import { AdminCheck, AdminField, AdminForm, adminInput } from "@/components/admin/AdminForm";
import { saveCoupon } from "../actions";

type CouponRow = { id: string; code: string; type: "flat" | "percent"; value: number; min_order_paise: number; expires_at: string | null; usage_limit: number | null; used_count: number; is_active: boolean };

const istDate = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10) : "");

function CouponForm({ c }: { c?: CouponRow }) {
  return (
    <AdminForm action={saveCoupon} submitLabel={c ? "Save" : "Create coupon"} className="border border-line bg-paper p-4">
      {c ? <input type="hidden" name="id" value={c.id} /> : null}
      <div className="grid grid-cols-2 gap-3">
        <AdminField label="Code">
          <input name="code" defaultValue={c?.code ?? ""} required className={`${adminInput} uppercase`} autoCapitalize="characters" />
        </AdminField>
        <AdminField label="Type">
          <select name="type" defaultValue={c?.type ?? "flat"} className={adminInput}>
            <option value="flat">Flat ₹ off</option>
            <option value="percent">% off</option>
          </select>
        </AdminField>
        <AdminField label="Value" hint="₹ for flat, whole % for percent">
          <input name="value" inputMode="decimal" defaultValue={c ? (c.type === "flat" ? c.value / 100 : c.value) : ""} required className={adminInput} />
        </AdminField>
        <AdminField label="Min order (₹)">
          <input name="minOrder" inputMode="decimal" defaultValue={c ? c.min_order_paise / 100 : 0} className={adminInput} />
        </AdminField>
        <AdminField label="Expires (end of day)">
          <input name="expiresAt" type="date" defaultValue={istDate(c?.expires_at ?? null)} className={adminInput} />
        </AdminField>
        <AdminField label="Usage limit" hint="Empty = unlimited">
          <input name="usageLimit" type="number" min={1} inputMode="numeric" defaultValue={c?.usage_limit ?? ""} className={adminInput} />
        </AdminField>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AdminCheck name="isActive" label="Active" defaultChecked={c?.is_active ?? true} />
        {c ? <span className="text-[0.8125rem] text-body">Used {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</span> : null}
      </div>
    </AdminForm>
  );
}

export default async function AdminCouponsPage() {
  const { data } = await db().from("coupons").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="text-[2rem]">Coupons</h1>
      <p className="mt-1 text-[0.875rem] text-body">Discounts apply to the cake subtotal (not delivery). Usage is counted only for paid orders.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[1.375rem]">New coupon</h2>
          <CouponForm />
        </div>
        {(data as CouponRow[] | null)?.map((c) => (
          <CouponForm key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
