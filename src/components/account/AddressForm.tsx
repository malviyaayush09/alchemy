"use client";

import { useActionState, useEffect, useRef } from "react";
import { addAddress, type FormState } from "@/app/account/actions";
import { buttonClasses } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

export function AddressForm({ defaultName, defaultPhone }: { defaultName: string; defaultPhone: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addAddress, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <TextField id="a-label" name="label" label="Label (optional)" placeholder="Home, Office…" maxLength={40} />
      <TextField id="a-name" name="name" label="Name" defaultValue={defaultName} autoComplete="name" required />
      <TextField id="a-phone" name="phone" label="Mobile number" type="tel" inputMode="tel" autoComplete="tel-national" defaultValue={defaultPhone} required />
      <TextField id="a-line1" name="line1" label="House / flat no., building" autoComplete="address-line1" required />
      <TextField id="a-line2" name="line2" label="Street and sector (optional)" autoComplete="address-line2" />
      <TextField id="a-landmark" name="landmark" label="Landmark (optional)" />
      <TextField id="a-pin" name="pincode" label="Pincode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" required />
      {state?.error ? <p role="alert" className="text-[1rem] text-danger">{state.error}</p> : null}
      {state?.ok ? <p role="status" className="text-[1rem] text-ink">Address saved.</p> : null}
      <button type="submit" disabled={pending} className={buttonClasses("primary", "md", true)}>
        {pending ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
