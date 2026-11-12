import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** First name for greetings, falling back to the part of the email before @. */
export function firstName(fullName: string | null | undefined, email: string) {
  const name = (fullName ?? "").trim();
  if (name) return name.split(/\s+/)[0];
  return email.split("@")[0];
}

/** Up to two initials for avatars. */
export function initials(fullName: string | null | undefined, email = "") {
  const name = (fullName ?? "").trim();
  if (!name) return (email[0] ?? "?").toUpperCase();
  const parts = name.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** "just now", "3 days ago", "2 months ago". Falls back to a date after a year. */
export function timeAgo(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];
  let value = seconds;
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) return unit === "second" ? "just now" : rtf.format(-Math.round(value), unit);
    value /= size;
  }
  return formatDate(iso);
}

/** 0 to 100, rounded. */
export function pct(ratio: number) {
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}
