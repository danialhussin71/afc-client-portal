#!/usr/bin/env node
// ============================================================================
// Who can get into the portal. It's invite-only: an email must be on the
// access list (public.allowed_emails) before that person can create an account.
//
//   npm run admin  -- you@example.com            give an email admin access
//   npm run invite -- client@example.com         give an email client access
//   npm run invite -- client@example.com --name "Jane Smith"
//   npm run access -- list                       show everyone with access
//   npm run access -- remove someone@example.com take access away (deletes
//                                                their account and data too)
//
// Uses the Supabase URL and service role key in .env.local (from npm run setup).
// Safe to run again: adding an email twice just updates it.
// ============================================================================
import { ENV_LOCAL, argValue, hasFlag, log, readEnvFile } from "./lib/env.mjs";

const env = readEnvFile(ENV_LOCAL);
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const SITE = (env.LIVE_URL || "http://localhost:3000").replace(/\/$/, "");

if (!URL || !KEY) log.fail(".env.local doesn't have the Supabase keys yet.", "Run npm run setup first.");

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function call(method, path, body, extra = {}) {
  const res = await fetch(URL + path, {
    method,
    headers: { ...headers, ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || data?.msg || data?.error || text;
    if (/allowed_emails/.test(message) && /does not exist|schema cache/i.test(message)) {
      log.fail("The access list table isn't in the database yet.", "Run npm run db:push, then try again.");
    }
    log.fail(`Supabase said ${res.status}: ${message}`);
  }
  return data;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const valueFlags = new Set(["--name"]);
const positional = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && !valueFlags.has(all[i - 1]));
const [command, rawEmail] = positional;
const email = (rawEmail || "").trim().toLowerCase();

function needEmail() {
  if (!EMAIL.test(email)) log.fail("Give an email address.", "For example: npm run admin -- you@example.com");
}

async function profileFor(address) {
  const rows = await call("GET", `/rest/v1/profiles?select=id,email,role&email=eq.${encodeURIComponent(address)}`);
  return rows?.[0] ?? null;
}

async function add() {
  needEmail();
  const role = hasFlag("--admin") ? "admin" : "client";
  const name = argValue("--name") || "";

  await call(
    "POST",
    "/rest/v1/allowed_emails?on_conflict=email",
    { email, role, ...(name ? { full_name: name } : {}) },
    { Prefer: "resolution=merge-duplicates,return=minimal" }
  );

  const existing = await profileFor(email);
  if (existing && existing.role !== role) {
    await call("PATCH", `/rest/v1/profiles?id=eq.${existing.id}`, { role }, { Prefer: "return=minimal" });
  }

  log.ok(`${email} has ${role} access`);
  if (existing) log.info(`They already have an account, so they can sign in now: ${SITE}/login`);
  else log.info(`Next: open ${SITE}/signup and create the account with ${email}`);
}

async function remove() {
  needEmail();
  await call("DELETE", `/rest/v1/allowed_emails?email=eq.${encodeURIComponent(email)}`, undefined, { Prefer: "return=minimal" });
  const existing = await profileFor(email);
  if (existing) {
    await call("DELETE", `/auth/v1/admin/users/${existing.id}`);
    log.ok(`Removed ${email} and deleted their account`);
  } else {
    log.ok(`Removed ${email} from the access list`);
  }
}

async function list() {
  const [invites, profiles] = await Promise.all([
    call("GET", "/rest/v1/allowed_emails?select=email,role,full_name&order=role.asc,email.asc"),
    call("GET", "/rest/v1/profiles?select=email"),
  ]);
  const joined = new Set((profiles ?? []).map((p) => p.email));
  if (!invites?.length) {
    console.log("Nobody has access yet. Start with: npm run admin -- you@example.com");
    return;
  }
  for (const i of invites) {
    console.log(`  ${i.role.padEnd(6)}  ${joined.has(i.email) ? "joined " : "invited"}  ${i.email}${i.full_name ? `  (${i.full_name})` : ""}`);
  }
}

const commands = { add, remove, list };
if (!commands[command]) {
  log.fail(
    "Tell me what to do.",
    "npm run admin -- you@example.com | npm run invite -- client@example.com | npm run access -- list | npm run access -- remove someone@example.com"
  );
}
commands[command]().catch((err) => log.fail(err.message || String(err)));
