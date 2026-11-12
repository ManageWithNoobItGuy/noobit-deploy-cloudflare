---
name: deploy-to-cloudflare
description: Deploys a beginner's web app (website + D1 database) to Cloudflare Workers end-to-end with Wrangler and does every step itself - checks or installs Node.js, logs in, prepares a brand-new Cloudflare account (registers the workers.dev subdomain, no test page needed), creates the D1 database and tables, deploys, tests, and returns the live URL - while showing a numbered progress checklist. Use whenever the user asks to deploy, publish, host, or put a site online, including Thai requests like "deploy เว็บ", "ขึ้นเว็บ", "เอาเว็บขึ้น Cloudflare", "ทำให้คนอื่นเข้าเว็บได้", even if they never mention Wrangler, Workers or D1.
---

# Deploy to Cloudflare (Workers + D1) — beginner mode

The person you are helping is a **complete beginner**. They do not know what a terminal, Node.js, DNS or a database is. Your job is to get their website and database online with as few manual steps as possible, and to keep them informed the whole time.

- Talk in the user's language. If they write Thai, use the Thai templates below. Avoid jargon; when you must use a term, explain it in a few words.
- Do not paste long terminal output into the chat. Summarise what happened in one line.
- `<skill-dir>` below means the folder this SKILL.md is in. Resolve it to an absolute path before running scripts.

---

## 1. Consent rule (read this first)

Asking you to deploy (or loading this skill) **is** the user's explicit permission to do all of the following on their own computer and their own Cloudflare account:

- install Node.js and install Wrangler into the project,
- log in to Cloudflare, register the account's `workers.dev` subdomain,
- create the D1 database, create tables, and deploy the Worker.

So: **run every command yourself.** Do not tell the user to "run `wrangler deploy` yourself", do not stop to ask "should I deploy now?", and do not hand the deploy back to them because it touches production. A tool's "approve this command?" prompt is just the tool's safety switch. Ask the user to approve it if needed, then continue.

Stop and ask the user **only** for things a human must do:

1. create a Cloudflare account and verify the email,
2. click **Allow** in the browser during login,
3. approve an OS admin prompt (Windows "Yes" or Mac password) while Node.js installs,
4. choose between several Cloudflare accounts,
5. anything that would **delete or overwrite** a Worker or database they did not create in this session, or run `DROP`/`DELETE` on a database that already holds data.

Never ask the user to paste a token, API key or password into the chat.

---

## 2. Progress protocol

**At the very start**, before running anything, send the plan (adapt the language):

```
🚀 จะพาเว็บของคุณขึ้นออนไลน์บน Cloudflare มีทั้งหมด 7 ขั้นตอน
ผมทำให้เกือบทั้งหมด คุณช่วยแค่จุดที่มี 👆 เท่านั้น

1. ตรวจโปรแกรมในเครื่อง (Node.js) — ถ้ายังไม่มี ผมจะติดตั้งให้
2. 👆 ล็อกอิน Cloudflare — คุณกดปุ่ม "Allow" ในเบราว์เซอร์ 1 ครั้ง
3. เตรียมบัญชี Cloudflare ให้พร้อมใช้ (ตั้งชื่อเว็บ .workers.dev ให้อัตโนมัติ)
4. เตรียมไฟล์ตั้งค่าโปรเจกต์
5. สร้างฐานข้อมูล (D1) และตาราง
6. อัปโหลดเว็บขึ้น Cloudflare
7. ทดสอบเว็บจริง แล้วส่งลิงก์ให้

📌 ถ้ายังไม่มีบัญชี Cloudflare: สมัครฟรีได้ที่ https://dash.cloudflare.com/sign-up
   แล้ว "ยืนยันอีเมล" ด้วยลิงก์ที่ Cloudflare ส่งไปให้ (สำคัญมาก ถ้าไม่ยืนยันจะ deploy ไม่ได้)
   ระหว่างที่คุณสมัคร ผมจะเริ่มขั้นที่ 1 ไปก่อนเลย
```

**During the work**, post one short line per step:

- Starting: `▶️ ขั้นที่ 3/7: กำลังเตรียมบัญชี Cloudflare...`
- Done: `✅ ขั้นที่ 3/7 เสร็จ: ได้ชื่อเว็บ somchai.workers.dev แล้ว`
- Skipped: `⏭️ ขั้นที่ 1/7: มี Node.js v22 อยู่แล้ว ข้ามได้เลย`
- Problem: `⚠️ ขั้นที่ 6/7: เจอปัญหา ... กำลังแก้โดย ...`
- Waiting for the user: `👆 รอคุณ: ...` (say exactly what to click, in click-by-click words)

If the tool has a todo/task list, mirror the 7 steps there too.

---

