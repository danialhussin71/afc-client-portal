"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Feedback";
import { signIn, signUp, type AuthState } from "./actions";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, null);
  const isLogin = mode === "login";

  return (
    <form action={action} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {!isLogin && (
        <Field
          label="Full name"
          name="full_name"
          autoComplete="name"
          placeholder="Jane Smith"
          defaultValue={state?.fullName}
          required
        />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        defaultValue={state?.email}
        hint={isLogin ? undefined : "Use the email you were invited with."}
        required
      />
      <Field
        label="Password"
        name="password"
        hint={isLogin ? undefined : "At least 8 characters."}
      >
        <PasswordInput
          id="f-password"
          name="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={isLogin ? undefined : 8}
          aria-describedby={isLogin ? undefined : "f-password-hint"}
          required
        />
      </Field>

      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.notice && <Alert tone="success">{state.notice}</Alert>}

      <SubmitButton size="lg" className="w-full" pendingText={isLogin ? "Signing in…" : "Creating your account…"}>
        {isLogin ? "Sign in" : "Create account"}
        <ArrowRight aria-hidden />
      </SubmitButton>

      <p className="text-center text-sm text-ink-muted">
        {isLogin ? "First time here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-brand-text underline-offset-4 hover:underline">
          {isLogin ? "Create your account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
