import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("rounded-card bg-surface p-5 shadow-card ring-1 ring-line ring-inset sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("font-sans text-[12px] font-semibold tracking-[0.06em] text-muted uppercase", className)} {...props} />;
}
