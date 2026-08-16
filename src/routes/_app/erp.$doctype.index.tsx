import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { RecordList } from "@/components/records";
import { useHive } from "@/lib/store";
import { personaSees } from "@/data/erp";

export const Route = createFileRoute("/_app/erp/$doctype/")({
  component: ErpList,
});

function ErpList() {
  const { doctype } = Route.useParams();
  const persona = useHive((s) => s.persona);
  const docs = useHive((s) => s.docs);
  const rows = docs.filter((d) => d.doctype === doctype);
  const allowed = personaSees(persona, doctype);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <Link
        to="/erp"
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm text-muted"
      >
        <ArrowLeft className="size-4" />
        Modules
      </Link>
      <h1 className="font-display text-2xl font-medium">{doctype}</h1>
      {!allowed ? (
        <p className="mt-3 text-sm text-muted">
          This profile cannot open {doctype}. Switch profile at the top.
        </p>
      ) : (
        <div className="mt-4">
          <RecordList rows={rows} />
          {rows.length === 0 && (
            <p className="text-sm text-muted">No rows. Ask Chat to create one.</p>
          )}
        </div>
      )}
    </div>
  );
}
