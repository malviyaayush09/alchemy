import { db } from "@/lib/db";
import { formatStamp } from "@/lib/time";
import { AdminField, AdminForm, adminInput } from "@/components/admin/AdminForm";
import { addPincode, removePincode, togglePincode } from "../actions";

export default async function AdminPincodesPage() {
  const [{ data: pins }, { data: notify }] = await Promise.all([
    db().from("serviceable_pincodes").select("*").order("pincode"),
    db().from("notify_requests").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="text-[2rem]">Serviceable pincodes</h1>
        <ul className="mt-4 divide-y divide-line border-y border-line bg-paper">
          {(pins ?? []).map((p) => (
            <li key={p.pincode} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="text-ink">
                <b className="font-medium">{p.pincode}</b> · {p.area_name} {p.is_active ? "" : <span className="text-danger">(paused)</span>}
              </span>
              <span className="flex gap-3">
                <form action={togglePincode}>
                  <input type="hidden" name="pincode" value={p.pincode} />
                  <input type="hidden" name="active" value={String(!p.is_active)} />
                  <button className="min-h-11 text-[0.8125rem] text-ink underline">{p.is_active ? "Pause" : "Resume"}</button>
                </form>
                <form action={removePincode}>
                  <input type="hidden" name="pincode" value={p.pincode} />
                  <button className="min-h-11 text-[0.8125rem] text-danger underline">Remove</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 max-w-sm">
          <AdminForm action={addPincode} submitLabel="Add pincode" className="border border-line bg-paper p-4">
            <AdminField label="Pincode">
              <input name="pincode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className={adminInput} />
            </AdminField>
            <AdminField label="Area name">
              <input name="area" required className={adminInput} placeholder="HSR Layout" />
            </AdminField>
          </AdminForm>
        </div>
      </section>
      <section>
        <h2 className="text-[1.5rem]">&quot;Notify me&quot; requests</h2>
        <p className="mt-1 text-[0.8125rem] text-body">People outside the delivery area who asked to be told when you reach them.</p>
        <ul className="mt-3 divide-y divide-line border-y border-line bg-paper text-[0.875rem]">
          {(notify ?? []).map((n) => (
            <li key={n.id} className="flex justify-between gap-3 px-3 py-2">
              <span className="text-ink">
                {n.pincode} · {n.contact}
              </span>
              <span className="shrink-0 text-body">{formatStamp(n.created_at)}</span>
            </li>
          ))}
          {!notify?.length ? <li className="px-3 py-2 text-body">None yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
