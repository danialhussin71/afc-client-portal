import { Header } from "@/components/shell/Header";
import { requireViewer } from "@/lib/auth";

/** Everything inside (portal) needs a signed-in user. */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireViewer();
  return (
    <>
      <Header profile={profile} />
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </>
  );
}
