"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Card";
import { updateProfile, type AccountState } from "./actions";

export function AccountForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action] = useActionState<AccountState, FormData>(updateProfile, null);

  return (
    <form action={action} className="max-w-md space-y-4">
      <Field label="Full name" name="full_name" defaultValue={fullName} autoComplete="name" required />
      <Field label="Email" name="email" defaultValue={email} disabled hint="Your sign-in email can't be changed here." />
      {state?.error && <Alert>{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}
