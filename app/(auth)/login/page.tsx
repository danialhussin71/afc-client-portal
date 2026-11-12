import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-2 text-[15px] text-ink-muted">Sign in to {brand.name}.</p>
      </div>
      <AuthForm mode="login" next={next} />
    </>
  );
}
