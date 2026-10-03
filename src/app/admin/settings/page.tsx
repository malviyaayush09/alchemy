import { brand } from "@/config/brand";
import { getSettings } from "@/lib/catalog";
import { AdminCheck, AdminField, AdminForm, adminInput } from "@/components/admin/AdminForm";
import { saveSettings } from "../actions";

export default async function AdminSettingsPage() {
  const s = await getSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="text-[2rem]">Store settings</h1>
      <AdminForm action={saveSettings} className="mt-4 border border-line bg-paper p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Message on cake: max characters" hint="0 hides the field.">
            <input name="cakeMessageMaxChars" type="number" min={0} max={200} inputMode="numeric" defaultValue={s.cakeMessageMaxChars} className={adminInput} />
          </AdminField>
          <AdminField label="Gift note: max characters" hint="0 hides the option.">
            <input name="giftNoteMaxChars" type="number" min={0} max={1000} inputMode="numeric" defaultValue={s.giftNoteMaxChars} className={adminInput} />
          </AdminField>
          <AdminField label="Delivery fee (₹)" hint="0 = free delivery.">
            <input name="deliveryFee" inputMode="decimal" defaultValue={s.deliveryFeePaise / 100} className={adminInput} />
          </AdminField>
          <AdminField label="Minimum order (₹)" hint="0 = no minimum.">
            <input name="minOrder" inputMode="decimal" defaultValue={s.minOrderPaise / 100} className={adminInput} />
          </AdminField>
          <AdminField label="Book up to (days ahead)">
            <input name="maxDaysAhead" type="number" min={0} max={90} inputMode="numeric" defaultValue={s.maxDaysAhead} className={adminInput} />
          </AdminField>
          <AdminField label="Hold a slot during payment (minutes)">
            <input name="pendingHoldMinutes" type="number" min={5} max={60} inputMode="numeric" defaultValue={s.pendingHoldMinutes} className={adminInput} />
          </AdminField>
        </div>

        <fieldset className="space-y-3 border-t border-line pt-4">
          <legend className="text-[1.125rem] text-ink">Alerts</legend>
          <AdminField label="Alert emails" hint="Comma-separated, up to 5. They get every new paid order, and an email if the site hits an error.">
            <input name="alertEmails" type="text" inputMode="email" defaultValue={s.alertEmails.join(", ")} placeholder="orders@…, owner@…" className={adminInput} />
          </AdminField>
        </fieldset>

        <fieldset className="space-y-3 border-t border-line pt-4">
          <legend className="text-[1.125rem] text-ink">GST [LEGAL REVIEW NEEDED]</legend>
          <p className="text-[0.8125rem] text-body">
            Invoices appear only when a GSTIN is set in brand config {brand.legal.gstin ? `(current: ${brand.legal.gstin})` : "(currently empty, so invoices are hidden)"} and the rate below is above 0. Confirm the rate and HSN with your CA. Changes apply to new orders only.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="GST rate (%)">
              <input name="gstRate" inputMode="decimal" defaultValue={s.gstRateBps / 100} className={adminInput} />
            </AdminField>
            <AdminField label="HSN / SAC code">
              <input name="hsnCode" defaultValue={s.hsnCode} className={adminInput} />
            </AdminField>
          </div>
          <AdminCheck name="pricesIncludeGst" label="Catalogue prices include GST" defaultChecked={s.pricesIncludeGst} />
        </fieldset>
      </AdminForm>
    </div>
  );
}
