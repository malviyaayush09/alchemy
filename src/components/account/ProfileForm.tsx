"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/app/account/actions";
import { buttonClasses } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

/** Email is the login identity for email-only accounts, so it can't be edited there. */
export function ProfileForm({ name, email, emailLocked }: { name: string; email: string; emailLocked: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <TextField id="p-name" name="name" label="Name" defaultValue={name} autoComplete="name" maxLength={80} />
      {emailLocked ? (
        <>
          <input type="hidden" name="email" value={email} />
          <p className="text-[0.9375rem] text-body">
            Email: <b className="font-medium text-ink">{email}</b>
          </p>
        </>
      ) : (
        <TextField id="p-email" name="email" type="email" inputMode="email" label="Email (for order updates)" defaultValue={email} autoComplete="email" />
      )}
      {state?.error ? <p role="alert" className="text-[1rem] text-danger">{state.error}</p> : null}
      {state?.ok ? <p role="status" className="text-[1rem] text-ink">Saved.</p> : null}
      <button type="submit" disabled={pending} className={buttonClasses("primary", "md", true)}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
