"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { ADMIN_NAV, MAIN_NAV, type NavItem } from "./nav";
import { UserMenu, type UserMenuProps } from "./UserMenu";

export function SidebarContent({
  isAdmin,
  user,
  onNavigate,
}: {
  isAdmin: boolean;
  user: UserMenuProps;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (item: NavItem) =>
    item.match === "prefix" ? pathname === item.href || pathname.startsWith(item.href + "/") : pathname === item.href;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate} className="min-w-0 rounded-lg text-ink" aria-label={`${brand.name} home`}>
          <Logo />
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        <NavGroup items={MAIN_NAV} isActive={isActive} onNavigate={onNavigate} />
        {isAdmin && ADMIN_NAV.length > 0 && (
          <>
            <p className="mb-1.5 mt-7 px-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Admin
            </p>
            <NavGroup items={ADMIN_NAV} isActive={isActive} onNavigate={onNavigate} />
          </>
        )}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <UserMenu {...user} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function NavGroup({
  items,
  isActive,
  onNavigate,
}: {
  items: NavItem[];
  isActive: (item: NavItem) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150",
                active
                  ? "bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--color-line),0_1px_2px_rgb(0_0_0/0.04)]"
                  : "text-ink-muted hover:bg-sunken/70 hover:text-ink"
              )}
            >
              <Icon
                aria-hidden
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  active ? "text-brand-text" : "text-ink-faint group-hover:text-ink-muted"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
