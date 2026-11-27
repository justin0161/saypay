import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, Logo, PlayIcon } from "@/components/ui/icons";
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
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-center text-lg text-ink-soft lg:text-left">
            {mode === "signup" ? "Free for your first 5 quotes. No card needed." : "Log in to see your quotes and replies."}
          </p>
          {linkError && (
            <p className="mt-5 rounded-2xl bg-stop-soft p-3.5 text-sm font-medium text-stop ring-1 ring-stop/30 ring-inset" role="alert">
              That sign-in link has expired or was already used. Request a new one below.
            </p>
          )}
          <LoginForms initialMode={mode} next={next} />
        </div>
      </main>

      {/* Brand panel (desktop) */}
      <aside className="hidden p-3 lg:block" aria-hidden>
        <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[2rem] bg-surface px-14 ring-1 ring-line ring-inset xl:px-20">
          <div className="absolute right-[-20%] bottom-[-25%] size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.18),transparent)]" />
          <p className="relative max-w-md font-display text-5xl leading-[1.02] font-bold tracking-[-0.045em]">
            Quotes with your voice. <span className="text-hivis">Paid on the spot.</span>
          </p>
          <div className="relative mt-14 w-full max-w-sm">
            <div className="rounded-3xl bg-canvas p-5 shadow-lift">
              <p className="text-xs text-muted">Harper &amp; Sons · Quote #0142</p>
              <p className="mt-1 font-display text-xl font-bold tracking-[-0.03em]">Back bedroom radiator</p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-night p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hivis text-on-accent">
                  <PlayIcon width={15} height={15} />
                </span>
                <span className="flex h-7 flex-1 items-center gap-[3px]">
                  {WAVE.map((h, i) => (
                    <span key={i} className={`flex-1 rounded-full ${i < 8 ? "bg-hivis" : "bg-[#3a3f3a]"}`} style={{ height: `${h * 100}%` }} />
                  ))}
                </span>
                <span className="tabular pr-1 text-xs text-muted">0:34</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="text-ink-soft">Total</span>
                <span className="tabular font-semibold">£849.60</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-10 flex animate-pop items-center gap-3 rounded-2xl bg-raised py-3 pr-5 pl-3 shadow-chip [animation-delay:500ms]">
              <span className="grid size-9 place-items-center rounded-full bg-hivis text-on-accent">
                <CheckIcon width={18} height={18} strokeWidth={3} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Deposit paid · £212.40</p>
                <p className="mt-0.5 text-xs text-muted">By bank transfer</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
