import Link from "next/link";
import { LiveDemo } from "@/components/demo/live-demo";
import { ButtonLink } from "@/components/ui/button";
import { CameraIcon, CardIcon, ChatIcon, CheckIcon, LockIcon, Logo, MicIcon, PhoneIcon, ShieldIcon } from "@/components/ui/icons";

const STEPS = [
  {
    icon: MicIcon,
    title: "Talk them through it",
    body: "Add line items, snap a few site photos, and record a 60-second voice note explaining the job — right from the van.",
  },
  {
    icon: ChatIcon,
    title: "Send one link",
    body: "One tap shares a magic link by WhatsApp or SMS. Your client opens it instantly. No app, no login, no PDF.",
  },
  {
    icon: CheckIcon,
    title: "Approved & paid",
    body: "They hit Approve, the price is locked with a timestamp, and the deposit lands — so you can book the job.",
  },
];

const FEATURES = [
  { icon: MicIcon, title: "Voice-note walkthroughs", body: "Clients trust a voice. Explain scope, options and why — in less time than typing it." },
  { icon: CameraIcon, title: "Visual proof both ways", body: "You attach site photos and video. Clients send back measurements, damage and access shots." },
  { icon: ChatIcon, title: "Two-way thread", body: "Questions, voice replies and change requests live with the quote — not lost in your texts." },
  { icon: LockIcon, title: "Locked, time-stamped approval", body: "Once approved, terms freeze with who, when and from which device. Fewer \"I never agreed to that\"." },
  { icon: CardIcon, title: "Deposits on approval", body: "Stripe card payments straight to your account, or your own payment link. Track who's paid at a glance." },
  { icon: PhoneIcon, title: "Lives on your home screen", body: "Install SayPay like an app on iPhone or Android. Built for one-thumb use on site." },
];

export default function LandingPage() {
  return (
    <div className="bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#demo" className="hidden min-h-11 items-center px-3 text-sm font-semibold text-ink-soft hover:text-ink sm:flex">
              Live demo
            </a>
            <a href="#pricing" className="hidden min-h-11 items-center px-3 text-sm font-semibold text-ink-soft hover:text-ink sm:flex">
              Pricing
            </a>
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/login?mode=signup" size="sm">
              Start free
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero + demo */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60rem 30rem at 85% -10%, rgba(255,176,32,0.28), transparent 60%), radial-gradient(40rem 24rem at -10% 110%, rgba(14,159,110,0.25), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="min-w-0">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/15 ring-inset">
              <span className="size-1.5 shrink-0 rounded-full bg-hivis" /> For plumbers, electricians, builders, cleaners & every trade
            </p>
            <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
              Quotes approved by voice.
              <span className="block text-hivis">Deposits paid today.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              Send a quote with a 60-second voice walkthrough and site photos. Your client listens, asks questions, and taps
              Approve &amp; Pay — from one link, no login. You get the job booked and the deposit secured.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" variant="hivis" size="lg">
                Send your first quote free
              </ButtonLink>
              <a
                href="#demo"
                className="inline-flex min-h-14 items-center justify-center rounded-xl px-6 font-semibold text-white ring-1 ring-white/25 ring-inset hover:bg-white/5 lg:hidden"
              >
                Try the live demo ↓
              </a>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-white/75 sm:grid-cols-2">
              {["No app for clients to install", "Works on any phone", "Price locked on approval", "Stripe-secured deposits"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon width={18} height={18} className="text-hivis" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div id="demo" className="min-w-0 scroll-mt-24">
            <p className="mb-3 text-center text-sm font-semibold text-white/70 lg:text-left">
              ▶ Live demo — play the voice note, reply, then approve. No sign-up.
            </p>
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">From site visit to booked job in one link.</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-card bg-canvas p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-ink text-hivis">
                  <s.icon />
                </span>
                <span className="text-sm font-bold text-muted">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything a PDF quote can&apos;t do.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-card bg-surface p-6 shadow-card">
                <f.icon className="text-ink" />
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Simple pricing. Pays for itself on one job.</h2>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="rounded-card p-7 ring-1 ring-line">
            <h3 className="text-lg font-bold">Starter</h3>
            <p className="mt-2 text-4xl font-extrabold">Free</p>
            <p className="mt-1 text-muted">Your first 5 quotes</p>
            <ul className="mt-6 space-y-2.5 text-ink-soft">
              {["Voice-note quotes", "Client magic links", "Photos, video & messaging", "Approval audit trail"].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckIcon className="shrink-0 text-go" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="secondary" size="lg" className="mt-8 w-full">
              Start free
            </ButtonLink>
          </div>
          <div className="rounded-card bg-ink p-7 text-white">
            <h3 className="flex items-center justify-between text-lg font-bold">
              Pro <span className="rounded-full bg-hivis px-2.5 py-1 text-xs font-bold text-hivis-ink">Most popular</span>
            </h3>
            <p className="mt-2 text-4xl font-extrabold">
              £19<span className="text-lg font-semibold text-white/60">/month</span>
            </p>
            <p className="mt-1 text-white/60">Unlimited quotes</p>
            <ul className="mt-6 space-y-2.5 text-white/85">
              {["Everything in Starter", "Unlimited quotes & storage", "Card deposits via Stripe", "Your logo & brand colour"].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckIcon className="shrink-0 text-hivis" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="hivis" size="lg" className="mt-8 w-full">
              Go Pro
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3">
          {[
            [ShieldIcon, "Private by design", "Every client link is a 192-bit random token. Media is served via short-lived signed URLs."],
            [LockIcon, "Tamper-evident approvals", "Approved terms are frozen in a snapshot and protected at the database level."],
            [CardIcon, "Payments by Stripe", "Card details never touch SayPay. Deposits go straight to your connected account."],
          ].map(([Icon, t, b]) => {
            const I = Icon as typeof ShieldIcon;
            return (
              <div key={t as string} className="flex gap-3">
                <I className="mt-0.5 shrink-0 text-ink" />
                <div>
                  <p className="font-bold">{t as string}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{b as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="bg-ink text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-white">
            <Logo tone="dark" />
          </span>
          <p>© {new Date().getFullYear()} SayPay · saypay.co</p>
        </div>
      </footer>
    </div>
  );
}
