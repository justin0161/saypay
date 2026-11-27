import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "go" | "secondary" | "ghost" | "danger" | "hivis";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink/90",
  go: "bg-go text-white hover:bg-go/90",
  hivis: "bg-hivis text-hivis-ink hover:brightness-95",
  secondary: "bg-surface text-ink ring-1 ring-line ring-inset hover:bg-canvas",
  ghost: "text-ink hover:bg-ink/5",
  danger: "bg-surface text-rose-700 ring-1 ring-rose-200 ring-inset hover:bg-rose-50",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-11 px-4 text-[15px]",
  lg: "min-h-14 px-6 text-base",
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
