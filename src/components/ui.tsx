import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-45",
        size === "sm" && "min-h-9 rounded-lg px-3 text-sm",
        size === "md" && "min-h-11 rounded-xl px-4 text-sm",
        size === "lg" && "min-h-12 rounded-xl px-5 text-[0.95rem]",
        size === "icon" && "size-11 rounded-xl",
        variant === "primary" && "bg-accent text-accent-fg shadow-sm",
        variant === "ghost" && "bg-transparent text-fg hover:bg-elevated",
        variant === "soft" && "bg-accent-soft text-accent",
        variant === "outline" && "border border-border bg-surface text-fg",
        variant === "danger" && "bg-danger-soft text-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/85 shadow-[var(--shadow-card)] backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  className,
  tone = "chip",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "chip" | "ok" | "warn" | "danger" | "accent" | "peach" | "pink";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "chip" && "bg-chip text-muted",
        tone === "ok" && "bg-ok-soft text-ok",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "danger" && "bg-danger-soft text-danger",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "peach" && "bg-warn-soft text-warn",
        tone === "pink" && "bg-danger-soft text-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({
  initials,
  className,
  size = "md",
}: {
  initials: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent",
        size === "sm" && "size-7 text-[10px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-11 text-sm",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function FaceStack({
  initials,
  extra,
}: {
  initials: string[];
  extra?: number;
}) {
  return (
    <div className="flex items-center">
      {initials.map((n, i) => (
        <Avatar
          key={n + i}
          initials={n}
          size="sm"
          className={cn("ring-2 ring-surface", i > 0 && "-ml-2")}
        />
      ))}
      {extra ? (
        <span className="-ml-2 grid size-7 place-items-center rounded-full bg-chip text-[10px] font-semibold text-muted ring-2 ring-surface">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
        {label}
      </span>
      {children}
    </label>
  );
}

export const fieldControl =
  "w-full min-h-11 rounded-xl border border-border bg-elevated px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-border-strong";
