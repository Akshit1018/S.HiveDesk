export type Persona =
  | "admin"
  | "sales"
  | "inventory"
  | "purchase"
  | "accounts"
  | "hr";

export type ErpDoc = {
  doctype: string;
  name: string;
  status: string;
  docstatus: 0 | 1 | 2;
  title: string;
  meta: string;
  fields: Record<string, string | number>;
};

export const PERSONAS: {
  id: Persona;
  label: string;
  roles: string[];
  modules: string[];
}[] = [
  {
    id: "admin",
    label: "Administrator",
    roles: ["System Manager"],
    modules: ["CRM", "Selling", "Buying", "Stock", "Accounts", "HR", "Projects"],
  },
  {
    id: "sales",
    label: "Sales",
    roles: ["Sales User", "Sales Manager"],
    modules: ["CRM", "Selling"],
  },
  {
    id: "inventory",
    label: "Warehouse",
    roles: ["Stock User", "Stock Manager"],
    modules: ["Stock"],
  },
  {
    id: "purchase",
    label: "Purchase",
    roles: ["Purchase User"],
    modules: ["Buying", "Stock"],
  },
  {
    id: "accounts",
    label: "Accounts",
    roles: ["Accounts User"],
    modules: ["Accounts", "Selling", "Buying"],
  },
  {
    id: "hr",
    label: "HR",
    roles: ["HR User", "HR Manager"],
    modules: ["HR"],
  },
];

export const MODULES: {
  id: string;
  label: string;
  doctypes: string[];
}[] = [
  { id: "CRM", label: "CRM", doctypes: ["Lead", "Opportunity", "Customer"] },
  { id: "Selling", label: "Selling", doctypes: ["Quotation", "Sales Order", "Sales Invoice"] },
  { id: "Buying", label: "Buying", doctypes: ["Supplier", "Purchase Order", "Purchase Receipt"] },
  { id: "Stock", label: "Stock", doctypes: ["Item", "Warehouse", "Bin", "Material Request", "Stock Entry", "File"] },
  { id: "Accounts", label: "Accounts", doctypes: ["Payment Entry", "Journal Entry"] },
  { id: "HR", label: "HR", doctypes: ["Employee", "Leave Application", "Attendance", "Expense Claim"] },
  { id: "Projects", label: "Projects", doctypes: ["Project", "ToDo"] },
];

export const DOCTYPE_MODULE: Record<string, string> = Object.fromEntries(
  MODULES.flatMap((m) => m.doctypes.map((d) => [d, m.id])),
);

function d(
  doctype: string,
  name: string,
  title: string,
  status: string,
  meta: string,
  fields: Record<string, string | number>,
  docstatus: 0 | 1 | 2 = 1,
): ErpDoc {
  return { doctype, name, title, status, meta, fields, docstatus };
}

