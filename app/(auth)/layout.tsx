import { Quote } from "lucide-react";
import { brand } from "@/lib/brand";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Showcase } from "./Showcase";

/**
 * Sign-in and sign-up: brand panel on the left (desktop), form on the right.
 * On phones the panel folds away and the logo sits above the form.
 * All the words come from lib/brand.ts.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* ------------------------------------------------ brand panel -- */}
      <aside className="relative hidden overflow-hidden bg-brand text-on-brand lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-12 xl:p-14">
        {/* Light from the top right, shade bottom left, a faint dot texture. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(900px_600px_at_90%_-10%,rgb(255_255_255/0.20),transparent_60%),radial-gradient(800px_700px_at_-10%_110%,rgb(0_0_0/0.30),transparent_60%)]"
        />
        <div
          aria-hidden
          className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_50%_at_55%_42%,black,transparent)]"
        />

        <div className="relative">
          {brand.logo.full || brand.logo.fullOnDark ? (
            <Logo onDark className="h-9" />
          ) : (
            <span className="flex items-center gap-3">
              <LogoMark size={40} inverse className="rounded-xl shadow-lg" />
              <span className="font-display text-lg font-semibold tracking-tight">{brand.name}</span>
            </span>
          )}
        </div>

        {/* The portal preview, centred in the panel. */}
        <div className="relative flex flex-1 items-center justify-center py-14 pl-10">
          <Showcase />
        </div>

        <div className="relative">
          <h1 className="max-w-xl animate-rise font-display text-[clamp(30px,2.8vw,44px)] font-semibold leading-[1.08] tracking-[-0.03em]">
            {brand.auth.headline}
          </h1>
          <p className="mt-4 max-w-md animate-rise text-[17px] leading-relaxed opacity-85 [animation-delay:80ms]">
            {brand.auth.subline}
          </p>
          {brand.auth.quote && (
            <figure className="mt-8 max-w-md rounded-2xl bg-black/15 p-5 ring-1 ring-inset ring-white/15">
              <Quote className="size-5 opacity-60" aria-hidden />
              <blockquote className="mt-2 text-[15px] leading-relaxed">{brand.auth.quote.text}</blockquote>
              <figcaption className="mt-3 text-sm opacity-75">
                {brand.auth.quote.name}
                {brand.auth.quote.role && <span> · {brand.auth.quote.role}</span>}
              </figcaption>
            </figure>
          )}
          <p className="mt-10 text-[13px] opacity-65">
            © {year} {brand.owner}
          </p>
        </div>
      </aside>

      {/* ------------------------------------------------- form panel -- */}
      <main id="main" className="relative flex min-h-dvh flex-col bg-surface">
        <div aria-hidden className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-80 lg:hidden" />
        <div className="relative flex items-center justify-between p-5 sm:p-6">
          <span className="text-ink lg:invisible">
            <Logo />
          </span>
          <ThemeToggle />
        </div>
        <div className="relative flex flex-1 items-center justify-center px-5 pb-16 pt-4 sm:px-8">
          <div className="w-full max-w-[400px] animate-rise">{children}</div>
        </div>
      </main>
    </div>
  );
}
