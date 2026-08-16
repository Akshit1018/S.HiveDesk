import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, Chip, fieldControl } from "@/components/ui";
import { FILES } from "@/data/seed";
import { useHive } from "@/lib/store";

export const Route = createFileRoute("/_app/files")({ component: FilesPage });

const FILTERS = ["All", "Documents", "Reports", "Notes"] as const;

function FilesPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const send = useHive((s) => s.send);
  const navigate = useNavigate();
  const rows = useMemo(() => {
    return FILES.filter((f) => {
      const hit = f.name.toLowerCase().includes(q.toLowerCase());
      if (!hit) return false;
      if (filter === "Reports") return /goal|r2|analytic/i.test(f.name);
      if (filter === "Documents") return f.kind === "pdf" || f.kind === "ppt";
      return true;
    });
  }, [q, filter]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 md:py-8">
      <h1 className="font-display text-2xl font-medium">Files</h1>
      <p className="mt-1 text-sm text-muted">Tap a source to chat with it</p>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search files"
          className={fieldControl + " pl-9"}
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className="min-h-10"
            onClick={() => setFilter(f)}
          >
            <Chip tone={filter === f ? "accent" : "chip"}>{f}</Chip>
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              className="w-full text-left"
              onClick={() => {
                toast.success(`Attached ${f.name}`);
                send(`Summarize file ${f.name} and relate it to open CRM work`);
                void navigate({ to: "/chat" });
              }}
            >
              <Card className="flex items-center gap-3 p-3">
                <span className="grid size-10 place-items-center rounded-xl bg-elevated">
                  <FileText className="size-4 text-muted" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-subtle">
                    {f.size} · {f.source}
                  </p>
                </div>
              </Card>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
