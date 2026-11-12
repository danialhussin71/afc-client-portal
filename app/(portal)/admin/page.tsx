import type { Metadata } from "next";
import { Search, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, timeAgo } from "@/lib/utils";
import { signupUrl } from "@/lib/urls";
import type { AllowedEmail, Profile } from "@/lib/types";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  CopyButton,
  EmptyState,
  Input,
  List,
  ListItem,
  PageHeader,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";
import { AddAccessDialog, RemoveAccessButton } from "./AccessForms";

export const metadata: Metadata = { title: "Clients" };

/** One row per person with access: joined (has a profile) or invited (not signed up yet). */
type Person = { email: string; name: string; role: Profile["role"]; joined: boolean; since: string; profile?: Profile };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { profile: me } = await requireAdmin();
  const { q = "" } = await searchParams;
  // Strip characters that mean something in a PostgREST filter.
  const term = q.replace(/[,()%*\\]/g, " ").trim().slice(0, 80).toLowerCase();

  const supabase = await createClient();
  // RLS lets admins read every profile and the invite list, so the normal client is enough here.
  const [profiles, invites, link] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("allowed_emails").select("*").order("created_at", { ascending: false }),
    signupUrl(),
  ]);
  const error = profiles.error || invites.error;

  const members = (profiles.data ?? []) as Profile[];
  const joinedEmails = new Set(members.map((p) => p.email));
  const people: Person[] = [
    ...((invites.data ?? []) as AllowedEmail[])
      .filter((i) => !joinedEmails.has(i.email))
      .map((i) => ({ email: i.email, name: i.full_name, role: i.role, joined: false, since: i.created_at })),
    ...members.map((p) => ({ email: p.email, name: p.full_name, role: p.role, joined: true, since: p.created_at, profile: p })),
  ];

  const matches = (p: Person) => !term || p.email.includes(term) || p.name.toLowerCase().includes(term);
  const clients = people.filter((p) => p.role === "client" && matches(p));
  const admins = people.filter((p) => p.role === "admin");
  const totalClients = people.filter((p) => p.role === "client").length;
  const waiting = people.filter((p) => p.role === "client" && !p.joined).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title={
          <span className="flex items-center gap-3">
            Clients
            {!error && <Badge tone="neutral">{totalClients}</Badge>}
          </span>
        }
        description="Only people on this list can create an account. Add someone, then send them your sign-up link."
        actions={<AddAccessDialog />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
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
                description="Add your first client's email. They can then create their account with your sign-up link."
                action={<AddAccessDialog />}
              />
            )
          ) : (
            <Table>
              <THead>
                <Th>Client</Th>
                <Th className="hidden md:table-cell">Since</Th>
                <Th className="hidden sm:table-cell">Status</Th>
                <Th className="w-12 pl-0 last:pr-2">
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {clients.map((c) => (
                  <Tr key={c.email}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} email={c.email} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{c.name || (c.joined ? "No name yet" : c.email)}</p>
                          <p className="truncate text-[13px]">{c.email}</p>
                          <StatusBadge joined={c.joined} className="mt-1.5 sm:hidden" />
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden whitespace-nowrap md:table-cell">
                      <time dateTime={c.since} title={formatDate(c.since)}>
                        {c.joined ? "Joined " : "Added "}
                        {timeAgo(c.since)}
                      </time>
                    </Td>
                    <Td className="hidden sm:table-cell">
                      <StatusBadge joined={c.joined} />
                    </Td>
                    <Td className="pl-0 text-right last:pr-2">
                      <RemoveAccessButton email={c.email} name={c.name} joined={c.joined} />
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Your sign-up link" description={waiting ? `${waiting} invited ${waiting === 1 ? "client hasn't" : "clients haven't"} joined yet.` : "Send this to everyone you add."} />
            <CardBody className="space-y-3">
              <Input readOnly value={link} aria-label="Sign-up link" className="font-mono text-[13px] sm:text-[13px]" />
              <CopyButton value={link} label="Copy link" />
              <p className="text-[13px] text-ink-faint">They sign up with the exact email you added.</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<ShieldCheck />} title="Admins" description="Can see every client and add people." />
            <List>
              {admins.map((a) => (
                <ListItem
                  key={a.email}
                  leading={<Avatar name={a.name} email={a.email} size="sm" />}
                  title={a.email === me.email ? `${a.name || a.email} (you)` : a.name || a.email}
                  description={a.joined ? a.email : "Invited, not joined yet"}
                  trailing={a.email !== me.email && <RemoveAccessButton email={a.email} name={a.name} joined={a.joined} />}
                />
              ))}
            </List>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ joined, className }: { joined: boolean; className?: string }) {
  return joined ? (
    <Badge tone="success" dot className={className}>
      Joined
    </Badge>
  ) : (
    <Badge tone="warning" dot className={className}>
      Invited
    </Badge>
  );
}
