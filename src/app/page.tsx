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
  { title: "Talk them through it", body: "Add line items, snap a few site photos and record a voice note explaining the job — from the van.", time: "60 sec" },
  { title: "Send one link", body: "Share a private link by WhatsApp or SMS. Your client opens it instantly. No app, no login, no PDF.", time: "1 tap" },
  { title: "Approved & paid", body: "They approve, the price locks with a timestamp, and the deposit lands. Book the job in.", time: "Same day" },
];

const FEATURES = [
  { icon: MicIcon, title: "Voice-note walkthroughs", body: "Clients trust a voice. Explain scope, options and reasoning quicker than typing it." },
  { icon: CameraIcon, title: "Photos, both ways", body: "Attach site photos and video. Clients send back measurements, damage and access shots." },
  { icon: ChatIcon, title: "One thread per job", body: "Questions, voice replies and change requests stay with the quote — not lost in your texts." },
  { icon: LockIcon, title: "Locked approvals", body: "Once approved, the terms freeze with who, when and from which device. No more disputes." },
  { icon: CardIcon, title: "Deposits on approval", body: "Card payments straight to your account via Stripe, or use your own payment link." },
  { icon: PhoneIcon, title: "Built for site", body: "Big buttons, one thumb, any phone. Install it on your home screen like an app." },
];

const TRADES = ["Plumbers", "Sparkies", "Builders", "Heating engineers", "Decorators", "Roofers", "Joiners", "Plasterers"];

