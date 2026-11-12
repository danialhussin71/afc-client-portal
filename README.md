# Client Portal Starter

A starter for a private, invite-only client portal: you add your clients' emails, they sign up and see their own space. You're the admin.

Built with **Next.js 16**, **Supabase** (auth + Postgres) and **Tailwind CSS v4**. Made for the AFC SaaS session by Purely Personal.

## What's already done

- Email + password sign-up and sign-in, **no email confirmation** (people go straight in)
- **Invite-only**: only emails on the access list (`allowed_emails`) can create an account. The admin adds people from the Clients page, or with `npm run admin -- you@example.com` / `npm run invite -- client@example.com`
- `profiles` table with roles (**admin** or **client**, set by the invite)
- Row level security on every table, with admin and client policies
- No landing page: the portal opens on a branded sign-in page
- A full design system (`DESIGN.md`): tokens, light and dark mode, buttons, forms, cards, stats, progress, tables, badges, dialogs, empty states and skeletons. See it live at `/styleguide`
- Sidebar app shell with a phone drawer, user menu and theme switch
- Protected pages: dashboard (admin and client views), account settings, admin client list with search
- Loading skeletons on every page, empty states, error page, 404
- Re-brand in three files: `app/brand.css` (colours), `lib/brand.ts` (name, words, logo) and `app/fonts.ts` (fonts), plus logo files in `public/brand/`
- Two scripts that do the setup for you:
  - `npm run setup` creates your Supabase project, gets the keys, switches off email confirmation and sets up the database
  - `npm run deploy` puts it live on your Vercel account

## Use it with Claude Code

1. Put your `tokens.txt` (with `VERCEL_TOKEN` and `SUPABASE_ACCESS_TOKEN`) in `Desktop/AFC SAAS/`.
2. Clone this repo into `Desktop/AFC SAAS/`.
3. Replace `BRIEF.md` with your portal brief. Put your logo files in `Desktop/AFC SAAS/brand/`.
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
| `components/ui/` | The design system (import from `@/components/ui`) |
| `components/shell/` | Sidebar, phone drawer, user menu. Nav items in `nav.ts` |
| `app/brand.css`, `lib/brand.ts`, `app/fonts.ts` | Brand colours, words and logo, fonts |
| `DESIGN.md` | Design rules and which component to use when |
| `lib/supabase/` | Supabase clients: server, browser, admin (service role) |
| `lib/auth.ts` | `requireViewer()` and `requireAdmin()` |
| `supabase/migrations/` | Database tables and security rules |
| `scripts/` | The setup and deploy scripts |
| `proxy.ts` | Keeps sessions fresh and sends signed-out people to /login |

## License

MIT
