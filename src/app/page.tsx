import Link from "next/link";
import { LiveDemo } from "@/components/demo/live-demo";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CameraIcon,
  CardIcon,
  ChatIcon,
  CheckIcon,
  LockIcon,
  Logo,
  MicIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/ui/icons";

const STEPS = [
  {
    icon: MicIcon,
    title: "Talk them through it",
    body: "Add line items, snap a few site photos, and record a 60-second voice note explaining the job — right from the van.",
  },
  {
    icon: ChatIcon,
    title: "Send one link",
    body: "One tap shares a private link by WhatsApp or SMS. Your client opens it instantly. No app, no login, no PDF.",
  },
  {
    icon: CheckIcon,
    title: "Approved and paid",
    body: "They approve, the price is locked with a timestamp, and the deposit lands — so you can book the job.",
  },
];

const FEATURES = [
  { icon: MicIcon, title: "Voice-note walkthroughs", body: "Clients trust a voice. Explain scope, options and reasoning in less time than typing it." },
  { icon: CameraIcon, title: "Visual proof, both ways", body: "Attach site photos and video. Clients send back measurements, damage and access shots." },
  { icon: ChatIcon, title: "One thread per job", body: "Questions, voice replies and change requests live with the quote — not lost in your texts." },
  { icon: LockIcon, title: "Locked, time-stamped approval", body: "Once approved, terms freeze with who, when and from which device. No more disputes." },
  { icon: CardIcon, title: "Deposits on approval", body: "Card payments straight to your account via Stripe, or your own payment link." },
  { icon: PhoneIcon, title: "Built for the job site", body: "Install SayPay on your home screen. Designed for one-handed use, on any phone." },
];

