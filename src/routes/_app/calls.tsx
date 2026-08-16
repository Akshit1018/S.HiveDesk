import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Card, Chip } from "@/components/ui";
import { CALLS } from "@/data/seed";

export const Route = createFileRoute("/_app/calls")({ component: CallsPage });

function CallsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5">
      <h1 className="font-display text-2xl font-medium">Calls</h1>
      <p className="mt-1 text-sm text-muted">
        Aira pulls live Bin + AR from ERP before speaking. Transcripts land here.
      </p>
      <ul className="mt-4 space-y-3">
        {CALLS.map((c) => (
          <li key={c.id}>
            <Card className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{c.with}</p>
                  <p className="text-xs text-subtle">
                    {c.at} · {c.duration} · {c.agent}
                  </p>
                </div>
                <Chip tone={c.direction === "out" ? "accent" : "ok"}>
                  {c.direction === "out" ? "Outbound" : "Inbound"}
                </Chip>
              </div>
              <p className="mt-2 text-xs text-muted">
                Inventory used: {c.inventoryUsed.join(", ")}
              </p>
              <ol className="mt-3 space-y-2">
                {c.lines.map((l, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{l.who}: </span>
                    <span className="text-muted">{l.text}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-subtle">
                <Phone className="size-3.5" />
                Plugin: Vapi / Exotel — configure on your VPS
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
