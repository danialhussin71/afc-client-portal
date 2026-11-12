import { cn } from "@/lib/utils";

/**
 * Button looks, usable anywhere (Server and Client Components).
 * Make a <Link> look like a button: <Link className={buttonClass("secondary")} />
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 " +
  "[&_svg]:size-4 [&_svg]:shrink-0";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand shadow-sm hover:bg-brand-hover " +
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.12)]",
  secondary: "bg-surface text-ink border border-line shadow-xs hover:bg-raised hover:border-line-strong",
  outline: "border border-brand-line text-brand-text hover:bg-brand-wash",
  ghost: "text-ink-muted hover:text-ink hover:bg-raised",
  danger: "bg-danger text-white shadow-sm hover:opacity-90 dark:text-[#1a0a0a]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
  icon: "size-10",
  "icon-sm": "size-9",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}
