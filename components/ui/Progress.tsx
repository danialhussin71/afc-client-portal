import { cn, pct } from "@/lib/utils";

/** Horizontal bar. value is 0 to 1. */
export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
}: {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}) {
  const p = pct(value);
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between text-[13px]">
          {label && <span className="font-medium text-ink">{label}</span>}
          {showValue && <span className="tabular-nums text-ink-muted">{p}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p}
        aria-label={label ?? "Progress"}
        className="h-2 overflow-hidden rounded-full bg-sunken"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-700 ease-[var(--ease-out)]"
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

/** Circular progress with the percentage in the middle. value is 0 to 1. */
export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  label,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const p = pct(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      role="img"
      aria-label={label ?? `${p}% complete`}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sunken)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p / 100)}
          style={{ transition: "stroke-dashoffset 0.7s var(--ease-out)" }}
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center font-semibold tabular-nums text-ink"
        style={{ fontSize: Math.max(10, size * 0.22) }}
      >
        {p}%
      </span>
    </div>
  );
}
