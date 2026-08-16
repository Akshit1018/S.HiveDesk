# Handover

## Built

| Layer | What |
| --- | --- |
| Web / PWA | HiveDesk — amber theme, mobile-first, Buzz sidebar |
| Chat | Conversations + channels + AI DMs; confirm-before-write |
| ERP sandbox | CRM, Selling, Buying, Stock, Accounts, HR, Projects, File |
| Profiles | Admin, Sales, Warehouse, Purchase, Accounts, HR |
| Hive | Hire 10 seats (sales, warehouse, purchase, accounts, HR, ops, CEO, support, caller, WhatsApp) |
| Mail | Google connect or demo mailbox → Communication DocType |
| Calls | Transcripts; agent cites live Bin / AR |
| MCP | `GET/POST /api/mcp` JSON-RPC |
| Auth | Google / X via Grok broker; email/password optional |

## Install (dev)

```bash
git clone <this-repo>
cd <repo>
npm install
npm run dev
```

Node 22. No extra system packages. Playwright is already in the template for QA.

## Install (VPS + real ERPNext)

```bash
# Frappe bench
bench init frappe-bench && cd frappe-bench
bench get-app erpnext
bench get-app hrms
bench get-app crm
bench new-site aarohi.local
bench --site aarohi.local install-app erpnext hrms crm
bench start
```

Create a Frappe User with only the roles you want the agent to have. Generate API key + secret.

HiveDesk production swap:

1. MCP `erp_*` tools call `https://<site>/api/resource/<DocType>` with token `token <key>:<secret>`.
2. Never use Administrator.
3. Uploads go to `/api/method/upload_file`.

## How a turn works

```
User (any channel)
  → Channel gateway (web / WhatsApp / voice)
  → Conversation + active AI employee
  → Permission check (human profile ∩ agent template ∩ DocType)
  → Read: return records
  → Write: proposal card
  → Human approve / reject
  → ERP engine (sandbox or Frappe REST)
  → Audit / Communication / transcript
```

## Permissions

`src/data/erp.ts` → `personaSees()`. Admin sees all. Sales sees CRM + Selling. Warehouse sees Stock. HR sees HR only. The chatbot refuses out-of-seat writes.

## WhatsApp (plugin)

Requirements you will add later (do not block the build):

- Meta Business account + Cloud API phone number
- Permanent token, Phone Number ID, WABA ID
- Webhook verify token; public HTTPS on the VPS
- Policy: group replies **only on @mention**

Inbound: webhook → same `send()` path with `channel: whatsapp`.

## Calling (plugin)

Requirements:

- Vapi or Exotel / Plivo number
- Grok (or other) voice model
- Webhook for call-end + recording URL

How Aira talks:

1. On ring, fetch `Bin` + open `Sales Order` / `Lead` for the caller’s number (Customer / Lead phone).
2. Speak only numbers that came from ERP.
3. On hangup, store transcript on **Calls** and optional Communication on the Customer.

Demo transcripts: `src/data/seed.ts` → `CALLS`. Inventory citations are real Bin rows.

## Upload

Plus on the composer attaches a file → `File` DocType in the sandbox. Production: Frappe `upload_file`.

## Why MCP

So Cursor / Claude Code / Codex / Grok Build can list stock, create a draft PO, or attach a file **without** going through the web UI — still with persona in the arguments.

## What is not wired yet (by design)

- Live Meta / Vapi keys (slots + UI exist)
- Multi-tenant Frappe site picker
- Persistent DB for conversations (in-memory for preview)
