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
          "flex min-h-10 items-center rounded-[10px] px-3.5 text-sm font-medium transition",
          active(l.href) ? "bg-canvas text-ink ring-1 ring-line ring-inset" : "text-muted hover:text-ink",
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/90 pb-safe backdrop-blur-xl sm:hidden" aria-label="Main">
      <div className="mx-auto grid max-w-md grid-cols-3 items-center px-4 pt-2">
        <Link href="/dashboard" className={cn("flex min-h-12 items-center justify-center text-sm font-medium", active("/dashboard") ? "text-ink" : "text-muted")}>
          Quotes
        </Link>
        <Link
          href="/quotes/new"
          aria-label="New quote"
          className="mx-auto -mt-6 grid size-14 place-items-center rounded-full bg-ink text-white shadow-lift ring-4 ring-surface transition active:scale-95"
        >
          <PlusIcon width={28} height={28} />
        </Link>
        <Link href="/settings" className={cn("flex min-h-12 items-center justify-center text-sm font-medium", active("/settings") ? "text-ink" : "text-muted")}>
          Settings
        </Link>
      </div>
    </nav>
  );
}
