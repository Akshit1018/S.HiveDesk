import { createFileRoute } from "@tanstack/react-router";
import { callTool, mcpInfo, MCP_TOOLS } from "@/lib/mcp-tools";

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          jsonrpc: "2.0",
          result: { ...mcpInfo(), tools: MCP_TOOLS },
        }),
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          id?: string | number;
          method?: string;
          params?: { name?: string; arguments?: Record<string, unknown> };
        };
        const id = body.id ?? 1;
        if (body.method === "initialize") {
          return Response.json({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2025-03-26",
              capabilities: { tools: {} },
              serverInfo: mcpInfo(),
            },
          });
        }
        if (body.method === "tools/list") {
          return Response.json({
            jsonrpc: "2.0",
            id,
            result: { tools: MCP_TOOLS },
          });
        }
        if (body.method === "tools/call") {
          const name = body.params?.name ?? "";
          const args = body.params?.arguments ?? {};
          const out = callTool(name, args);
          return Response.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(out.data, null, 2) }],
              isError: !out.ok,
            },
          });
        }
        return Response.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Unknown method ${body.method}` },
        });
      },
    },
  },
});
