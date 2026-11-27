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
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/75 backdrop-blur-xl after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-[linear-gradient(90deg,transparent,#ffb020,#ff4f9a,#7b5cff,transparent)] after:opacity-60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            <AppNav variant="top" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 items-center gap-2 truncate rounded-full bg-canvas py-1 pr-3 pl-1 text-sm font-bold text-ink-soft ring-1 ring-line ring-inset md:inline-flex">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sunset text-[11px] font-extrabold text-white">
                {workspace.business_name.trim().charAt(0).toUpperCase() || "S"}
              </span>
              <span className="truncate">{workspace.business_name}</span>
            </span>
            <Link href="/quotes/new" className={buttonClass("hivis", "sm", "max-sm:hidden")}>
              <PlusIcon width={18} height={18} /> New quote
            </Link>
            <form action={signOut}>
              <button type="submit" className="min-h-11 rounded-full px-3 text-sm font-bold text-muted transition hover:bg-ink/5 hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl animate-rise px-4 py-5 sm:py-8">{children}</main>
      <AppNav variant="bottom" />
    </div>
  );
}
