import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, fieldControl } from "@/components/ui";
import { useHive } from "@/lib/store";
import type { TaskStatus } from "@/data/seed";

export const Route = createFileRoute("/_app/tasks")({ component: TasksPage });

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "progress", label: "In progress" },
  { id: "done", label: "Done" },
];

function TasksPage() {
  const tasks = useHive((s) => s.tasks);
  const add = useHive((s) => s.addTask);
  const setStatus = useHive((s) => s.setTaskStatus);
  const prioritize = useHive((s) => s.prioritize);
  const [title, setTitle] = useState("");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 md:py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium">Tasks</h1>
        <Button size="sm" variant="soft" onClick={prioritize}>
          Prioritize
        </Button>
      </div>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add(title.trim(), "today");
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          className={fieldControl}
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <Card className="p-3">
              <p className="text-sm font-medium">{t.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {t.priority === "urgent" && <Chip tone="danger">Urgent</Chip>}
                {t.priority === "today" && <Chip tone="accent">Today</Chip>}
                {t.priority === "tomorrow" && <Chip>Tomorrow</Chip>}
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(t.id, s.id)}
                    className="min-h-8"
                  >
                    <Chip tone={t.status === s.id ? "ok" : "chip"}>{s.label}</Chip>
                  </button>
                ))}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
