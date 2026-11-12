import { CalendarCheck, Check, MessageCircle } from "lucide-react";

/**
 * Decorative preview of the portal on the sign-in brand panel . Glass cards that hint at what's inside. Claude Code: change the words
 * to match the brief (stage names, the thing clients track).
 */
export function Showcase() {
  return (
    <div aria-hidden className="pointer-events-none relative w-[340px] select-none xl:w-[380px]">
      {/* Progress card */}
      <div className="animate-rise rotate-[-3deg] rounded-2xl bg-white p-5 text-[#18181b] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)] [animation-delay:200ms]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-[#56555b]">Your progress</p>
          <span className="rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-text)]">
            Stage 3 of 5
          </span>
        </div>
        <p className="mt-2 font-display text-4xl font-semibold tracking-tight">64%</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ececea]">
          <div className="h-full w-[64%] rounded-full bg-[var(--brand)]" />
        </div>
        <ul className="mt-5 space-y-2.5 text-[13px]">
          {[
            ["Welcome call", true],
            ["Set your 90-day goal", true],
            ["Finish week 3 worksheet", false],
          ].map(([label, done]) => (
            <li key={label as string} className="flex items-center gap-2.5">
              <span
                className={
                  done
                    ? "grid size-5 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-ink)]"
                    : "size-5 rounded-full border-2 border-[#d3d2cd]"
                }
              >
                {done && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className={done ? "text-[#74737a] line-through decoration-[#d3d2cd]" : "font-medium"}>{label as string}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating chips */}
      <div className="absolute -left-16 -top-10 flex animate-rise items-center gap-2.5 rounded-xl bg-white/95 px-3.5 py-2.5 text-[13px] text-[#18181b] shadow-[0_20px_40px_-16px_rgb(0_0_0/0.4)] [animation-delay:320ms]">
        <span className="grid size-7 place-items-center rounded-lg bg-[#ecf7f0] text-[#15803d]">
          <CalendarCheck className="size-4" />
        </span>
        <span>
          <span className="block font-semibold">Check-in done</span>
          <span className="text-[12px] text-[#74737a]">Friday, 9:41</span>
        </span>
      </div>
      <div className="absolute -bottom-12 -left-24 flex animate-rise items-center gap-2.5 rounded-xl bg-white/95 px-3.5 py-2.5 text-[13px] text-[#18181b] shadow-[0_20px_40px_-16px_rgb(0_0_0/0.4)] [animation-delay:420ms]">
        <span className="grid size-7 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-[var(--brand-text)]">
          <MessageCircle className="size-4" />
        </span>
        <span>
          <span className="block font-semibold">New note from your coach</span>
          <span className="text-[12px] text-[#74737a]">&ldquo;Great week, keep going.&rdquo;</span>
        </span>
      </div>
    </div>
  );
}
