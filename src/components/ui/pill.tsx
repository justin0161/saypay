import { DEPOSIT_META, STATUS_META, type Tone } from "@/lib/format";
import type { DepositStatus, QuoteStatus } from "@/lib/types";
import { cn } from "./cn";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-soft ring-line",
  info: "bg-[#e8eef6] text-[#1d3f6e] ring-[#bccbe0]",
  warning: "bg-hivis-soft text-ink ring-hivis-deep/40",
  success: "bg-go-soft text-go-ink ring-go/30",
  danger: "bg-red-50 text-stop ring-stop/30",
};

const dots: Record<Tone, string> = {
  neutral: "bg-slate-400",
  info: "bg-sky-500",
  warning: "bg-hivis",
  success: "bg-go",
  danger: "bg-rose-500",
};

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[3px] px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.06em] whitespace-nowrap uppercase ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      <span className={cn("size-1.5", dots[tone])} aria-hidden />
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
