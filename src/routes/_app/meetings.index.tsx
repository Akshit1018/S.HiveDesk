import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, Copy, MoreHorizontal, Video } from "lucide-react";
import { toast } from "sonner";
import { Card, Chip, FaceStack } from "@/components/ui";
import { MEETINGS, PEOPLE } from "@/data/seed";
import { useHive } from "@/lib/store";

export const Route = createFileRoute("/_app/meetings/")({
  component: MeetingsPage,
});

function MeetingsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const send = useHive((s) => s.send);
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 md:py-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-surface">
          Meetings
        </span>
        <span className="rounded-full px-4 py-2 text-sm font-medium text-muted">
          Events
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {MEETINGS.map((m) => (
          <Card key={m.id} className="relative h-full p-4">
            <div className="flex items-start justify-between gap-2">
              <Link
                to="/meetings/$id"
                params={{ id: m.id }}
                className="min-w-0 font-medium leading-snug"
              >
                {m.title}
              </Link>
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-xl"
                aria-label="Meeting actions"
                onClick={() => setOpenId(openId === m.id ? null : m.id)}
              >
                <MoreHorizontal className="size-5 text-subtle" />
              </button>
            </div>
            {openId === m.id && (
              <div className="absolute top-14 right-3 z-10 w-52 rounded-xl border border-border bg-elevated p-1 shadow-[var(--shadow-float)]">
                <Link
                  to="/meetings/$id"
                  params={{ id: m.id }}
                  className="flex min-h-11 items-center px-3 text-sm"
                  onClick={() => setOpenId(null)}
                >
                  View details
                </Link>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center px-3 text-left text-sm"
                  onClick={() => {
                    send("Summarize my last meeting");
                    setOpenId(null);
                    void navigate({ to: "/chat" });
                  }}
                >
                  Summarize in Chat
                </button>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(
                      `${m.title}\n${m.date} ${m.start}-${m.end}\n${m.link}`,
                    );
                    toast.success("Copied");
                    setOpenId(null);
                  }}
                >
                  <Copy className="size-4" />
                  Copy details
                </button>
              </div>
            )}
            <Link to="/meetings/$id" params={{ id: m.id }} className="mt-3 block">
              <p className="flex items-center gap-2 text-sm text-muted">
                <Calendar className="size-4" />
                {m.date}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Clock className="size-4" />
                {m.start} – {m.end} ({m.tz})
              </p>
              <div className="mt-4 flex items-center justify-between">
                <FaceStack
                  initials={m.guests.slice(0, 3).map((id) => PEOPLE[id].initials)}
                  extra={m.extra || undefined}
                />
                {m.tag && (
                  <Chip
                    tone={
                      m.tagTone === "blue" ? "accent" : m.tagTone === "pink" ? "pink" : "peach"
                    }
                  >
                    {m.tag}
                  </Chip>
                )}
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                <Video className="size-4" />
                {m.provider === "zoom" ? "Zoom" : "Google Meet"}
              </p>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
