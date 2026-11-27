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
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            <AppNav variant="top" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-52 items-center gap-2 truncate py-1 pr-1 text-sm font-semibold text-ink-soft md:inline-flex">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-hivis-soft text-[13px] font-semibold text-hivis-ink">
                {workspace.business_name.trim().charAt(0).toUpperCase() || "S"}
              </span>
              <span className="truncate">{workspace.business_name}</span>
            </span>
            <Link href="/quotes/new" className={buttonClass("hivis", "sm", "max-sm:hidden")}>
              <PlusIcon width={18} height={18} /> New quote
            </Link>
            <form action={signOut}>
              <button type="submit" className="min-h-10 rounded-full px-3 text-sm font-medium text-muted transition hover:bg-ink/[0.05] hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl animate-rise px-4 py-6 sm:py-10">{children}</main>
      <AppNav variant="bottom" />
    </div>
  );
}
