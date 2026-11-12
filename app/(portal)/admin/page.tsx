import type { Metadata } from "next";
import { Search, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, timeAgo } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { Avatar, Badge, ButtonLink, EmptyState, Input, PageHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  // Strip characters that mean something in a PostgREST filter.
  const term = q.replace(/[,()%*\\]/g, " ").trim().slice(0, 80);

  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false });
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  // RLS lets admins read every profile, so the normal client is enough here.
  const { data, error } = await query;
  const clients = (data ?? []) as Profile[];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title={
          <span className="flex items-center gap-3">
            Clients
            {!error && <Badge tone="neutral">{clients.length}</Badge>}
          </span>
        }
        description="Everyone who has created an account in your portal."
      />

      <form role="search" className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <Input name="q" defaultValue={q} placeholder="Search by name or email" aria-label="Search clients" className="pl-9" />
      </form>

      {error ? (
        <EmptyState title="Couldn't load your clients" description="Refresh the page to try again." />
      ) : clients.length === 0 ? (
        term ? (
          <EmptyState
            icon={<Search />}
            title={`No clients match "${term}"`}
            description="Check the spelling or search by email instead."
            action={
              <ButtonLink href="/admin" variant="secondary" size="sm">
                Clear search
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={<Users />}
            title="No clients yet"
            description="When a client creates an account with your sign-up link, they'll show up here."
            action={
              <ButtonLink href="/dashboard" variant="secondary" size="sm">
                Get your sign-up link
              </ButtonLink>
            }
          />
        )
      ) : (
        <Table>
          <THead>
            <Th>Client</Th>
            <Th className="hidden md:table-cell">Joined</Th>
            <Th className="hidden sm:table-cell">Status</Th>
          </THead>
          <TBody>
            {clients.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.full_name} email={c.email} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{c.full_name || "No name yet"}</p>
                      <p className="truncate text-[13px]">{c.email}</p>
                    </div>
                  </div>
                </Td>
                <Td className="hidden whitespace-nowrap md:table-cell">
                  <time dateTime={c.created_at} title={formatDate(c.created_at)}>
                    {timeAgo(c.created_at)}
                  </time>
                </Td>
                <Td className="hidden sm:table-cell">
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
