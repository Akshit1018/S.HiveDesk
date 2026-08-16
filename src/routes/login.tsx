import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button, Card } from "@/components/ui";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 py-10">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-accent font-display text-accent-fg">
            H
          </span>
          <div>
            <p className="text-sm font-semibold">HiveDesk</p>
            <p className="text-xs text-subtle">Sign in to save your hive</p>
          </div>
        </div>
        <h1 className="font-display text-2xl font-medium tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 mb-5 text-sm text-muted">
          Use Google or X. You can also browse the workspace first.
        </p>
        <div className="space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
          <Link to="/" className="block">
            <Button type="button" variant="ghost" className="w-full">
              Continue without signing in
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
