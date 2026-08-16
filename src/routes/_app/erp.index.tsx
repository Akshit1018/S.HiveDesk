import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Chip } from "@/components/ui";
import { MODULES, PERSONAS } from "@/data/erp";
import { useHive } from "@/lib/store";

export const Route = createFileRoute("/_app/erp/")({ component: ErpHome });

function ErpHome() {
  const persona = useHive((s) => s.persona);
  const docs = useHive((s) => s.docs);
  const allowed = PERSONAS.find((p) => p.id === persona)?.modules ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <h1 className="font-display text-2xl font-medium">ERPNext</h1>
      <p className="mt-1 text-sm text-muted">
        Live sandbox for CRM, Selling, Buying, Stock, Accounts, and HR. Profile:{" "}
        <span className="text-fg">{persona}</span>
      </p>
      <div className="mt-4 space-y-4">
        {MODULES.filter((m) => allowed.includes(m.id)).map((mod) => (
          <div key={mod.id}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
              {mod.label}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {mod.doctypes.map((dt) => {
                const count = docs.filter((d) => d.doctype === dt).length;
                return (
                  <Link key={dt} to="/erp/$doctype" params={{ doctype: dt }}>
                    <Card className="h-full p-3">
                      <p className="text-sm font-medium">{dt}</p>
                      <Chip className="mt-2">{count}</Chip>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
