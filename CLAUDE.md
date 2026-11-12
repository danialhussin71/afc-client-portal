# CLAUDE.md

You are building a **client portal** for a coach, consultant or small business owner. They are not a developer. They will watch you work and want plain answers, not jargon.

This repo is a working starter: Next.js 16 (App Router) + Supabase auth + Tailwind v4, with a full design system. Invite-only sign-up (only emails on the access list can create an account), sign-in, sign-out, a profiles table with roles, a sidebar app shell, a dashboard, an account page, an admin client list where the admin adds and removes people, and a live `/styleguide` already work. There is no landing page: `/` goes to sign-in. **Build on top of it. Don't rewrite what's here.**

**Read `DESIGN.md` before you build any page.** It says which component to use for what, the tokens, and the rules every page follows.

**Ambition:** build everything in the brief. Don't cut features, simplify the logic or leave "v2" stubs. If the brief is big, work through it feature by feature until all of it works. The bar is a product the client's own clients would pay for, and it has to look the part.

**When the brief and DESIGN.md disagree:** the brief decides colours, fonts, wording and content. `DESIGN.md` decides layout, the app shell and components. If a brand rule would change the layout or shell (a dark sidebar, a different nav), keep the design system's version and carry the brand through colours, fonts and logo instead. Tell the user in one line.

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
- `app/(auth)/Showcase.tsx` → rewrite the preview cards to show the portal's hero feature (its result, its number, its words). Keep the layout.

### 3. Install and set up Supabase
```bash
npm install
npm run setup
```
`npm run setup` finds `tokens.txt` (in `Desktop/AFC SAAS/` or the parent folder), creates the Supabase project, waits for it, fetches the URL + anon + service role keys, switches off email confirmation, applies the migrations and writes `.env.local`. It takes 2 to 4 minutes. **Don't do any of this by hand and don't call the Supabase API yourself.** If it fails, read its message: it says what to do. It is safe to run again.

### 4. Plan, then show the plan
The brief describes **features** (calculators, scorecards, trackers, builders, libraries, submit-and-review and more) and how they connect. Write a short plan and show it, then start building straight away:
- **Each feature:** its pages, what the client does, what they get back, and what the admin sees.
- **Tables:** name + columns, and who can read/write each one.
- **The client's home dashboard** and **the admin's view**, from the brief.

- **Build order:** shared tables and logic first, then the hero feature, then the features around it, then the home dashboard and the admin view that pull from all of them.

Build all of it. Don't wait for approval on details; make sensible choices and mention them.

### 5. Database changes
- Every new table goes in a **new** migration file: `supabase/migrations/<YYYYMMDDHHMMSS>_<what>.sql`, with a timestamp later than the existing ones. Never edit a migration that's already applied.
- Every table: `enable row level security` plus policies. Use the patterns below.
- Apply with `npm run db:push`. Fix and re-run if it errors.
- Add the new table's types to `lib/types.ts` (Row / Insert / Update) so queries are typed.

### 6. Build the features
Follow **Building features** below and `DESIGN.md`.
- New pages for signed-in users go in `app/(portal)/`. Add each one to `components/shell/nav.ts` (client pages in `MAIN_NAV`, admin pages in `ADMIN_NAV`) with a lucide icon.
- Build the hero feature first and make it excellent, then every other feature to the same standard. Wire up the connections between features the brief describes.
- Replace the placeholder cards on the client dashboard with the brief's **Home dashboard** (their latest result, their trend, their next move). Keep the admin dashboard's stats and the "Add a client" card, and add the brief's admin numbers.
- Every new route gets a `loading.tsx` skeleton, an empty state for each list, and an error message if a query fails.

### 7. Check it
```bash
npm run build
```
Must pass with no errors. The portal is invite-only, so give yourself test access first:
```bash
npm run admin -- test-admin@test.dev
npm run invite -- test-client@test.dev
```
Then `npm run dev`, open http://localhost:3000/signup, create both accounts and click through every page as each. Use each feature with the **worked examples from the brief** and check you get the same answers. If the brief's own maths is wrong (a target that wouldn't reach the goal, an example that doesn't add up), fix it, keep the owner's intent, and tell the user what you changed. Fix what's broken. When you're done testing, remove the test accounts so the user starts clean:
```bash
npm run access -- remove test-admin@test.dev
npm run access -- remove test-client@test.dev
```

### 7b. Polish pass
Go through every screen once more against **Make it beautiful** below, in light and dark mode and at 375px wide. This step is not optional.

### 8. Put it live
```bash
npm run deploy
```
Creates the Vercel project, copies the keys over, deploys and prints the live URL.

### 9. Make the user the admin
Nobody can sign up yet: the portal is invite-only and the access list is empty. **Ask the user: "Which email should be the admin of your portal?"** and wait for their answer. Then run:
```bash
npm run admin -- their@email.com
```
Give them the live link and tell them, in plain words:
1. Open `<live URL>/signup` and create your account with that email. You're the admin.
2. To let a client in, go to **Clients → Add client** (or the "Add a client" card on the dashboard), enter their email, then send them your sign-up link. Only emails you add can create an account.

## Building features

The point of this portal is tools the client uses on their own, built on the owner's method. They must feel like a real product, not a form.

**Logic lives in one place, as plain functions.** Put each feature's maths, scoring and templates in `lib/features/<feature>.ts`: typed, pure functions with no database or React in them (`calculatePrice(inputs)`, `scoreAssessment(answers)`, `buildPlan(answers)`). Copy formulas, weights, bands and result text from the brief exactly. Never invent the owner's method; if the brief is missing a number, ask.

