import type { ComponentPropsWithoutRef, ReactNode } from "react";

const control =
  "block w-full min-h-12 border border-ink/40 bg-paper-soft px-3.5 py-2.5 text-ink placeholder:text-body/70 " +
  "transition-colors hover:border-ink focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-accent " +
  "aria-[invalid=true]:border-danger";

type Wrap = { label: string; hint?: ReactNode; error?: string; id: string; children: ReactNode; counter?: ReactNode };

function FieldWrap({ label, hint, error, id, children, counter }: Wrap) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.875rem] font-medium text-ink">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.8125rem] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-body">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & { id: string; label: string; hint?: ReactNode; error?: string };

/**
 * Text input. Pass the correct type/inputMode/autoComplete per use:
 *   phone:   type="tel" inputMode="tel" autoComplete="tel"
 *   pincode: inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code"
 *   OTP:     inputMode="numeric" autoComplete="one-time-code"
 * Font size is forced to 16px+ globally so iOS never zooms on focus.
 */
export function TextField({ id, label, hint, error, className = "", ...rest }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldWrap id={id} label={label} hint={hint} error={error}>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={`${control} ${className}`} {...rest} />
    </FieldWrap>
  );
}

type TextAreaProps = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & { id: string; label: string; hint?: ReactNode; error?: string };

export function TextArea({ id, label, hint, error, maxLength, className = "", ...rest }: TextAreaProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldWrap
      id={id}
      label={label}
      hint={hint}
      error={error}
      counter={maxLength ? <span className="text-[0.8125rem] text-body">Up to {maxLength} characters</span> : null}
    >
      <textarea
        id={id}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${control} min-h-24 resize-y ${className}`}
        {...rest}
      />
    </FieldWrap>
  );
}
