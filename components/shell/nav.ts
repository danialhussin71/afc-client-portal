import { LayoutDashboard, Palette, Users, type LucideIcon } from "lucide-react";

/**
 * The sidebar. Add a page here and it shows up in the nav (desktop sidebar and
 * phone drawer). Icons come from lucide.dev, imported by name.
 *
 * match: "exact" lights up only on that URL; "prefix" also on pages under it
 * (e.g. /clients/123 keeps "Clients" active).
 */
export type NavItem = { href: string; label: string; icon: LucideIcon; match?: "exact" | "prefix" };

/** Everyone who signs in sees these. */
export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: "exact" },
];

/** Only the admin sees these, under an "Admin" heading. */
export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Clients", icon: Users, match: "prefix" },
  { href: "/styleguide", label: "Design system", icon: Palette, match: "exact" },
];
