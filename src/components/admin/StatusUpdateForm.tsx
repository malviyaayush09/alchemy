"use client";

import { useActionState, useState } from "react";
import { updateOrderStatus, type AdminState } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/Button";
import { adminInput } from "./AdminForm";

type Props = {
  orderId: string;
  current: string;
  options: { value: string; label: string }[];
  rider: { name: string; phone: string; url: string };
};

/** Next-status picker. Rider fields appear when moving to (or while) Out for Delivery. */
export function StatusUpdateForm({ orderId, current, options, rider }: Props) {
  const [state, action, pending] = useActionState<AdminState, FormData>(updateOrderStatus, null);
  const [picked, setPicked] = useState(options[0]?.value ?? current);
  const allowed = [...options.map((o) => o.value), ...(current === "out_for_delivery" ? [current] : [])];
  const to = allowed.includes(picked) ? picked : (options[0]?.value ?? current);
  const showRider = to === "out_for_delivery";
  const destructive = to === "cancelled" || to === "refunded";

  return (
    <form
      action={action}
      className="mt-3 space-y-3"
      onSubmit={(e) => {
        if (destructive && !confirm(`Mark this order ${to}? The customer will be emailed.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block space-y-1">
        <span className="block text-[0.8125rem] font-medium text-ink">Move to</span>
        <select name="status" value={to} onChange={(e) => setPicked(e.target.value)} className={adminInput}>
          {current === "out_for_delivery" ? <option value="out_for_delivery">Out for Delivery (edit rider)</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {showRider ? (
        <fieldset className="space-y-3 border border-line p-3">
          <legend className="px-1 text-[0.8125rem] font-medium text-ink">Rider (from Porter or similar)</legend>
          <label className="block space-y-1">
            <span className="block text-[0.8125rem] text-ink">Rider name</span>
            <input name="riderName" defaultValue={rider.name} className={adminInput} autoComplete="off" />
          </label>
          <label className="block space-y-1">
            <span className="block text-[0.8125rem] text-ink">Rider phone</span>
            <input name="riderPhone" type="tel" inputMode="tel" defaultValue={rider.phone} className={adminInput} autoComplete="off" />
          </label>
          <label className="block space-y-1">
            <span className="block text-[0.8125rem] text-ink">Tracking link (optional)</span>
            <input name="trackingUrl" type="url" inputMode="url" defaultValue={rider.url} placeholder="https://…" className={adminInput} />
          </label>
        </fieldset>
      ) : null}
      <label className="block space-y-1">
        <span className="block text-[0.8125rem] text-ink">Internal note (optional)</span>
        <input name="note" className={adminInput} maxLength={300} />
      </label>
      {state?.error ? <p role="alert" className="text-[0.875rem] text-danger">{state.error}</p> : state?.message ? <p role="status" className="text-[0.875rem] text-ink">{state.message}</p> : null}
      <button type="submit" disabled={pending} className={buttonClasses(destructive ? "outline" : "primary", "md", true)}>
        {pending ? "Updating…" : "Update"}
      </button>
    </form>
  );
}
