import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">Create your account</h1>
        <p className="mt-2 text-[15px] text-ink-muted">Join {brand.name}. It takes a minute.</p>
      </div>
      <AuthForm mode="signup" />
    </>
  );
}
