# CLAUDE.md

You are building a **client portal** for a coach, consultant or small business owner. They are not a developer. They will watch you work and want plain answers, not jargon.

This repo is a working starter: Next.js 16 (App Router) + Supabase auth + Tailwind v4, with a full design system. Sign-up, sign-in, sign-out, a profiles table with roles, a sidebar app shell, a dashboard, an account page, an admin client list and a live `/styleguide` already work. There is no landing page: `/` goes to sign-in. **Build on top of it. Don't rewrite what's here.**

**Read `DESIGN.md` before you build any page.** It says which component to use for what, the tokens, and the rules every page follows.

---

## Build from the brief (the session flow)

When the user asks you to build their portal, do these steps in order. Tell them in one short line what you're doing at each step.

### 1. Read everything first
- Read `BRIEF.md` in full. That's what the portal is for. If it's still the placeholder, stop and ask the user for their brief.
- Read this file and skim `app/`, `lib/` and `supabase/migrations/` so you know what already exists.

### 2. Name it and brand it
The brief has a **Brand kit** section. Apply it exactly (see `DESIGN.md` §1):
- `package.json` → `name`: a short lowercase slug of the portal name (letters, numbers, hyphens, e.g. `bright-path-portal`). The Supabase and Vercel projects use this name.
- `lib/brand.ts` → name, tagline, description, owner, and the sign-in panel words (`auth.headline`, `auth.subline`, `auth.quote` if the brief has a real client quote, else `null`).
- `app/brand.css` → the brand colours. Work out `--brand-ink`, `--brand-text` and `--brand-text-dark` so they reach 4.5:1 contrast.
- `app/fonts.ts` → the brand fonts if they're on Google Fonts. If not, pick the closest Google Font and say which.
- Logo: if there's a `brand` folder next to this repo (`../brand/`), copy the logo files into `public/brand/` and set the paths in `lib/brand.ts` (`mark` = square icon, `full` = wide logo, `fullOnDark` = light version). Look at each image first to tell which is which. No files → leave them `null`; the monogram is used.
- `app/(auth)/Showcase.tsx` → change the preview words to match the portal (its stage names, its tracked number).

### 3. Install and set up Supabase
```bash
npm install
npm run setup
```
`npm run setup` finds `tokens.txt` (in `Desktop/AFC SAAS/` or the parent folder), creates the Supabase project, waits for it, fetches the URL + anon + service role keys, switches off email confirmation, applies the migrations and writes `.env.local`. It takes 2 to 4 minutes. **Don't do any of this by hand and don't call the Supabase API yourself.** If it fails, read its message: it says what to do. It is safe to run again.

### 4. Plan, then show the plan
From the brief, write a short plan and show it to the user before you build:
- **Pages** (v1 is at most 5 new pages, keep it small enough to finish in the session)
- **Tables** (name + columns, and who can read/write each one)
- **What the admin can do** vs **what a client can do**

Then build it. Don't wait for approval on small details; make sensible choices and mention them.

### 5. Database changes
- Every new table goes in a **new** migration file: `supabase/migrations/<YYYYMMDDHHMMSS>_<what>.sql`, with a timestamp later than the existing ones. Never edit a migration that's already applied.
- Every table: `enable row level security` plus policies. Use the patterns below.
- Apply with `npm run db:push`. Fix and re-run if it errors.
- Add the new table's types to `lib/types.ts` (Row / Insert / Update) so queries are typed.

### 6. Build the pages
- New pages for signed-in users go in `app/(portal)/`. Add each one to `components/shell/nav.ts` (client pages in `MAIN_NAV`, admin pages in `ADMIN_NAV`) with a lucide icon.
- Build every page from `@/components/ui` following `DESIGN.md`. Replace the placeholder cards on the client dashboard with the real thing (their progress, next step, latest note). Keep the admin dashboard's stats and invite card, and add the brief's admin numbers.
- Every new route gets a `loading.tsx` skeleton, an empty state for each list, and an error message if a query fails.

### 7. Check it
```bash
npm run build
```
Must pass with no errors. Then `npm run dev`, open http://localhost:3000, sign up (the first account becomes admin) and click through every page. Fix what's broken.

