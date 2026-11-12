"use client";

import * as React from "react";
import { useActionState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Alert, Button, Dialog, Field, Select, SubmitButton } from "@/components/ui";
import { addAccess, removeAccess, type AccessState } from "./actions";

/**
 * Add an email to the invite list. Used on the admin dashboard (inline) and on
 * the Clients page (in a dialog). `showRole` lets the admin add another admin.
 */
export function AddAccessForm({ showRole = false, onDone }: { showRole?: boolean; onDone?: () => void }) {
  const [state, action] = useActionState<AccessState, FormData>(addAccess, null);

  React.useEffect(() => {
    if (state?.success && onDone) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="off"
        placeholder="client@example.com"
        defaultValue={state?.email}
        required
      />
      <Field label="Name" name="full_name" optional placeholder="Jane Smith" defaultValue={state?.fullName} autoComplete="off" />
      {showRole && (
        <Field label="Access" name="role" hint="Admins see every client and can add people.">
          <Select id="f-role" name="role" defaultValue="client" aria-describedby="f-role-hint">
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
      )}
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      <SubmitButton className="w-full" pendingText="Adding…">
        <UserPlus aria-hidden />
        Give access
      </SubmitButton>
    </form>
  );
}

/** "Add client" button that opens the form in a dialog. */
export function AddAccessDialog() {
  return (
    <Dialog
      trigger={
        <Button>
          <UserPlus aria-hidden />
          Add client
        </Button>
      }
      title="Add a client"
      description="Only people you add can create an account. Send them your sign-up link after."
      size="sm"
    >
      {(close) => <AddAccessForm showRole onDone={close} />}
    </Dialog>
  );
}

/** Remove someone's access, with a confirmation step. */
export function RemoveAccessButton({ email, name, joined }: { email: string; name: string; joined: boolean }) {
  return (
    <Dialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${name || email}`}>
          <Trash2 aria-hidden />
        </Button>
      }
      title={joined ? `Remove ${name || email}?` : `Cancel the invite for ${email}?`}
      description={
        joined
          ? "They won't be able to sign in any more, and everything they've saved in the portal is deleted. This can't be undone."
          : "They won't be able to create an account. You can add them again any time."
      }
      size="sm"
    >
      {(close) => (
        <form action={removeAccess} className="flex justify-end gap-2">
          <input type="hidden" name="email" value={email} />
          <Button type="button" variant="secondary" onClick={close}>
            Keep
          </Button>
          <SubmitButton variant="danger" pendingText="Removing…">
            {joined ? "Remove" : "Cancel invite"}
          </SubmitButton>
        </form>
      )}
    </Dialog>
  );
}
