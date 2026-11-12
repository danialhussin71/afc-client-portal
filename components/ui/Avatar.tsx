import { cn, initials } from "@/lib/utils";

const SIZES = { xs: "size-6 text-[10px]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-20 text-2xl" };

/** Six soft tints. The same person always gets the same one. */
const TINTS = [
  "bg-[#e8edff] text-[#3049b5] dark:bg-[#1c2447] dark:text-[#a9b9ff]",
  "bg-[#e6f6ee] text-[#17663f] dark:bg-[#132b20] dark:text-[#86dcae]",
  "bg-[#fdf0e3] text-[#99510d] dark:bg-[#2d1f10] dark:text-[#f5be84]",
  "bg-[#fbe9f0] text-[#a02658] dark:bg-[#2e1420] dark:text-[#f3a3c3]",
  "bg-[#ece9fb] text-[#5333b0] dark:bg-[#211a3d] dark:text-[#bfaefc]",
  "bg-[#e4f4f6] text-[#16656f] dark:bg-[#11282c] dark:text-[#89d3dc]",
];

function tintFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function Avatar({
  name,
  email = "",
  src,
  size = "md",
  className,
}: {
  name?: string | null;
  email?: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold", SIZES[size], className);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn(base, "object-cover")} />;
  }
  return (
    <span aria-hidden className={cn(base, tintFor(email || name || "?"))}>
      {initials(name, email)}
    </span>
  );
}
