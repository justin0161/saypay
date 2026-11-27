import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, LockIcon, Logo, PlayIcon } from "@/components/ui/icons";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const mode = sp.mode === "signup" ? "signup" : "signin";
  const next = typeof sp.next === "string" ? sp.next : "/dashboard";
  const linkError = sp.error === "link";

  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[1fr_1fr]">
      <main className="relative flex flex-col px-4 py-6 sm:px-10">
        <Link href="/" className="mx-auto lg:mx-0" aria-label="SayPay home">
          <Logo />
        </Link>
        <div className="mx-auto mt-12 w-full max-w-sm flex-1 animate-rise sm:mt-20 lg:mt-24">
          <h1 className="text-center text-[2rem] leading-tight font-semibold tracking-[-0.035em] lg:text-left">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2.5 text-center text-muted lg:text-left">
            {mode === "signup" ? "Free for your first 5 quotes. No card needed." : "Log in to your SayPay dashboard."}
          </p>
          {linkError && (
            <p className="mt-5 rounded-[10px] bg-rose-50 p-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200 ring-inset" role="alert">
              That sign-in link has expired or was already used. Request a new one below.
            </p>
          )}
          <LoginForms initialMode={mode} next={next} />
        </div>
        <p className="mt-10 text-center text-xs text-muted lg:text-left">
          Secured by Supabase Auth · Payments by Stripe
        </p>
      </main>

      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-ink lg:block" aria-hidden>
        <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black,transparent)]" />
        <div className="absolute top-1/2 left-1/2 size-[40rem] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_165_36/0.13),transparent)]" />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-24">
          <p className="max-w-md font-display text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.035em] text-white">
            Send it from the van. <span className="text-white/45">Approved before you&apos;re home.</span>
          </p>

          {/* Product card */}
          <div className="mt-14 w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_40px_80px_-24px_rgb(0_0_0/0.6)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink">Back bedroom radiator</p>
                <p className="mt-0.5 text-sm text-muted">For Priya · £849.60</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-go-soft px-2.5 py-1 text-xs font-medium text-go-ink ring-1 ring-emerald-200/80 ring-inset">
                <span className="size-1.5 rounded-full bg-go" /> Approved
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas p-2.5 ring-1 ring-line ring-inset">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
                <PlayIcon width={14} height={14} />
              </span>
              <span className="flex h-6 flex-1 items-center gap-[3px]">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8, 0.55].map((h, i) => (
                  <span key={i} className={`flex-1 rounded-full ${i < 9 ? "bg-ink" : "bg-slate-300"}`} style={{ height: `${h * 100}%` }} />
                ))}
              </span>
              <span className="tabular pr-1 text-xs font-medium text-muted">0:34</span>
            </div>
            <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
              <p className="flex items-center gap-2 text-ink-soft">
                <LockIcon width={15} height={15} className="text-muted" /> Terms locked · 27 Nov, 18:42
              </p>
              <p className="flex items-center gap-2 font-medium text-ink">
                <CheckIcon width={15} height={15} strokeWidth={2.5} className="text-go" /> Deposit of £212.40 received
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
