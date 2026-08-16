export type MeetingProvider = "zoom" | "meet";
export type TaskStatus = "todo" | "progress" | "done";
export type TaskPriority = "urgent" | "today" | "tomorrow" | "later";

export type Person = {
  id: string;
  name: string;
  role: string;
  initials: string;
  tone: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  tz: string;
  provider: MeetingProvider;
  tag?: string;
  tagTone?: "blue" | "peach" | "pink" | "mint";
  guests: string[];
  extra: number;
  link: string;
  notes: string;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due?: string;
  meeting?: string;
};

export type FileItem = {
  id: string;
  name: string;
  kind: "pdf" | "xlsx" | "ppt" | "fig" | "miro";
  size: string;
  source: string;
};

export type AgentTemplate =
  | "sales"
  | "warehouse"
  | "purchase"
  | "accounts"
  | "hr"
  | "ops"
  | "ceo"
  | "support"
  | "caller"
  | "whatsapp";

export type Agent = {
  id: string;
  name: string;
  title: string;
  template: AgentTemplate;
  model: string;
  persona: string;
  channels: string[];
  active: boolean;
};

export const PEOPLE: Record<string, Person> = {
  sam: { id: "sam", name: "Sam Smith", role: "Product", initials: "SS", tone: "bg-accent-soft text-accent" },
  aya: { id: "aya", name: "Aya Chen", role: "UX", initials: "AC", tone: "bg-ok-soft text-ok" },
  leo: { id: "leo", name: "Leo Park", role: "Eng", initials: "LP", tone: "bg-warn-soft text-warn" },
  nia: { id: "nia", name: "Nia Brooks", role: "Research", initials: "NB", tone: "bg-accent-soft text-accent" },
  raj: { id: "raj", name: "Raj Mehta", role: "PM", initials: "RM", tone: "bg-ok-soft text-ok" },
  kim: { id: "kim", name: "Kim Adeyemi", role: "Marketing", initials: "KA", tone: "bg-warn-soft text-warn" },
};

export const MEETINGS: Meeting[] = [
  {
    id: "ux-sync",
    title: "UX Design Sync — Token Transfer Flow",
    date: "Thu, 17 Apr",
    start: "2:00 PM",
    end: "3:00 PM",
    tz: "IST",
    provider: "zoom",
    guests: ["aya", "leo", "nia"],
    extra: 4,
    link: "https://zoom.us/j/hivedesk-ux",
    notes:
      "Aligned on Q2 product priorities with a focus on conversion and onboarding UX. Reviewed bottlenecks in the token transfer flow and wallet connection logic. Agreed to explore clearer UI for error handling and slippage.",
  },
  {
    id: "mkt",
    title: "Quarterly Marketing Review and Creative Strategy",
    date: "Fri, 18 Apr",
    start: "1:00 PM",
    end: "1:45 PM",
    tz: "IST",
    provider: "meet",
    tag: "Marketing",
    tagTone: "peach",
    guests: ["kim", "sam", "raj"],
    extra: 2,
    link: "https://meet.google.com/hivedesk-mkt",
    notes: "Review campaign performance and lock creative for the next quarter.",
  },
  {
    id: "partner",
    title: "Partnership Strategy Sync: Collaboration Alignment",
    date: "Fri, 18 Apr",
    start: "2:00 PM",
    end: "3:00 PM",
    tz: "IST",
    provider: "meet",
    tag: "Partnership",
    tagTone: "blue",
    guests: ["raj", "leo", "kim"],
    extra: 8,
    link: "https://meet.google.com/hivedesk-ptn",
    notes: "Map partner integrations and decide on the next three outreach targets.",
  },
  {
    id: "delivery",
    title: "Weekly Project Oversight and Delivery Coordination",
    date: "Mon, 21 Apr",
    start: "12:00 PM",
    end: "1:00 PM",
    tz: "IST",
    provider: "zoom",
    tag: "Delivery",
    tagTone: "pink",
    guests: ["sam", "aya", "raj"],
    extra: 6,
    link: "https://zoom.us/j/hivedesk-ops",
    notes: "Unblock shipping, review risk, and lock the Friday release checklist.",
  },
  {
    id: "ux-session",
    title: "UX design Session",
    date: "Sun, 20 Apr",
    start: "1:00 PM",
    end: "2:00 PM",
    tz: "IST",
    provider: "meet",
    guests: ["sam", "aya", "nia", "leo", "raj", "kim"],
    extra: 0,
    link: "https://meet.google.com/ofrd-hdhcb",
    notes:
      "Discuss improvements to the current token transfer flow, address usability issues, and align with engineering.",
  },
];

export const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Design Meeting", status: "todo", priority: "today", due: "2 pm", meeting: "ux-sync" },
  { id: "t2", title: "Refine UI components based on user feedback", status: "todo", priority: "urgent" },
  { id: "t3", title: "Prepare a prototype for usability testing", status: "progress", priority: "tomorrow" },
  { id: "t4", title: "Collaborate with developers on implementation detail", status: "todo", priority: "tomorrow" },
  { id: "t5", title: "Write a prospect email for Parle", status: "todo", priority: "later" },
];

export const FILES: FileItem[] = [
  { id: "f1", name: "Miro — Product Analytics and Statistics", kind: "miro", size: "Board", source: "Miro" },
  { id: "f2", name: "Figma — UX Research", kind: "fig", size: "File", source: "Figma" },
  { id: "f3", name: "R2 Strategic Goals & Objectives.pdf", kind: "pdf", size: "64 KB", source: "Drive" },
  { id: "f4", name: "google-certificate.pdf", kind: "pdf", size: "94 KB", source: "Drive" },
  { id: "f5", name: "UX Research Insights and Design Goals.ppt", kind: "ppt", size: "124 KB", source: "Drive" },
  { id: "f6", name: "Accessibility Improvements.pdf", kind: "pdf", size: "50 KB", source: "Drive" },
];

