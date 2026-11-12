#!/usr/bin/env node
// ============================================================================
// npm run setup
//
// Creates (or reuses) the Supabase project for this portal, then:
//   1. waits until it's ready
//   2. fetches the project URL, anon key and service role key
//   3. switches OFF email confirmation (people can sign up and go straight in)
//   4. applies every migration in supabase/migrations that isn't applied yet
//   5. writes everything to .env.local
//
// Safe to run again: it reuses the project in .env.local and only applies new
// migrations. `npm run db:push` runs step 4 alone.
//
// Options:
//   --name <name>        project name (default: "name" in package.json)
//   --org <slug>         Supabase organization (default: your only/first one)
//   --region <code>      americas | emea | apac, or a code like eu-central-1
//   --tokens <path>      where tokens.txt is (default: searches for it)
//   --migrate-only       only apply migrations to the existing project
// ============================================================================
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  ENV_LOCAL,
  ROOT,
  argValue,
  hasFlag,
  loadTokens,
  log,
  projectName,
  readEnvFile,
  sleep,
  writeEnvLocal,
} from "./lib/env.mjs";

const API = "https://api.supabase.com";
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------
const { tokens, foundAt, searched } = loadTokens();
const TOKEN = tokens.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  log.fail(
    "Couldn't find your Supabase token.",
    `Looked for SUPABASE_ACCESS_TOKEN in:\n    ${searched.join("\n    ")}\n  Put tokens.txt in one of those places, or run: npm run setup -- --tokens "/path/to/tokens.txt"`
  );
}
if (!TOKEN.startsWith("sbp_")) {
  log.fail("SUPABASE_ACCESS_TOKEN should start with sbp_.", "Check tokens.txt. You may have pasted a different key.");
}

