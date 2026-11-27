import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

export const inputClass =
  "block w-full min-h-12 rounded-xl border-0 bg-surface px-3.5 py-2.5 text-ink ring-1 ring-[#d5dcea] ring-inset transition placeholder:text-[#94a1b8] hover:ring-[#b8c3d8] focus:ring-2 focus:ring-hivis focus:shadow-[0_0_0_4px_rgb(47_91_255/0.12)] focus:outline-none disabled:bg-canvas aria-[invalid=true]:ring-rose-400";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-stop" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "min-h-24 resize-y", className)} {...props} />;
}
