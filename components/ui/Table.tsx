import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Data table inside a card. Scrolls sideways on small screens instead of
 * breaking the layout. For long lists on phones, hide minor columns with
 * `className="hidden md:table-cell"` on both the <Th> and the <Td>.
 */
export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-surface shadow-xs", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-line bg-raised/60">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn("h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-wide text-ink-faint first:pl-5 last:pr-5", className)}
      {...props}
    />
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-line-soft">{children}</tbody>;
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-raised/50", className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle text-ink-muted first:pl-5 last:pr-5", className)} {...props} />;
}

/** A simple stacked list (rows inside a card). Good for "recent" lists and phones. */
export function List({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn("divide-y divide-line-soft", className)}>{children}</ul>;
}

export function ListItem({
  leading,
  title,
  description,
  trailing,
  className,
}: {
  leading?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex min-h-14 items-center gap-3 px-5 py-3", className)}>
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        {description && <p className="truncate text-[13px] text-ink-muted">{description}</p>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </li>
  );
}
