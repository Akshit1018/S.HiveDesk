# HiveDesk — Open Source AI ERP Desk (Frappe / ERPNext Ready)

**HiveDesk** is an open-source **in-browser ERP** with AI employee seats. Chat with sales, warehouse, purchase, accounts, HR, and ops agents. They read CRM, stock, and invoices — and **ask before they write**.

Built as a sandbox that can later point at a real **Frappe / ERPNext** site over REST + MCP.

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Node.js 22](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)

## Features

- **AI seats** — hire sales, warehouse, purchase, accounts, HR, ops, CEO, support, caller, WhatsApp
- **ERP modules** — CRM, Selling, Buying, Stock, Accounts, HR, Projects, Files
- **Role-aware** — a warehouse agent cannot post to payroll
- **Confirm-before-write** proposal cards
- **MCP server** at `GET/POST /api/mcp` (JSON-RPC) for other agents
- **Mail + call transcripts** in the sandbox
- Mobile-first amber PWA shell

## Who it is for

- Teams evaluating **AI inside ERPNext / Frappe**
- Founders who want an **open source ERP chatbot** without standing up a bench first
- Developers building **MCP tools** against CRM and inventory

## Quick start

```bash
git clone https://github.com/Akshit1018/S.HiveDesk.git
cd S.HiveDesk
npm install
VITE_AUTH_ENABLED=false npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

This demo uses an in-browser ERP engine (PGLite). It is **not** a live Frappe site. Production swap notes live in [`docs/HANDOVER.md`](docs/HANDOVER.md).

## Tech stack

React 19 · TanStack Start · Vite · Tailwind · Zustand · PGLite · MCP JSON-RPC

## License

[MIT](LICENSE)

## Keywords

open source ERP, AI ERP assistant, ERPNext chatbot, Frappe AI agent, MCP ERP, in-browser ERP, inventory CRM HR desk, confirm-before-write agents
