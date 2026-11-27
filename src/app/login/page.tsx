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
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[1fr_1.05fr]">
      <main className="relative flex flex-col overflow-hidden px-4 py-6 sm:px-8">
        {/* Soft sunset glow (mobile + tablet). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-sunset opacity-25 blur-3xl lg:hidden"
        />
        <Link href="/" className="relative mx-auto lg:mx-0" aria-label="SayPay home">
          <Logo />
        </Link>
        <div className="relative mx-auto mt-10 w-full max-w-sm flex-1 animate-rise sm:mt-16 lg:mt-20">
          <h1 className="text-center text-4xl font-extrabold tracking-tight text-balance lg:text-left">
            {mode === "signup" ? (
              <>
                Start sending <span className="text-sunset">voice quotes</span>
              </>
            ) : (
              <>
                Welcome <span className="text-sunset">back</span> 👋
              </>
            )}
          </h1>
          <p className="mt-3 text-center font-medium text-muted lg:text-left">
            {mode === "signup" ? "Free for your first 5 quotes. No card needed." : "Log in to your SayPay dashboard."}
          </p>
          {linkError && (
            <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200 ring-inset" role="alert">
              That sign-in link has expired or was already used. Request a new one below.
            </p>
          )}
          <LoginForms initialMode={mode} next={next} />
        </div>
      </main>

      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-sunset lg:block" aria-hidden>
        <div className="absolute -top-1/4 -left-1/4 size-[70%] animate-blob rounded-full bg-[#ffd15c] opacity-70 blur-3xl" />
        <div className="absolute right-[-20%] bottom-[-10%] size-[75%] animate-blob rounded-full bg-[#7b5cff] opacity-80 blur-3xl [animation-delay:-8s]" />
        <div className="absolute top-1/3 left-1/3 size-[45%] animate-blob rounded-full bg-[#ff4f9a] opacity-60 blur-3xl [animation-delay:-4s]" />

        <div className="relative flex h-full flex-col justify-center px-12 xl:px-20">
          <p className="max-w-md font-display text-4xl leading-tight font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgb(13_16_51/0.2)]">
            Send it from the van. Get it approved before you&apos;re home.
          </p>
          <p className="mt-4 max-w-sm font-semibold text-white/85">
            A voice note, a few photos and one link — your client listens, approves and pays the deposit.
          </p>

          {/* Floating mini quote card */}
          <div className="mt-12 w-full max-w-sm animate-float rounded-3xl bg-white/95 p-5 shadow-[0_40px_80px_-20px_rgb(40_20_100/0.5)] backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-extrabold text-ink">Back bedroom radiator</p>
              <span className="rounded-full bg-go-soft px-2.5 py-1 text-xs font-bold text-go-ink">Approved</span>
            </div>
            <p className="text-sm font-medium text-muted">For Priya · £849.60</p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink p-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,#ffd15c,#ff7a3d)] text-hivis-ink">
                <PlayIcon width={16} height={16} />
              </span>
              <span className="flex h-7 flex-1 items-center gap-[3px]">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8, 0.55].map((h, i) => (
                  <span key={i} className="flex-1 rounded-full bg-white/35" style={{ height: `${h * 100}%` }} />
                ))}
              </span>
              <span className="pr-1 text-xs font-semibold text-white/80">0:34</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-go-soft px-3 py-2.5 text-sm font-bold text-go-ink">
              <CheckIcon width={16} height={16} strokeWidth={3} /> Deposit of £212.40 paid
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
