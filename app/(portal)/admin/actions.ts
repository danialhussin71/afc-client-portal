"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

export type AccessState = { error?: string; success?: string; email?: string; fullName?: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Give someone access: they can now create an account with this email. */
export async function addAccess(_prev: AccessState, formData: FormData): Promise<AccessState> {
  const { user } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const role: UserRole = formData.get("role") === "admin" ? "admin" : "client";
  const keep = { email, fullName };

  if (!EMAIL.test(email)) return { error: "Enter a valid email address.", ...keep };

  const supabase = await createClient();
  const [{ data: invite }, { data: member }] = await Promise.all([
    supabase.from("allowed_emails").select("email").eq("email", email).maybeSingle(),
    supabase.from("profiles").select("id").eq("email", email).maybeSingle(),
  ]);
  if (member) return { error: `${email} already has an account.`, ...keep };
  if (invite) return { error: `${email} already has access. They just need to create their account.`, ...keep };

  const { error } = await supabase.from("allowed_emails").insert({ email, full_name: fullName, role, invited_by: user.id });
  if (error) return { error: "Couldn't add them. Try again.", ...keep };

  revalidatePath("/", "layout");
  return { success: `${fullName || email} can now create their account.` };
}

/**
 * Take someone's access away. If they already have an account, it's deleted
 * along with everything they saved (every table references profiles with
 * `on delete cascade`).
 */
export async function removeAccess(formData: FormData) {
  const { user, profile } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || email === profile.email) return;

  const supabase = await createClient();
  const { data: member } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();

  await supabase.from("allowed_emails").delete().eq("email", email);
  if (member && member.id !== user.id) {
    // Deleting a sign-in needs the service role. We've checked the caller is an admin above.
    await createAdminClient().auth.admin.deleteUser(member.id);
  }

  revalidatePath("/", "layout");
}