### 8. Put it live
```bash
npm run deploy
```
Creates the Vercel project, copies the keys over, deploys and prints the live URL. Give the user the link and tell them: sign up on the live site first (that makes them the admin), then try a second account in a private window to see the client view.

---

## Conventions

**Data and security**
- Pages are Server Components and read data with `createClient()` from `lib/supabase/server.ts`. That client acts as the signed-in user, so RLS protects everything.
- Get the user with `requireViewer()` / `requireAdmin()` from `lib/auth.ts`. Admin pages call `requireAdmin()`.
- Writes are Server Actions (`"use server"`) in an `actions.ts` next to the page. Validate input on the server. Return `{ error }` / `{ success }` and show it with `useActionState`. Call `revalidatePath` after a write.
- `lib/supabase/admin.ts` (service role) **bypasses RLS**. Only use it in server code after `requireAdmin()`, and only when RLS genuinely can't express the rule. Never import it in a Client Component. Never put the service role key in anything prefixed `NEXT_PUBLIC_`.
- Never commit `.env.local` or `tokens.txt`. Never print keys or tokens in chat.

**UI** (full rules in `DESIGN.md`)
- Import components from `@/components/ui`. Check `/styleguide` for what exists before making anything new.
- Colours only through tokens (`bg-surface`, `text-ink-muted`, `bg-brand` ...). No hex codes or Tailwind palette colours in components.
- To make a `<Link>` look like a button use `ButtonLink` or `buttonClass()`.
- Form submits use `SubmitButton` (pending state, no double clicks).
- Mobile first: check every page at 375px wide, in light and dark mode.
- Words on screen: short, plain, friendly, in the tone from the brief. No jargon, no lorem ipsum.

**RLS patterns** (copy these)
```sql
-- A table where each client owns their own rows
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  note text not null,
  created_at timestamptz not null default now()
);
create index check_ins_user_id_idx on public.check_ins (user_id);
alter table public.check_ins enable row level security;

create policy "Clients manage their own check-ins" on public.check_ins
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Admins read all check-ins" on public.check_ins
  for select to authenticated
  using ((select public.is_admin()));

-- Content the admin publishes and every client can read
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  created_at timestamptz not null default now()
);
alter table public.resources enable row level security;

create policy "Signed-in users read resources" on public.resources
  for select to authenticated using (true);

create policy "Admins manage resources" on public.resources
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
```
- Always wrap `auth.uid()` and `is_admin()` in `(select ...)` in policies (it's much faster).
- Index every foreign key column.
- `public.is_admin()` already exists. Roles are `admin` and `client` on `public.profiles`. The first sign-up is the admin.

**Don't**
- Don't turn email confirmation back on, add OAuth providers, or add payments unless the brief asks and the user confirms.
- Don't add big dependencies (UI kits, ORMs, state libraries, animation libraries). The starter has what v1 needs.
- Don't add a landing page. `/` goes to sign-in; the sign-in brand panel is the first impression.
- Don't change the auth flow, `proxy.ts`, the app shell or the profiles migration unless something is broken.

---

## Commands
| Command | What it does |
| --- | --- |
| `npm run setup` | Create/reuse the Supabase project, keys to `.env.local`, apply migrations |
| `npm run db:push` | Apply new migrations only |
| `npm run dev` | Run locally at http://localhost:3000 |
| `npm run build` | Production build. Must pass before deploying |
| `npm run deploy` | Deploy to the user's Vercel and print the live URL |

## If something breaks
- **"Missing NEXT_PUBLIC_SUPABASE_URL"**: run `npm run setup`, then restart `npm run dev`.
- **Supabase won't create a project**: the free plan allows 2 active projects. The user pauses or deletes one at supabase.com/dashboard, then run `npm run setup` again.
- **Migration error**: read the SQL error, fix the new migration file, `npm run db:push`.
- **Deploy build fails**: run `npm run build` locally, fix the error, `npm run deploy` again.
- **Live site asks for a Vercel login**: Vercel project → Settings → Deployment Protection → off for production.
