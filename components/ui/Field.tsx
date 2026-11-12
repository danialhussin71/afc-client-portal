import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared input look. 16px text on phones so iOS doesn't zoom in. */
export const inputClass =
  "block w-full rounded-lg border border-line bg-surface px-3 text-base text-ink shadow-xs sm:text-sm " +
  "transition-[border-color,box-shadow] duration-150 " +
  "hover:border-line-strong focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 " +
  "disabled:cursor-not-allowed disabled:bg-raised disabled:text-ink-muted " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

/**
 * Label + control + hint/error, wired up for screen readers.
 * Pass the control as a child, or use the `input` shorthand props.
 */
export function Field({
  label,
  name,
  hint,
  error,
  optional,
  className,
  children,
  ...inputProps
}: {
  label: string;
  name: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = inputProps.id ?? `f-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const control = children ?? (
    <Input id={id} name={name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...inputProps} />
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-ink-faint">Optional</span>}
      </label>
      {control}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, "h-11 sm:h-10", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(inputClass, "min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        inputClass,
        "h-11 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9 sm:h-10",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2374737a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/** A checkbox with its label. */
export function Checkbox({ label, className, ...props }: { label: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex min-h-11 items-center gap-3 text-sm text-ink", className)}>
      <input type="checkbox" className="size-[18px] shrink-0 rounded accent-[var(--color-brand)]" {...props} />
      {label}
    </label>
  );
}
