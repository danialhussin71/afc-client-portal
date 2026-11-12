/**
 * Database types. Hand-written for the starter tables.
 * When you add a table, add it here too (or generate with:
 * `npx supabase gen types typescript --project-id <ref> > lib/database.types.ts`).
 */
export type UserRole = "admin" | "client";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: never;
        Update: Partial<Pick<Profile, "full_name" | "avatar_url">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { user_role: UserRole };
    CompositeTypes: Record<string, never>;
  };
};
