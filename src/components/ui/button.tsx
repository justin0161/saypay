import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "go" | "secondary" | "ghost" | "danger" | "hivis" | "inverse" | "glass";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  // Lime is the brand's call-to-action colour.
  primary: "bg-hivis text-on-accent hover:bg-[#d6ff66]",
  go: "bg-go text-white hover:bg-[#28c468]",
  hivis: "bg-hivis text-on-accent hover:bg-[#d6ff66]",
  secondary: "bg-transparent text-ink ring-1 ring-[#2f343a] ring-inset hover:bg-raised",
  ghost: "text-ink hover:bg-ink/[0.06]",
  danger: "bg-transparent text-stop ring-1 ring-stop/35 ring-inset hover:bg-stop-soft",
  inverse: "bg-hivis text-on-accent hover:bg-[#d6ff66]",
  glass: "bg-ink/[0.06] text-ink ring-1 ring-ink/15 ring-inset hover:bg-ink/10",
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
