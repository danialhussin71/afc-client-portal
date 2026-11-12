# Client Portal Starter

A starter for a private client portal: your clients sign up, sign in and see their own space. You're the admin.

Built with **Next.js 16**, **Supabase** (auth + Postgres) and **Tailwind CSS v4**. Made for the AFC SaaS session by Purely Personal.

## What's already done

- Email + password sign-up and sign-in, **no email confirmation** (people go straight in)
- `profiles` table with roles: the **first** person to sign up is the **admin**, everyone after is a **client**
- Row level security on every table, with admin and client policies
- Protected pages: dashboard, account settings, admin client list
- Loading skeletons on every page, empty states, error page, 404
- Pending states on every form button
- One place to re-brand (`app/globals.css`) and rename (`lib/site.ts`)
- Two scripts that do the setup for you:
  - `npm run setup` creates your Supabase project, gets the keys, switches off email confirmation and sets up the database
  - `npm run deploy` puts it live on your Vercel account

## Use it with Claude Code

1. Put your `tokens.txt` (with `VERCEL_TOKEN` and `SUPABASE_ACCESS_TOKEN`) in `Desktop/AFC SAAS/`.
2. Clone this repo into `Desktop/AFC SAAS/`.
3. Replace `BRIEF.md` with your portal brief.
4. Open the folder in Claude Code and say: *"Read CLAUDE.md and build my portal from BRIEF.md."*

`CLAUDE.md` has the full playbook Claude follows.

## Do it by hand

Needs Node.js 20.9 or newer.

```bash
npm install
npm run setup      # Supabase project + keys + database
npm run dev        # http://localhost:3000
npm run deploy     # live on Vercel
```

## Where things are

| Path | What |
| --- | --- |
| `app/(auth)/` | Sign in, sign up, sign out |
| `app/(portal)/` | Pages for signed-in users (dashboard, account, admin) |
| `components/ui/` | Buttons, fields, cards, skeletons, empty states |
| `lib/supabase/` | Supabase clients: server, browser, admin (service role) |
| `lib/auth.ts` | `requireViewer()` and `requireAdmin()` |
| `lib/site.ts` | Portal name and tagline |
| `supabase/migrations/` | Database tables and security rules |
| `scripts/` | The setup and deploy scripts |
| `proxy.ts` | Keeps sessions fresh and sends signed-out people to /login |

## License

MIT
