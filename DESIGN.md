# DESIGN.md

The portal's design system. Every page is built from these pieces, so the whole product looks like one thing. **Open `/styleguide` (signed in as admin) to see every component live.**

---

## 1. Re-brand in three files

| What | Where | Notes |
| --- | --- | --- |
| Colours | `app/brand.css` | `--brand` (main colour), `--brand-ink` (text on it), `--brand-text` (brand as text on white), `--brand-text-dark` (brand as text in dark mode). |
| Name, words, logo paths | `lib/brand.ts` | Portal name, tagline, owner, sign-in panel headline/subline/quote, logo file paths. |
| Fonts | `app/fonts.ts` | Any Google Font via `next/font/google`. Keep the three `variable` names. |
| Logo files | `public/brand/` | `mark.svg` or `.png` (square icon) and optionally `logo.svg` (wide). Set the paths in `lib/brand.ts`. |

Rules for brand colours:
- `--brand-ink` must reach 4.5:1 contrast on `--brand`. Dark or saturated brand: `#ffffff`. Light brand (yellow, mint, pastel): `#0b0b0c`.
- If the brand is light, set `--brand-text` to a darker shade of it that reaches 4.5:1 on white.
- `--brand-text-dark` is a lighter shade that reads on near-black.
- The brand colour is an **accent**. It's used for the primary button, active nav, links, progress and the sign-in panel. Never for large backgrounds inside the app, and never for body text.

## 2. Tokens (use the utilities, never hex codes)

**Surfaces:** `bg-canvas` (app background, sidebar), `bg-surface` (content panel, cards), `bg-raised` (hover, chips), `bg-sunken` (tracks, wells).
**Lines:** `border-line`, `border-line-soft` (dividers inside cards), `border-line-strong` (hover).
**Text:** `text-ink` (primary), `text-ink-muted` (secondary), `text-ink-faint` (meta, hints, at least 4.5:1).
**Brand:** `bg-brand`, `text-on-brand`, `text-brand-text`, `bg-brand-wash`, `bg-brand-soft`, `ring-brand-line`, `hover:bg-brand-hover`.
**Status:** `success`, `warning`, `danger`, `info`, each with a `-wash` background. Always pair colour with an icon or a word.
**Radius:** `rounded-lg` controls (12px), `rounded-xl` cards (16px), `rounded-2xl` dialogs and panels, `rounded-full` badges/avatars.
**Shadow:** `shadow-xs` cards, `shadow-md` popovers, `shadow-lg` dialogs/menus.
**Motion:** `animate-rise` for things that appear. 150 to 300ms, ease-out, transform/opacity only. Reduced motion is respected globally.

Light and dark mode both work automatically when you only use these. Check both.

## 3. Type

| Role | Classes |
| --- | --- |
| Page title | `<PageHeader title>`: 28px semibold, tight tracking |
| Section title | `<Section title>` or `<CardHeader title>`: 15 to 16px semibold |
| Body | 15px `text-ink-muted` (default body size) |
| Meta | 13px `text-ink-faint` |
| Label | `<Eyebrow>`: mono 11px uppercase, wide tracking |
| Numbers | `tabular-nums`; big numbers use `font-display text-3xl font-semibold` |

## 4. Layout

- **Shell** (`app/(portal)/layout.tsx`): vertical sidebar on the canvas, the page in a raised panel beside it. Phones get a top bar and a drawer. Don't change it per page.
- **Nav** lives in `components/shell/nav.ts`. `MAIN_NAV` is for everyone, `ADMIN_NAV` for the admin. Every item has an icon (lucide) and a label.
- **Page anatomy:** `<PageHeader>` (title, one-line description, at most one primary action) → content in `<Card>`s or `<Section>`s → nothing else.
- **Grids:** stats `grid gap-4 sm:grid-cols-3`; main + side `grid gap-6 lg:grid-cols-3` with `lg:col-span-2`; add `items-start` when cards differ in height.
- Content width is capped by the shell (`max-w-6xl`). Long text uses `prose-portal`.
- Mobile first. No sideways scrolling at 375px. Tap targets at least 40px (controls are 40 to 44px tall already).

## 5. Components (`@/components/ui`)

| Need | Use |
| --- | --- |
| Page top | `PageHeader` (`eyebrow`, `title`, `description`, `actions`) |
| Group of content | `Card` + `CardHeader` (`title`, `description`, `icon`, `action`) + `CardBody` / `CardFooter` |
| Titled area without a card | `Section` |
| A key number | `StatCard` (`label`, `value`, `note`, `icon`, `trend`, `trendline`) |
| Progress | `ProgressBar`, `ProgressRing` (value 0 to 1) |
| Charts | `LineChart` (trend, optional `goal`), `BarChart` (compare, optional `highlight`), `Sparkline` (or `StatCard trendline`), `ScoreMeter` (score on bands). Always pass `summary` with the key point for screen readers |
| Rows of things | `List` + `ListItem` (`leading`, `title`, `description`, `trailing`) |
| Tabular data | `Table`, `THead`, `Th`, `TBody`, `Tr`, `Td`. Hide minor columns on phones with `hidden md:table-cell` |
| Status | `Badge` (`tone`, `dot`) |
| People | `Avatar` (`name`, `email`, `src`, `size`) |
| Buttons | `Button`, `ButtonLink`, `SubmitButton` (forms), `buttonClass()` for links. Variants: primary, secondary, outline, ghost, danger |
| Forms | `Field` (label + hint + error, wired for screen readers), `Input`, `Textarea`, `Select`, `Checkbox`, `PasswordInput` |
| Messages | `Alert` (`tone`, `title`) |
| Nothing there yet | `EmptyState` (`icon`, `title`, `description`, `action`) |
| Pop-up form | `Dialog` (`trigger`, `title`, `description`). Children can be a function `(close) => ...` when used inside a Client Component |
| Copy a link | `CopyButton` |
| Loading | `Skeleton`, `HeaderSkeleton`, `StatsSkeleton`, `ListSkeleton`, `CardSkeleton`, `PageSkeleton` |
| Theme | `ThemeToggle` |
| Brand | `Logo`, `LogoMark` from `@/components/brand/Logo` |

If you need something that isn't here, build it in `components/ui/` from the same tokens, export it from `components/ui/index.ts` and add it to `/styleguide`.

## 6. Every page must have

1. A `loading.tsx` shaped like the page (use the skeletons).
2. An empty state for every list: what goes here and how to add the first one.
3. An error message if a query fails. Never a blank screen.
4. One primary action at most. The rest are secondary or ghost.
5. Icons from `lucide-react` only. No emoji as icons.
6. Plain, friendly words in the client's language (from the brief). No lorem ipsum, no "Stage 1" placeholders.

## 7. Don't

- Don't use hex codes, `bg-white`, `text-gray-*` or `bg-blue-*` in components. Use tokens. (The avatar tints and the sign-in `Showcase` cards are deliberate exceptions.)
- Don't add UI kits (shadcn, MUI, Chakra), icon packs or animation libraries.
- Don't put the brand colour behind large blocks of text inside the app.
- Don't add gradients, glows or glass effects beyond `brand-glow` on a hero card.
- Don't change the shell, the sign-in layout or the tokens per page.