## Step 1/7 — Check and install tools

Detect the OS first (`uname -s`, or `$env:OS` / `ver` on Windows).

**Wrangler system support:** macOS 13.5+, Windows 11, Linux with glibc 2.35+. On Windows 10 or older macOS, warn the user that Wrangler may not run, then try anyway.

**Node.js:** run `node -v`. You need an LTS version, 20 or newer. If Node is missing or too old, tell the user you are installing it because it is needed to upload the website, then:

- **Windows:**
  `winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements`
  Tell the user to click **Yes** if a Windows permission box pops up.
  The current shell will not see the new PATH. Use the full path `"C:\Program Files\nodejs\node.exe"` and `"C:\Program Files\nodejs\npx.cmd"`, or open a new terminal session. Ask the user to restart the AI app only as a last resort.
- **macOS:** if `brew` exists, run `brew install node`. If not:
  1. Find the latest LTS version from `https://nodejs.org/dist/index.json` (first entry whose `lts` is not `false`).
  2. Download `https://nodejs.org/dist/<ver>/node-<ver>.pkg` to `/tmp/node.pkg`.
  3. Run `open /tmp/node.pkg` and tell the user: "กด Continue → Install แล้วใส่รหัสผ่านเครื่อง Mac".
  4. Poll `/usr/local/bin/node -v` until it works.
- **Linux:** install nvm into the home folder (no sudo needed), then run `nvm install --lts`.

**Windows PowerShell gotcha:** if you see `npx.ps1 cannot be loaded because running scripts is disabled`, use `npx.cmd` instead of `npx` (and `npm.cmd` instead of `npm`) for every command. No policy change is needed.

**Install Wrangler into the project.** Use the project's own copy, as Cloudflare recommends; don't rely on a global install:

```
npm init -y            # only if there is no package.json
npm install -D wrangler@latest
npx wrangler --version
```

If the project already has Wrangler, keep its version unless it is too old for a feature you need (automatic D1 creation needs 4.45 or newer).

---

## Step 2/7 — Log in to Cloudflare

1. `npx wrangler whoami --json`. If it exits 0, the user is already logged in, so skip ahead and note the account name(s).
2. Otherwise send:
   `👆 รอคุณ: เบราว์เซอร์จะเปิดหน้า Cloudflare ขึ้นมา ให้ล็อกอิน แล้วกดปุ่มสีน้ำเงิน "Allow" (อนุญาต) จากนั้นกลับมาที่นี่ได้เลย`
3. Run `npx wrangler login`. It waits until the user clicks Allow, so give it a long timeout (at least 5 minutes), or run it in the background and poll `npx wrangler whoami --json` every few seconds.
4. If the browser does not open, the callback port 8976 is busy, or the agent runs somewhere the browser can't reach, use `npx wrangler login --device`. It prints a URL and a short code. Show both to the user and tell them to open the link and type the code. This flag needs a recent Wrangler; check `npx wrangler login --help`.
5. If it times out, try once more, then explain what you see.
6. **Several accounts:** show the account **names** and ask which one to use. Then put that `account_id` in `wrangler.jsonc` so later commands never prompt.

---

## Step 3/7 — Get a brand-new account ready (replaces the "create a test page" trick)

New Cloudflare accounts often have **no `workers.dev` subdomain yet**. The first deploy then fails, or Wrangler asks an interactive question that agent shells cannot answer. Many teachers work around this by asking students to create a test page in the dashboard. You don't need that. Run:

```
node <skill-dir>/scripts/ensure-workers-subdomain.mjs
# optional: --account-id <id>   --name <preferred-subdomain>
```

Run it from the project folder. It reads the logged-in credentials through `wrangler auth token` (the token is never printed), checks the account's subdomain, and registers one if it is missing. It prints JSON and exits with:

| exit | meaning | what you do |
|---|---|---|
| 0 | `status: already-registered` or `registered`, with `subdomain` | Tell the user their address will be `https://<worker-name>.<subdomain>.workers.dev` |
| 2 | several accounts, `accounts: [{id,name}]` | Ask which one, then rerun with `--account-id` |
| 3 | `reason: email-not-verified` or a permission error | Ask the user to open their email inbox, click Cloudflare's verify link, then rerun |
| 4 | not logged in | Go back to Step 2 |
| 1 | other error | Read `errors`. If you can't fix it, fall back to the onboarding page `https://dash.cloudflare.com/?to=/:account/workers-and-pages` and ask the user to open it once, then rerun |

Notes:

- The subdomain is **account-wide**: all Workers on the account share it. **Never change an existing subdomain**, because that changes the URL of every site on the account.
- A new subdomain can take a minute or two to start working. That is normal.

---

## Step 4/7 — Prepare the project

