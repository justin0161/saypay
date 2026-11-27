import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "go" | "secondary" | "ghost" | "danger" | "hivis" | "inverse" | "glass";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-[5px] font-semibold uppercase tracking-[0.04em] transition duration-100 disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-[#2a2d32] active:translate-y-px",
  go: "bg-go text-white hover:bg-[#0f773f] active:translate-y-px",
  // Hi-vis CTA: amber with a hard stamped shadow that presses in on click.
  hivis:
    "bg-hivis text-ink ring-2 ring-ink ring-inset shadow-stamp hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  secondary: "bg-surface text-ink ring-2 ring-ink/80 ring-inset hover:bg-canvas active:translate-y-px",
  ghost: "text-ink hover:bg-ink/[0.06]",
  danger: "bg-surface text-stop ring-2 ring-stop/40 ring-inset hover:bg-red-50",
  // For dark backgrounds.
  inverse: "bg-hivis text-ink hover:bg-[#ffc640] active:translate-y-px",
  glass: "text-white ring-2 ring-white/30 ring-inset hover:bg-white/[0.06] active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-3.5 text-[13px]",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-13 px-6 text-[15px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
