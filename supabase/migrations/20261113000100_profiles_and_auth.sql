-- ============================================================================
-- Profiles + roles
--
-- Invite-only. Nobody can create an account unless their email is on
-- public.allowed_emails. The admin adds people there (from the portal, or with
-- `npm run admin -- you@example.com` / `npm run invite -- client@example.com`).
-- The role on the allowed_emails row ('admin' or 'client') becomes their role
-- when they sign up.
--
-- Every auth user gets one row in public.profiles, created by a trigger the
-- moment they sign up. The same trigger refuses anyone who isn't invited, so
-- the rule holds even if someone calls the Supabase API directly.
--
-- Security model:
--   * RLS is on. A user can read and edit their own profile. Admins can read all.
--   * Only admins can read or change allowed_emails.
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

-- ---------------------------------------------------------------------------
-- Allowed emails: the invite list
-- ---------------------------------------------------------------------------

create table public.allowed_emails (
  email       text primary key check (email = lower(btrim(email)) and email like '%_@_%'),
  role        public.user_role not null default 'client',
  full_name   text not null default '',
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.allowed_emails is 'Who may create an account, and with which role. Managed by the admin.';

alter table public.allowed_emails enable row level security;

revoke all on table public.allowed_emails from anon, authenticated;
grant select, insert, update, delete on table public.allowed_emails to authenticated;

create policy "Admins manage the invite list"
  on public.allowed_emails for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Create the profile when someone signs up, with the role they were invited
-- with. No invite = no account (the sign-up is rolled back).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.allowed_emails;
begin
  select * into invite
  from public.allowed_emails
  where email = lower(btrim(coalesce(new.email, '')));

  if not found then
    raise exception 'not_invited: % is not on the invite list', new.email
      using errcode = 'P0001';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), invite.full_name),
    invite.role
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
