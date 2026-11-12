import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--color-muted)]">It takes 20 seconds. No email confirmation needed.</p>
      <AuthForm mode="signup" />
    </>
  );
}
