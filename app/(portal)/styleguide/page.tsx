import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ClipboardList, FileText, Plus, Target, Trash2, TrendingUp, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { LogoMark } from "@/components/brand/Logo";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CopyButton,
  Dialog,
  EmptyState,
  Eyebrow,
  Field,
  List,
  ListItem,
  ListSkeleton,
  PageHeader,
  ProgressBar,
  ProgressRing,
  Section,
  Select,
  StatCard,
  StatsSkeleton,
  Table,
  TBody,
  Td,
  Textarea,
  Th,
  THead,
  Tr,
} from "@/components/ui";

export const metadata: Metadata = { title: "Design system" };

/**
 * Every component in the design system, live. Admin only.
 * Claude Code: look here before building a page, and reuse these pieces.
 */
export default async function StyleguidePage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Admin · Reference"
        title="Design system"
        description="Every building block in this portal. New pages are made from these, so everything looks like one product."
      />

      <Section title="Colour" description="Brand colour comes from app/brand.css. Everything else is derived.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ["brand", "bg-brand"],
            ["brand-wash", "bg-brand-wash"],
            ["brand-soft", "bg-brand-soft"],
            ["canvas", "bg-canvas"],
            ["surface", "bg-surface"],
            ["raised", "bg-raised"],
            ["ink", "bg-ink"],
            ["ink-muted", "bg-ink-muted"],
            ["success", "bg-success"],
            ["warning", "bg-warning"],
            ["danger", "bg-danger"],
            ["info", "bg-info"],
          ].map(([name, cls]) => (
            <div key={name} className="overflow-hidden rounded-xl border border-line">
              <div className={`h-14 ${cls}`} />
              <p className="px-3 py-2 font-mono text-xs text-ink-muted">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <Card>
          <CardBody className="space-y-4">
            <Eyebrow>Eyebrow · section label</Eyebrow>
            <p className="font-display text-[28px] font-semibold tracking-tight text-ink">Page title, 28px semibold</p>
            <p className="text-base font-semibold text-ink">Section title, 16px semibold</p>
            <p className="text-[15px] text-ink-muted">Body text, 15px. Short sentences, plain words, the client&apos;s language.</p>
            <p className="text-[13px] text-ink-faint">Meta text, 13px. Dates, hints, small print.</p>
          </CardBody>
        </Card>
      </Section>

      <Section title="Buttons" description="One primary button per screen. Everything else is secondary or ghost.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus aria-hidden /> Primary
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">
            <Trash2 aria-hidden /> Delete
          </Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button size="lg">
            Large <ArrowRight aria-hidden />
          </Button>
          <Button size="icon" variant="secondary" aria-label="Add">
            <Plus aria-hidden />
          </Button>
          <CopyButton value="Copied from the design system" />
        </div>
      </Section>

      <Section title="Badges" description="Status always has a word, never colour alone.">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="brand" dot>
            In progress
          </Badge>
          <Badge tone="success" dot>
            Done
          </Badge>
          <Badge tone="warning" dot>
            Due soon
          </Badge>
          <Badge tone="danger" dot>
            Overdue
          </Badge>
          <Badge tone="info">New</Badge>
        </div>
      </Section>

      <Section title="Stats and progress">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active clients" value={24} icon={<Users />} note="+3 this week" trend="up" />
          <StatCard label="Actions done" value="86%" icon={<CheckCircle2 />} note="Across all clients" />
          <StatCard label="Check-ins" value={112} icon={<TrendingUp />} note="2 missed this week" trend="down" />
        </div>
        <Card className="mt-4">
          <CardBody className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={0.64} size={72} />
            <div className="flex-1 space-y-4">
              <ProgressBar value={0.64} label="Stage 3 of 5" showValue />
              <ProgressBar value={0.25} label="This week's actions" showValue />
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section title="Cards and lists">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader
              icon={<ClipboardList />}
              title="This week's actions"
              description="3 of 5 done"
              action={
                <Button size="sm" variant="ghost">
                  View all
                </Button>
              }
            />
            <List>
              <ListItem
                leading={<CheckCircle2 className="size-5 text-success" aria-hidden />}
                title="Record your welcome video"
                description="Due Monday"
                trailing={<Badge tone="success">Done</Badge>}
              />
              <ListItem
                leading={<Target className="size-5 text-brand-text" aria-hidden />}
                title="Write your offer in one sentence"
                description="Due Wednesday"
                trailing={<Badge tone="brand">Next</Badge>}
              />
              <ListItem
                leading={<FileText className="size-5 text-ink-faint" aria-hidden />}
                title="Fill in the pricing worksheet"
                description="Due Friday"
                trailing={<Badge>To do</Badge>}
              />
            </List>
          </Card>
          <Card>
            <CardHeader title="Card with a form" description="Fields, a hint, an error and a footer." />
            <CardBody className="space-y-4">
              <Field label="Name" name="sg-name" placeholder="Jane Smith" />
              <Field label="Email" name="sg-email" type="email" defaultValue="jane@" error="That email is missing the part after @." />
              <Field label="Stage" name="sg-stage">
                <Select id="f-sg-stage" defaultValue="2">
                  <option value="1">Foundations</option>
                  <option value="2">Build</option>
                  <option value="3">Launch</option>
                </Select>
              </Field>
              <Field label="Notes" name="sg-notes" optional hint="Only you can see these.">
                <Textarea id="f-sg-notes" placeholder="How did the call go?" />
              </Field>
              <Checkbox label="Send me a reminder" defaultChecked />
            </CardBody>
            <CardFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <THead>
            <Th>Client</Th>
            <Th className="hidden sm:table-cell">Stage</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {[
              ["Amelia Hart", "amelia@example.com", "Build", "success", "On track"],
              ["Omar Siddiqui", "omar@example.com", "Foundations", "warning", "No check-in"],
              ["Lena Fischer", "lena@example.com", "Launch", "brand", "In progress"],
            ].map(([name, email, stage, tone, status]) => (
              <Tr key={email}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={name} email={email} size="sm" />
                    <div>
                      <p className="font-medium text-ink">{name}</p>
                      <p className="text-[13px]">{email}</p>
                    </div>
                  </div>
                </Td>
                <Td className="hidden sm:table-cell">{stage}</Td>
                <Td>
                  <Badge tone={tone as "success"} dot>
                    {status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section title="Feedback">
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert tone="success" title="Saved">Your changes are live.</Alert>
          <Alert tone="info" title="Heads up">Check-ins close on Sunday night.</Alert>
          <Alert tone="warning" title="No check-in this week">Omar hasn&apos;t checked in for 8 days.</Alert>
          <Alert tone="danger">That email and password don&apos;t match.</Alert>
        </div>
      </Section>

      <Section title="Empty state, dialog, avatars">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <EmptyState
            icon={<ClipboardList />}
            title="No actions yet"
            description="Actions you add for this client show up here."
            action={
              <Dialog
                title="Add an action"
                description="Your client sees it on their Actions page."
                trigger={
                  <Button size="sm">
                    <Plus aria-hidden /> Add action
                  </Button>
                }
              >
                <div className="space-y-4">
                  <Field label="What should they do?" name="sg-action" placeholder="Book your strategy call" />
                  <Field label="Due" name="sg-due" type="date" />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button>Add action</Button>
                  </div>
                </div>
              </Dialog>
            }
          />
          <Card>
            <CardBody className="space-y-5">
              <div className="flex items-end gap-3">
                <Avatar name="Amelia Hart" email="amelia@example.com" size="xs" />
                <Avatar name="Omar Siddiqui" email="omar@example.com" size="sm" />
                <Avatar name="Lena Fischer" email="lena@example.com" size="md" />
                <Avatar name="Priya Nair" email="priya@example.com" size="lg" />
                <Avatar name="Tom Okafor" email="tom@example.com" size="xl" />
              </div>
              <div className="flex items-center gap-3">
                <LogoMark size={40} />
                <p className="text-[13px] text-ink-muted">
                  Brand mark: public/brand logo, or a monogram from the portal name.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="Loading" description="Every page has a loading.tsx shaped like the real thing.">
        <StatsSkeleton />
        <ListSkeleton rows={3} className="mt-4" />
      </Section>
    </>
  );
}
