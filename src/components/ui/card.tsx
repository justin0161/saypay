import type { ComponentProps } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("rounded-card bg-surface p-5 shadow-card sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "flex items-center gap-2 font-sans text-[12px] font-extrabold tracking-[0.08em] text-muted uppercase before:size-1.5 before:rounded-full before:bg-sunset",
        className,
      )}
      {...props}
    />
  );
}
