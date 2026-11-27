import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "go" | "secondary" | "ghost" | "danger" | "hivis" | "inverse" | "glass";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold tracking-[-0.01em] transition duration-150 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_1px_2px_rgb(10_13_26/0.3)] hover:bg-[#1c2032]",
  go: "bg-go text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_1px_2px_rgb(10_13_26/0.2)] hover:bg-[#0c7a54]",
  // Main call-to-action. Ink, like the primary, so the brand reads premium; amber stays an accent.
  hivis: "bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_1px_2px_rgb(10_13_26/0.3)] hover:bg-[#1c2032]",
  secondary: "bg-surface text-ink ring-1 ring-line ring-inset shadow-[0_1px_2px_rgb(10_13_26/0.04)] hover:bg-canvas",
  ghost: "text-ink hover:bg-ink/[0.05]",
  danger: "bg-surface text-rose-700 ring-1 ring-rose-200 ring-inset hover:bg-rose-50",
  // For dark backgrounds.
  inverse: "bg-white text-ink hover:bg-white/90",
  glass: "bg-white/[0.06] text-white ring-1 ring-white/15 ring-inset hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-3.5 text-sm",
  md: "min-h-11 px-4 text-[15px]",
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
