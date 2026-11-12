import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6">
      <div className="max-w-sm text-center">
        <LogoMark size={44} className="mx-auto" />
        <p className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-[15px] text-ink-muted">The link may be old, or the page has moved.</p>
        <Link href="/dashboard" className={buttonClass("primary", "md", "mt-8")}>
          <ArrowLeft aria-hidden /> Back to your dashboard
        </Link>
      </div>
    </main>
  );
}
