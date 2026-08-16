import { create } from "zustand";
import {
  AGENT_TEMPLATES,
  INITIAL_AGENTS,
  INITIAL_TASKS,
  type Agent,
  type AgentTemplate,
  type FileItem,
  type Task,
  type TaskPriority,
  type TaskStatus,
  FILES,
} from "@/data/seed";
import { updateBin } from "@/lib/erp-engine";
import { AGENT_TO_PERSONA, PERSONAS, personaSees, seedErp, type ErpDoc, type Persona } from "@/data/erp";

export type MailCard = {
  to: string;
  subject: string;
  greeting: string;
  sections: { title: string; tone: "ok" | "warn" | "chip"; items: string[] }[];
};

export type OutboxMail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  at: string;
};

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  agentName?: string;
  thinking?: string;
  mail?: MailCard;
  records?: ErpDoc[];
  proposal?: {
    id: string;
    summary: string;
    doctype: string;
    payload: Record<string, string | number>;
  };
};

export type Conversation = {
  id: string;
  title: string;
  channel: string;
  agentId: string;
  messages: ChatMsg[];
};

type HiveState = {
  persona: Persona;
  tasks: Task[];
  files: FileItem[];
  agents: Agent[];
  docs: ErpDoc[];
  conversations: Conversation[];
  activeConvId: string;
  activeAgentId: string;
  pendingId: string | null;
  thinking: boolean;
  mailConnected: boolean;
  mailAddress: string;
  outbox: OutboxMail[];
  seq: Record<string, number>;
  drawerOpen: boolean;
  setDrawer: (v: boolean) => void;
  setPersona: (p: Persona) => void;
  setActiveAgent: (id: string) => void;
  openConversation: (id: string) => void;
  newConversation: (channel?: string, agentId?: string) => string;
  addTask: (title: string, priority?: TaskPriority) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  prioritize: () => void;
  hire: (input: { template: AgentTemplate; name: string; model: string; persona: string }) => void;
  updateAgent: (id: string, patch: Partial<Agent>) => void;
  deactivate: (id: string) => void;
  send: (text: string) => void;
  resolveProposal: (id: string, decision: "approve" | "reject") => void;
  connectMail: (address: string) => void;
  disconnectMail: () => void;
  sendMail: (card: MailCard) => { ok: boolean; reason?: string };
  uploadFile: (filename: string, attached?: { doctype?: string; name?: string }) => void;
  visibleDocs: (doctype?: string) => ErpDoc[];
  getDoc: (doctype: string, name: string) => ErpDoc | undefined;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nextName(seq: Record<string, number>, doctype: string, prefix: string) {
  const n = (seq[doctype] ?? 0) + 1;
  seq[doctype] = n;
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

export const useHive = create<HiveState>((set, get) => ({
  persona: "admin",
  tasks: INITIAL_TASKS,
  files: FILES,
  agents: INITIAL_AGENTS,
  docs: seedErp(),
  conversations: [
    {
      id: "c-general",
      title: "#general",
      channel: "general",
      agentId: "ai-ops",
      messages: [],
    },
  ],
  activeConvId: "c-general",
  activeAgentId: "ai-ops",
  pendingId: null,
  thinking: false,
  mailConnected: false,
  mailAddress: "",
  outbox: [],
  seq: { "Purchase Order": 1, "Sales Order": 1, "Sales Invoice": 1, "Leave Application": 1, Communication: 0, Lead: 2, "Stock Entry": 0, File: 0 },
  drawerOpen: false,

  setDrawer: (drawerOpen) => set({ drawerOpen }),

  setPersona: (persona) => {
    const map: Record<Persona, string> = {
      admin: "ai-ops",
      sales: "ai-sales",
      inventory: "ai-warehouse",
      purchase: "ai-purchase",
      accounts: "ai-accounts",
      hr: "ai-hr",
    };
    set({ persona, activeAgentId: map[persona] });
  },

  setActiveAgent: (id) => set({ activeAgentId: id }),

  openConversation: (id) => {
    const c = get().conversations.find((x) => x.id === id);
    if (c) set({ activeConvId: id, activeAgentId: c.agentId, drawerOpen: false });
  },

  newConversation: (channel = "general", agentId) => {
    const agent = agentId ?? get().activeAgentId;
    const id = uid("c");
    const title = channel.startsWith("dm:")
      ? get().agents.find((a) => a.id === agent)?.name ?? "New chat"
      : `#${channel}`;
    const conv: Conversation = { id, title, channel, agentId: agent, messages: [] };
    set((s) => ({
      conversations: [conv, ...s.conversations],
      activeConvId: id,
      activeAgentId: agent,
      drawerOpen: false,
    }));
    return id;
  },

  addTask: (title, priority = "later") =>
    set((s) => ({
      tasks: [{ id: uid("t"), title, status: "todo", priority }, ...s.tasks],
    })),

  setTaskStatus: (id, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  prioritize: () =>
    set((s) => {
      const order: TaskPriority[] = ["urgent", "today", "tomorrow", "later"];
      return {
        tasks: [...s.tasks].sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority)),
      };
    }),

  hire: ({ template, name, model, persona }) =>
    set((s) => {
      const agent: Agent = {
        id: uid("ai"),
        name: name || AGENT_TEMPLATES[template].defaultName,
        title: AGENT_TEMPLATES[template].title,
        template,
        model,
        persona: persona || AGENT_TEMPLATES[template].persona,
        channels: [AGENT_TEMPLATES[template].channel, "general"],
        active: true,
      };
      return { agents: [...s.agents, agent], activeAgentId: agent.id };
    }),

  updateAgent: (id, patch) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  deactivate: (id) =>
    set((s) => {
      const agents = s.agents.map((a) => (a.id === id ? { ...a, active: false } : a));
      const next = agents.find((a) => a.active);
      return {
        agents,
        activeAgentId: s.activeAgentId === id ? (next?.id ?? "") : s.activeAgentId,
      };
    }),

  send: (raw) => {
    const text = raw.trim();
    if (!text || get().thinking) return;
    const user: ChatMsg = { id: uid("m"), role: "user", text };
    set((s) => ({
      thinking: true,
      conversations: s.conversations.map((c) =>
        c.id === s.activeConvId ? { ...c, messages: [...c.messages, user], title: c.messages.length ? c.title : text.slice(0, 42) } : c,
      ),
    }));
    window.setTimeout(() => {
      const state = get();
      const agent = state.agents.find((a) => a.id === state.activeAgentId);
      const reply = planReply(text, agent, state);
      set((s) => ({
        thinking: false,
        pendingId: reply.proposal?.id ?? s.pendingId,
        conversations: s.conversations.map((c) =>
          c.id === s.activeConvId ? { ...c, messages: [...c.messages, reply] } : c,
        ),
      }));
      if (/priorit/i.test(text)) get().prioritize();
    }, 480);
  },

  resolveProposal: (id, decision) => {
    const state = get();
    const msgs = state.conversations.flatMap((c) => c.messages);
    const msg = [...msgs].reverse().find((m) => m.proposal?.id === id);
    if (!msg?.proposal) return;
    if (decision === "reject") {
      set((s) => ({
        pendingId: null,
        conversations: patchConv(s, {
          id: uid("m"),
          role: "assistant",
          text: `Proposal \`${id}\` rejected. Nothing written to ERP.`,
        }),
      }));
      return;
    }
    const created = applyWrite(state, msg.proposal.doctype, msg.proposal.payload);
    let docs = created.docs;
    if (msg.proposal.doctype === "Stock Entry") {
      const item = String(msg.proposal.payload.item || "RM-STEEL-12MM");
      const qty = Number(msg.proposal.payload.qty || 0);
      docs = updateBin({ docs, seq: created.seq }, item, qty).docs;
    }
    const done: ChatMsg = {
      id: uid("m"),
      role: "assistant",
      text: `Done. Created ${created.doc.doctype} \`${created.doc.name}\` as Draft in ERP.`,
      records: [created.doc],
    };
    set((s) => ({
      pendingId: null,
      seq: created.seq,
      docs,
      conversations: patchConv(s, done),
    }));
  },

  connectMail: (address) => set({ mailConnected: true, mailAddress: address }),
  disconnectMail: () => set({ mailConnected: false, mailAddress: "" }),

  sendMail: (card) => {
    const s = get();
    if (!s.mailConnected) {
      return { ok: false, reason: "Connect Google Mail first." };
    }
    const body = [card.greeting, ...card.sections.flatMap((sec) => [sec.title, ...sec.items])].join("\n");
    const commName = nextName({ ...s.seq }, "Communication", "COMM");
    const comm: ErpDoc = {
      doctype: "Communication",
      name: commName,
      title: card.subject,
      status: "Sent",
      meta: card.to,
      docstatus: 1,
      fields: { to: card.to, subject: card.subject, sent_from: s.mailAddress },
    };
    const mail: OutboxMail = {
      id: uid("mail"),
      to: card.to,
      subject: card.subject,
      body,
      at: new Date().toLocaleString(),
    };
    const note: ChatMsg = {
      id: uid("m"),
      role: "assistant",
      text: `Sent via ${s.mailAddress}. Logged as Communication \`${commName}\`.`,
      records: [comm],
    };
    set({
      outbox: [mail, ...s.outbox],
      docs: [comm, ...s.docs],
      seq: { ...s.seq, Communication: (s.seq.Communication ?? 0) + 1 },
      conversations: patchConv(s, note),
    });
    return { ok: true };
  },

  uploadFile: (filename, attached) => {
    const s = get();
    const created = applyWrite(s, "File", {
      title: filename,
      attached_to_doctype: attached?.doctype ?? "",
      attached_to_name: attached?.name ?? "",
      meta: "Uploaded",
    });
    const file: FileItem = {
      id: created.doc.name,
      name: filename,
      kind: "pdf",
      size: "local",
      source: "Upload",
    };
    const note: ChatMsg = {
      id: uid("m"),
      role: "assistant",
      text: `Attached \`${filename}\` as File ${created.doc.name}.`,
      records: [created.doc],
    };
    set({
      files: [file, ...s.files],
      docs: created.docs,
      seq: created.seq,
      conversations: patchConv(s, note),
    });
  },

  visibleDocs: (doctype) => {
    const { persona, docs } = get();
    return docs.filter((d) => personaSees(persona, d.doctype) && (!doctype || d.doctype === doctype));
  },

  getDoc: (doctype, name) => get().docs.find((d) => d.doctype === doctype && d.name === name),
}));

function patchConv(s: { conversations: Conversation[]; activeConvId: string }, msg: ChatMsg) {
  return s.conversations.map((c) =>
    c.id === s.activeConvId ? { ...c, messages: [...c.messages, msg] } : c,
  );
}

function applyWrite(
  state: HiveState,
  doctype: string,
  payload: Record<string, string | number>,
): { docs: ErpDoc[]; seq: Record<string, number>; doc: ErpDoc } {
  const seq = { ...state.seq };
  const prefixes: Record<string, string> = {
    "Purchase Order": "PO",
    "Sales Order": "SO",
    "Leave Application": "LV",
    Lead: "LEAD",
    "Expense Claim": "EXP",
    "Material Request": "MR",
    Quotation: "QTN",
  };
  const name = nextName(seq, doctype, prefixes[doctype] ?? "DOC");
  const title = String(payload.title || payload.summary || `${doctype} ${name}`);
  const doc: ErpDoc = {
    doctype,
    name,
    title,
    status: "Draft",
    meta: String(payload.meta || "Created by HiveDesk"),
    docstatus: 0,
    fields: payload,
  };
  return { docs: [doc, ...state.docs], seq, doc };
}

function planReply(text: string, agent: Agent | undefined, state: HiveState): ChatMsg {
  const agentName = agent?.name ?? "HiveDesk";
  const template = agent?.template ?? "ops";
  const lower = text.toLowerCase();
  const base = { id: uid("m"), role: "assistant" as const, agentName };
  const persona = state.persona;
  const can = (dt: string) =>
    personaSees(persona, dt) &&
    (template === "ops" || AGENT_TO_PERSONA[template] === "admin" || personaSees(AGENT_TO_PERSONA[template], dt));

  if (/connect (gmail|mail|google)|attach mail/i.test(lower)) {
    return {
      ...base,
      text: state.mailConnected
        ? `Mail is already attached as ${state.mailAddress}. I can send meeting recaps and customer emails into ERP Communications.`
        : "Open Mail and tap Connect Google. After that, Send on any draft posts a Communication on the linked Customer / Lead.",
    };
  }

  if (/summar|meeting|gmail|takeaway/i.test(lower) && !/prospect|parle|purchase|po /i.test(lower)) {
    return {
      ...base,
      thinking: "Read last meeting + CRM notes",
      text: "Drafted a Gmail recap from the UX Design Sync and the open Parle opportunity. Review, then send — it will log on the customer.",
      mail: {
        to: "ux@aarohi.example",
        subject: "Meeting Summary — Key Takeaways & Next Steps",
        greeting:
          "Hi Team,\nThanks for joining the UX Design Sync. Linked CRM: Opportunity OPP-0001 (Rajasthan Infra) and Project PRJ-UX.",
        sections: [
          {
            title: "Key Takeaways",
            tone: "ok",
            items: [
              "Q2 focus: conversion and onboarding UX on token transfer.",
              "Wallet connection is the drop-off. Read-only explore-before-connect approved.",
              "Parle SO-0001 (20 pipes, ₹13,000) is To Deliver — warehouse to confirm FG-PIPE-2IN.",
            ],
          },
          {
            title: "Decisions Made",
            tone: "warn",
            items: [
              "Redesign Connect Wallet this sprint.",
              "Show slippage and INR conversion on transfer.",
              "Sales to convert LEAD-0002 Kota Build Mart this week.",
            ],
          },
          {
            title: "Action Items",
            tone: "chip",
            items: [
              "Aya — Connect Wallet wire by Friday.",
              "Arjun · Warehouse — reserve 20 × FG-PIPE-2IN for SO-0001.",
              "Riya · Sales — follow up LEAD-0002.",
            ],
          },
        ],
      },
    };
  }

  if (/prospect|email parle|write .*email/i.test(lower)) {
    return {
      ...base,
      text: "Prospect note for Parle, using Customer CUST-PARLE and open quotation QTN-0001.",
      mail: {
        to: "procurement@parle.example",
        subject: "Aarohi Traders — GI pipe availability & QTN-0001",
        greeting: "Hello Parle team,\nSharing a short update from our ERP on your account.",
        sections: [
          {
            title: "Account snapshot",
            tone: "ok",
            items: [
              "Open quotation QTN-0001 · 20 × FG-PIPE-2IN · ₹13,000.",
              "Sales Order SO-0001 is To Deliver.",
              "Finished goods on hand: 80 pipes at FG-WH.",
            ],
          },
          {
            title: "Ask",
            tone: "chip",
            items: ["Confirm if we should raise the balance 20 units this week."],
          },
        ],
      },
    };
  }

  if (/priorit/i.test(lower)) {
    return {
      ...base,
      text: "Reordered My Tasks by urgency. Urgent and same-day sit at the top. Open Tasks to change status.",
    };
  }

  if (/stock|inventory|bin|how many|available/i.test(lower) && !/update|receive|issue|entry/i.test(lower)) {
    if (!can("Bin")) {
      return { ...base, text: `Stock is a Warehouse module. Switch profile to Warehouse or Admin, or chat with Arjun.` };
    }
    const bins = state.docs.filter((d) => d.doctype === "Bin");
    const hint = /cement/i.test(lower)
      ? bins.filter((b) => String(b.fields.item_code).includes("CEMENT"))
      : /steel|rod/i.test(lower)
        ? bins.filter((b) => String(b.fields.item_code).includes("STEEL"))
        : /pipe/i.test(lower)
          ? bins.filter((b) => String(b.fields.item_code).includes("PIPE"))
          : bins;
    return {
      ...base,
      text: `Live Bin from Stock (${hint.length} row${hint.length === 1 ? "" : "s"}).`,
      records: hint,
    };
  }

  if (/\bleads?\b/i.test(lower) && /list|show|open|all/i.test(lower)) {
    if (!can("Lead")) return { ...base, text: "Leads are CRM. Switch to Sales or Admin." };
    const rows = state.docs.filter((d) => d.doctype === "Lead");
    return { ...base, text: `CRM · Lead — ${rows.length} row(s).`, records: rows };
  }

  if (/create|add|new/i.test(lower) && /lead/i.test(lower)) {
    if (!can("Lead")) return { ...base, text: "Creating leads needs the Sales seat." };
    const name = text.replace(/.*lead( for| named)?/i, "").trim() || "New Lead";
    return {
      ...base,
      text: `Draft Lead for ${name}. Approve to write it into CRM.`,
      proposal: {
        id: uid("prop"),
        summary: `Create Lead · ${name}`,
        doctype: "Lead",
        payload: { title: name, status: "Open", source: "HiveDesk", meta: "Open · HiveDesk" },
      },
    };
  }

  if (/employee|leave|attendance|expense|payroll/i.test(lower) && /list|show|all/i.test(lower)) {
    if (!can("Employee")) return { ...base, text: "People data is HR. Switch to the HR profile." };
    const dt = /leave/i.test(lower)
      ? "Leave Application"
      : /expense/i.test(lower)
        ? "Expense Claim"
        : /attendance/i.test(lower)
          ? "Attendance"
          : "Employee";
    const rows = state.docs.filter((d) => d.doctype === dt);
    return { ...base, text: `HR · ${dt} — ${rows.length} row(s).`, records: rows };
  }

  if (/customer|supplier|sales order|purchase order|quotation|invoice/i.test(lower) && /list|show|all/i.test(lower)) {
    const map: [RegExp, string][] = [
      [/customer/, "Customer"],
      [/supplier/, "Supplier"],
      [/quotation/, "Quotation"],
      [/sales order/, "Sales Order"],
      [/purchase order|\bpo\b/, "Purchase Order"],
      [/invoice/, "Sales Invoice"],
    ];
    const hit = map.find(([re]) => re.test(lower));
    if (!hit) return { ...base, text: "Which DocType should I list?" };
    if (!can(hit[1])) return { ...base, text: `${hit[1]} is outside this profile.` };
    const rows = state.docs.filter((d) => d.doctype === hit[1]);
    return { ...base, text: `${hit[1]} — ${rows.length} row(s).`, records: rows };
  }

  if (/purchase|create po|\bpo\b|tata|procure/i.test(lower)) {
    if (!can("Purchase Order")) {
      return { ...base, text: `Purchase Orders need the Purchase or Admin profile. I am ${agentName}.` };
    }
    const qty = Number(lower.match(/(\d+)/)?.[1] ?? 50);
    return {
      ...base,
      text: `Draft PO from Tata Steel Ltd: ${qty} × RM-STEEL-12MM @ ₹85 = ₹${(qty * 85).toLocaleString("en-IN")}.`,
      proposal: {
        id: uid("prop"),
        summary: `Create PO · Tata · ${qty} steel · ₹${qty * 85}`,
        doctype: "Purchase Order",
        payload: {
          title: `PO · Tata ${qty} steel`,
          supplier: "SUP-TATA",
          item: "RM-STEEL-12MM",
          qty,
          grand_total: qty * 85,
          meta: `₹${qty * 85}`,
        },
      },
    };
  }

  if (/sales order|create so|book order|parle/i.test(lower) && !/email|mail|prospect/i.test(lower)) {
    if (!can("Sales Order")) {
      return { ...base, text: `Sales Orders need the Sales or Admin profile. I am ${agentName}.` };
    }
    const qty = Number(lower.match(/(\d+)/)?.[1] ?? 40);
    return {
      ...base,
      text: `Draft SO for Parle Products Ltd: ${qty} × FG-PIPE-2IN @ ₹650 = ₹${(qty * 650).toLocaleString("en-IN")}. Stock on hand: 80.`,
      proposal: {
        id: uid("prop"),
        summary: `Create SO · Parle · ${qty} pipes · ₹${qty * 650}`,
        doctype: "Sales Order",
        payload: {
          title: `SO · Parle ${qty} pipes`,
          customer: "CUST-PARLE",
          item: "FG-PIPE-2IN",
          qty,
          grand_total: qty * 650,
          meta: `₹${qty * 650}`,
        },
      },
    };
  }

  if (/invoice|raise bill|bill parle/i.test(lower)) {
    if (!can("Sales Invoice")) return { ...base, text: "Invoices need Accounts or Admin." };
    return {
      ...base,
      text: "Draft Sales Invoice for Parle against SO-0001 · 20 × FG-PIPE-2IN · ₹13,000.",
      proposal: {
        id: uid("prop"),
        summary: "Sales Invoice · Parle · ₹13,000",
        doctype: "Sales Invoice",
        payload: {
          title: "Invoice · Parle pipes",
          customer: "CUST-PARLE",
          item: "FG-PIPE-2IN",
          qty: 20,
          grand_total: 13000,
          meta: "₹13,000",
        },
      },
    };
  }

  if (/update inventory|stock entry|receive \d+|issue stock/i.test(lower)) {
    if (!can("Stock Entry")) return { ...base, text: "Stock entries need Warehouse or Admin." };
    const qty = Number(lower.match(/(\d+)/)?.[1] ?? 50);
    return {
      ...base,
      text: `Draft Stock Entry: receive ${qty} × RM-STEEL-12MM into STORES. Approve to update the Bin.`,
      proposal: {
        id: uid("prop"),
        summary: `Stock Entry · +${qty} RM-STEEL-12MM`,
        doctype: "Stock Entry",
        payload: {
          title: `Receive ${qty} steel`,
          item: "RM-STEEL-12MM",
          qty,
          warehouse: "STORES",
          meta: `+${qty} STORES`,
        },
      },
    };
  }

  if (/claim|expense/i.test(lower) && !/list|show|all/i.test(lower)) {
    if (!can("Leave Application")) return { ...base, text: "Leave and claims are HR. Switch profile." };
    if (/expense/i.test(lower)) {
      return {
        ...base,
        text: "Draft Expense Claim for Priya Sharma · Travel · ₹4,200.",
        proposal: {
          id: uid("prop"),
          summary: "Expense Claim · Priya · ₹4,200",
          doctype: "Expense Claim",
          payload: {
            title: "Priya · Travel",
            employee: "HR-EMP-0001",
            total_claimed_amount: 4200,
            meta: "₹4,200",
          },
        },
      };
    }
    return {
      ...base,
      text: "Draft Leave Application for Priya Sharma — Casual Leave, 2 days.",
      proposal: {
        id: uid("prop"),
        summary: "Leave · Priya Sharma · 2 days",
        doctype: "Leave Application",
        payload: {
          title: "Priya · Casual Leave",
          employee: "HR-EMP-0001",
          leave_type: "Casual Leave",
          total_leave_days: 2,
          meta: "2 days",
        },
      },
    };
  }

  if (/who are you|help|what can|modules/i.test(lower)) {
    const mods = PERSONAS.find((p) => p.id === persona)?.modules.join(", ");
    return {
      ...base,
      text: `I'm ${agentName}. Your profile **${persona}** can see: ${mods}.\nI can list ERP documents, draft SO/PO/Lead/Leave, recap meetings to Gmail, and log sent mail as Communication.`,
    };
  }

  return {
    ...base,
    text: `I can work ERP + HR + CRM from this seat (${agentName}). Try: list leads, stock of cement, create PO for 50 steel, apply leave, or summarize my last meeting.`,
  };
}