export const AGENT_TEMPLATES: Record<
  AgentTemplate,
  { title: string; defaultName: string; persona: string; channel: string }
> = {
  sales: {
    title: "Sales representative",
    defaultName: "Riya · Sales",
    persona: "Own leads, quotations, and sales orders. Confirm customer, item, and qty.",
    channel: "sales",
  },
  warehouse: {
    title: "Warehouse manager",
    defaultName: "Arjun · Warehouse",
    persona: "Report exact stock. Draft stock entries. Never invent quantities.",
    channel: "stock",
  },
  purchase: {
    title: "Purchase officer",
    defaultName: "Rohan · Purchase",
    persona: "Draft POs with supplier, item, qty, and rate. Confirm before submit.",
    channel: "buying",
  },
  accounts: {
    title: "Accountant",
    defaultName: "Meera · Accounts",
    persona: "Draft invoices and payments. Never submit money moves without approval.",
    channel: "accounts",
  },
  hr: {
    title: "HR officer",
    defaultName: "Kavita · HR",
    persona: "Leave, attendance, and expense claims. Confirm names and dates.",
    channel: "hr",
  },
  ops: {
    title: "Ops coordinator",
    defaultName: "Dev · Ops",
    persona: "Route cross-team work and propose clear multi-step plans.",
    channel: "general",
  },
  ceo: {
    title: "Chief of staff",
    defaultName: "Isha · Chief of staff",
    persona: "Brief the CEO. Summarize ERP risk, cash, and open commitments.",
    channel: "exec",
  },
  support: {
    title: "Support desk",
    defaultName: "Neel · Support",
    persona: "Log issues against customers. Never invent invoice numbers.",
    channel: "support",
  },
  caller: {
    title: "Calling agent",
    defaultName: "Aira · Voice",
    persona: "Outbound/inbound voice. Pull live stock and AR before speaking. File transcripts.",
    channel: "calling",
  },
  whatsapp: {
    title: "WhatsApp agent",
    defaultName: "Vani · WhatsApp",
    persona: "Reply only when @mentioned in a group. Confirm before ERP writes.",
    channel: "whatsapp",
  },
};

export const INITIAL_AGENTS: Agent[] = (Object.keys(AGENT_TEMPLATES) as AgentTemplate[]).map(
  (template, i) => ({
    id: `ai-${template}`,
    name: AGENT_TEMPLATES[template].defaultName,
    title: AGENT_TEMPLATES[template].title,
    template,
    model: i % 2 === 0 ? "grok-4.5" : "claude-sonnet",
    persona: AGENT_TEMPLATES[template].persona,
    channels: [AGENT_TEMPLATES[template].channel, "general"],
    active: true,
  }),
);

export const GROUPS = [
  { id: "hq", name: "Aarohi HQ", desc: "Company-wide" },
  { id: "sales-g", name: "Sales floor", desc: "CRM + selling" },
  { id: "ops-g", name: "Warehouse", desc: "Stock + buying" },
];

export const CHANNELS = [
  { id: "general", group: "hq", name: "general", topic: "Anything · routed by Ops" },
  { id: "sales", group: "sales-g", name: "sales", topic: "Leads, SO, quotations" },
  { id: "stock", group: "ops-g", name: "stock", topic: "Bins and stock entries" },
  { id: "buying", group: "ops-g", name: "buying", topic: "Suppliers and POs" },
  { id: "accounts", group: "hq", name: "accounts", topic: "Invoices and payments" },
  { id: "hr", group: "hq", name: "hr", topic: "Leave, claims, attendance" },
  { id: "calling", group: "sales-g", name: "calling", topic: "Voice agent + transcripts" },
  { id: "whatsapp", group: "sales-g", name: "whatsapp", topic: "WhatsApp mentions" },
  { id: "exec", group: "hq", name: "exec", topic: "CEO brief" },
  { id: "support", group: "sales-g", name: "support", topic: "Tickets" },
];

export type CallTranscript = {
  id: string;
  with: string;
  direction: "in" | "out";
  at: string;
  duration: string;
  agent: string;
  inventoryUsed: string[];
  lines: { who: string; text: string }[];
};

export const CALLS: CallTranscript[] = [
  {
    id: "call-1",
    with: "Parle Products Ltd",
    direction: "out",
    at: "12 Aug · 16:22",
    duration: "3m 12s",
    agent: "Aira · Voice",
    inventoryUsed: ["FG-PIPE-2IN @ FG-WH · 80"],
    lines: [
      { who: "Aira", text: "Hello, this is Aira from Aarohi Traders. I see 80 units of 2-inch GI pipe on hand." },
      { who: "Parle", text: "Can you reserve 20 for SO-0001 this week?" },
      { who: "Aira", text: "Yes. I will draft the reservation and send a confirmation after your buyer approves." },
    ],
  },
  {
    id: "call-2",
    with: "Kota Build Mart",
    direction: "in",
    at: "11 Aug · 11:04",
    duration: "2m 05s",
    agent: "Aira · Voice",
    inventoryUsed: ["RM-CEMENT-OPC @ STORES · 200"],
    lines: [
      { who: "Kota", text: "Do you have OPC 50kg in Kota today?" },
      { who: "Aira", text: "Live bin shows 200 bags at Stores. I can raise a quotation from LEAD-0002." },
    ],
  },
];

export const CHAT_CHIPS = [
  "Summarize my last meeting",
  "List open leads",
  "Stock of cement",
  "Raise an invoice for Parle",
  "Update inventory — receive 50 steel",
  "Claim travel expense for Priya",
  "Create PO for 50 steel from Tata",
];

