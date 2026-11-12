import type { Metadata } from "next";
import { requireViewer } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge, Card, CardBody, PageHeader, ThemeToggle } from "@/components/ui";
import { AccountForm } from "./AccountForm";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const { profile } = await requireViewer();

  return (
    <>
      <PageHeader title="Account settings" description="Your details and how the portal looks for you." />

      <div className="divide-y divide-line-soft">
        <SettingsRow title="Profile" description="How you show up in the portal.">
          <AccountForm fullName={profile.full_name} email={profile.email} avatarUrl={profile.avatar_url} />
        </SettingsRow>

        <SettingsRow title="Appearance" description="Light, dark, or match your device.">
          <Card>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Theme</p>
                <p className="text-[13px] text-ink-muted">Saved in this browser.</p>
              </div>
              <ThemeToggle className="w-36" />
            </CardBody>
          </Card>
        </SettingsRow>

        <SettingsRow title="Membership" description="Your account details.">
          <Card>
            <CardBody className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[13px] text-ink-faint">Role</p>
                <Badge tone={profile.role === "admin" ? "brand" : "neutral"} className="mt-1.5">
                  {profile.role === "admin" ? "Admin" : "Client"}
                </Badge>
              </div>
              <div>
                <p className="text-[13px] text-ink-faint">Member since</p>
                <p className="mt-1.5 font-medium text-ink">{formatDate(profile.created_at)}</p>
              </div>
            </CardBody>
          </Card>
        </SettingsRow>
      </div>
    </>
  );
}

function SettingsRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 py-8 first:pt-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
      </div>
      <div className="max-w-2xl">{children}</div>
    </section>
  );
}
