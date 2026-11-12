import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight, CalendarPlus, Sparkles, UserPlus, Users } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";
import { firstName, formatDate, timeAgo } from "@/lib/utils";
import type { Profile } from "@/lib/types";
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
  StatCard,
} from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard" };

const DAY = 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const { profile } = await requireViewer();
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const name = firstName(profile.full_name, profile.email);

  return profile.role === "admin" ? (
    <AdminDashboard name={name} today={today} />
  ) : (
    <ClientDashboard profile={profile} name={name} today={today} />
  );
}

async function signupUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/signup`;
}

async function AdminDashboard({ name, today }: { name: string; today: string }) {
  const supabase = await createClient();
  const [{ data, error }, link] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false }),
    signupUrl(),
  ]);
  const clients = (data ?? []) as Profile[];
  const now = Date.now();
  const lastWeek = clients.filter((c) => now - new Date(c.created_at).getTime() < 7 * DAY).length;
  const lastMonth = clients.filter((c) => now - new Date(c.created_at).getTime() < 30 * DAY).length;

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`Welcome back, ${name}`}
        description={`Here's what's happening in ${brand.name}.`}
        actions={
          <ButtonLink href="/admin" variant="secondary">
            <Users aria-hidden />
            All clients
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Clients" value={clients.length} icon={<Users />} note="Everyone with an account" />
        <StatCard
          label="Joined this week"
          value={lastWeek}
          icon={<UserPlus />}
          note={lastWeek ? "New this week" : "No one new yet"}
          trend={lastWeek ? "up" : undefined}
        />
        <StatCard label="Joined this month" value={lastMonth} icon={<CalendarPlus />} note="Last 30 days" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Newest clients"
            description="The latest people to join."
            action={
              clients.length > 0 && (
                <ButtonLink href="/admin" variant="ghost" size="sm">
                  View all <ArrowRight aria-hidden />
                </ButtonLink>
              )
            }
          />
          {error ? (
            <CardBody className="text-sm text-danger">Couldn&apos;t load your clients. Refresh to try again.</CardBody>
          ) : clients.length === 0 ? (
            <CardBody>
              <EmptyState
                className="border-0 py-10"
                icon={<UserPlus />}
                title="No clients yet"
                description="Share your sign-up link. Everyone who joins shows up here."
              />
            </CardBody>
          ) : (
            <List>
              {clients.slice(0, 6).map((c) => (
                <ListItem
                  key={c.id}
                  leading={<Avatar name={c.full_name} email={c.email} size="sm" />}
                  title={c.full_name || "No name yet"}
                  description={c.email}
                  trailing={<span className="text-[13px] text-ink-faint">{timeAgo(c.created_at)}</span>}
                />
              ))}
            </List>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader icon={<Sparkles />} title="Invite your clients" description="Send them this link to create their account." />
          <CardBody className="space-y-3">
            <Input readOnly value={link} aria-label="Sign-up link" className="font-mono text-[13px] sm:text-[13px]" />
            <CopyButton value={link} label="Copy link" variant="primary" />
            <p className="text-[13px] text-ink-faint">
              You&apos;re the admin because you signed up first. Everyone after you joins as a client.
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function ClientDashboard({ profile, name, today }: { profile: Profile; name: string; today: string }) {
  return (
    <>
      <PageHeader eyebrow={today} title={`Welcome, ${name}`} description={brand.tagline} />

      <Card className="relative overflow-hidden">
        <div aria-hidden className="brand-glow pointer-events-none absolute inset-0" />
        <CardBody className="relative p-6 sm:p-8">
          <Badge tone="brand" dot>
            You&apos;re in
          </Badge>
          <h2 className="mt-4 max-w-xl text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            This is your space with {brand.owner}.
          </h2>
          <p className="mt-2 max-w-xl text-[15px] text-ink-muted">
            Your plan, your next steps and everything you need will show up here.
          </p>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your next step" />
          <CardBody>
            <EmptyState
              className="border-0 py-8"
              icon={<Sparkles />}
              title="Nothing to do just yet"
              description={`${brand.owner} will add your first steps here.`}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Your account" />
          <CardBody className="flex items-center gap-3">
            <Avatar name={profile.full_name} email={profile.email} src={profile.avatar_url} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{profile.full_name || "Add your name"}</p>
              <p className="truncate text-[13px] text-ink-muted">{profile.email}</p>
              <p className="mt-0.5 text-[13px] text-ink-faint">Joined {formatDate(profile.created_at)}</p>
            </div>
          </CardBody>
          <div className="px-5 pb-5">
            <ButtonLink href="/account" variant="secondary" size="sm" className="w-full">
              Edit your details
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  );
}