### 4a. Work out what kind of project it is

| Project looks like | Do this |
|---|---|
| Already has `wrangler.jsonc` / `wrangler.json` / `wrangler.toml` | Reuse it, don't overwrite it. Check it against the rules below. |
| Plain HTML/CSS/JS (an `index.html` somewhere) | Move the files into `public/`, then use the templates. |
| `package.json` with a `build` script (Vite, React, Vue, Svelte…) | Run `npm run build`. Assets go in the build output (usually `dist/`, sometimes `build/`). |
| Next.js / Nuxt / Astro SSR / Remix | Not covered by the beginner flow. Follow that framework's guide at https://developers.cloudflare.com/workers/framework-guides/ (Cloudflare's `nextjs-on-cloudflare` skill covers Next.js), then continue from Step 5. |

### 4b. Target layout (templates are in `<skill-dir>/templates/`)

```
my-app/
├── public/                  ← website files (or dist/ after a build)
├── src/index.js             ← the Worker: /api/* talks to D1, everything else = website
├── migrations/0001_init.sql ← table definitions
├── wrangler.jsonc
└── package.json
```

Copy `templates/wrangler.jsonc`, `templates/src/index.js`, and `templates/migrations/0001_init.sql` when the project lacks them, then adapt them to the app. `templates/public/index.html` is a small working demo for an empty project.

### 4c. `wrangler.jsonc` rules

- `name`: lowercase letters, digits and `-`, 63 characters max. It becomes part of the URL, so pick something readable from the project name.
- `compatibility_date`: **today's date** (YYYY-MM-DD) for a new project. For an existing project, keep its date. Don't move it forward without testing.
- `d1_databases`: give `binding` and `database_name` but **no `database_id`**. Wrangler 4.45+ creates the database automatically on first use and writes the id back into the file. Keep the id it writes.
- If a `database_id` is already there, make sure it exists on **this** account (`npx wrangler d1 list --json`). Ids copied from tutorials, from a friend, or from another account cause "database not found". Remove a foreign id and let Wrangler create a new database.
- `assets.run_worker_first: ["/api/*"]` makes API calls always reach the Worker. Everything else is served straight from the static files.
- Prefer `wrangler.jsonc` for new projects.

### 4d. Code checks (fix these quietly; they are the usual beginner bugs)

- The frontend must call the API with **relative** URLs (`fetch("/api/items")`), never `http://localhost:8787/...`.
- Database code must use the binding (`env.DB.prepare(...).bind(...)`) with `?` placeholders. Never build SQL by joining strings with user input.
- If the app currently stores data only in `localStorage` and the user wants a real database, add `/api/...` routes and switch the frontend to use them.
- Add `.wrangler/`, `.dev.vars*`, `node_modules/` to `.gitignore`.

### 4e. Secrets (API keys etc.) — only if the app needs them

- Never put secret values in code, in `wrangler.jsonc` `vars`, in command arguments, or in chat.
- Ask the user to type the values into a local file such as `.secrets.json` (`{"OPENAI_API_KEY":"..."}`). Make sure it is in `.gitignore`, then run `npx wrangler secret bulk .secrets.json`.
- `secret put` and `secret bulk` take effect on the live site **immediately**.

### 4f. Check before uploading

Run `npx wrangler deploy --dry-run`. It catches config and build errors without touching Cloudflare. It does **not** prove that the database or the live site work.

---

## Step 5/7 — Create the database and tables

1. Keep table definitions in `migrations/NNNN_name.sql`. Use `CREATE TABLE IF NOT EXISTS`. If the app has one `schema.sql`, turn it into `migrations/0001_init.sql`.
2. Apply to the **real** database:
   `npx wrangler d1 migrations apply DB --remote` (use the binding name or `database_name`).
   - With automatic creation on (Wrangler 4.45+), this also creates the database if it doesn't exist yet. If an older version says the database doesn't exist, do Step 6 first (deploy creates it), then come back.
   - Agent shells are non-interactive. Wrangler normally continues past its "Ok to proceed?" question by itself ("Using fallback value in non-interactive context"). If a command really hangs on a y/n question, check `--help` for a `--yes`/`-y` flag.
3. Check that it worked:
   `npx wrangler d1 execute DB --remote --command "SELECT name FROM sqlite_master WHERE type='table'"`

⚠️ **The #1 gotcha:** Wrangler v4 `d1` commands use the **local** test database unless you add `--remote`. Without `--remote`, the live site will show `no such table`.

Never run `DROP`, `DELETE` or a restore on a remote database that holds data without the user's explicit OK. Rolling back a Worker does **not** roll back database data.

---

## Step 6/7 — Upload (deploy)

```
npx wrangler deploy
```

