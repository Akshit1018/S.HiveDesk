import { Link } from "@tanstack/react-router";
import { Card, Chip } from "@/components/ui";
import type { ErpDoc } from "@/data/erp";

export function RecordList({ rows }: { rows: ErpDoc[] }) {
  if (!rows.length) return null;
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.doctype + row.name}>
          <Link to="/erp/$doctype/$name" params={{ doctype: row.doctype, name: row.name }}>
            <Card className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.title}</p>
                  <p className="text-xs text-subtle">
                    {row.doctype} · {row.name}
                  </p>
                </div>
                <Chip>{row.status}</Chip>
              </div>
              <p className="mt-1 text-xs text-muted">{row.meta}</p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
