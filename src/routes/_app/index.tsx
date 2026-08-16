import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, FileText, Sparkles } from "lucide-react";
import { Card, Chip, FaceStack } from "@/components/ui";
import { FILES, MEETINGS, PEOPLE } from "@/data/seed";
import { useHive } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/")({ component: HomePage });

function HomePage() {
  const user = useCurrentUser();
  const name = user?.displayName?.split(" ")[0] ?? "Sam";
  const tasks = useHive((s) => s.tasks);
  const send = useHive((s) => s.send);
  const prioritize = useHive((s) => s.prioritize);
  const navigate = useNavigate();
  const meeting = MEETINGS[0];

  function ask(q: string) {
    send(q);
    void navigate({ to: "/chat" });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5 md:py-8">
      <div>
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          Welcome, {name}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight font-medium tracking-tight">
          How can I help you today?
        </h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/files" className="block">
          <Card className="h-full p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Previously viewed
            </p>
            <ul className="mt-3 space-y-2.5">
              {FILES.slice(0, 3).map((f) => (
                <li key={f.id} className="flex items-center gap-2 text-sm">
                  <FileText className="size-4 shrink-0 text-muted" />
                  <span className="truncate">{f.name}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Link>

        <button type="button" className="text-left" onClick={() => ask("Summarize my last meeting")}>
          <Card className="h-full p-4">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-subtle">
              <Sparkles className="size-3.5" />
              Summarize last meeting
            </p>
            <p className="mt-3 font-medium">{meeting.title}</p>
            <p className="mt-1 text-sm text-muted">
              {meeting.date} · {meeting.start}
            </p>
          </Card>
        </button>

        <button type="button" className="text-left" onClick={() => ask("List open leads")}>
          <Card className="h-full p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              CRM
            </p>
            <p className="mt-3 font-medium">Show open leads</p>
          </Card>
        </button>
        <button
          type="button"
          className="text-left"
          onClick={() => ask("Write a prospect email for Parle")}
        >
          <Card className="h-full p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Mail
            </p>
            <p className="mt-3 font-medium">Write a prospect email</p>
          </Card>
        </button>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link to="/tasks" className="text-sm font-semibold">
            My Tasks {tasks.length}
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
            onClick={() => {
              prioritize();
              void navigate({ to: "/tasks" });
            }}
          >
            Prioritize
            <ArrowUpRight className="ml-0.5 size-4" />
          </button>
        </div>
        <ul className="space-y-2.5">
          {tasks.slice(0, 4).map((t) => (
            <li key={t.id}>
              <Link to="/tasks" className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0 flex-1">
                  <p>{t.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {t.priority === "urgent" && <Chip tone="danger">Urgent</Chip>}
                    {t.priority === "today" && <Chip tone="accent">Today</Chip>}
                    {t.priority === "tomorrow" && <Chip>Tomorrow</Chip>}
                    {t.status === "progress" && <Chip tone="ok">In progress</Chip>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Link to="/meetings/$id" params={{ id: MEETINGS[4].id }} className="block">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Next meeting
          </p>
          <p className="mt-2 font-medium">{MEETINGS[4].title}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-muted">
              {MEETINGS[4].start}–{MEETINGS[4].end}
            </p>
            <FaceStack
              initials={MEETINGS[4].guests.slice(0, 3).map((id) => PEOPLE[id].initials)}
              extra={MEETINGS[4].extra}
            />
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-2 gap-2">
        <Link to="/erp">
          <Card className="p-4 text-sm font-medium">Open ERP modules</Card>
        </Link>
        <Link to="/mail">
          <Card className="p-4 text-sm font-medium">Connect Google Mail</Card>
        </Link>
      </div>
    </div>
  );
}