export function seedErp(): ErpDoc[] {
  return [
    d("Customer", "CUST-PARLE", "Parle Products Ltd", "Active", "North · INR", {
      territory: "North",
      customer_type: "Company",
    }),
    d("Customer", "CUST-LOCAL", "Jaipur Hardware Mart", "Active", "West · INR", {
      territory: "West",
      customer_type: "Company",
    }),
    d("Supplier", "SUP-TATA", "Tata Steel Ltd", "Active", "Raw Material", {
      supplier_group: "Raw Material",
    }),
    d("Supplier", "SUP-ULTRA", "UltraTech Cement", "Active", "Raw Material", {
      supplier_group: "Raw Material",
    }),
    d("Item", "RM-STEEL-12MM", "12mm Steel Rod", "Active", "Raw Material · ₹85", {
      item_group: "Raw Material",
      standard_rate: 85,
      stock_uom: "Nos",
    }),
    d("Item", "RM-CEMENT-OPC", "OPC Cement 50kg", "Active", "Raw Material · ₹420", {
      item_group: "Raw Material",
      standard_rate: 420,
      stock_uom: "Bag",
    }),
    d("Item", "FG-PIPE-2IN", "2-inch GI Pipe", "Active", "Finished · ₹650", {
      item_group: "Finished Good",
      standard_rate: 650,
      stock_uom: "Nos",
    }),
    d("Item", "FG-VALVE-BR", "Brass Valve 1in", "Active", "Finished · ₹320", {
      item_group: "Finished Good",
      standard_rate: 320,
      stock_uom: "Nos",
    }),
    d("Warehouse", "STORES", "Stores - Main", "Active", "Aarohi Traders", {}),
    d("Warehouse", "FG-WH", "Finished Goods", "Active", "Aarohi Traders", {}),
    d("Bin", "BIN-STEEL", "RM-STEEL-12MM @ STORES", "On hand", "500 Nos", {
      item_code: "RM-STEEL-12MM",
      warehouse: "STORES",
      actual_qty: 500,
    }),
    d("Bin", "BIN-CEMENT", "RM-CEMENT-OPC @ STORES", "On hand", "200 Bag", {
      item_code: "RM-CEMENT-OPC",
      warehouse: "STORES",
      actual_qty: 200,
    }),
    d("Bin", "BIN-PIPE", "FG-PIPE-2IN @ FG-WH", "On hand", "80 Nos", {
      item_code: "FG-PIPE-2IN",
      warehouse: "FG-WH",
      actual_qty: 80,
    }),
    d("Bin", "BIN-VALVE", "FG-VALVE-BR @ FG-WH", "On hand", "150 Nos", {
      item_code: "FG-VALVE-BR",
      warehouse: "FG-WH",
      actual_qty: 150,
    }),
    d("Lead", "LEAD-0001", "Rajasthan Infra Pvt Ltd", "Open", "Website · North", {
      source: "Website",
      email: "ops@rajinfra.example",
    }),
    d("Lead", "LEAD-0002", "Kota Build Mart", "Replied", "Campaign · West", {
      source: "Campaign",
      email: "buy@kotabuild.example",
    }),
    d("Opportunity", "OPP-0001", "Rajasthan Infra — pipes", "Open", "₹2,60,000", {
      party: "LEAD-0001",
      opportunity_amount: 260000,
    }),
    d("Quotation", "QTN-0001", "Quote · Parle 20 pipes", "Open", "₹13,000", {
      customer: "CUST-PARLE",
      grand_total: 13000,
    }),
    d("Sales Order", "SO-0001", "SO · Parle 20 pipes", "To Deliver", "₹13,000", {
      customer: "CUST-PARLE",
      item: "FG-PIPE-2IN",
      qty: 20,
      grand_total: 13000,
    }),
    d("Sales Invoice", "SI-0001", "Invoice · Jaipur Hardware", "Unpaid", "₹9,600", {
      customer: "CUST-LOCAL",
      grand_total: 9600,
    }),
    d("Purchase Order", "PO-SEED", "PO · Tata 100 steel", "To Receive", "₹8,500", {
      supplier: "SUP-TATA",
      item: "RM-STEEL-12MM",
      qty: 100,
      grand_total: 8500,
    }),
    d("Employee", "HR-EMP-0001", "Priya Sharma", "Active", "Design · Kota", {
      department: "Design",
      company_email: "priya@aarohi.example",
    }),
    d("Employee", "HR-EMP-0002", "Amit Verma", "Active", "Warehouse · Kota", {
      department: "Warehouse",
      company_email: "amit@aarohi.example",
    }),
    d("Leave Application", "LV-0001", "Priya · Casual Leave", "Open", "2 days", {
      employee: "HR-EMP-0001",
      leave_type: "Casual Leave",
      total_leave_days: 2,
    }),
    d("Attendance", "ATT-0001", "Amit · Present", "Present", "Today", {
      employee: "HR-EMP-0002",
    }),
    d("Expense Claim", "EXP-0001", "Priya · Travel", "Draft", "₹4,200", {
      employee: "HR-EMP-0001",
      total_claimed_amount: 4200,
    }),
    d("Project", "PRJ-UX", "Token transfer UX", "Open", "Q2", {
      customer: "CUST-PARLE",
    }),
    d("ToDo", "TODO-0001", "Follow up Kota Build Mart", "Open", "Sales", {
      reference: "LEAD-0002",
    }),
  ];
}

export function personaSees(persona: Persona, doctype: string): boolean {
  if (persona === "admin") return true;
  const mod = DOCTYPE_MODULE[doctype];
  const p = PERSONAS.find((x) => x.id === persona);
  return Boolean(mod && p?.modules.includes(mod));
}

export const AGENT_TO_PERSONA: Record<string, Persona> = {
  sales: "sales",
  warehouse: "inventory",
  purchase: "purchase",
  accounts: "accounts",
  hr: "hr",
  ops: "admin",
  ceo: "admin",
  support: "sales",
  caller: "sales",
  whatsapp: "sales",
};