function SectionLabel({ n, children, dark = false }: { n: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-xs font-medium tracking-[0.16em] uppercase ${dark ? "text-white/60" : "text-muted"}`}>
      <span className="bg-hivis px-1.5 py-0.5 text-ink">{n}</span>
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-canvas">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {[
              ["#how", "How it works"],
              ["#demo", "Demo"],
              ["#pricing", "Pricing"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="hidden min-h-10 items-center px-3 font-display text-[15px] font-semibold tracking-[0.06em] text-ink-soft uppercase transition hover:text-ink sm:flex"
              >
                {label}
              </a>
            ))}
            <ButtonLink href="/login" variant="ghost" size="sm" className="ml-1">
              Log in
            </ButtonLink>
            <ButtonLink href="/login?mode=signup" variant="hivis" size="sm" className="ml-1">
              Start free
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero — hi-vis amber */}
      <section className="relative bg-hivis">
        {/* Reflective vest bands */}
        <div aria-hidden className="absolute inset-x-0 bottom-16 h-3.5 bg-reflective opacity-75" />
        <div aria-hidden className="absolute inset-x-0 bottom-9 h-3.5 bg-reflective opacity-75" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-28 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-32">
          <div className="min-w-0 animate-rise">
            <p className="inline-flex items-center gap-2 bg-ink px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.16em] text-hivis uppercase">
              For tradespeople & service businesses
            </p>
            <h1 className="mt-6 text-[3.4rem] leading-[0.88] font-extrabold tracking-[-0.01em] text-ink uppercase sm:text-[5.75rem]">
              Quotes approved
              <br />
              by voice.
              <span className="mt-3 block"><span className="bg-ink box-decoration-clone px-2 leading-[1.02] text-hivis">Deposits paid today.</span></span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed font-medium text-ink/80">
              Send a quote with a 60-second voice note and site photos. Your client listens, asks questions and taps approve — from
              one link. You book the job with the deposit secured.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" size="lg" className="shadow-[4px_4px_0_rgb(22_24_27/0.25)]">
                Send your first quote free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg" className="bg-transparent! ring-ink! hover:bg-ink/5!">
                Try the demo
              </ButtonLink>
            </div>
            <ul className="mt-9 grid gap-2 font-mono text-[13px] font-medium text-ink/80 sm:grid-cols-2">
              {["No app for your clients", "Works on any phone", "Price locked on approval", "Deposits via Stripe"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid size-4 shrink-0 place-items-center bg-ink text-hivis">
                    <CheckIcon width={11} height={11} strokeWidth={3.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div id="demo" className="relative min-w-0 scroll-mt-24 animate-rise [animation-delay:120ms]">
            <LiveDemo />
          </div>
        </div>
        <div aria-hidden className="h-4 bg-hazard" />
      </section>

      {/* Tape-measure of trades */}
      <section aria-label="Built for every trade" className="border-b-2 border-ink bg-[#f7d354]">
        <div aria-hidden className="h-4 bg-ruler opacity-80" />
        <ul className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-center gap-x-7 gap-y-1 px-4 pt-2 pb-4 sm:px-6 lg:justify-between">
          {TRADES.map((t, i) => (
            <li key={t} className="flex items-baseline gap-1.5">
              <span className="font-mono text-[10px] font-semibold text-ink/50">{(i + 1) * 10}</span>
              <span className="font-display text-lg font-bold tracking-[0.04em] text-ink uppercase">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works — a job sheet */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionLabel n="01">How it works</SectionLabel>
            <h2 className="mt-5 text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl">
              Site visit to booked job. <span className="text-ink/40">One link.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              No more chasing PDFs, no more &ldquo;I&apos;ll have a think&rdquo;. Your client hears you explain it, then says yes.
            </p>
          </div>

          <div className="relative rounded-card bg-surface ring-2 ring-ink shadow-lift">
            <div className="flex items-center justify-between bg-ink px-5 py-3 font-mono text-xs font-medium tracking-[0.12em] text-white uppercase">
              <span>Job sheet</span>
              <span className="text-hivis">No. 0001</span>
            </div>
            <ol className="bg-jobsheet">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-b border-dashed border-ink/20 px-5 py-6 last:border-b-0 sm:grid-cols-[3.5rem_1fr_6rem] sm:px-6"
                >
                  <span className="font-display text-4xl leading-none font-extrabold text-hivis-deep">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl leading-tight font-bold uppercase">{s.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink-soft">{s.body}</p>
                  </div>
                  <span className="col-start-2 font-mono text-xs font-medium tracking-[0.08em] text-muted uppercase sm:col-start-auto sm:pt-1.5 sm:text-right">
                    {s.time}
                  </span>
                </li>
              ))}
            </ol>
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -bottom-5 rotate-[-8deg] rounded-[4px] border-[3px] border-go bg-surface/80 px-3 py-1 font-display text-2xl font-extrabold tracking-[0.08em] text-go uppercase sm:-right-6"
            >
              Approved ✓
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y-2 border-ink bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel n="02">Why SayPay</SectionLabel>
          <h2 className="mt-5 max-w-3xl text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl">
            Everything a PDF quote <span className="text-ink/40">can&apos;t do.</span>
          </h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-card bg-canvas p-6 ring-2 ring-ink transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid size-11 place-items-center rounded-[4px] bg-hivis text-ink ring-2 ring-ink">
                  <f.icon width={20} height={20} strokeWidth={2.25} />
                </span>
                <h3 className="mt-5 font-display text-2xl leading-tight font-bold uppercase">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust — charcoal, framed in hazard tape */}
      <section className="bg-ink text-white">
        <div aria-hidden className="h-3 bg-hazard" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel n="03" dark>
            Built to stand up
          </SectionLabel>
          <h2 className="mt-5 max-w-3xl text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl">
            Quick for you. <span className="text-hivis">Solid for them.</span>
          </h2>
          <dl className="mt-14 grid border-2 border-white/15 sm:grid-cols-3">
            {[
              ["60s", "To record and send a quote"],
              ["1 tap", "For your client to approve"],
              ["0 apps", "For your client to download"],
            ].map(([n, l], i) => (
              <div key={n} className={`p-7 ${i > 0 ? "border-t-2 border-white/15 sm:border-t-0 sm:border-l-2" : ""}`}>
                <dt className="font-display text-7xl leading-none font-extrabold text-hivis uppercase">{n}</dt>
                <dd className="mt-3 font-mono text-xs tracking-[0.1em] text-white/60 uppercase">{l}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {[
              [ShieldIcon, "Private by design", "Every client link is a 192-bit random token. Photos and voice notes use short-lived signed links."],
              [LockIcon, "Tamper-evident", "Approved terms are frozen in a snapshot and protected at the database level."],
              [CardIcon, "Payments by Stripe", "Card details never touch SayPay. Deposits go straight to your connected account."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof ShieldIcon;
              return (
                <div key={t as string} className="border-l-2 border-hivis pl-5">
                  <I width={22} height={22} className="text-hivis" />
                  <p className="mt-4 font-display text-xl font-bold tracking-[0.02em] uppercase">{t as string}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{b as string}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div aria-hidden className="h-3 bg-hazard" />
      </section>

      {/* Pricing — tickets */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <SectionLabel n="04">Pricing</SectionLabel>
        <h2 className="mt-5 max-w-3xl text-5xl leading-[0.92] font-extrabold uppercase sm:text-6xl">
          Pays for itself <span className="text-ink/40">on one job.</span>
        </h2>
        <div className="mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-card bg-surface p-8 ring-2 ring-ink">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted uppercase">Starter</p>
            <p className="mt-3 font-display text-7xl leading-none font-extrabold uppercase">Free</p>
            <p className="mt-2 font-medium text-ink-soft">Your first 5 quotes</p>
            <ul className="mt-7 flex-1 space-y-3 border-t-2 border-dashed border-ink/20 pt-7 text-ink-soft">
              {["Voice-note quotes", "Private client links", "Photos, video & messaging", "Approval audit trail"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckIcon width={18} height={18} strokeWidth={2.75} className="shrink-0 text-go" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="secondary" size="lg" className="mt-9 w-full">
              Start free
            </ButtonLink>
          </div>
          <div className="relative flex flex-col rounded-card bg-hivis p-8 ring-2 ring-ink shadow-[8px_8px_0_var(--color-ink)]">
            <span className="absolute -top-3.5 right-6 bg-ink px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.14em] text-hivis uppercase">
              Most popular
            </span>
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-ink/70 uppercase">Pro</p>
            <p className="mt-3 font-display text-7xl leading-none font-extrabold uppercase">
              £19<span className="ml-1 font-sans text-lg font-semibold tracking-normal text-ink/60 normal-case">/month</span>
            </p>
            <p className="mt-2 font-medium text-ink/75">Unlimited quotes</p>
            <ul className="mt-7 flex-1 space-y-3 border-t-2 border-dashed border-ink/25 pt-7 text-ink/85">
              {["Everything in Starter", "Unlimited quotes & storage", "Card deposits via Stripe", "Your logo & brand colour"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckIcon width={18} height={18} strokeWidth={2.75} className="shrink-0 text-ink" /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" size="lg" className="mt-9 w-full">
              Go Pro <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-6xl rounded-card bg-hazard p-3">
          <div className="rounded-[3px] bg-ink px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-3xl text-5xl leading-[0.92] font-extrabold uppercase sm:text-7xl">
              Your next job could be <span className="text-hivis">booked by tonight.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-lg text-white/65">Free for your first 5 quotes. No card needed. Set up in two minutes.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" variant="inverse" size="lg">
                Start free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="glass" size="lg">
                Try the demo
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-ink text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo tone="dark" />
          <div className="flex items-center gap-6 font-display text-[15px] font-semibold tracking-[0.06em] uppercase">
            <a href="#how" className="transition hover:text-hivis">
              How it works
            </a>
            <a href="#pricing" className="transition hover:text-hivis">
              Pricing
            </a>
            <Link href="/login" className="transition hover:text-hivis">
              Log in
            </Link>
          </div>
          <p className="font-mono text-xs tracking-[0.08em] uppercase">© {new Date().getFullYear()} SayPay · Made for the trades</p>
        </div>
      </footer>
    </div>
  );
}
