"use client";

import { useActionState } from "react";
import type { AdminState } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/Button";

type Props = {
  action: (s: AdminState, fd: FormData) => Promise<AdminState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  encType?: "multipart/form-data";
};

/** Server-action form with inline success/error feedback. */
export function AdminForm({ action, children, submitLabel = "Save", className = "", encType }: Props) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(action, null);
  return (
    <form action={formAction} className={`space-y-4 ${className}`} encType={encType}>
      {children}
      {state?.error ? (
        <p role="alert" className="text-[0.875rem] text-danger">
          {state.error}
        </p>
      ) : state?.message ? (
        <p role="status" className="text-[0.875rem] text-ink">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClasses("primary", "md")}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

export const adminInput =
  "block w-full min-h-11 border border-ink/40 bg-white px-3 py-2 text-ink focus:border-ink focus:outline-2 focus:outline-accent";

export function AdminField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="block text-[0.8125rem] font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-[0.75rem] text-body">{hint}</span> : null}
    </label>
  );
}

export function AdminCheck({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[0.9375rem] text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-[var(--color-ink)]" />
      {label}
    </label>
  );
}
