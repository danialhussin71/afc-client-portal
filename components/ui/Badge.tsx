import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-raised text-ink-muted ring-line",
  brand: "bg-brand-wash text-brand-text ring-brand-line",
  success: "bg-success-wash text-success ring-success/25",
  warning: "bg-warning-wash text-warning ring-warning/25",
  danger: "bg-danger-wash text-danger ring-danger/25",
  info: "bg-info-wash text-info ring-info/25",
};

const DOTS: Record<BadgeTone, string> = {
  neutral: "bg-ink-faint",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

/** Small status label. Pass `dot` for a coloured dot before the text. */
export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}
