import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, Field, fieldControl } from "@/components/ui";
import { AGENT_TEMPLATES, type AgentTemplate } from "@/data/seed";
import { useHive } from "@/lib/store";

export const Route = createFileRoute("/_app/hive")({ component: HivePage });

const TEMPLATES = Object.keys(AGENT_TEMPLATES) as AgentTemplate[];

function HivePage() {
  const agentsAll = useHive((s) => s.agents);
  const agents = agentsAll.filter((a) => a.active);
  const hire = useHive((s) => s.hire);
  const deactivate = useHive((s) => s.deactivate);
  const setActive = useHive((s) => s.setActiveAgent);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<AgentTemplate>("sales");
  const [name, setName] = useState(AGENT_TEMPLATES.sales.defaultName);
  const [model, setModel] = useState("grok-4.5");
  const [persona, setPersona] = useState(AGENT_TEMPLATES.sales.persona);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 md:py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium">Hive</h1>
          <p className="mt-1 text-sm text-muted">
            Hire AI employees. Each seat has a role, model, and allowlist.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Hire</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((a) => (
          <Card key={a.id} className="flex flex-col p-4">
            <p className="font-medium">{a.name}</p>
            <p className="text-sm text-muted">{a.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip>{a.model}</Chip>
              <Chip tone="accent">{a.template}</Chip>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted">{a.persona}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setActive(a.id);
                  void navigate({ to: "/chat" });
                }}
              >
                Chat
              </Button>
              <Button size="sm" variant="outline" onClick={() => deactivate(a.id)}>
                Deactivate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 grid place-items-end bg-bg/70 p-3 backdrop-blur-sm md:place-items-center"
          onClick={() => setOpen(false)}
        >
          <Card
            className="w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-medium">Hire AI employee</h2>
            <div className="mt-4 space-y-3">
              <Field label="Role">
                <select
                  className={fieldControl}
                  value={template}
                  onChange={(e) => {
                    const t = e.target.value as AgentTemplate;
                    setTemplate(t);
                    setName(AGENT_TEMPLATES[t].defaultName);
                    setPersona(AGENT_TEMPLATES[t].persona);
                  }}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t} value={t}>
                      {AGENT_TEMPLATES[t].title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Name">
                <input
                  className={fieldControl}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Model">
                <select
                  className={fieldControl}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="grok-4.5">grok-4.5</option>
                  <option value="claude-sonnet">claude-sonnet</option>
                  <option value="gpt-4.1">gpt-4.1</option>
                </select>
              </Field>
              <Field label="Personality">
                <textarea
                  className={fieldControl + " min-h-24 py-2"}
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  hire({ template, name, model, persona });
                  setOpen(false);
                  void navigate({ to: "/chat" });
                }}
              >
                Hire to hive
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
