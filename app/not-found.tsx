import Link from "next/link";
import { buttonClass } from "@/components/ui/button-styles";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-[var(--color-faint)]">404</p>
      <h1 className="mt-2 text-2xl font-bold">This page doesn&apos;t exist</h1>
      <Link href="/dashboard" className={buttonClass("primary", "mt-6")}>
        Go to your dashboard
      </Link>
    </main>
  );
}
