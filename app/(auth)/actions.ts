"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * `email` / `fullName` are sent back so the form can refill them. React 19
 * resets a form after its action runs, and nobody wants to retype their email
 * because they mistyped the password.
 */
export type AuthState = { error?: string; notice?: string; email?: string; fullName?: string } | null;

const MIN_PASSWORD = 8;

/** Only ever redirect to a path on this site, never to a URL someone typed in. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      return { error: "That email and password don't match. New here? Create an account instead.", email };
    }
    return { error: error.message, email };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const keep = { email, fullName };
  if (!fullName || !email || !password) return { error: "Fill in your name, email and a password.", ...keep };
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters for your password.`, ...keep };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      return { error: "There's already an account with that email. Sign in instead.", ...keep };
    }
    return { error: error.message, ...keep };
  }

  // Email confirmation is switched off by `npm run setup`, so Supabase hands
  // back a session straight away. If someone turned confirmation back on,
  // there's no session yet: tell them to check their inbox instead of failing.
  if (!data.session) {
    return { notice: "Check your email to confirm your account, then sign in.", ...keep };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
