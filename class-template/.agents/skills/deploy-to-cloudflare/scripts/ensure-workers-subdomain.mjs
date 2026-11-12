#!/usr/bin/env node
// ensure-workers-subdomain.mjs
// Makes sure the logged-in Cloudflare account has a workers.dev subdomain.
// Brand-new accounts don't have one, which makes the first `wrangler deploy`
// fail or stop at an interactive question that AI agents can't answer.
//
// Usage (run from the project folder, after `npx wrangler login`):
//   node ensure-workers-subdomain.mjs [--account-id <id>] [--name <preferred-subdomain>]
//
// Output: one JSON object on stdout. Exit codes:
//   0 ready (already-registered | registered)
//   1 other error
//   2 several accounts - pass --account-id
//   3 email not verified / permission problem
//   4 not logged in
// The auth token is never printed.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const API = process.env.CF_API_BASE || "https://api.cloudflare.com/client/v4";

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      o[key] = next && !next.startsWith("--") ? argv[++i] : true;
    }
  }
  return o;
}

function done(obj, code) {
  console.log(JSON.stringify(obj, null, 2));
  process.exit(code);
}

function getAuth() {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` };
  }
  let raw;
  try {
    raw = execSync("npx wrangler auth token --json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120000,
    });
  } catch {
    done({ status: "error", reason: "not-logged-in",
      hint: "Run `npx wrangler login` first (`auth token` needs a Wrangler release from Dec 2025 or later)." }, 4);
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  let parsed;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    done({ status: "error", reason: "not-logged-in", hint: "Could not read credentials from wrangler." }, 4);
  }
  if (parsed.type === "api_key") {
    return { "X-Auth-Email": parsed.email, "X-Auth-Key": parsed.key };
  }
  if (!parsed.token) done({ status: "error", reason: "not-logged-in" }, 4);
  return { Authorization: `Bearer ${parsed.token}` };
}

async function cf(method, path, headers, body) {
  const res = await fetch(API + path, {
    method,
    headers: { ...headers, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  let json = {};
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

function accountIdFromConfig() {
  for (const f of ["wrangler.jsonc", "wrangler.json", "wrangler.toml"]) {
    if (!existsSync(f)) continue;
    const m = readFileSync(f, "utf8").match(/account_id["']?\s*[:=]\s*["']([0-9a-f]{32})["']/);
    if (m) return m[1];
  }
  return null;
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .split("@")[0]
    .replace(/'s account$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

const looksUnverified = (errs) =>
  errs.some((e) => /verif/i.test(e?.message || ""));
const looksTaken = (errs) =>
  errs.some((e) => /(taken|unavailable|already|exists|in use)/i.test(e?.message || ""));

const args = parseArgs(process.argv.slice(2));
const auth = getAuth();

// 1. Pick the account
let accountId = args["account-id"] || process.env.CLOUDFLARE_ACCOUNT_ID || accountIdFromConfig();
let accountName = null;
const acc = await cf("GET", "/accounts?per_page=50", auth);
if (!acc.json.success) {
  done({ status: "error", reason: acc.status === 403 ? "permission" : "accounts-lookup-failed",
    errors: acc.json.errors || [] }, acc.status === 401 ? 4 : 3);
}
const accounts = (acc.json.result || []).map((a) => ({ id: a.id, name: a.name }));
if (accountId) {
  accountName = accounts.find((a) => a.id === accountId)?.name ?? null;
} else if (accounts.length === 1) {
  accountId = accounts[0].id;
  accountName = accounts[0].name;
} else if (accounts.length === 0) {
  done({ status: "error", reason: "no-accounts" }, 1);
} else {
  done({ status: "choose-account", accounts }, 2);
}

// 2. Already has a subdomain?
const cur = await cf("GET", `/accounts/${accountId}/workers/subdomain`, auth);
if (cur.json.success && cur.json.result?.subdomain) {
  done({ status: "already-registered", accountId, accountName,
    subdomain: `${cur.json.result.subdomain}.workers.dev` }, 0);
}
const curErrs = cur.json.errors || [];
const missing = cur.status === 404 || curErrs.some((e) => e.code === 10007);
if (!missing) {
  if (looksUnverified(curErrs)) done({ status: "error", reason: "email-not-verified", errors: curErrs }, 3);
  done({ status: "error", reason: cur.status === 403 ? "permission" : "subdomain-lookup-failed",
    httpStatus: cur.status, errors: curErrs }, cur.status === 401 ? 4 : 3);
}

// 3. Register one
const base = slugify(args.name) || slugify(accountName) || "my-site";
const safeBase = base.length >= 3 ? base : `${base}-site`;
const candidates = [safeBase];
for (let i = 0; i < 4; i++) candidates.push(`${safeBase}-${Math.floor(1000 + Math.random() * 9000)}`);

const tried = [];
for (const name of candidates) {
  const put = await cf("PUT", `/accounts/${accountId}/workers/subdomain`, auth, { subdomain: name });
  if (put.json.success) {
    done({ status: "registered", accountId, accountName,
      subdomain: `${put.json.result?.subdomain || name}.workers.dev`,
      note: "New subdomains can take 1-2 minutes before URLs respond." }, 0);
  }
  const errs = put.json.errors || [];
  tried.push({ name, httpStatus: put.status, errors: errs });
  if (looksUnverified(errs)) done({ status: "error", reason: "email-not-verified", errors: errs }, 3);
  if (put.status === 401) done({ status: "error", reason: "not-logged-in", errors: errs }, 4);
  if (put.status === 403) done({ status: "error", reason: "permission", errors: errs }, 3);
  if (!looksTaken(errs) && put.status !== 409 && put.status !== 400) break; // unexpected - stop trying
}
done({ status: "error", reason: "register-failed", tried,
  hint: "Open https://dash.cloudflare.com/?to=/:account/workers-and-pages once, then rerun." }, 1);
