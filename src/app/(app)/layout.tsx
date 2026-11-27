import Link from "next/link";
import { signOut } from "@/actions/auth";
import { Logo, PlusIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/button";
import { requireWorkspace } from "@/lib/auth";
import { AppNav } from "./app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { workspace } = await requireWorkspace();
  return (
    <div className="min-h-dvh pb-24 sm:pb-10">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            <AppNav variant="top" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm font-semibold text-muted md:inline">{workspace.business_name}</span>
            <Link href="/quotes/new" className={buttonClass("hivis", "sm", "hidden sm:inline-flex")}>
              <PlusIcon width={18} height={18} /> New quote
            </Link>
            <form action={signOut}>
              <button type="submit" className="min-h-11 px-2 text-sm font-semibold text-muted hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">{children}</main>
      <AppNav variant="bottom" />
    </div>
  );
}
