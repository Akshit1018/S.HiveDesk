import {
  createDoc,
  createEngine,
  getDoc,
  listDocs,
  updateBin,
  type Engine,
} from "@/lib/erp-engine";
import { MODULES, personaSees, type Persona } from "@/data/erp";

let engine: Engine = createEngine();

export const MCP_TOOLS = [
  {
    name: "erp_list_modules",
    description: "List ERPNext / HR / CRM modules and DocTypes.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "erp_list",
    description: "List documents of a DocType (Lead, Sales Invoice, Bin, …).",
    inputSchema: {
      type: "object",
      properties: { doctype: { type: "string" }, persona: { type: "string" } },
      required: ["doctype"],
    },
  },
  {
    name: "erp_get",
    description: "Get one document by DocType + name.",
    inputSchema: {
      type: "object",
      properties: { doctype: { type: "string" }, name: { type: "string" } },
      required: ["doctype", "name"],
    },
  },
  {
    name: "erp_create",
    description: "Create a Draft document. Requires human approval in the app for money moves.",
    inputSchema: {
      type: "object",
      properties: {
        doctype: { type: "string" },
        fields: { type: "object" },
        persona: { type: "string" },
      },
      required: ["doctype", "fields"],
    },
  },
  {
    name: "erp_stock_adjust",
    description: "Adjust a Bin qty (receive positive, issue negative).",
    inputSchema: {
      type: "object",
      properties: { item_code: { type: "string" }, qty: { type: "number" } },
      required: ["item_code", "qty"],
    },
  },
  {
    name: "erp_upload",
    description: "Register an uploaded file against a document (File DocType).",
    inputSchema: {
      type: "object",
      properties: {
        filename: { type: "string" },
        attached_to_doctype: { type: "string" },
        attached_to_name: { type: "string" },
      },
      required: ["filename"],
    },
  },
] as const;

export function mcpInfo() {
  return {
    name: "hivedesk",
    version: "0.2.0",
    title: "HiveDesk ERP MCP",
    description:
      "Permission-aware ERPNext + HR + CRM tools for Claude Code, Codex, Cursor, and Grok.",
  };
}

export function callTool(
  name: string,
  args: Record<string, unknown>,
): { ok: boolean; data: unknown } {
  const persona = (String(args.persona || "admin") as Persona) || "admin";
  if (name === "erp_list_modules") return { ok: true, data: MODULES };
  if (name === "erp_list") {
    const dt = String(args.doctype || "");
    if (!personaSees(persona, dt)) return { ok: false, data: `Persona ${persona} cannot list ${dt}` };
    return { ok: true, data: listDocs(engine, dt) };
  }
  if (name === "erp_get") {
    const doc = getDoc(engine, String(args.doctype), String(args.name));
    return doc ? { ok: true, data: doc } : { ok: false, data: "Not found" };
  }
  if (name === "erp_create") {
    const dt = String(args.doctype);
    if (!personaSees(persona, dt)) return { ok: false, data: `No permission on ${dt}` };
    const fields = (args.fields ?? {}) as Record<string, string | number>;
    const res = createDoc(engine, dt, fields);
    engine = res.engine;
    return { ok: true, data: res.doc };
  }
  if (name === "erp_stock_adjust") {
    if (!personaSees(persona, "Bin")) return { ok: false, data: "No stock permission" };
    engine = updateBin(engine, String(args.item_code), Number(args.qty));
    const bin = engine.docs.find(
      (d) => d.doctype === "Bin" && d.fields.item_code === args.item_code,
    );
    return { ok: true, data: bin ?? { updated: true } };
  }
  if (name === "erp_upload") {
    const res = createDoc(engine, "File", {
      title: String(args.filename),
      attached_to_doctype: String(args.attached_to_doctype || ""),
      attached_to_name: String(args.attached_to_name || ""),
      meta: "Uploaded",
    });
    engine = res.engine;
    return { ok: true, data: res.doc };
  }
  return { ok: false, data: `Unknown tool ${name}` };
}
