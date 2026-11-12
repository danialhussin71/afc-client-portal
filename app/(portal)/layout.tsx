import { requireViewer } from "@/lib/auth";
import { SidebarContent } from "@/components/shell/Sidebar";
import { MobileNav } from "@/components/shell/MobileNav";

/**
 * The app shell for everything behind sign-in: a vertical sidebar on the
 * canvas, the page in a raised panel beside it. Phones get a top bar + drawer.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireViewer();
  const isAdmin = profile.role === "admin";
  const user = { name: profile.full_name, email: profile.email, role: profile.role, avatarUrl: profile.avatar_url };

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-surface px-4 py-2 text-sm font-medium shadow-md focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 lg:block print:hidden">
        <SidebarContent isAdmin={isAdmin} user={user} />
      </aside>

      <MobileNav isAdmin={isAdmin} user={user} />

      <div className="min-w-0 flex-1 lg:py-2 lg:pr-2 print:p-0">
        <main
          id="main"
          tabIndex={-1}
          className="min-h-[calc(100dvh-3.5rem)] bg-surface outline-none lg:min-h-[calc(100dvh-1rem)] lg:rounded-2xl lg:shadow-panel print:shadow-none"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
