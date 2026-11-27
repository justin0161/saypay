"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { PlusIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/dashboard", label: "Quotes" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({ variant }: { variant: "top" | "bottom" }) {
  const path = usePathname();
  const active = (href: string) => path === href || (href === "/dashboard" && path.startsWith("/quotes/") && path !== "/quotes/new");

  if (variant === "top") {
    return LINKS.map((l) => (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "flex min-h-11 items-center rounded-full px-4 text-sm font-bold transition",
          active(l.href) ? "bg-ink text-white shadow-md" : "text-muted hover:bg-ink/5 hover:text-ink",
        )}
      >
        {l.label}
      </Link>
    ));
  }

  // The quote builder has its own sticky action bar.
  if (path === "/quotes/new" || path.endsWith("/edit")) return null;

  // Mobile: bottom tab bar with a central "new quote" action in thumb reach.
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/85 pb-safe shadow-float backdrop-blur-xl sm:hidden" aria-label="Main">
      <div className="mx-auto grid max-w-md grid-cols-3 items-center px-4 pt-2">
        <Link href="/dashboard" className={cn("flex min-h-12 items-center justify-center text-sm font-bold", active("/dashboard") ? "text-ink" : "text-muted")}>
          Quotes
        </Link>
        <Link
          href="/quotes/new"
          aria-label="New quote"
          className="mx-auto -mt-7 grid size-16 place-items-center rounded-full bg-sunset text-white shadow-[0_12px_24px_-8px_rgb(255_79_154/0.7)] ring-4 ring-surface transition active:scale-95"
        >
          <PlusIcon width={28} height={28} />
        </Link>
        <Link href="/settings" className={cn("flex min-h-12 items-center justify-center text-sm font-bold", active("/settings") ? "text-ink" : "text-muted")}>
          Settings
        </Link>
      </div>
    </nav>
  );
}
