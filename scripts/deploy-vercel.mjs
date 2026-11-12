#!/usr/bin/env node
// ============================================================================
// npm run deploy
//
// Puts the portal live on your own Vercel account:
//   1. creates the Vercel project (or reuses it)
//   2. copies the Supabase keys from .env.local into the project's settings
//   3. deploys to production
//   4. tells Supabase the live URL, so auth redirects point at the real site
//
// Run `npm run setup` first. Safe to run again: every run redeploys.
//
// Options:
//   --name <name>     Vercel project name (default: "name" in package.json)
//   --team <id|slug>  deploy to a Vercel team instead of your default scope
//   --tokens <path>   where tokens.txt is (default: searches for it)
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ENV_LOCAL, ROOT, argValue, loadTokens, log, projectName, readEnvFile } from "./lib/env.mjs";

const VERCEL = "https://api.vercel.com";
const { tokens, foundAt, searched } = loadTokens();
const TOKEN = tokens.VERCEL_TOKEN;

if (!TOKEN) {
  log.fail(
    "Couldn't find your Vercel token.",
    `Looked for VERCEL_TOKEN in:\n    ${searched.join("\n    ")}\n  Put tokens.txt in one of those places, or run: npm run deploy -- --tokens "/path/to/tokens.txt"`
  );
}

const env = readEnvFile(ENV_LOCAL);
const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = REQUIRED.filter((k) => !env[k]);
if (missing.length) {
  log.fail(`.env.local is missing ${missing.join(", ")}.`, "Run npm run setup first.");
}

async function vercel(method, url, { body, teamId, okStatuses = [] } = {}) {
  const u = new URL(VERCEL + url);
  if (teamId) u.searchParams.set("teamId", teamId);
  const res = await fetch(u, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (res.ok || okStatuses.includes(res.status)) return { status: res.status, data };
  const message = data?.error?.message || data?.message || text;
  const err = new Error(`Vercel said ${res.status}: ${message}`);
  err.status = res.status;
  throw err;
}

async function resolveScope() {
  const { data } = await vercel("GET", "/v2/user");
  const user = data.user;
  const wanted = argValue("--team");
  if (wanted) {
    const { data: t } = await vercel("GET", `/v2/teams/${encodeURIComponent(wanted)}`, {});
    return { teamId: t.id, label: t.name || t.slug, orgId: t.id };
  }
  if (user.defaultTeamId) {
    return { teamId: user.defaultTeamId, label: `${user.username}'s projects`, orgId: user.defaultTeamId };
  }
  return { teamId: undefined, label: user.username, orgId: user.id };
}

async function ensureProject(name, teamId) {
  const found = await vercel("GET", `/v9/projects/${encodeURIComponent(name)}`, { teamId, okStatuses: [404] });
  if (found.status === 200) {
    log.ok(`Using existing Vercel project "${name}"`);
    return found.data;
  }
  const { data } = await vercel("POST", "/v11/projects", { teamId, body: { name, framework: "nextjs" } });
  log.ok(`Created Vercel project "${name}"`);
  return data;
}

async function setEnvVars(projectId, teamId) {
  const vars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { key: "SUPABASE_SERVICE_ROLE_KEY", value: env.SUPABASE_SERVICE_ROLE_KEY },
  ].map((v) => ({ ...v, type: "encrypted", target: ["production", "preview"] }));

  await vercel("POST", `/v10/projects/${projectId}/env?upsert=true`, { teamId, body: vars });
  log.ok("Supabase keys saved in the Vercel project (encrypted)");
}

function linkLocally(project, orgId) {
  const dir = path.join(ROOT, ".vercel");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "project.json"),
    JSON.stringify({ projectId: project.id, orgId, projectName: project.name }, null, 2)
  );
}

function deploy() {
  log.step("Deploying to production (2 to 4 minutes)");
  const result = spawnSync("npx", ["--yes", "vercel@latest", "deploy", "--prod", "--yes", "--token", TOKEN], {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.status !== 0) {
    console.error(output.replaceAll(TOKEN, "***"));
    log.fail("The deploy failed.", "Read the build error above, fix it, run npm run build to check, then npm run deploy again.");
  }
  const aliased = output.match(/Aliased:\s*(https:\/\/\S+)/)?.[1];
  const urls = output.match(/https:\/\/[^\s]+\.vercel\.app/g) || [];
  return { aliased, deploymentUrl: urls[urls.length - 1] };
}

async function productionUrl(projectId, teamId, fallback) {
  try {
    const { data } = await vercel("GET", `/v9/projects/${projectId}`, { teamId });
    const alias = data?.targets?.production?.alias?.find((a) => a.endsWith(".vercel.app")) || data?.targets?.production?.alias?.[0];
    if (alias) return alias.startsWith("http") ? alias : `https://${alias}`;
  } catch {
    // fall through
  }
  return fallback;
}

async function pointSupabaseAtLiveSite(liveUrl) {
  const ref = env.SUPABASE_PROJECT_REF;
  const sbToken = tokens.SUPABASE_ACCESS_TOKEN;
  if (!ref || !sbToken) {
    log.info("Skipped telling Supabase the live URL (no project ref or Supabase token).");
    return;
  }
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${sbToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      site_url: liveUrl,
      uri_allow_list: `${liveUrl}/**,http://localhost:3000/**`,
      mailer_autoconfirm: true,
    }),
  });
  if (res.ok) log.ok("Supabase now knows the live URL");
  else log.info(`Couldn't update Supabase auth URLs (${res.status}). Sign-up still works.`);
}

async function main() {
  console.log(`Using tokens from ${process.env.VERCEL_TOKEN ? "environment" : foundAt}`);
  const name = projectName();

  log.step("Setting up the Vercel project");
  const scope = await resolveScope();
  log.info(`Account: ${scope.label}`);
  const project = await ensureProject(name, scope.teamId);
  await setEnvVars(project.id, scope.teamId);
  linkLocally(project, scope.orgId);

  const { aliased, deploymentUrl } = deploy();
  const liveUrl = aliased || (await productionUrl(project.id, scope.teamId, deploymentUrl));
  if (!liveUrl) log.fail("Deployed, but couldn't work out the live URL.", "Open vercel.com/dashboard to find it.");
  log.ok(`Live at ${liveUrl}`);

  await pointSupabaseAtLiveSite(liveUrl);

  log.step("Checking the live site");
  try {
    const res = await fetch(`${liveUrl}/login`, { redirect: "manual" });
    if (res.status === 200) log.ok("Login page loads");
    else if (res.status === 401) log.info("The site asks for a Vercel login. Turn off Deployment Protection in the Vercel project settings.");
    else log.info(`Login page returned ${res.status}. Open it in your browser to check.`);
  } catch {
    log.info("Couldn't reach the site yet. Give it a minute and open it in your browser.");
  }

  console.log(`
Your portal is live:
  ${liveUrl}

Open it, create the first account (that's you, the admin), then try a second
account in a private window to see what a client sees.`);
}

main().catch((err) => log.fail(err.message || String(err)));
