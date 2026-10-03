import { getClosedDates } from "@/lib/closed-dates";
import { getAllSlots } from "@/lib/slots";
import { longDate } from "@/lib/time";
import type { Slot } from "@/lib/types";
import { AdminCheck, AdminField, AdminForm, adminInput } from "@/components/admin/AdminForm";
import { addClosedDate, removeClosedDate, saveSlot } from "../actions";

function SlotForm({ s }: { s?: Slot }) {
  return (
    <AdminForm action={saveSlot} submitLabel={s ? "Save slot" : "Add slot"} className="border border-line bg-paper p-4">
      {s ? <input type="hidden" name="id" value={s.id} /> : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-3">
          <AdminField label="Label">
            <input name="label" defaultValue={s?.label ?? ""} required placeholder="11 AM – 1 PM" className={adminInput} />
          </AdminField>
        </div>
        <AdminField label="Start (IST)">
          <input name="startTime" type="time" defaultValue={s?.startTime ?? "11:00"} required className={adminInput} />
        </AdminField>
        <AdminField label="End (IST)">
          <input name="endTime" type="time" defaultValue={s?.endTime ?? "13:00"} required className={adminInput} />
        </AdminField>
        <AdminField label="Same-day cutoff" hint="Orders for today close at this time.">
          <input name="sameDayCutoff" type="time" defaultValue={s?.sameDayCutoff ?? "07:00"} required className={adminInput} />
        </AdminField>
        <AdminField label="Capacity" hint="Orders per day in this slot.">
          <input name="capacity" type="number" min={0} max={500} inputMode="numeric" defaultValue={s?.capacity ?? 3} required className={adminInput} />
        </AdminField>
        <AdminField label="Type">
          <select name="kind" defaultValue={s?.kind ?? "standard"} className={adminInput}>
            <option value="standard">Standard</option>
            <option value="midnight">Midnight</option>
            <option value="express">Express</option>
          </select>
        </AdminField>
        <AdminField label="Sort order">
          <input name="sortOrder" type="number" inputMode="numeric" defaultValue={s?.sortOrder ?? 0} className={adminInput} />
        </AdminField>
      </div>
      <AdminCheck name="isEnabled" label="Enabled (shown to customers)" defaultChecked={s?.isEnabled ?? true} />
    </AdminForm>
  );
}

export default async function AdminSlotsPage() {
  const [slots, closed] = await Promise.all([getAllSlots(), getClosedDates()]);
  return (
    <div>
      <section aria-labelledby="closed-title" className="mb-10">
        <h1 id="closed-title" className="text-[2rem]">
          Closed dates
        </h1>
        <p className="mt-1 max-w-2xl text-[0.875rem] text-body">Holidays and days off. Customers see these as &quot;Closed&quot; and can&apos;t book them. Existing orders for that day are not cancelled.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AdminForm action={addClosedDate} submitLabel="Close this date" className="border border-line bg-paper p-4">
            <div className="grid grid-cols-2 gap-3">
              <AdminField label="Date">
                <input name="date" type="date" required className={adminInput} />
              </AdminField>
              <AdminField label="Reason (optional)">
                <input name="reason" maxLength={80} placeholder="Diwali" className={adminInput} />
              </AdminField>
            </div>
          </AdminForm>
          <ul className="divide-y divide-line border-y border-line bg-paper">
            {closed.map((c) => (
              <li key={c.date} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-ink">
                  {longDate(c.date)}
                  {c.reason ? <span className="text-body"> · {c.reason}</span> : null}
                </span>
                <form action={removeClosedDate}>
                  <input type="hidden" name="date" value={c.date} />
                  <button className="min-h-11 text-[0.8125rem] text-danger underline">Reopen</button>
                </form>
              </li>
            ))}
            {!closed.length ? <li className="px-3 py-3 text-[0.875rem] text-body">No closed dates coming up.</li> : null}
          </ul>
        </div>
      </section>

      <h2 className="text-[2rem]">Delivery slots</h2>
      <p className="mt-1 max-w-2xl text-[0.875rem] text-body">
        Customers see only enabled slots. Midnight and express slots stay hidden unless you enable them. A slot is disabled for customers when it&apos;s full, or (for today) once its cutoff has passed.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {slots.map((s) => (
          <SlotForm key={s.id} s={s} />
        ))}
      </div>
      <h2 className="mt-8 text-[1.5rem]">Add a slot</h2>
      <div className="mt-3 max-w-xl">
        <SlotForm />
      </div>
    </div>
  );
}
