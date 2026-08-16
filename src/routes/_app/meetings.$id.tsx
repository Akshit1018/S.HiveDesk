import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Copy, Video } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, FaceStack } from "@/components/ui";
import { MEETINGS, PEOPLE } from "@/data/seed";
import { useHive } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/meetings/$id")({
  component: MeetingDetail,
});

function MeetingDetail() {
  const { id } = Route.useParams();
  const meeting = MEETINGS.find((m) => m.id === id);
  const send = useHive((s) => s.send);
  const navigate = useNavigate();
  if (!meeting) throw notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-5">
      <Link
        to="/meetings"
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted"
      >
        <ArrowLeft className="size-4" />
        Meetings
      </Link>
      <h1 className="font-display text-2xl font-medium tracking-tight">
        {meeting.title}
      </h1>

      <Card className="mt-4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          Guests ({meeting.guests.length})
        </p>
        <div className="mt-3">
          <FaceStack
            initials={meeting.guests.map((g) => PEOPLE[g].initials)}
            extra={meeting.extra || undefined}
          />
        </div>
      </Card>

      <Card className="mt-3 space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Where
          </p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm">
            <Video className="size-4 text-muted" />
            {meeting.link}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-elevated p-3">
            <p className="text-xs text-subtle">From</p>
            <p className="mt-1 flex items-center gap-1 font-medium">
              <Clock className="size-4" />
              {meeting.start}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Calendar className="size-3.5" />
              {meeting.date}
            </p>
          </div>
          <div className="rounded-xl bg-elevated p-3">
            <p className="text-xs text-subtle">To</p>
            <p className="mt-1 flex items-center gap-1 font-medium">
              <Clock className="size-4" />
              {meeting.end}
            </p>
            <p className="mt-1 text-xs text-muted">{meeting.tz}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Description
          </p>
          <p className="mt-1 text-sm text-muted">{meeting.notes}</p>
        </div>
        <Button
          className="w-full"
          onClick={() => toast.success("Opening meeting room (demo)")}
        >
          Join now
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              send("Summarize my last meeting");
              void navigate({ to: "/chat" });
            }}
          >
            Summarize
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void navigator.clipboard?.writeText(
                `${meeting.title}\n${meeting.date} ${meeting.start}–${meeting.end}\n${meeting.link}`,
              );
              toast.success("Copied meeting details");
            }}
          >
            <Copy className="size-4" />
            Copy
          </Button>
        </div>
      </Card>
    </div>
  );
}
