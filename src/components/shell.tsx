import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Hash,
  Home,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { Avatar } from "@/components/ui";
import { Composer } from "@/components/composer";
import { CHANNELS, GROUPS } from "@/data/seed";
import { PERSONAS } from "@/data/erp";
import { useHive } from "@/lib/store";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/erp", label: "ERP", icon: Building2 },
  { to: "/calls", label: "Calls", icon: Phone },
  { to: "/hive", label: "Hive", icon: Sparkles },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isPending } = useCurrentUserState();
  const user = useCurrentUser();
  const name = user?.displayName?.split(" ")[0] ?? "there";
  const persona = useHive((s) => s.persona);
  const setPersona = useHive((s) => s.setPersona);
  const drawer = useHive((s) => s.drawerOpen);
  const setDrawer = useHive((s) => s.setDrawer);
  const conversations = useHive((s) => s.conversations);
  const agents = useHive((s) => s.agents);
  const openConversation = useHive((s) => s.openConversation);
  const newConversation = useHive((s) => s.newConversation);
  const setActive = useHive((s) => s.setActiveAgent);
  const navigate = useNavigate();

  function goChannel(ch: string) {
    const existing = conversations.find((c) => c.channel === ch);
    if (existing) openConversation(existing.id);
    else newConversation(ch);
    void navigate({ to: "/chat" });
  }

  function goAgent(id: string) {
    setActive(id);
    newConversation(`dm:${id}`, id);
    void navigate({ to: "/chat" });
  }

  const side = (
    <>
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent font-display text-sm text-accent-fg">
            H
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">HiveDesk</p>
            <p className="mt-1 text-xs text-subtle">Buzz-style hive</p>
          </div>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center md:hidden"
          onClick={() => setDrawer(false)}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
      </div>
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-subtle">
          Profile
        </span>
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value as typeof persona)}
          className="min-h-11 w-full rounded-xl border border-border bg-elevated px-2 text-sm"
        >
          {PERSONAS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="mb-3 flex min-h-11 w-full items-center gap-2 rounded-xl bg-accent px-3 text-sm font-medium text-accent-fg"
        onClick={() => {
          newConversation("general");
          void navigate({ to: "/chat" });
        }}
      >
        <Plus className="size-4" />
        New conversation
      </button>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {GROUPS.map((g) => (
          <div key={g.id}>
            <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-subtle">
              {g.name}
            </p>
            {CHANNELS.filter((c) => c.group === g.id).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => goChannel(c.id)}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-muted hover:bg-elevated hover:text-fg"
              >
                <Hash className="size-3.5 shrink-0" />
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        ))}
        <div>
          <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-subtle">
            Direct · AI employees
          </p>
          {agents
            .filter((a) => a.active)
            .map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => goAgent(a.id)}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-muted hover:bg-elevated hover:text-fg"
              >
                <span className="size-1.5 rounded-full bg-ok" />
                <span className="truncate">{a.name}</span>
              </button>
            ))}
        </div>
        <div>
          <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-subtle">
            Previous chats
          </p>
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                openConversation(c.id);
                void navigate({ to: "/chat" });
              }}
              className="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              <span className="truncate">{c.title}</span>
            </button>
          ))}
        </div>
        <Link
          to="/mail"
          className="flex min-h-10 items-center gap-2 px-2 text-sm text-muted"
          onClick={() => setDrawer(false)}
        >
          <Mail className="size-4" />
          Mail setup
        </Link>
      </div>
      <div className="border-t border-border pt-3">
        {isPending ? (
          <div className="h-10 animate-pulse rounded-xl bg-elevated" />
        ) : (
          <>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link to="/login" className="flex min-h-11 items-center gap-2 text-sm text-muted">
                <Avatar initials="?" size="sm" />
                Sign in
              </Link>
            </SignedOut>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1">
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-surface/80 px-3 py-4 backdrop-blur-xl md:flex">
          {side}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2 md:hidden">
            <button
              type="button"
              className="grid size-11 place-items-center"
              aria-label="Open menu"
              onClick={() => setDrawer(true)}
            >
              <Menu className="size-5" />
            </button>
            <p className="truncate text-sm font-semibold">Hi, {name}</p>
            <Link to="/login">
              <Avatar initials={(user?.displayName ?? "S").slice(0, 1)} />
            </Link>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>

          <div className="shrink-0 border-t border-border/50 bg-bg/70 px-3 pt-2 backdrop-blur-xl">
            <Composer jumpToChat={pathname !== "/chat"} />
          </div>

          <nav className="shrink-0 border-t border-border/70 bg-surface/85 px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
            <ul className="flex">
              {TABS.map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <li key={item.to} className="flex-1">
                    <Link
                      to={item.to}
                      className={cn(
                        "flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                        active ? "text-accent" : "text-subtle",
                      )}
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/60"
            aria-label="Close drawer"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col bg-surface px-3 py-4 shadow-[var(--shadow-float)]">
            {side}
          </div>
        </div>
      )}
    </div>
  );
}
