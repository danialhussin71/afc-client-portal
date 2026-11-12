import * as React from "react";
import { cn } from "@/lib/utils";

/** A number that matters, with a label and an optional note underneath. */
export function StatCard({
  label,
  value,
  note,
  icon,
  trend,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  icon?: React.ReactNode;
  /** "up" | "down" colours the note. */
  trend?: "up" | "down";
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface p-5 shadow-xs", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint [&_svg]:size-4">{icon}</span>}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
      {note && (
        <p
          className={cn(
            "mt-1.5 text-[13px]",
            trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-ink-faint"
          )}
        >
          {note}
        </p>
      )}
    </div>
  );
}
