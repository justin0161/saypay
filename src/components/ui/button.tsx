import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "go" | "secondary" | "ghost" | "danger" | "hivis" | "inverse" | "glass";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-[#1c2d47]",
  go: "bg-go text-white hover:bg-[#0f8f5e]",
  // Brand call-to-action.
  hivis: "bg-hivis text-ink hover:bg-[#ffc24d]",
  secondary: "bg-surface text-ink ring-1 ring-line ring-inset shadow-stamp hover:ring-ink/25",
  ghost: "text-ink hover:bg-ink/[0.05]",
  danger: "bg-surface text-stop ring-1 ring-stop/25 ring-inset hover:bg-red-50",
  // For dark backgrounds.
  inverse: "bg-white text-ink hover:bg-white/90",
  glass: "bg-white/10 text-white ring-1 ring-white/20 ring-inset hover:bg-white/15",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-14 px-7 text-base",
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
