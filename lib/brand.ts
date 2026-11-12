/**
 * The portal's identity. Change this, app/brand.css (colours) and app/fonts.ts
 * (typefaces) to re-brand everything. Logo files go in public/brand/.
 */
export const brand = {
  /** Full portal name: browser tab, sidebar, sign-in page. */
  name: "Client Portal",
  /** Short line under the name. */
  tagline: "Everything for our work together, in one place.",
  /** Used for search engines and link previews. */
  description: "Sign in to see your plan, your progress and your next step.",
  /** The business behind the portal, shown in small print. */
  owner: "Your Business",

  /**
   * Logo files in public/brand/. Leave null to use a monogram built from the
   * name in the brand colour.
   * - mark: square icon (sidebar, favicon-sized spots). SVG or PNG.
   * - full: wide logo with the wordmark. Shown on the sign-in page if set.
   * - fullOnDark: a light version of the wide logo for dark backgrounds.
   */
  logo: {
    mark: null as string | null,
    full: null as string | null,
    fullOnDark: null as string | null,
  },

  /** The brand panel on the sign-in and sign-up pages. */
  auth: {
    headline: "Your work, your progress, all in one place.",
    subline: "Sign in to pick up where you left off.",
    /** Optional client quote. Set to null to hide it. */
    quote: null as null | { text: string; name: string; role?: string },
  },
};

/** Two-letter monogram from the brand name, for when there's no logo file. */
export function monogram(name = brand.name) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
}
