"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[60dvh] place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-danger">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">That didn&apos;t load</h1>
        <p className="mt-2 text-[15px] text-ink-muted">Try again. If it keeps happening, refresh the page.</p>
        <button type="button" onClick={reset} className={buttonClass("primary", "md", "mt-8")}>
          <RotateCw aria-hidden /> Try again
        </button>
      </div>
    </main>
  );
}
