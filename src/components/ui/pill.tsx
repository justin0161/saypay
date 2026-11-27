import { DEPOSIT_META, STATUS_META, type Tone } from "@/lib/format";
import type { DepositStatus, QuoteStatus } from "@/lib/types";
import { cn } from "./cn";

const tones: Record<Tone, string> = {
  neutral: "bg-raised text-ink-soft ring-line",
  info: "bg-[#101b2a] text-[#8cc0ff] ring-[#1f3550]",
  warning: "bg-hivis-soft text-hivis-ink ring-hivis/25",
  success: "bg-go-soft text-go-ink ring-go/30",
  danger: "bg-stop-soft text-stop ring-stop/30",
};

const dots: Record<Tone, string> = {
  neutral: "bg-muted",
  info: "bg-[#5aa7ff]",
  warning: "bg-hivis",
  success: "bg-go",
  danger: "bg-rose-500",
};

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden />
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: QuoteStatus }) {
  const m = STATUS_META[status];
  return <Pill tone={m.tone}>{m.label}</Pill>;
}

export function DepositPill({ status }: { status: DepositStatus }) {
  if (status === "not_required") return null;
  const m = DEPOSIT_META[status];
  return <Pill tone={m.tone}>{m.label}</Pill>;
}
