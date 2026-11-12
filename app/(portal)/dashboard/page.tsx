import type { Metadata } from "next";
import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/button-styles";
import { firstName } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { profile } = await requireViewer();
  const isAdmin = profile.role === "admin";

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName(profile.full_name, profile.email)}`}
        description={isAdmin ? "You're the admin of this portal." : "Here's everything for your work together."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-[var(--color-faint)]">Your role</p>
          <p className="mt-2 text-2xl font-bold capitalize">{profile.role}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-[var(--color-faint)]">Your profile</p>
          <p className="mt-2 font-semibold">{profile.full_name || "No name yet"}</p>
          <Link href="/account" className="mt-3 inline-block text-sm font-semibold text-[var(--color-brand)] hover:underline">
            Edit profile
          </Link>
        </Card>
        {isAdmin && (
          <Card>
            <p className="text-sm font-medium text-[var(--color-faint)]">Clients</p>
            <p className="mt-2 text-[var(--color-muted)]">See everyone who has signed up.</p>
            <Link href="/admin" className={buttonClass("secondary", "mt-4")}>
              Open client list
            </Link>
          </Card>
        )}
      </div>
    </>
  );
}
