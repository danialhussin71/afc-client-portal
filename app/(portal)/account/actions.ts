"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireViewer } from "@/lib/auth";

export type AccountState = { error?: string; success?: string } | null;

export async function updateProfile(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const { user } = await requireViewer();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!fullName) return { error: "Your name can't be empty." };
  if (fullName.length > 120) return { error: "That name is too long." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);

  if (error) return { error: "Couldn't save. Try again." };

  revalidatePath("/", "layout");
  return { success: "Saved." };
}
