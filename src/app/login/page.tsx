import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, Logo, PlayIcon } from "@/components/ui/icons";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const mode = sp.mode === "signup" ? "signup" : "signin";
  const next = typeof sp.next === "string" ? sp.next : "/dashboard";
  const linkError = sp.error === "link";

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[1fr_1fr]">
      <main className="relative flex flex-col px-4 py-6 sm:px-10">
        <Link href="/" className="mx-auto lg:mx-0" aria-label="SayPay home">
          <Logo />
        </Link>
        <div className="mx-auto mt-12 w-full max-w-sm flex-1 animate-rise sm:mt-20">
          <p className="text-center font-mono text-xs font-medium tracking-[0.16em] text-muted uppercase lg:text-left">
            {mode === "signup" ? "Free for your first 5 quotes" : "SayPay dashboard"}
          </p>
          <h1 className="mt-3 text-center text-5xl leading-[0.92] font-extrabold uppercase lg:text-left">
            {mode === "signup" ? "Get set up" : "Welcome back"}
          </h1>
          <p className="mt-3 text-center text-ink-soft lg:text-left">
            {mode === "signup" ? "Takes two minutes. No card needed." : "Log in to see your quotes and replies."}
          </p>
          {linkError && (
            <p className="mt-5 rounded-[5px] bg-red-50 p-3 text-sm font-medium text-stop ring-1 ring-stop/30 ring-inset" role="alert">
              That sign-in link has expired or was already used. Request a new one below.
            </p>
          )}
          <LoginForms initialMode={mode} next={next} />
        </div>
      </main>

      {/* Brand panel (desktop) */}
      <aside className="relative hidden flex-col overflow-hidden border-l-2 border-ink bg-hivis lg:flex" aria-hidden>
        <div className="h-4 bg-hazard" />
        <div className="flex flex-1 flex-col justify-center px-14 xl:px-20">
          <p className="max-w-md font-display text-6xl leading-[0.9] font-extrabold text-ink uppercase">
            Send it from the van.
            <span className="mt-2 block">
              <span className="bg-ink box-decoration-clone px-2 leading-[1.08] text-hivis">Booked by tonight.</span>
            </span>
          </p>

          {/* Job sheet card */}
          <div className="relative mt-14 w-full max-w-sm rounded-card bg-surface ring-2 ring-ink shadow-[8px_8px_0_var(--color-ink)]">
            <div className="flex items-center justify-between bg-ink px-4 py-2.5 font-mono text-[11px] font-medium tracking-[0.12em] text-white uppercase">
              <span>Quote</span>
              <span className="text-hivis">No. 0142</span>
            </div>
            <div className="p-4">
              <p className="font-display text-2xl leading-tight font-bold uppercase">Back bedroom radiator</p>
              <p className="mt-0.5 font-mono text-xs text-muted">For Priya · £849.60</p>
              <div className="mt-4 flex items-center gap-3 rounded-[5px] bg-ink p-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-hivis text-ink">
                  <PlayIcon width={14} height={14} />
                </span>
                <span className="flex h-6 flex-1 items-center gap-[3px]">
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8, 0.55].map((h, i) => (
                    <span key={i} className={`flex-1 ${i < 9 ? "bg-hivis" : "bg-white/25"}`} style={{ height: `${h * 100}%` }} />
                  ))}
                </span>
                <span className="tabular pr-1 font-mono text-xs text-white/70">0:34</span>
              </div>
              <p className="mt-4 flex items-center gap-2 border-t-2 border-dashed border-ink/15 pt-4 text-sm font-semibold text-ink">
                <CheckIcon width={16} height={16} strokeWidth={3} className="text-go" /> Deposit of £212.40 received
              </p>
            </div>
            <span className="absolute -right-8 -bottom-9 animate-stamp rounded-[4px] border-[3px] border-go bg-surface/90 px-3 py-1 font-display text-2xl font-extrabold tracking-[0.08em] text-go uppercase [animation-delay:400ms]">
              Approved ✓
            </span>
          </div>
        </div>
        <div className="h-4 bg-hazard" />
      </aside>
    </div>
  );
}
