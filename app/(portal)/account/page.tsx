import type { Metadata } from "next";
import { requireViewer } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui/Card";
import { AccountForm } from "./AccountForm";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const { profile } = await requireViewer();
  return (
    <>
      <PageHeader title="Your account" description="Update the name people see in the portal." />
      <Card>
        <AccountForm fullName={profile.full_name} email={profile.email} />
      </Card>
    </>
  );
}
