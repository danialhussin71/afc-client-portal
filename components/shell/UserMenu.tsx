"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

export type UserMenuProps = { name: string; email: string; role: "admin" | "client"; avatarUrl?: string | null };

/** The account button at the bottom of the sidebar. Opens upwards. */
export function UserMenu({ name, email, role, avatarUrl, onNavigate }: UserMenuProps & { onNavigate?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 bottom-[calc(100%+8px)] z-50 animate-rise rounded-xl border border-line bg-surface p-1.5 shadow-lg"
        >
          <div className="px-2.5 pb-2.5 pt-2">
            <p className="truncate text-sm font-medium text-ink">{name || "Your account"}</p>
            <p className="truncate text-[13px] text-ink-muted">{email}</p>
          </div>
          <div className="h-px bg-line-soft" />
          <Link
            href="/account"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-1 flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink transition-colors hover:bg-raised"
          >
            <UserRound className="size-4 text-ink-faint" aria-hidden />
            Account settings
          </Link>
          <div className="flex h-11 items-center justify-between gap-3 px-2.5 text-sm text-ink">
            Theme
            <ThemeToggle />
          </div>
          <div className="my-1 h-px bg-line-soft" />
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-danger transition-colors hover:bg-danger-wash"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sunken/70",
          open && "bg-sunken/70"
        )}
      >
        <Avatar name={name} email={email} src={avatarUrl} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{name || email}</span>
          <span className="block truncate text-xs text-ink-faint">{role === "admin" ? "Admin" : "Client"}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-faint" aria-hidden />
      </button>
    </div>
  );
}
