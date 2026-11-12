import Link from "next/link";
import { buttonClass } from "@/components/ui/button-styles";
import { site } from "@/lib/site";

/** Public landing page. Replace the words with the portal's own pitch. */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand)]">{site.name}</p>
      <h1 className="mt-4 text-4xl font-bold sm:text-6xl">{site.tagline}</h1>
      <p className="mt-5 max-w-xl text-lg text-[var(--color-muted)]">
        {site.description}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/signup" className={buttonClass("primary", "h-12 px-6 text-base")}>
          Create your account
        </Link>
        <Link href="/login" className={buttonClass("secondary", "h-12 px-6 text-base")}>
          Sign in
        </Link>
      </div>
    </main>
  );
}
