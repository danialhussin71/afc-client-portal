// Shared helpers for the setup and deploy scripts. Zero dependencies.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath handles spaces ("AFC SAAS") and Windows drive letters correctly.
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ENV_LOCAL = path.join(ROOT, ".env.local");

/** Parse KEY=value lines. Ignores blanks and # comments, strips quotes. */
export function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function readEnvFile(file) {
  return fs.existsSync(file) ? parseEnv(fs.readFileSync(file, "utf8")) : {};
}

/** Merge keys into .env.local, keeping anything already there. */
export function writeEnvLocal(updates) {
  const current = readEnvFile(ENV_LOCAL);
  const merged = { ...current, ...updates };
  const body =
    "# Written by `npm run setup`. Secret. Never commit this file.\n" +
    Object.entries(merged)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") +
    "\n";
  fs.writeFileSync(ENV_LOCAL, body, { mode: 0o600 });
}

/**
 * Find tokens.txt. Checked in this order:
 *   1. --tokens <path> on the command line
 *   2. tokens.txt in the project folder, then its parent folder
 *   3. Desktop/AFC SAAS/tokens.txt (and the OneDrive Desktop on Windows)
 * Environment variables with the same names win over the file.
 */
export function loadTokens() {
  const argIndex = process.argv.indexOf("--tokens");
  const home = os.homedir();
  const candidates = [
    argIndex > -1 ? process.argv[argIndex + 1] : null,
    path.join(ROOT, "tokens.txt"),
    path.join(ROOT, "..", "tokens.txt"),
    path.join(home, "Desktop", "AFC SAAS", "tokens.txt"),
    path.join(home, "OneDrive", "Desktop", "AFC SAAS", "tokens.txt"),
  ].filter(Boolean);

  let fromFile = {};
  let foundAt = null;
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      fromFile = readEnvFile(file);
      foundAt = file;
      break;
    }
  }

  const tokens = {
    VERCEL_TOKEN: process.env.VERCEL_TOKEN || fromFile.VERCEL_TOKEN || "",
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN || fromFile.SUPABASE_ACCESS_TOKEN || "",
  };
  return { tokens, foundAt, searched: candidates };
}

export function argValue(name) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
}

export function hasFlag(name) {
  return process.argv.includes(name);
}

export const log = {
  step: (msg) => console.log(`\n→ ${msg}`),
  ok: (msg) => console.log(`  ✓ ${msg}`),
  info: (msg) => console.log(`    ${msg}`),
  fail(msg, hint) {
    console.error(`\n✗ ${msg}`);
    if (hint) console.error(`  ${hint}`);
    process.exit(1);
  },
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Make a name safe for a Supabase project / Vercel project / URL. */
export function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    .replace(/^-|-$/g, "");
}

export function projectName() {
  const explicit = argValue("--name");
  if (explicit) return slugify(explicit);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  return slugify(pkg.name || path.basename(ROOT));
}
