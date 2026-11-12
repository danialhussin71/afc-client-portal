"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { SidebarContent } from "./Sidebar";
import type { UserMenuProps } from "./UserMenu";

/** Phone and tablet: a top bar with a menu button that opens the sidebar as a drawer. */
export function MobileNav({ isAdmin, user }: { isAdmin: boolean; user: UserMenuProps }) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line px-2 lg:hidden print:hidden">
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label="Open menu"
        className="grid size-11 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-raised hover:text-ink"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <Link href="/dashboard" className="min-w-0 flex-1 text-ink" aria-label={`${brand.name} home`}>
        <Logo />
      </Link>
      <Link href="/account" aria-label="Account settings" className="grid size-11 place-items-center">
        <Avatar name={user.name} email={user.email} src={user.avatarUrl} size="sm" />
      </Link>

      <dialog ref={ref} data-ui="drawer" aria-label="Menu" onClick={(e) => e.target === ref.current && close()}>
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="absolute right-2 top-2.5 z-10 grid size-11 place-items-center rounded-lg text-ink-muted hover:bg-raised hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
        <SidebarContent isAdmin={isAdmin} user={user} onNavigate={close} />
      </dialog>
    </header>
  );
}
