import { cn } from "@/lib/utils";

/** Button classes. Plain function, safe to use in Server and Client Components. */
export type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand)] text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-hover)]",
  secondary:
    "border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-raised)]",
  ghost: "text-[var(--color-muted)] hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
};

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    styles[variant],
    className
  );
}
