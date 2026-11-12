"use client";

import { useActionState } from "react";
import { Alert, Avatar, Card, CardBody, CardFooter, Field, SubmitButton } from "@/components/ui";
import { updateProfile, type AccountState } from "./actions";

export function AccountForm({ fullName, email, avatarUrl }: { fullName: string; email: string; avatarUrl: string | null }) {
  const [state, action] = useActionState<AccountState, FormData>(updateProfile, null);

  return (
    <form action={action}>
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={state?.fullName ?? fullName} email={email} src={avatarUrl} size="lg" />
            <div className="text-[13px] text-ink-muted">Your initials are your picture.</div>
          </div>
          <Field
            label="Full name"
            name="full_name"
            defaultValue={state?.fullName ?? fullName}
            autoComplete="name"
            required
          />
          <Field label="Email" name="email" defaultValue={email} disabled hint="Your sign-in email can't be changed here." />
          {state?.error && <Alert tone="danger">{state.error}</Alert>}
          {state?.success && <Alert tone="success">{state.success}</Alert>}
        </CardBody>
        <CardFooter>
          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
