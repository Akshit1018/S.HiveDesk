import { useRef, useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui";
import { useHive } from "@/lib/store";

export function Composer({
  placeholder = "Message the hive — invoice, stock, leave, mail…",
  jumpToChat = false,
}: {
  placeholder?: string;
  jumpToChat?: boolean;
}) {
  const [value, setValue] = useState("");
  const send = useHive((s) => s.send);
  const thinking = useHive((s) => s.thinking);
  const uploadFile = useHive((s) => s.uploadFile);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  function submit() {
    const text = value.trim();
    if (!text) return;
    send(text);
    setValue("");
    if (jumpToChat) void navigate({ to: "/chat" });
  }

  return (
    <div className="rounded-2xl border border-border bg-elevated/80 p-2 shadow-[var(--shadow-float)] backdrop-blur-xl">
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            uploadFile(f.name);
            if (jumpToChat) void navigate({ to: "/chat" });
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-xl text-muted"
          aria-label="Upload document"
          onClick={() => fileRef.current?.click()}
        >
          <Plus className="size-5" />
        </button>
        <textarea
          value={value}
          rows={1}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="max-h-28 min-h-11 w-0 flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-subtle"
        />
        <Button
          size="icon"
          className="shrink-0 rounded-full"
          disabled={!value.trim() || thinking}
          onClick={submit}
          aria-label="Send"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
