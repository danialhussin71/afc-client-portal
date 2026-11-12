-- ============================================================================
-- Profiles + roles
--
-- Every auth user gets one row in public.profiles, created by a trigger the
-- moment they sign up. The FIRST person to sign up becomes 'admin' (that's the
-- portal owner). Everyone after that is a 'client'.
--
-- Security model:
--   * RLS is on. A user can read and edit their own profile. Admins can read all.
--   * Users can only change full_name and avatar_url. Nobody can promote
--     themselves: the role column is not writable from the browser at all.
--     Role changes go through the server with the service role key.
-- ============================================================================

create type public.user_role as enum ('admin', 'client');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  avatar_url  text,
  role        public.user_role not null default 'client',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'One row per signed-up user. Created by the on_auth_user_created trigger.';

create index profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Is the current user an admin? security definer so it can read profiles
-- without tripping the RLS policies that call it (no recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Keep updated_at honest on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile when someone signs up. First user ever = admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_first boolean;
begin
  -- Serialise concurrent sign-ups so two people can't both become "first".
  lock table public.profiles in share row exclusive mode;
  select not exists (select 1 from public.profiles) into is_first;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when is_first then 'admin'::public.user_role else 'client'::public.user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Privileges: the browser may only ever touch these two columns.
-- ---------------------------------------------------------------------------

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- RLS policies
-- (select auth.uid()) is wrapped so Postgres evaluates it once per query,
-- not once per row.
-- ---------------------------------------------------------------------------

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Admins can read every profile"
  on public.profiles for select
  to authenticated
  using ((select public.is_admin()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
