import { brand, monogram } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The square brand mark. Uses public/brand/<mark> if set in lib/brand.ts,
 * otherwise a monogram on the brand colour.
 */
export function LogoMark({ size = 32, inverse = false, className }: { size?: number; inverse?: boolean; className?: string }) {
  if (brand.logo.mark) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo.mark}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-[22%] object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-[26%] font-display font-semibold tracking-tight",
        inverse ? "bg-on-brand text-brand" : "bg-brand text-on-brand",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.15)]",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {monogram()}
    </span>
  );
}

/** Mark + name, or the full logo file if there is one. */
export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const full = onDark ? brand.logo.fullOnDark ?? brand.logo.full : brand.logo.full;
  if (full) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={full} alt={brand.name} className={cn("h-8 w-auto object-contain", className)} />;
  }
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark />
      <span className="truncate font-display text-[15px] font-semibold tracking-tight">{brand.name}</span>
    </span>
  );
}
