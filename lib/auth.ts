import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * The signed-in user and their profile. Cached per request, so calling it from
 * a layout and a page costs one round trip, not two.
 */
export const getViewer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as Profile | null };
});

/** For pages behind login. Sends anyone without a session to /login. */
export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer?.profile) redirect("/login");
  return viewer as { user: NonNullable<typeof viewer>["user"]; profile: Profile };
}

/** For admin-only pages and actions. Clients get bounced to the dashboard. */
export async function requireAdmin() {
  const viewer = await requireViewer();
  if (viewer.profile.role !== "admin") redirect("/dashboard");
  return viewer;
}
