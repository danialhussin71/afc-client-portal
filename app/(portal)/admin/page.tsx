import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Clients" };

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  // RLS lets admins read every profile, so the normal client is enough here.
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const clients = (data ?? []) as Profile[];

  return (
    <>
      <PageHeader title="Clients" description="Everyone who has created an account in your portal." />

      {error ? (
        <EmptyState title="Couldn't load your clients" description="Refresh the page to try again." />
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="When a client creates an account with your portal link, they'll show up here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-line)] bg-[var(--color-raised)] text-[var(--color-muted)]">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Email</th>
                <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-3.5 font-medium">{c.full_name || "No name yet"}</td>
                  <td className="px-5 py-3.5 text-[var(--color-muted)]">{c.email}</td>
                  <td className="hidden px-5 py-3.5 text-[var(--color-muted)] sm:table-cell">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
