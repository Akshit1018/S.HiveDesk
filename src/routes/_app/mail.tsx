import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button, Card, Chip } from "@/components/ui";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { authEnabled, signIn } from "@/lib/auth/client";
import { useHive } from "@/lib/store";

export const Route = createFileRoute("/_app/mail")({ component: MailPage });

function MailPage() {
  const user = useCurrentUser();
  const connected = useHive((s) => s.mailConnected);
  const address = useHive((s) => s.mailAddress);
  const outbox = useHive((s) => s.outbox);
  const connectMail = useHive((s) => s.connectMail);
  const disconnectMail = useHive((s) => s.disconnectMail);
  const googleEmail = user?.primaryEmail ?? "";

  function connectGoogle() {
    if (googleEmail) {
      connectMail(googleEmail);
      toast.success(`Mail attached as ${googleEmail}`);
      return;
    }
    if (authEnabled) {
      toast.message("Sign in with Google, then return here to attach mail.");
      void signIn("google", { callbackURL: "/mail" });
      return;
    }
    connectMail("sam.smith@aarohi.example");
    toast.success("Workspace mailbox attached (demo).");
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-5">
      <h1 className="font-display text-2xl font-medium">Mail</h1>
      <p className="mt-1 text-sm text-muted">
        Attach Google so meeting recaps and customer emails log as ERP Communications.
      </p>

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <Mail className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Google Mail</p>
            <p className="truncate text-sm text-muted">
              {connected ? address : "Not connected"}
            </p>
          </div>
          <Chip tone={connected ? "ok" : "chip"}>{connected ? "Live" : "Off"}</Chip>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {connected ? (
            <Button variant="outline" onClick={() => disconnectMail()}>
              Disconnect
            </Button>
          ) : (
            <>
              <Button onClick={connectGoogle}>Connect Google</Button>
              <Button
                variant="outline"
                onClick={() => {
                  connectMail("sam.smith@aarohi.example");
                  toast.success("Demo mailbox attached");
                }}
              >
                Use workspace mailbox
              </Button>
            </>
          )}
        </div>
      </Card>

      <h2 className="mt-6 text-sm font-semibold">Outbox</h2>
      {outbox.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Nothing sent yet. Draft in Chat, then tap Send.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {outbox.map((m) => (
            <li key={m.id}>
              <Card className="p-3">
                <p className="text-sm font-medium">{m.subject}</p>
                <p className="text-xs text-subtle">
                  To {m.to} · {m.at}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Link to="/chat" className="mt-6 block">
        <Button className="w-full">Draft an email in Chat</Button>
      </Link>
    </div>
  );
}