const TRADES = ["Plumbers", "Electricians", "Builders", "Heating engineers", "Decorators", "Roofers", "Cleaners", "Landscapers"];

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] font-semibold tracking-[0.04em] uppercase ${dark ? "text-white/60" : "text-muted"}`}>
      <span className="h-px w-6 bg-hivis" aria-hidden />
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            <a href="#how" className="hidden min-h-10 items-center px-3 text-sm font-medium text-ink-soft transition hover:text-ink md:flex">
              How it works
            </a>
            <a href="#demo" className="hidden min-h-10 items-center px-3 text-sm font-medium text-ink-soft transition hover:text-ink sm:flex">
              Demo
            </a>
            <a href="#pricing" className="hidden min-h-10 items-center px-3 text-sm font-medium text-ink-soft transition hover:text-ink sm:flex">
              Pricing
            </a>
            <span className="mx-2 hidden h-5 w-px bg-line sm:block" aria-hidden />
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/login?mode=signup" size="sm">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div
          aria-hidden
          className="absolute top-24 right-[8%] hidden size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(245_165_36/0.16),transparent)] lg:block"
        />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-28">
          <div className="min-w-0 animate-rise">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface py-1 pr-3 pl-1 text-[13px] font-medium text-ink-soft shadow-card ring-1 ring-line ring-inset">
              <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
              Voice-backed quotes for trades
            </p>
            <h1 className="mt-7 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-[4.25rem]">
              Quotes approved by voice.{" "}
              <span className="text-muted/80">Deposits paid today.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Send a quote with a 60-second voice walkthrough and site photos. Your client listens, asks questions and approves —
              from one private link. You get the job booked and the deposit secured.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" size="lg">
                Send your first quote free
                <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg">
                See it in action
              </ButtonLink>
            </div>
            <ul className="mt-10 grid gap-3 text-sm text-ink-soft sm:grid-cols-2">
              {["No app for your clients", "Works on any phone", "Price locked on approval", "Deposits secured by Stripe"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckIcon width={16} height={16} strokeWidth={2.25} className="shrink-0 text-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div id="demo" className="min-w-0 scroll-mt-24 animate-rise [animation-delay:120ms]">
            <LiveDemo />
            <p className="mt-4 text-center text-sm text-muted">Interactive demo — play the voice note, reply, then approve.</p>
          </div>
        </div>
      </section>

      {/* Trades */}
      <section aria-label="Built for every trade" className="border-y border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
          <p className="shrink-0 text-[13px] font-medium text-muted">Built for</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 lg:justify-start">
            {TRADES.map((t) => (
              <li key={t} className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink/55">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl">
          From site visit to booked job. <span className="text-muted/80">In one link.</span>
        </h2>
        <ol className="mt-16 grid gap-px overflow-hidden rounded-card bg-line ring-1 ring-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-surface p-8">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-[10px] bg-canvas text-ink ring-1 ring-line ring-inset">
                  <s.icon width={18} height={18} />
                </span>
                <span className="tabular font-display text-sm font-medium text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-10 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2.5 leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <Eyebrow>Why SayPay</Eyebrow>
              <h2 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl">
                Everything a PDF quote <span className="text-muted/80">can&apos;t do.</span>
              </h2>
            </div>
            <p className="max-w-lg text-lg leading-relaxed text-ink-soft lg:justify-self-end">
              A quote your client can hear, question and approve in minutes — with a record that stands up if anyone asks.
            </p>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-card bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-surface p-8 transition hover:bg-[#fcfcfd]">
                <f.icon width={22} height={22} className="text-ink" strokeWidth={1.75} />
                <h3 className="mt-6 text-[17px] font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark band: numbers + trust */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black,transparent)]" />
        <div aria-hidden className="absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_165_36/0.14),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <Eyebrow dark>Trust, by design</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl">
            Fast for you. <span className="text-white/45">Reassuring for them.</span>
          </h2>
          <dl className="mt-16 grid gap-10 border-y border-white/10 py-12 sm:grid-cols-3">
            {[
              ["60s", "To record and send a quote"],
              ["1 tap", "For your client to approve"],
              ["0 apps", "For your client to download"],
            ].map(([n, l]) => (
              <div key={n}>
                <dt className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{n}</dt>
                <dd className="mt-3 text-white/55">{l}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              [ShieldIcon, "Private by design", "Every client link is a 192-bit random token. Media is served via short-lived signed URLs."],
              [LockIcon, "Tamper-evident approvals", "Approved terms are frozen in a snapshot and protected at the database level."],
              [CardIcon, "Payments by Stripe", "Card details never touch SayPay. Deposits go straight to your connected account."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof ShieldIcon;
              return (
                <div key={t as string}>
                  <I width={20} height={20} strokeWidth={1.75} className="text-hivis" />
                  <p className="mt-5 font-display text-lg font-semibold">{t as string}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{b as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow>Pricing</Eyebrow>
          </div>
          <h2 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl">
            Simple pricing. <span className="text-muted/80">Pays for itself on one job.</span>
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-card bg-surface p-8 shadow-card ring-1 ring-line ring-inset sm:p-10">
            <h3 className="text-[15px] font-semibold text-ink-soft">Starter</h3>
            <p className="mt-4 font-display text-5xl font-semibold tracking-[-0.04em]">Free</p>
            <p className="mt-2 text-muted">Your first 5 quotes</p>
            <ul className="mt-8 flex-1 space-y-3.5 border-t border-line pt-8 text-ink-soft">
              {["Voice-note quotes", "Private client links", "Photos, video and messaging", "Approval audit trail"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckIcon width={16} height={16} strokeWidth={2.25} className="shrink-0 text-ink" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="secondary" size="lg" className="mt-10 w-full">
              Start free
            </ButtonLink>
          </div>
          <div className="relative flex flex-col overflow-hidden rounded-card bg-ink p-8 text-white shadow-lift sm:p-10">
            <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(245_165_36/0.22),transparent)]" />
            <h3 className="relative flex items-center justify-between text-[15px] font-semibold text-white/75">
              Pro
              <span className="rounded-full px-2.5 py-1 font-sans text-xs font-medium text-hivis ring-1 ring-hivis/40 ring-inset">
                Most popular
              </span>
            </h3>
            <p className="relative mt-4 font-display text-5xl font-semibold tracking-[-0.04em]">
              £19<span className="ml-1 font-sans text-base font-normal tracking-normal text-white/50">/ month</span>
            </p>
            <p className="relative mt-2 text-white/55">Unlimited quotes</p>
            <ul className="relative mt-8 flex-1 space-y-3.5 border-t border-white/10 pt-8 text-white/80">
              {["Everything in Starter", "Unlimited quotes and storage", "Card deposits via Stripe", "Your logo and brand colour"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckIcon width={16} height={16} strokeWidth={2.25} className="shrink-0 text-hivis" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="inverse" size="lg" className="relative mt-10 w-full">
              Go Pro <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-24 sm:px-6 sm:pb-32">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.25rem] bg-ink px-6 py-20 text-center text-white sm:px-12 sm:py-24">
          <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent)]" />
          <div aria-hidden className="absolute -bottom-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_165_36/0.2),transparent)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
              Your next quote could be approved by tonight.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-white/60">Free for your first 5 quotes. No card needed. Set up in two minutes.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" variant="inverse" size="lg">
                Get started free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="glass" size="lg">
                Try the demo
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-6">
            <Logo className="text-ink" />
            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
            <p className="hidden sm:block">Quotes approved by voice.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#pricing" className="transition hover:text-ink">Pricing</a>
            <Link href="/login" className="transition hover:text-ink">Log in</Link>
          </div>
          <p>© {new Date().getFullYear()} SayPay</p>
        </div>
      </footer>
    </div>
  );
}
