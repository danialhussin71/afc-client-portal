"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { brand } from "@/lib/brand";

/**
 * `email` / `fullName` are sent back so the form can refill them. React 19
 * resets a form after its action runs, and nobody wants to retype their email
 * because they mistyped the password.
 */
export type AuthState = { error?: string; notice?: string; email?: string; fullName?: string } | null;

const MIN_PASSWORD = 8;
const NOT_INVITED = `That email doesn't have access yet. Ask ${brand.owner} to add it, then try again.`;

/** Is this email on the invite list? (The database enforces it too; this is for a friendly message.) */
async function isInvited(email: string) {
  const { data, error } = await createAdminClient().from("allowed_emails").select("email").eq("email", email).maybeSingle();
  return error ? null : Boolean(data);
}

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
      const invited = await isInvited(email);
      if (invited === false) return { error: NOT_INVITED, email };
      return { error: "That email and password don't match. First time here? Create your account instead.", email };
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

  if ((await isInvited(email)) === false) return { error: NOT_INVITED, ...keep };

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
    // The database trigger refused it: the email isn't on the invite list.
    if (/database error|not_invited/i.test(error.message)) return { error: NOT_INVITED, ...keep };
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