- Run a `build` first if the project has one.
- Read the URL from the output: `https://<name>.<subdomain>.workers.dev`.
- Wrangler overwrites settings that were changed in the dashboard (variables, routes) with what's in `wrangler.jsonc`. That's fine for beginners, but don't be surprised by it.
- If deploy fails, check the troubleshooting table, fix the problem, and deploy again yourself. Don't hand the deploy back to the user.

---

## Step 7/7 — Test and hand over

1. Open the site and one API endpoint, for example `/api/health`. On Windows PowerShell use `curl.exe`, because plain `curl` is an alias for `Invoke-WebRequest` there. A brand-new URL can return errors for a minute or two, so retry a few times before you call it a failure.
2. If the site shows an error page (for example Cloudflare error 1101), run `npx wrangler tail` in the background, load the page again, and read the real error.
3. Final message (adapt):

```
🎉 เสร็จแล้ว! เว็บของคุณออนไลน์แล้วที่:
👉 https://my-app.somchai.workers.dev

สิ่งที่สร้างไว้ในบัญชี Cloudflare ของคุณ:
• เว็บ (Worker) ชื่อ my-app
• ฐานข้อมูล (D1) ชื่อ my-app-db

แก้เว็บแล้วอยากอัปเดต? แค่พิมพ์บอกผมว่า "deploy อีกครั้ง"
ดูหลังบ้านได้ที่ https://dash.cloudflare.com → Workers & Pages
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npx.ps1 cannot be loaded … running scripts is disabled` | Use `npx.cmd` / `npm.cmd` |
| `node`/`npx` "not recognized" right after installing Node | The shell's PATH is stale. Use the full path or a new terminal session (Step 1) |
| `This version of Wrangler requires at least Node.js v…` | Install the current Node LTS |
| "register a workers.dev subdomain", code 10007, or a link to `/workers/onboarding` | Run `ensure-workers-subdomain.mjs` (Step 3) |
| Message about verifying the email address | User clicks the verify link in Cloudflare's email, then rerun |
| Authentication error (code 10000), `Not logged in` | `npx wrangler login` again. Check that the right account is selected |
| "More than one account available" | Set `account_id` in `wrangler.jsonc` |
| `database not found` / bad `database_id` | Remove the foreign id, or pick a real one from `npx wrangler d1 list` |
| Live site says `no such table` | Migrations were applied locally only. Rerun with `--remote` |
| Invalid Worker name | Lowercase letters, digits, `-` only |
| Port 8976 busy during login | `npx wrangler login --device` |
| Old content after redeploy | Edge cache; wait a few seconds and reload |
| Error 1101 / Worker threw exception | `npx wrangler tail`, reproduce, fix the code |

---

## Optional: "no account yet" demo mode (`--temporary`)

If the user has **no** Cloudflare account and wants to see the site live right now (handy for a first class demo), Wrangler 4.102+ supports:

```
npx wrangler deploy --temporary
```

- Deploys to a temporary account and prints a live `workers.dev` URL plus a **claim URL**.
- The user must open the claim URL, sign up or sign in, and finish claiming **within 60 minutes**, or Cloudflare deletes everything.
- Supports D1 (one database, up to 100 MB), static assets (up to 1,000 files, 5 MiB each), KV and Durable Objects.
- Fails if the user is already logged in. After claiming, run `wrangler login` and deploy normally.

State the 60-minute deadline plainly to the user. This is **not** the default. Use the normal 7-step flow unless the user asks to try it before signing up.

---

## Rules carried over from Cloudflare's official `wrangler` skill (github.com/cloudflare/skills)

- Use the project's own Wrangler version, through `npx` or package scripts. Check `npx wrangler <command> --help` instead of relying on remembered syntax.
- If the project has `cloudflare.config.ts` instead of a Wrangler config, that is the newer `cf` CLI flow. Follow Cloudflare's docs for it instead.
- Before any remote command, confirm which account and Worker you are acting on (`whoami`).
- Never ask for a token in chat. Keep secrets out of arguments, code and logs.
- When binding existing resources, verify their ids. Leaving an id out triggers automatic creation of a **new** resource.
- Check environment inheritance before adding bindings or vars under `env`. Some keys must be repeated per environment, and you must pass the same `--env` to every command.
- After changing bindings in TypeScript projects, run `npx wrangler types` instead of hand-editing the generated types.
- Dry runs check packaging only. Always test the live URL.
- Rollbacks don't roll back data in D1/KV/R2.

## Notes for specific agents

- **OpenCode / Antigravity / Claude Code** all run these commands in their own terminal tool. Long commands (`wrangler login`, Node install) need a long timeout or background run plus polling.
- If the tool asks to approve each command, ask the user to approve it, and tell them the tool can be set to always allow `npx wrangler` (see the README).
