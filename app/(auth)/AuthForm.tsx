"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Card";
import { signIn, signUp, type AuthState } from "./actions";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, null);
  const isLogin = mode === "login";

  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {!isLogin && (
        <Field label="Full name" name="full_name" autoComplete="name" defaultValue={state?.fullName} required />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        defaultValue={state?.email}
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        hint={isLogin ? undefined : "At least 8 characters."}
        required
        minLength={isLogin ? undefined : 8}
      />

      {state?.error && <Alert>{state.error}</Alert>}
      {state?.notice && <Alert tone="success">{state.notice}</Alert>}

      <SubmitButton className="h-11 w-full" pendingText={isLogin ? "Signing in…" : "Creating your account…"}>
        {isLogin ? "Sign in" : "Create account"}
      </SubmitButton>

      <p className="text-center text-sm text-[var(--color-muted)]">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-[var(--color-brand)] hover:underline">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
