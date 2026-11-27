import { DEPOSIT_META, STATUS_META, type Tone } from "@/lib/format";
import type { DepositStatus, QuoteStatus } from "@/lib/types";
import { cn } from "./cn";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  warning: "bg-hivis-soft text-hivis-ink ring-amber-200",
  success: "bg-go-soft text-go-ink ring-emerald-200",
  danger: "bg-rose-50 text-rose-800 ring-rose-200",
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
