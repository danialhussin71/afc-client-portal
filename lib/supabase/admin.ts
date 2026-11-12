import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * Service-role client. BYPASSES RLS.
 * Server only (the import above makes the build fail if a Client Component
 * pulls this in). Only use it after you have checked the caller is an admin.
 */
export function createAdminClient() {
  return createClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
