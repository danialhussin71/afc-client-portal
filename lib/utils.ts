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

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
