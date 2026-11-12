import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const ALERT: Record<AlertTone, { wrap: string; icon: React.ElementType }> = {
  info: { wrap: "bg-info-wash text-info ring-info/20", icon: Info },
  success: { wrap: "bg-success-wash text-success ring-success/20", icon: CheckCircle2 },
  warning: { wrap: "bg-warning-wash text-warning ring-warning/25", icon: AlertTriangle },
  danger: { wrap: "bg-danger-wash text-danger ring-danger/20", icon: XCircle },
};

/** Inline message. Always says what happened and what to do next. */
export function Alert({
  tone = "danger",
  title,
  className,
  children,
}: {
  tone?: AlertTone;
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const { wrap, icon: Icon } = ALERT[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg px-3.5 py-3 text-sm ring-1 ring-inset", wrap, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 text-ink-muted" : "text-ink"}>{children}</div>}
      </div>
    </div>
  );
}

/** What an empty list shows: what goes here, and how to add the first one. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-xl bg-brand-wash text-brand-text ring-1 ring-inset ring-brand-line [&_svg]:size-5">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
