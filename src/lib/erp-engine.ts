import { seedErp, type ErpDoc } from "@/data/erp";

export type Engine = {
  docs: ErpDoc[];
  seq: Record<string, number>;
};

const PREFIX: Record<string, string> = {
  "Purchase Order": "PO",
  "Sales Order": "SO",
  "Sales Invoice": "SI",
  "Leave Application": "LV",
  Lead: "LEAD",
  "Expense Claim": "EXP",
  "Material Request": "MR",
  Quotation: "QTN",
  "Stock Entry": "STE",
  File: "FILE",
  Communication: "COMM",
  "Payment Entry": "PE",
};

export function createEngine(): Engine {
  return {
    docs: seedErp(),
    seq: {
      "Purchase Order": 1,
      "Sales Order": 1,
      "Sales Invoice": 1,
      "Leave Application": 1,
      Lead: 2,
      Communication: 0,
      "Stock Entry": 0,
      File: 0,
      "Expense Claim": 1,
    },
  };
}

export function listDocs(engine: Engine, doctype?: string): ErpDoc[] {
  return doctype ? engine.docs.filter((d) => d.doctype === doctype) : engine.docs;
}

export function getDoc(engine: Engine, doctype: string, name: string): ErpDoc | undefined {
  return engine.docs.find((d) => d.doctype === doctype && d.name === name);
}

export function createDoc(
  engine: Engine,
  doctype: string,
  fields: Record<string, string | number>,
): { engine: Engine; doc: ErpDoc } {
  const seq = { ...engine.seq };
  const n = (seq[doctype] ?? 0) + 1;
  seq[doctype] = n;
  const name = `${PREFIX[doctype] ?? "DOC"}-${String(n).padStart(4, "0")}`;
  const doc: ErpDoc = {
    doctype,
    name,
    title: String(fields.title || `${doctype} ${name}`),
    status: String(fields.status || "Draft"),
    meta: String(fields.meta || "Created via HiveDesk"),
    docstatus: 0,
    fields,
  };
  return { engine: { docs: [doc, ...engine.docs], seq }, doc };
}

export function updateBin(engine: Engine, item: string, delta: number): Engine {
  const docs = engine.docs.map((d) => {
    if (d.doctype !== "Bin" || d.fields.item_code !== item) return d;
    const qty = Number(d.fields.actual_qty ?? 0) + delta;
    return {
      ...d,
      meta: `${qty} ${d.fields.stock_uom ?? "Nos"}`,
      fields: { ...d.fields, actual_qty: qty },
    };
  });
  return { ...engine, docs };
}
