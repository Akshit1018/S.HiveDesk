# MCP — HiveDesk

Endpoint: `POST /api/mcp` (JSON-RPC 2.0). `GET /api/mcp` returns server info + tools.

## Tools

| Tool | Use |
| --- | --- |
| `erp_list_modules` | Module → DocType map |
| `erp_list` | List a DocType (`persona` optional) |
| `erp_get` | One document |
| `erp_create` | Draft document |
| `erp_stock_adjust` | Change Bin qty |
| `erp_upload` | Register a File |

## Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "hivedesk": {
      "url": "https://YOUR-HOST/api/mcp"
    }
  }
}
```

## Claude Code

```bash
claude mcp add --transport http hivedesk https://YOUR-HOST/api/mcp
```

## Codex / Grok Build

Point the MCP / OpenAPI connector at the same URL. `initialize` → `tools/list` → `tools/call`.

## Example

```bash
curl -s https://YOUR-HOST/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"erp_list","arguments":{"doctype":"Lead","persona":"sales"}}}'
```
