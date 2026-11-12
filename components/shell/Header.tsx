import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import type { Profile } from "@/lib/types";
import { NavLinks } from "./NavLinks";
import { site } from "@/lib/site";

export type NavItem = { href: string; label: string };

export function Header({ profile }: { profile: Profile }) {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/account", label: "Account" },
    ...(profile.role === "admin" ? [{ href: "/admin", label: "Clients" }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-surface)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/dashboard" className="font-bold tracking-tight">
          {site.name}
        </Link>
        <NavLinks items={items} />
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-[var(--color-muted)] sm:inline">{profile.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
