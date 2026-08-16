import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Chip } from "@/components/ui";
import { RecordList } from "@/components/records";
import { CHAT_CHIPS } from "@/data/seed";
import { useHive, type ChatMsg } from "@/lib/store";
import { cn } from "@/lib/cn";

type ChatSearch = { q?: string };

export const Route = createFileRoute("/_app/chat")({
  validateSearch: (s: Record<string, unknown>): ChatSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: ChatPage,
});

function ChatPage() {
  const { q } = Route.useSearch();
  const conversations = useHive((s) => s.conversations);
  const activeConvId = useHive((s) => s.activeConvId);
  const conv = conversations.find((c) => c.id === activeConvId);
  const messages = conv?.messages ?? [];
  const thinking = useHive((s) => s.thinking);
  const send = useHive((s) => s.send);
  const agentsAll = useHive((s) => s.agents);
  const agents = agentsAll.filter((a) => a.active);
  const active = useHive((s) => s.activeAgentId);
  const setActive = useHive((s) => s.setActiveAgent);
  const endRef = useRef<HTMLDivElement>(null);
  const lastQ = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (q && q !== lastQ.current) {
      lastQ.current = q;
      send(q);
    }
  }, [q, send]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-3">
      <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {agents.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActive(a.id)}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-3 text-xs font-medium",
              active === a.id ? "bg-fg text-surface" : "bg-surface text-muted ring-1 ring-border",
            )}
          >
            {a.name}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-subtle">{conv?.title ?? "New chat"}</p>

      <div className="space-y-4">
        {messages.length === 0 && !thinking && (
          <button
            type="button"
            className="w-full rounded-2xl border border-border bg-elevated/70 p-4 text-left"
            onClick={() => send("Summarize my last meeting")}
          >
            <p className="font-medium">Tap to draft a Gmail recap, or use the bar below.</p>
            <p className="mt-2 text-sm text-muted">
              Raise invoices, update stock, claim expenses — all write to ERP after you approve.
            </p>
          </button>
        )}
        {messages.map((m) => (
          <Message key={m.id} msg={m} />
        ))}
        {thinking && <p className="text-sm text-subtle">Checking ERP…</p>}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
          {CHAT_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              className="min-h-10 shrink-0 rounded-full bg-surface px-3 text-xs font-medium text-muted ring-1 ring-border"
            >
              {c}
            </button>
          ))}
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Message({ msg }: { msg: ChatMsg }) {
  const resolve = useHive((s) => s.resolveProposal);
  const pending = useHive((s) => s.pendingId);

  if (msg.role === "user") {
    return (
      <div className="ml-8 rounded-2xl bg-accent px-4 py-3 text-sm text-accent-fg">{msg.text}</div>
    );
  }

  return (
    <div className="space-y-3">
      {msg.thinking && <p className="text-xs font-medium text-subtle">{msg.thinking}</p>}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
      {msg.records && <RecordList rows={msg.records} />}
      {msg.mail && <MailCardView card={msg.mail} />}
      {msg.proposal && (
        <Card className="p-4">
          <Chip tone="warn">Needs approval</Chip>
          <p className="mt-2 font-medium">{msg.proposal.summary}</p>
          <p className="mt-1 text-xs text-subtle">{msg.proposal.doctype}</p>
          {pending === msg.proposal.id && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => resolve(msg.proposal!.id, "approve")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => resolve(msg.proposal!.id, "reject")}>
                Reject
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function MailCardView({ card }: { card: NonNullable<ChatMsg["mail"]> }) {
  const sendMail = useHive((s) => s.sendMail);
  const connected = useHive((s) => s.mailConnected);
  const navigate = useNavigate();

  function sendNow() {
    const res = sendMail(card);
    if (!res.ok) {
      toast.message(res.reason ?? "Connect mail first");
      void navigate({ to: "/mail" });
      return;
    }
    toast.success("Sent and logged in ERP");
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <Mail className="size-4 text-accent" />
          Mail
        </span>
        <button type="button" className="min-h-11 text-sm text-accent" onClick={sendNow}>
          Send
        </button>
      </div>
      <div className="space-y-2 border-b border-border px-4 py-3 text-sm">
        <p>
          <span className="mr-3 text-subtle">To</span>
          <Chip tone="accent">{card.to}</Chip>
        </p>
        <p>
          <span className="mr-3 text-subtle">Subject</span>
          <span className="font-medium">{card.subject}</span>
        </p>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm whitespace-pre-wrap text-muted">{card.greeting}</p>
        {card.sections.map((sec) => (
          <div
            key={sec.title}
            className={cn(
              "rounded-xl p-3",
              sec.tone === "ok" && "bg-ok-soft",
              sec.tone === "warn" && "bg-warn-soft",
              sec.tone === "chip" && "bg-elevated",
            )}
          >
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Check className="size-3.5" />
              {sec.title}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {sec.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <Button className="w-full" onClick={sendNow}>
          {connected ? "Looks good? Send it now" : "Connect mail to send"}
        </Button>
        {!connected && (
          <Link to="/mail" className="block text-center text-sm text-accent">
            Open mail setup
          </Link>
        )}
      </div>
    </Card>
  );
}
