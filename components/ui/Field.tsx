import { cn } from "@/lib/utils";

export function Field({
  label,
  name,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; hint?: string }) {
  const id = props.id ?? name;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        className="block h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-faint)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-wash)]"
        {...props}
      />
      {hint && <p className="text-xs text-[var(--color-faint)]">{hint}</p>}
    </div>
  );
}
