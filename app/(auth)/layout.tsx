import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">
          {site.name}
        </Link>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