// ---------------------------------------------------------------------------
// API helper with retries for rate limits and brief server hiccups
// ---------------------------------------------------------------------------
async function api(method, url, body, { retries = 4, okStatuses = [] } = {}) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(API + url, {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      if (attempt < retries) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      throw new Error(`Network error calling Supabase (${method} ${url}): ${err.message}`);
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (res.ok || okStatuses.includes(res.status)) return { status: res.status, data };

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await sleep(3000 * (attempt + 1));
      continue;
    }

    const message = typeof data === "object" && data ? data.message || data.error || JSON.stringify(data) : String(data);
    const error = new Error(`Supabase said ${res.status}: ${message}`);
    error.status = res.status;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------
function guessRegion() {
  const explicit = argValue("--region");
  if (explicit) {
    return ["americas", "emea", "apac"].includes(explicit)
      ? { type: "smartGroup", code: explicit }
      : { type: "specific", code: explicit };
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (tz.startsWith("America/")) return { type: "smartGroup", code: "americas" };
  if (/^(Asia|Australia|Pacific)\//.test(tz)) return { type: "smartGroup", code: "apac" };
  return { type: "smartGroup", code: "emea" };
}

async function pickOrganization() {
  const { data: orgs } = await api("GET", "/v1/organizations");
  if (!Array.isArray(orgs) || orgs.length === 0) {
    log.fail(
      "Your Supabase account has no organization.",
      "Go to supabase.com/dashboard, create a free organization, then run npm run setup again."
    );
  }
  const wanted = argValue("--org");
  if (wanted) {
    const match = orgs.find((o) => o.slug === wanted || o.name === wanted);
    if (!match) log.fail(`No organization called ${wanted}.`, `You have: ${orgs.map((o) => `${o.name} (${o.slug})`).join(", ")}`);
    return match;
  }
  if (orgs.length > 1) {
    log.info(`You have ${orgs.length} organizations. Using "${orgs[0].name}". Pick another with --org <slug>.`);
  }
  return orgs[0];
}

async function createProject() {
  const org = await pickOrganization();
  const name = projectName();
  const dbPassword = crypto.randomBytes(24).toString("base64url");
  const region = guessRegion();

  log.step(`Creating Supabase project "${name}" in ${org.name} (${region.code})`);
  let project;
  try {
    ({ data: project } = await api(
      "POST",
      "/v1/projects",
      { name, organization_slug: org.slug, db_pass: dbPassword, region_selection: region },
      { retries: 1 }
    ));
  } catch (err) {
    if (err.status === 402 || /limit|maximum|quota|free/i.test(err.message)) {
      log.fail(
        "Supabase won't create another free project.",
        "The free plan allows 2 active projects. Pause or delete one at supabase.com/dashboard, then run npm run setup again.\n  " +
          err.message
      );
    }
    throw err;
  }

  // Save straight away so a re-run reuses this project instead of making another.
  writeEnvLocal({ SUPABASE_PROJECT_REF: project.ref, SUPABASE_DB_PASSWORD: dbPassword });
  log.ok(`Project created: ${project.ref}`);
  return project.ref;
}

async function waitUntilHealthy(ref) {
  log.step("Waiting for the project to start (usually 1 to 3 minutes)");
  const started = Date.now();
  let last = "";
  while (Date.now() - started < 12 * 60 * 1000) {
    const { data } = await api("GET", `/v1/projects/${ref}`);
    if (data.status !== last) {
      log.info(`status: ${data.status}`);
      last = data.status;
    }
    if (data.status === "ACTIVE_HEALTHY") {
      log.ok("Project is ready");
      return;
    }
    if (["INACTIVE", "INIT_FAILED", "REMOVED", "PAUSE_FAILED", "RESTORE_FAILED"].includes(data.status)) {
      log.fail(
        `The project is ${data.status}.`,
        data.status === "INACTIVE"
          ? `It's paused. Restore it at https://supabase.com/dashboard/project/${ref} then run npm run setup again.`
          : `Open https://supabase.com/dashboard/project/${ref} to see what happened.`
      );
    }
    await sleep(5000);
  }
  log.fail("The project took too long to start.", "Run npm run setup again in a minute. It will pick up where it left off.");
}

async function fetchKeys(ref) {
  log.step("Fetching API keys");
  for (let attempt = 0; attempt < 20; attempt++) {
    const { data } = await api("GET", `/v1/projects/${ref}/api-keys?reveal=true`);
    const keys = Array.isArray(data) ? data : [];
    const find = (pred) => keys.find((k) => pred(k) && k.api_key)?.api_key;

    const anon = find((k) => k.name === "anon") || find((k) => k.type === "publishable");
    const service = find((k) => k.name === "service_role") || find((k) => k.type === "secret");

    if (anon && service) {
      log.ok("Got the anon key and the service role key");
      return { anon, service };
    }
    await sleep(3000);
  }
  log.fail("Supabase didn't return the API keys yet.", "Run npm run setup again in a minute.");
}

async function configureAuth(ref) {
  log.step("Switching off email confirmation");
  const { data: current } = await api("GET", `/v1/projects/${ref}/config/auth`);

  const patch = { mailer_autoconfirm: true };
  // Don't overwrite the live URL that `npm run deploy` sets.
  if (!current?.site_url || current.site_url.startsWith("http://localhost")) {
    patch.site_url = "http://localhost:3000";
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await api("PATCH", `/v1/projects/${ref}/config/auth`, patch, { retries: 1 });
      log.ok("New sign-ups go straight in, no confirmation email");
      return;
    } catch (err) {
      if (attempt === 9) throw err;
      await sleep(4000);
    }
  }
}

function localMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((file) => {
      const base = file.replace(/\.sql$/, "");
      const match = base.match(/^(\d+)_(.+)$/);
      return {
        file,
        version: match ? match[1] : null,
        name: match ? match[2] : base,
        sql: fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"),
      };
    });
}

async function applyMigrations(ref) {
  log.step("Applying database migrations");
  const local = localMigrations();
  if (local.length === 0) {
    log.info("No migration files in supabase/migrations.");
    return;
  }

  const { data: applied } = await api("GET", `/v1/projects/${ref}/database/migrations`);
  const done = new Set();
  for (const m of Array.isArray(applied) ? applied : []) {
    if (m.name) done.add(m.name);
    if (m.version) done.add(m.version);
  }

  let count = 0;
  for (const m of local) {
    if (done.has(m.name) || done.has(`${m.version}_${m.name}`) || (m.version && done.has(m.version))) {
      log.info(`already applied: ${m.file}`);
      continue;
    }
    try {
      await api("POST", `/v1/projects/${ref}/database/migrations`, { name: m.name, query: m.sql }, { retries: 1 });
    } catch (err) {
      log.fail(`Migration ${m.file} failed.`, `${err.message}\n  Fix the SQL in supabase/migrations/${m.file} and run npm run db:push again.`);
    }
    log.ok(`applied: ${m.file}`);
    count++;
  }
  if (count === 0) log.ok("Database is up to date");
}

async function verify(ref) {
  log.step("Checking the database");
  const { data } = await api("POST", `/v1/projects/${ref}/database/query`, {
    query: "select count(*)::int as profiles from public.profiles;",
  });
  const n = Array.isArray(data) ? data[0]?.profiles : undefined;
  log.ok(`profiles table is live (${n ?? 0} users so far)`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Using tokens from ${process.env.SUPABASE_ACCESS_TOKEN ? "environment" : foundAt}`);

  const existing = readEnvFile(ENV_LOCAL);
  let ref = existing.SUPABASE_PROJECT_REF;

  if (hasFlag("--migrate-only")) {
    if (!ref) log.fail("No project yet.", "Run npm run setup first.");
    await applyMigrations(ref);
    await verify(ref);
    console.log("\nDone.");
    return;
  }

  if (ref) {
    log.step(`Reusing the project in .env.local (${ref})`);
    try {
      await api("GET", `/v1/projects/${ref}`, undefined, { retries: 1 });
    } catch (err) {
      if (err.status === 404) {
        log.fail(
          `Project ${ref} doesn't exist any more.`,
          "Delete SUPABASE_PROJECT_REF from .env.local and run npm run setup again to make a new one."
        );
      }
      throw err;
    }
  } else {
    ref = await createProject();
  }

  await waitUntilHealthy(ref);
  const { anon, service } = await fetchKeys(ref);

  writeEnvLocal({
    NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co`,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
    SUPABASE_PROJECT_REF: ref,
  });
  log.ok("Saved keys to .env.local");

  await configureAuth(ref);
  await applyMigrations(ref);
  await verify(ref);

  console.log(`
Supabase is ready.
  Project:   https://supabase.com/dashboard/project/${ref}
  URL:       https://${ref}.supabase.co
  Keys:      saved in .env.local (secret, not committed)

Next: npm run dev, then open http://localhost:3000 and create the first account.
The first account becomes the admin.`);
}

main().catch((err) => log.fail(err.message || String(err)));
