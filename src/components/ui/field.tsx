import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

export const inputClass =
  "block w-full min-h-12 rounded-2xl border-0 bg-night px-3.5 py-2.5 text-ink ring-1 ring-[#2f343a] ring-inset transition placeholder:text-[#5d635d] hover:ring-[#3d434a] focus:ring-2 focus:ring-hivis focus:shadow-[0_0_0_4px_rgb(200_255_61/0.12)] focus:outline-none disabled:bg-canvas aria-[invalid=true]:ring-rose-400";

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
