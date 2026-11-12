import type { ComponentProps, ReactNode } from "react";

const CONTROL_CLASSES =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-primary/30 " +
  "aria-[invalid=true]:border-danger";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** A label, a form control and an optional hint or error message. */
export function Field({ label, htmlFor, error, hint, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-sm text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${CONTROL_CLASSES} h-10 ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${CONTROL_CLASSES} h-10 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${CONTROL_CLASSES} min-h-24 ${className}`} {...props} />;
}

export function Checkbox({ label, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-[var(--primary)]" {...props} />
      {label}
    </label>
  );
}
