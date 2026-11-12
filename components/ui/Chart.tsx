"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Small, dependency-free charts in the brand colour (pure SVG). They measure
 * their own width so labels stay a readable size on phones.
 * Every chart has a text label for screen readers; pass `summary` to say the
 * key point ("Up 12% since last month").
 *
 *   <LineChart data={[{ label: "W1", value: 4 }, ...]} unit="calls" goal={10} />
 *   <BarChart data={[{ label: "Mon", value: 2 }, ...]} />
 *   <Sparkline values={[3, 5, 4, 7]} />
 */
export type Point = { label: string; value: number };

const fmt = (n: number) => (Math.abs(n) >= 1000 ? Intl.NumberFormat(undefined, { notation: "compact" }).format(n) : String(Math.round(n * 10) / 10));

/** Round step sizes (1, 2, 2.5, 5 × 10ⁿ) so the axis reads 0, 5, 10, 15. */
function niceStep(raw: number) {
  const exp = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const f = raw / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * exp;
}

function scale(values: number[], goal?: number) {
  const all = goal === undefined ? values : [...values, goal];
  const hi = Math.max(...all, 0);
  const lo = Math.min(...all, 0);
  const step = niceStep((hi - lo) / 4 || 1);
  const min = Math.floor(lo / step) * step;
  const max = Math.max(Math.ceil(hi / step) * step, min + step);
  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) ticks.push(t);
  return { min, max, ticks };
}

/** Width of the element, so the SVG draws at real pixel size. */
function useWidth(fallback = 600) {
  const ref = React.useRef<HTMLElement>(null);
  const [w, setW] = React.useState(fallback);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Empty({ height }: { height: number }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-line-strong text-[13px] text-ink-faint" style={{ height }}>
      No data yet
    </div>
  );
}

