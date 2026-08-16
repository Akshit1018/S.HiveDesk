import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card, Chip } from "@/components/ui";
import { useHive } from "@/lib/store";

export const Route = createFileRoute("/_app/erp/$doctype/$name")({
  component: ErpDetail,
});

function ErpDetail() {
  const { doctype, name } = Route.useParams();
  const docs = useHive((s) => s.docs);
  const doc = docs.find((d) => d.doctype === doctype && d.name === name);

  if (!doc) {
    return (
      <div className="px-4 py-8 text-sm text-muted">
        Document not found.{" "}
        <Link to="/erp" className="text-accent">
          Back to ERP
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-5">
      <Link
        to="/erp/$doctype"
        params={{ doctype }}
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-muted"
      >
        <ArrowLeft className="size-4" />
        {doctype}
      </Link>
      <div className="flex items-start justify-between gap-2">
        <h1 className="font-display text-2xl font-medium">{doc.title}</h1>
        <Chip>{doc.status}</Chip>
      </div>
      <p className="mt-1 text-sm text-subtle">
        {doc.name} · docstatus {doc.docstatus}
      </p>
      <Card className="mt-4 divide-y divide-border">
        {Object.entries(doc.fields).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 px-4 py-3 text-sm">
            <span className="text-muted">{k}</span>
            <span className="text-right font-medium break-all">{String(v)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
