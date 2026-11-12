# noobit-deploy-cloudflare ☁️🚀

**Skill สำหรับ AI Agent ที่พาเว็บ + ฐานข้อมูลขึ้น Cloudflare Workers และ D1 ให้มือใหม่แบบครบทุกขั้นตอน**
ผู้เรียนพิมพ์แค่ประโยคเดียวว่า **"deploy เว็บนี้ขึ้น Cloudflare ให้หน่อย"** แล้ว AI จะทำให้เกือบทั้งหมด ตั้งแต่ติดตั้ง Node.js ไปจนถึงส่งลิงก์เว็บที่ออนไลน์แล้วกลับมา

ใช้ได้กับ **Claude Code, OpenCode และ Antigravity** (เป็นไฟล์ `SKILL.md` มาตรฐานเดียวกัน)

ทำโดยช่อง **[บริหารงานแบบคนไอที (noobitguy)](https://www.youtube.com/@noobitguy)** เพื่อใช้สอนในคลาส ผมเจอว่าเวลาให้นักเรียนแต่ละคนสั่ง AI ให้ deploy เอง แต่ละคนติดปัญหาไม่เหมือนกันเลย skill นี้รวมวิธีแก้ปัญหาที่เจอบ่อยไว้ในที่เดียว ให้ AI ของทุกคนเดินตามขั้นตอนเดียวกัน

> *English summary: an agent skill (Claude Code / OpenCode / Antigravity) that deploys a beginner's web app with a D1 database to Cloudflare Workers end to end. It installs Node.js if needed, logs in with Wrangler, registers the `workers.dev` subdomain on brand-new accounts through the API (no "create a test page" step), creates the D1 database and tables with `--remote`, deploys, tests the live URL and reports progress as a 7-step checklist. A ready-to-hand-out `class-template/` project is included.*

---

## ✨ Skill นี้ทำอะไรให้บ้าง

พอผู้เรียนสั่ง deploy, AI จะประกาศแผน 7 ขั้นตอนก่อนเริ่ม แล้วรายงานทีละขั้นด้วยสัญลักษณ์ ▶️ ✅ ⏭️ ⚠️ 👆 (👆 = ขั้นที่ผู้เรียนต้องกดเอง)

| ขั้น | AI ทำอะไร |
|---|---|
| 1. ตรวจเครื่อง | เช็ก Node.js ถ้าไม่มีหรือเก่าเกินจะติดตั้งให้ (Windows ใช้ `winget`, Mac ใช้ `brew` หรือ `.pkg`, Linux ใช้ `nvm`) แล้วลง Wrangler ไว้ในโปรเจกต์ |
| 2. 👆 ล็อกอิน | รัน `wrangler login` ผู้เรียนแค่กด **Allow** ในเบราว์เซอร์ ถ้าเบราว์เซอร์ไม่เด้งจะใช้ `--device` (ได้ลิงก์ + รหัส) |
| 3. เตรียมบัญชี | จองชื่อ `xxx.workers.dev` ให้บัญชีใหม่อัตโนมัติผ่าน API **ไม่ต้องให้นักเรียนไปสร้าง test page ใน dashboard** |
| 4. เตรียมโปรเจกต์ | ดูว่าเป็น HTML ธรรมดา / Vite-React / มี config อยู่แล้ว แล้วจัดไฟล์ + `wrangler.jsonc` ให้ถูก แก้บั๊กมือใหม่ที่เจอบ่อยให้เงียบๆ |
| 5. ฐานข้อมูล | สร้าง D1 และตารางจากไฟล์ `migrations/` บน **ฐานข้อมูลจริง** (`--remote`) แล้วเช็กว่าตารางขึ้นจริง |
| 6. Deploy | `wrangler deploy` ถ้าพังจะแก้แล้ว deploy ใหม่เอง ไม่โยนงานกลับให้ผู้เรียน |
| 7. ทดสอบ | เปิดเว็บจริงและ `/api/health` ถ้าเจอ error จะเปิด `wrangler tail` ดูสาเหตุ แล้วส่งลิงก์เว็บให้ |

**สิ่งที่ผู้เรียนต้องทำเองมีแค่:**

1. สมัครบัญชีที่ https://dash.cloudflare.com/sign-up และ **กดยืนยันอีเมล** (สำคัญมาก ไม่ยืนยันจะ deploy ไม่ได้)
2. กด **Allow** ตอนล็อกอิน
3. กด **Yes** / ใส่รหัสเครื่อง ตอนติดตั้ง Node.js (ถ้ายังไม่มี)
4. เลือกบัญชี (ถ้ามีหลายบัญชี Cloudflare)

AI จะไม่ขอ token, API key หรือรหัสผ่านในแชทเด็ดขาด และจะถามก่อนเสมอถ้าต้องลบหรือเขียนทับ Worker / ฐานข้อมูลที่มีข้อมูลอยู่แล้ว

---

## 🧯 ปัญหาที่ skill นี้แก้ให้ (ที่มือใหม่มักติด)

- **บัญชีใหม่ยังไม่มี workers.dev subdomain** → deploy ครั้งแรกพัง หรือ Wrangler ถามคำถามที่ AI ตอบไม่ได้ สคริปต์ `ensure-workers-subdomain.mjs` จองชื่อให้ผ่าน API และถ้าชื่อซ้ำจะสุ่มเลขต่อท้ายให้
- **ยังไม่ได้ยืนยันอีเมล** → สคริปต์ตรวจเจอ แล้ว AI จะบอกให้ไปกดลิงก์ในอีเมล
- **ลืม `--remote`** → Wrangler v4 ใช้ฐานข้อมูล *ในเครื่อง* เป็นค่าเริ่มต้น เว็บจริงเลยขึ้น `no such table` skill บังคับใส่ `--remote` ทุกครั้ง
- **`database_id` ที่ก๊อปมาจากเพื่อน / tutorial** → template ไม่ใส่ id ไว้ ให้ Wrangler (4.45+) สร้างฐานข้อมูลใหม่ในบัญชีของแต่ละคนเอง
- **Windows: `npx.ps1 cannot be loaded`** → ใช้ `npx.cmd` แทน ไม่ต้องไปแก้ execution policy
- **ลง Node แล้ว terminal ยังหาไม่เจอ** → ใช้ full path ไปก่อน
- **ล็อกอินไม่ได้เพราะ port 8976 ไม่ว่าง** → `wrangler login --device`
- **Frontend เรียก `http://localhost:8787`** → เปลี่ยนเป็น path แบบ relative (`/api/...`) ให้
- **SQL ต่อ string เอง** → เปลี่ยนเป็น `?` placeholder + `.bind()`
- **ใส่ API key ไว้ในโค้ด** → ย้ายไปเป็น secret ผ่าน `wrangler secret bulk` (ผู้เรียนพิมพ์ค่าเองในไฟล์ ไม่ผ่านแชท)

---

## 📁 ใน repo มีอะไรบ้าง

```
noobit-deploy-cloudflare/                 ← ตัว skill (ก๊อปทั้งโฟลเดอร์นี้ไปติดตั้ง)
├── SKILL.md                              ← คำสั่งหลักที่ AI อ่าน
├── scripts/ensure-workers-subdomain.mjs  ← จองชื่อ workers.dev ให้บัญชีใหม่
└── templates/                            ← โปรเจกต์ตัวอย่างที่ใช้ได้จริง (เว็บ + API + D1)
    ├── wrangler.jsonc
    ├── src/index.js                      ← /api/* คุยกับ D1 ที่เหลือเสิร์ฟไฟล์เว็บ
    ├── migrations/0001_init.sql
    └── public/index.html                 ← เว็บ "รายการของฉัน" เพิ่ม/ลบข้อมูลใน D1 ได้

class-template/                           ← โปรเจกต์ตั้งต้นสำหรับแจกนักเรียน (มี skill ติดตั้งไว้แล้วทั้ง 3 เครื่องมือ)
├── .claude/skills/noobit-deploy-cloudflare/ ← สำหรับ Claude Code (OpenCode ก็อ่านได้)
├── .agents/skills/noobit-deploy-cloudflare/ ← สำหรับ Antigravity (OpenCode ก็อ่านได้)
├── .claude/settings.json                 ← Claude Code: อนุญาต npx wrangler / npm / node อัตโนมัติ
├── opencode.json                         ← OpenCode: อนุญาตคำสั่งชุดเดียวกัน
└── public/ src/ migrations/ wrangler.jsonc package.json

install.sh / install.ps1                  ← ติดตั้ง skill ลงเครื่อง (Mac-Linux / Windows)
sync-class-template.sh                    ← สำหรับคนดูแล repo: ก๊อป skill ล่าสุดไปไว้ใน class-template
```

---

## 🎓 วิธีใช้ในคลาส (แนะนำ)

ง่ายที่สุดคือแจก **`class-template/`** ให้นักเรียน เพราะมี skill และไฟล์ตั้งค่าอยู่ในโปรเจกต์ครบแล้ว ไม่ต้องติดตั้งอะไรเพิ่ม

1. นักเรียนกดปุ่ม **Code → Download ZIP** ที่หน้านี้ แล้วแตกไฟล์
2. เอาโฟลเดอร์ `class-template` ออกมา (เปลี่ยนชื่อเป็นชื่อโปรเจกต์ได้ เช่น `my-app`)
3. เปิดโฟลเดอร์นั้นใน Claude Code / OpenCode / Antigravity
4. ทำเว็บของตัวเองในโฟลเดอร์ หรือจะลอง deploy เว็บตัวอย่างที่ให้มาก่อนก็ได้
5. พิมพ์ว่า

   > deploy เว็บนี้ขึ้น Cloudflare ให้หน่อย

💡 ถ้านักเรียนมี Node.js อยู่แล้ว จะดึงแค่โฟลเดอร์ template ด้วยคำสั่งเดียวก็ได้:

```bash
npx degit ManageWithNoobItGuy/noobit-deploy-cloudflare/class-template my-app
```

หมายเหตุ: OpenCode อ่าน skill ได้ทั้งจาก `.claude/skills/` และ `.agents/skills/` เลยอาจเห็น skill ชื่อซ้ำ 2 อัน เนื้อหาเหมือนกัน ใช้ได้ปกติ

---

## 📦 ติดตั้ง skill ลงเครื่อง (ใช้กับทุกโปรเจกต์)

ถ้าอยากให้ AI ใช้ skill นี้ได้กับโปรเจกต์ไหนก็ได้ ไม่ใช่แค่ class-template

**วิธีที่ 1: ให้ AI ลงให้** (ง่ายสุด)

เปิด Claude Code / OpenCode / Antigravity แล้วพิมพ์ว่า

> ช่วยติดตั้ง skill จาก https://github.com/ManageWithNoobItGuy/noobit-deploy-cloudflare ให้หน่อย

**วิธีที่ 2: ใช้สคริปต์**

macOS / Linux:

```bash
git clone https://github.com/ManageWithNoobItGuy/noobit-deploy-cloudflare.git
```

```bash
cd noobit-deploy-cloudflare && ./install.sh --all
```

Windows (PowerShell): ดาวน์โหลด ZIP แล้วแตกไฟล์ เปิด PowerShell ในโฟลเดอร์นั้น แล้วรัน

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -All
```

ไม่ใส่ `--all` / `-All` = ลงให้ Claude Code อย่างเดียว ใส่ = ลงให้ OpenCode และ Antigravity ด้วย

**วิธีที่ 3: ก๊อปเอง** ก๊อปโฟลเดอร์ `noobit-deploy-cloudflare/` ไปไว้ที่

| เครื่องมือ | ใส่ในโปรเจกต์ | ใส่ทั้งเครื่อง |
|---|---|---|
| Claude Code | `.claude/skills/noobit-deploy-cloudflare/` | `~/.claude/skills/noobit-deploy-cloudflare/` |
| OpenCode | `.opencode/skills/…`, `.agents/skills/…` หรือ `.claude/skills/…` | `~/.config/opencode/skills/noobit-deploy-cloudflare/` |
| Antigravity | `.agents/skills/noobit-deploy-cloudflare/` | `~/.gemini/config/skills/noobit-deploy-cloudflare/` (เวอร์ชันเก่าใช้ `~/.gemini/antigravity/skills/`) |

---

## 🔓 ลดการถาม "อนุญาตให้รันคำสั่งไหม?" (แนะนำมาก)

skill สั่งให้ AI ทำเองทุกขั้นแล้ว แต่ตัวเครื่องมืออาจเด้งถามยืนยันทุกคำสั่ง ซึ่งมือใหม่มักงงว่าต้องกดอะไร

- **Claude Code** → `class-template/.claude/settings.json` อนุญาต `npx wrangler`, `npm install`, `npm run build`, `node` ไว้ให้แล้ว
- **OpenCode** → `class-template/opencode.json` อนุญาตคำสั่งชุดเดียวกัน
- **Antigravity** → ตั้งในแอป: Settings → Agent → Terminal command auto execution ให้รันอัตโนมัติ หรือเพิ่ม `npx wrangler` ใน allow list (ชื่อเมนูอาจต่างกันเล็กน้อยตามเวอร์ชัน)

ถ้าติดตั้ง skill แบบทั้งเครื่อง (ไม่ใช้ class-template) ให้ก๊อปไฟล์เหล่านี้ไปใส่ในโปรเจกต์ของนักเรียนด้วย

---

## 🎬 โหมด demo: ยังไม่มีบัญชีก็ลองได้

สำหรับเปิดคลาสครั้งแรก ถ้าอยากให้เห็นเว็บขึ้นทันทีก่อนสมัครบัญชี ให้บอก AI ว่า *"ขอลองแบบยังไม่สมัครบัญชีก่อน"* AI จะใช้ `wrangler deploy --temporary` (Wrangler 4.102+)

- ได้ลิงก์เว็บจริง + ลิงก์ claim บัญชี
- **ต้อง claim ภายใน 60 นาที** ไม่งั้น Cloudflare ลบทิ้งทั้งหมด
- ไม่ใช่โหมดหลัก AI จะใช้เฉพาะตอนผู้เรียนขอเท่านั้น

---

## ⚠️ ข้อจำกัดที่ควรบอกผู้เรียน

- Wrangler รองรับ **Windows 11**, macOS 13.5+ และ Linux glibc 2.35+ เครื่อง **Windows 10** อาจใช้ไม่ได้
- รองรับเว็บ HTML/CSS/JS ธรรมดา และเว็บที่ build เป็นไฟล์ static (Vite, React, Vue, Svelte) ส่วน **Next.js / Nuxt / Astro / Remix แบบ SSR** ไม่อยู่ใน flow มือใหม่ AI จะทำตามคู่มือ framework นั้นของ Cloudflare แทน
- ถ้าบัญชีมี workers.dev subdomain อยู่แล้ว skill จะ **ไม่เปลี่ยน** ให้ เพราะจะทำให้ URL ของทุกเว็บในบัญชีเปลี่ยน

## 🧪 สถานะการทดสอบ

- `templates/` ผ่าน `wrangler deploy --dry-run` บน Wrangler 4.160.1 และรัน `wrangler dev` ได้จริง (เพิ่ม/อ่านข้อมูลใน D1 ได้)
- สคริปต์จอง subdomain ทดสอบกับ mock API ครบ 5 กรณี: บัญชีใหม่, มี subdomain แล้ว, ชื่อซ้ำ, ยังไม่ยืนยันอีเมล, มีหลายบัญชี
- **ยังไม่ได้ทดสอบกับบัญชี Cloudflare ใหม่จริง** แนะนำให้ผู้สอนลองกับบัญชีใหม่ 1 ครั้งก่อนสอน

---

## 🛠️ สำหรับคนดูแล repo

ตัว skill มี 3 ชุดใน repo (ชุดหลัก + 2 ชุดใน class-template) ให้แก้ที่ `noobit-deploy-cloudflare/` เท่านั้น แล้วรัน

```bash
./sync-class-template.sh
```

เพื่อก๊อปไปทับใน `class-template/.claude/skills/` และ `class-template/.agents/skills/` ให้ตรงกัน

---

## 🙌 ติดตามช่อง

ถ้า skill นี้มีประโยชน์ ฝากกด ⭐ ให้ repo และติดตามช่องได้ที่

- YouTube: https://www.youtube.com/@noobitguy
- Website: https://noobitguy.one
- Facebook: https://www.facebook.com/ManageWithNoobITguy
- TikTok: https://www.tiktok.com/@noobitguy

ติดปัญหาหรือมีไอเดียปรับปรุง เปิด [Issue](https://github.com/ManageWithNoobItGuy/noobit-deploy-cloudflare/issues) ได้เลยครับ

## License

[MIT](LICENSE): ใช้ แก้ไข และแจกต่อได้ฟรี ขอแค่คงชื่อผู้สร้างไว้ในไฟล์ LICENSE