**Patterns by type**
| Type | Client experience | Saved | Admin sees |
| --- | --- | --- | --- |
| Calculator | Inputs on the left, live result on the right (a Client Component that recalculates as they type). A "Save this" button stores a snapshot. | Each saved run: inputs + outputs as `jsonb`, plus the key number as a column | Each client's latest result |
| Scorecard | One question per step with a progress bar, then a result page: `ScoreMeter`, the band's text and next steps, and a breakdown per area (`BarChart`). Can retake. | Each attempt: answers `jsonb`, total score, band, per-area scores | Every client's latest score and band, lowest first |
| Tracker | A quick "log today/this week" form at the top, then a `LineChart` (with goal), streak and stats (`StatCard` with `trendline`), then history. | One row per entry: date + value(s), unique per client per day/week | Clients' trends, flag who stopped logging |
| Builder | Step-by-step prompts, then a formatted document (`prose-portal`) with Copy and Print (`window.print()`; the shell hides when printing). Can edit and rebuild. | Answers `jsonb` + the generated text | Each client's latest document |
| Library | Search + filter chips by situation/stage, cards that open a detail page. | Admin-managed content table | Add, edit, publish items |
| Submit and review | Client submits work, sees status (`Badge`) and the admin's feedback. | Submissions (client-owned) + feedback (admin-written) | Review queue, reply, set status |

**Make it feel good**
- Instant feedback: calculators update as you type; scorecards move one step at a time; trackers show the new point straight after saving.
- Show the result big (`font-display`, the brand colour, a chart), then explain it in the owner's words.
- Every feature has a first-run empty state that explains what it does and gets them started in one click.
- Numbers: `tabular-nums`, formatted with `Intl.NumberFormat` (currency/units from the brief).
- Charts: `LineChart`, `BarChart`, `Sparkline`, `ScoreMeter` from `@/components/ui`. No chart libraries. If a feature needs a chart the kit doesn't have (several lines, grouped bars, a pace line, target markers), extend `components/ui/Chart.tsx` in the same style and add it to `/styleguide`.

**Make it beautiful**
- Each screen has one hero element: the result, the number or the chart that matters, big (`font-display`, 3xl to 5xl), with room around it. Everything else is quieter.
- Clear hierarchy: `PageHeader`, then the hero card, then supporting cards in a grid. Group related things in one card instead of many small ones.
- Generous, consistent spacing (the 4px scale: gaps of 4, 6, 8; card padding 5 to 8). Align everything to the same grid.
- Use the brand colour sparingly so it means something: the main action, the key number, progress, the active state.
- Motion with meaning: `animate-rise` on cards as a page loads (stagger 40 to 60ms), numbers and charts that update instantly as inputs change, a clear success state after saving.
- Status in words and colour (`Badge` with `dot`), never colour alone.
- Every list, chart and result has a designed empty state that tells a new client what to do first.
- Check both themes and phone width on every screen. No sideways scrolling, nothing cramped, nothing clipped.
- Interactive pieces are small Client Components; the page around them stays a Server Component that loads the saved data.

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

-- Client submits, admin reviews (feedback lives in its own admin-written table)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  title text not null,
  body text not null,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  created_at timestamptz not null default now()
);
create index submissions_user_id_idx on public.submissions (user_id);
alter table public.submissions enable row level security;
create policy "Clients read and add their own" on public.submissions
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Clients submit" on public.submissions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Admins set status" on public.submissions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.submission_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index submission_feedback_submission_id_idx on public.submission_feedback (submission_id);
alter table public.submission_feedback enable row level security;
create policy "Owner of the submission and admins read feedback" on public.submission_feedback
  for select to authenticated using (
    (select public.is_admin())
    or exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = (select auth.uid()))
  );
create policy "Admins write feedback" on public.submission_feedback
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
```
- Always wrap `auth.uid()` and `is_admin()` in `(select ...)` in policies (it's much faster).
- Index every foreign key column.
- `public.is_admin()` already exists. Roles are `admin` and `client` on `public.profiles`.
- Access is invite-only: `public.allowed_emails` (email, role, full_name) is the list of who may sign up. A trigger refuses sign-ups from any other email and gives new users the role on their invite. Admins manage it from `/admin`; from the terminal use `npm run admin` / `npm run invite` / `npm run access`.
- Feature tables reference `public.profiles (id) on delete cascade`, so removing someone's access also removes their data.

**Don't**
- Don't turn email confirmation back on, add OAuth providers, or add payments unless the brief asks and the user confirms.
- Don't add big dependencies (UI kits, ORMs, state libraries, animation libraries, chart libraries). Build on the design system.
- Don't add a landing page. `/` goes to sign-in; the sign-in brand panel is the first impression.
- Don't open up sign-up. The portal is invite-only; never remove the `allowed_emails` check.
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
| `npm run admin -- you@example.com` | Give an email admin access (they can then sign up) |
| `npm run invite -- client@example.com` | Give an email client access |
| `npm run access -- list` | Show everyone with access and whether they've joined |
| `npm run access -- remove someone@example.com` | Take access away (deletes their account and data) |

## If something breaks
- **"Missing NEXT_PUBLIC_SUPABASE_URL"**: run `npm run setup`, then restart `npm run dev`.
- **Supabase won't create a project**: the free plan allows 2 active projects. The user pauses or deletes one at supabase.com/dashboard, then run `npm run setup` again.
- **Migration error**: read the SQL error, fix the new migration file, `npm run db:push`.
- **Deploy build fails**: run `npm run build` locally, fix the error, `npm run deploy` again.
- **"That email doesn't have access yet"**: the email isn't on the access list. `npm run admin -- email` or `npm run invite -- email`, then sign up again.
- **Live site asks for a Vercel login**: Vercel project → Settings → Deployment Protection → off for production.
