/**
 * Typefaces. Swap these for the brand fonts (any Google Font works:
 * import it from "next/font/google" and keep the same `variable` names).
 *
 * - sans:    body text and UI
 * - display: headings (can be the same as sans)
 * - mono:    numbers, labels, code
 */
import { Geist, Geist_Mono } from "next/font/google";

export const sans = Geist({ subsets: ["latin"], variable: "--font-sans-src", display: "swap" });
export const display = Geist({ subsets: ["latin"], variable: "--font-display-src", display: "swap", weight: ["500", "600", "700"] });
export const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-src", display: "swap" });

export const fontVariables = [sans.variable, display.variable, mono.variable].join(" ");
