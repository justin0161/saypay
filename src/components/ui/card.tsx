import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("rounded-card bg-surface p-5 ring-1 ring-line ring-inset sm:p-6", className)} {...props} />;
}

/** Section label, styled like a printed job-sheet heading. */
export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase before:size-2 before:bg-hivis",
        className,
      )}
      {...props}
    />
  );
}
