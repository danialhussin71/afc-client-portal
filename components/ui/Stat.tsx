import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Chart";

/** A number that matters, with a label and an optional note underneath. */
export function StatCard({
  label,
  value,
  note,
  icon,
  trend,
  trendline,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  icon?: React.ReactNode;
  /** "up" | "down" colours the note. */
  trend?: "up" | "down";
  /** Recent values, drawn as a small line next to the number. */
  trendline?: number[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface p-5 shadow-xs", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
        {trendline && <Sparkline values={trendline} className="mb-1.5 shrink-0" />}
      </div>
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