/** Trend over time. Optional dashed goal line. */
export function LineChart({
  data,
  height = 220,
  unit,
  goal,
  summary,
  className,
}: {
  data: Point[];
  height?: number;
  unit?: string;
  goal?: number;
  summary?: string;
  className?: string;
}) {
  const [ref, W] = useWidth();
  if (data.length === 0) return <Empty height={height} />;
  const H = height;
  const P = { t: 12, r: 12, b: 28, l: 40 };
  const { min, max, ticks } = scale(data.map((d) => d.value), goal);
  const x = (i: number) => P.l + (data.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (data.length - 1));
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${y(min)} L${x(0)},${y(min)} Z`;
  const every = Math.ceil(data.length / Math.max(2, Math.floor(W / 70)));

  return (
    <figure ref={ref} className={cn("w-full min-w-0 [contain:inline-size]", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block overflow-visible"
        role="img"
        aria-label={summary ?? `Line chart, latest ${fmt(data[data.length - 1].value)}${unit ? ` ${unit}` : ""}`}
      >
        <defs>
          <linearGradient id="lc-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--color-line-soft)" />
            <text x={P.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-faint text-[11px] tabular-nums">
              {fmt(t)}
            </text>
          </g>
        ))}
        {goal !== undefined && (
          <g>
            <line x1={P.l} x2={W - P.r} y1={y(goal)} y2={y(goal)} stroke="var(--color-success)" strokeDasharray="5 5" strokeWidth={1.5} />
            <text x={P.l + 6} y={y(goal) - 6} textAnchor="start" className="fill-success text-[11px] font-medium">
              Goal {fmt(goal)}
            </text>
          </g>
        )}
        <path d={area} fill="url(#lc-fill)" />
        <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.value)} r={3.5} fill="var(--color-surface)" stroke="var(--color-brand)" strokeWidth={2}>
              <title>{`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ""}`}</title>
            </circle>
            {i % every === 0 && (
              <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-ink-faint text-[11px]">
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </figure>
  );
}

/** Compare values side by side. Highlight one bar with `highlight` (its index). */
export function BarChart({
  data,
  height = 220,
  unit,
  highlight,
  summary,
  className,
}: {
  data: Point[];
  height?: number;
  unit?: string;
  highlight?: number;
  summary?: string;
  className?: string;
}) {
  const [ref, W] = useWidth();
  if (data.length === 0) return <Empty height={height} />;
  const H = height;
  const P = { t: 20, r: 8, b: 28, l: 8 };
  const { min, max } = scale(data.map((d) => d.value));
  const band = (W - P.l - P.r) / data.length;
  const bw = Math.min(48, band * 0.62);
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);

  return (
    <figure ref={ref} className={cn("w-full min-w-0 [contain:inline-size]", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label={summary ?? "Bar chart"}>
        <line x1={P.l} x2={W - P.r} y1={y(0)} y2={y(0)} stroke="var(--color-line)" />
        {data.map((d, i) => {
          const cx = P.l + band * i + band / 2;
          const top = y(Math.max(0, d.value));
          const h = Math.abs(y(d.value) - y(0));
          const on = highlight === undefined || highlight === i;
          return (
            <g key={i}>
              <rect
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={Math.max(h, 1)}
                rx={6}
                fill="var(--color-brand)"
                opacity={on ? 1 : 0.35}
              >
                <title>{`${d.label}: ${fmt(d.value)}${unit ? ` ${unit}` : ""}`}</title>
              </rect>
              <text x={cx} y={top - 6} textAnchor="middle" className="fill-ink-muted text-[11px] font-medium tabular-nums">
                {fmt(d.value)}
              </text>
              <text x={cx} y={H - 8} textAnchor="middle" className="fill-ink-faint text-[11px]">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/** Tiny trend line for stat cards and table rows. */
export function Sparkline({ values, width = 96, height = 28, className }: { values: number[]; width?: number; height?: number; className?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => (i * (width - 4)) / (values.length - 1) + 2;
  const y = (v: number) => 2 + (1 - (v - min) / (max - min || 1)) * (height - 4);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const up = values[values.length - 1] >= values[0];
  return (
    <svg width={width} height={height} className={className} role="img" aria-label={up ? "Trending up" : "Trending down"}>
      <path d={d} fill="none" stroke="var(--color-brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={2.5} fill="var(--color-brand)" />
    </svg>
  );
}

/**
 * A score on a scale split into bands (for scorecards and assessments).
 *   <ScoreMeter score={62} max={100} bands={[{ upTo: 40, label: "Foundations" }, { upTo: 75, label: "Building" }, { upTo: 100, label: "Ready" }]} />
 */
export function ScoreMeter({
  score,
  max = 100,
  bands,
  className,
}: {
  score: number;
  max?: number;
  bands: { upTo: number; label: string }[];
  className?: string;
}) {
  const p = Math.max(0, Math.min(1, score / max)) * 100;
  const current = bands.find((b) => score <= b.upTo) ?? bands[bands.length - 1];
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-4xl font-semibold tracking-tight tabular-nums text-ink">
          {Math.round(score)}
          <span className="text-lg font-medium text-ink-faint">/{max}</span>
        </p>
        <p className="text-sm font-semibold text-brand-text">{current.label}</p>
      </div>
      <div className="relative mt-4 flex h-2.5 gap-1" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={score} aria-label={`Score ${Math.round(score)} of ${max}, ${current.label}`}>
        {bands.map((b, i) => {
          const from = i === 0 ? 0 : bands[i - 1].upTo;
          return (
            <div
              key={b.label}
              className={cn("h-full rounded-full", b === current ? "bg-brand" : "bg-sunken")}
              style={{ width: `${((b.upTo - from) / max) * 100}%` }}
            />
          );
        })}
        <span
          aria-hidden
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-brand shadow-md"
          style={{ left: `${p}%` }}
        />
      </div>
      <div className="mt-2 flex gap-1 text-[11px] text-ink-faint">
        {bands.map((b, i) => {
          const from = i === 0 ? 0 : bands[i - 1].upTo;
          return (
            <span key={b.label} className="truncate" style={{ width: `${((b.upTo - from) / max) * 100}%` }}>
              {b.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
