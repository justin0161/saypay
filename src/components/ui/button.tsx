import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "go" | "secondary" | "ghost" | "danger" | "hivis";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] transition duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_8px_18px_-8px_rgb(13_16_51/0.6)] hover:bg-[#1b1f55]",
  go: "bg-go text-white shadow-[0_1px_0_rgb(255_255_255/0.2)_inset,0_8px_20px_-8px_rgb(14_159_110/0.7)] hover:bg-[#0b8f62]",
  hivis:
    "bg-[linear-gradient(110deg,#ffc53d_0%,#ffb020_35%,#ff8a3d_100%)] text-hivis-ink shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_10px_22px_-8px_rgb(255_122_61/0.75)] hover:brightness-[1.04]",
  secondary: "bg-surface text-ink ring-1 ring-line ring-inset shadow-[0_1px_2px_rgb(13_16_51/0.05)] hover:ring-ink/20",
  ghost: "text-ink hover:bg-ink/5 hover:translate-y-0",
  danger: "bg-surface text-rose-700 ring-1 ring-rose-200 ring-inset hover:bg-rose-50",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm",
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
