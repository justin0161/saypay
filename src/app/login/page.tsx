import type { Metadata } from "next";
import Link from "next/link";
import { CardIcon, CheckIcon, Logo, PlayIcon } from "@/components/ui/icons";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Log in" };

const WAVE = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8, 0.55, 0.9, 0.5];

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
          <h1 className="text-center text-[2.5rem] leading-[1.02] font-bold lg:text-left">
            {mode === "signup" ? "Start winning more quotes" : "Welcome back"}
          </h1>
          <p className="mt-3 text-center text-lg text-ink-soft lg:text-left">
            {mode === "signup" ? "Free for your first 5 quotes. No card needed." : "Log in to see your quotes and replies."}
          </p>
          {linkError && (
            <p className="mt-5 rounded-2xl bg-red-50 p-3.5 text-sm font-medium text-stop ring-1 ring-stop/20 ring-inset" role="alert">
              That sign-in link has expired or was already used. Request a new one below.
            </p>
          )}
          <LoginForms initialMode={mode} next={next} />
        </div>
      </main>

      {/* Brand panel (desktop) */}
      <aside className="hidden p-4 lg:block" aria-hidden>
        <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[2.5rem] bg-hivis px-14 xl:px-20">
          <div className="absolute -top-28 -right-20 size-96 rounded-full bg-[#ffc757]" />
          <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-[#ffa90f]" />

          <p className="relative max-w-md font-display text-5xl leading-[1.02] font-bold tracking-[-0.04em] text-ink">
            Quotes clients understand. Deposits that actually get paid.
          </p>

          <div className="relative mt-12 w-full max-w-sm">
            <div className="rounded-3xl bg-surface p-5 shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold tracking-[-0.03em]">Back bedroom radiator</p>
                  <p className="mt-0.5 text-sm text-muted">For Priya · £849.60</p>
                </div>
                <span className="rounded-full bg-go-soft px-2.5 py-1 text-xs font-semibold text-go-ink">Accepted</span>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-ink p-3 text-white">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hivis text-ink">
                  <PlayIcon width={15} height={15} />
                </span>
                <span className="flex h-7 flex-1 items-center gap-[3px]">
                  {WAVE.map((h, i) => (
                    <span key={i} className={`flex-1 rounded-full ${i < 8 ? "bg-hivis" : "bg-white/25"}`} style={{ height: `${h * 100}%` }} />
                  ))}
                </span>
                <span className="tabular pr-1 text-xs text-white/70">0:34</span>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-go-ink">
                <CheckIcon width={16} height={16} strokeWidth={3} className="text-go" /> Accepted by Priya · terms locked
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 flex animate-pop items-center gap-3 rounded-2xl bg-surface py-3 pr-5 pl-3 shadow-chip [animation-delay:500ms]">
              <span className="grid size-10 place-items-center rounded-full bg-hivis text-ink">
                <CardIcon width={18} height={18} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Deposit paid · £212.40</p>
                <p className="mt-0.5 text-xs text-muted">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
