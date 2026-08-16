# Ideation

Tier-2 / tier-3 companies already have ERPNext for truth (stock, GL, HR, CRM) but live in WhatsApp and phone calls. HiveDesk is the **conversation layer** on that truth.

## Problem

- ERPNext is complete and open source. The desk is not how a warehouse clerk or sales rep works at 6pm.
- ChatGPT-style bots invent stock and skip permissions.
- Hiring “AI employees” (Buzz) is the right metaphor, but they need a real ledger.

## Bet

Do not rewrite ERPNext. Wrap it.

- **Buzz UX** — groups, channels, DMs, hireable agents, previous chats, fixed composer.
- **Frappe truth** — DocTypes, roles, User Permissions, docstatus.
- **Human in the loop** — every write is a proposal until the human (same role) approves.
- **MCP** — the same tools the app uses are exposed to Claude Code, Codex, Cursor, Grok Build.

## Why an API / MCP app

So the product is not locked to one chat UI. A clerk can use WhatsApp, a CEO can use the phone app, an accountant can use Cursor on the VPS, and all of them hit the same permissioned ERP tools.

## Non-goals

- Multiplayer game / social network
- Replacing the ERPNext desk for controllers who already live there
- Silent money movement
