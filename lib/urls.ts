import "server-only";
import { headers } from "next/headers";

/** The full sign-up URL for this site (works locally and on the live domain). */
export async function signupUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/signup`;
}
