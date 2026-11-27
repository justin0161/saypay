import Link from "next/link";
import { LiveDemo } from "@/components/demo/live-demo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
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

/** Icon tile colours — each feature gets its own little burst of colour. */
const TILES = {
  amber: "bg-[linear-gradient(135deg,#ffd15c,#ffb020)] text-hivis-ink shadow-[0_8px_18px_-8px_rgb(255_176_32/0.9)]",
  tangerine: "bg-[linear-gradient(135deg,#ffa26b,#ff6a3d)] text-white shadow-[0_8px_18px_-8px_rgb(255_106_61/0.9)]",
  pink: "bg-[linear-gradient(135deg,#ff8cc0,#ff4f9a)] text-white shadow-[0_8px_18px_-8px_rgb(255_79_154/0.9)]",
  grape: "bg-[linear-gradient(135deg,#a48bff,#7b5cff)] text-white shadow-[0_8px_18px_-8px_rgb(123_92_255/0.9)]",
  sky: "bg-[linear-gradient(135deg,#7dd8ff,#1fb6ff)] text-white shadow-[0_8px_18px_-8px_rgb(31_182_255/0.9)]",
  mint: "bg-[linear-gradient(135deg,#7ff5c8,#16c98a)] text-white shadow-[0_8px_18px_-8px_rgb(22_201_138/0.9)]",
} as const;

const STEPS = [
  {
    icon: MicIcon,
    tile: TILES.amber,
    title: "Talk them through it",
    body: "Add line items, snap a few site photos, and record a 60-second voice note explaining the job — right from the van.",
  },
  {
    icon: ChatIcon,
    tile: TILES.pink,
    title: "Send one link",
    body: "One tap shares a magic link by WhatsApp or SMS. Your client opens it instantly. No app, no login, no PDF.",
  },
  {
    icon: CheckIcon,
    tile: TILES.grape,
    title: "Approved & paid",
    body: "They hit Approve, the price is locked with a timestamp, and the deposit lands — so you can book the job.",
  },
];

const FEATURES = [
  { icon: MicIcon, tile: TILES.amber, title: "Voice-note walkthroughs", body: "Clients trust a voice. Explain scope, options and why — in less time than typing it." },
  { icon: CameraIcon, tile: TILES.tangerine, title: "Visual proof both ways", body: "You attach site photos and video. Clients send back measurements, damage and access shots." },
  { icon: ChatIcon, tile: TILES.pink, title: "Two-way thread", body: "Questions, voice replies and change requests live with the quote — not lost in your texts." },
  { icon: LockIcon, tile: TILES.grape, title: "Locked, time-stamped approval", body: "Once approved, terms freeze with who, when and from which device. Fewer \"I never agreed to that\"." },
  { icon: CardIcon, tile: TILES.sky, title: "Deposits on approval", body: "Stripe card payments straight to your account, or your own payment link. Track who's paid at a glance." },
  { icon: PhoneIcon, tile: TILES.mint, title: "Lives on your home screen", body: "Install SayPay like an app on iPhone or Android. Built for one-thumb use on site." },
];

const TRADES = [
  "🔧 Plumbers",
  "⚡ Electricians",
  "🧱 Builders",
  "🧽 Cleaners",
  "🎨 Decorators",
  "🌿 Gardeners",
  "🔑 Locksmiths",
  "🛠️ Handypeople",
  "🔥 Heating engineers",
  "🪟 Window fitters",
  "🏠 Roofers",
  "🪚 Carpenters",
];

/** Animated sunset mesh used behind the hero and the closing CTA. */
function SunsetMesh({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute overflow-hidden", className)}>
      <div className="absolute inset-0 bg-sunset" />
      <div className="absolute -top-1/3 -left-1/4 size-[70%] animate-blob rounded-full bg-[#ffd15c] opacity-80 blur-3xl" />
      <div
        className="absolute top-1/4 right-[-15%] size-[65%] animate-blob rounded-full bg-[#7b5cff] opacity-80 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute -bottom-1/3 left-1/4 size-[60%] animate-blob rounded-full bg-[#ff4f9a] opacity-70 blur-3xl"
        style={{ animationDelay: "-12s" }}
      />
      <div
        className="absolute top-0 left-1/2 size-[40%] animate-blob rounded-full bg-[#1fb6ff] opacity-50 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#how" className="hidden min-h-11 items-center px-3 text-sm font-bold text-ink-soft transition hover:text-ink md:flex">
              How it works
            </a>
            <a href="#demo" className="hidden min-h-11 items-center px-3 text-sm font-bold text-ink-soft transition hover:text-ink sm:flex">
              Live demo
            </a>
            <a href="#pricing" className="hidden min-h-11 items-center px-3 text-sm font-bold text-ink-soft transition hover:text-ink sm:flex">
              Pricing
            </a>
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/login?mode=signup" size="sm">
              Start free <ArrowRightIcon width={16} height={16} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero + demo */}
      <section className="relative -mt-16 pt-16">
        {/* Slanted, animated sunset band. Faded out on the left so the headline stays crisp. */}
        <SunsetMesh className="inset-x-0 top-0 h-[100%] origin-top-left -skew-y-6 [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:h-[88%] lg:[mask-image:linear-gradient(100deg,transparent_28%,black_58%)]" />
        <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(to_bottom,rgb(255_255_255/0.55),rgb(255_255_255/0.85)_45%,white)] lg:hidden" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-24">
          <div className="min-w-0 animate-rise">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/80 py-1.5 pr-3.5 pl-1.5 text-xs font-bold text-ink-soft shadow-card backdrop-blur">
              <span className="shrink-0 rounded-full bg-sunset px-2 py-0.5 text-[11px] font-extrabold text-white">NEW</span>
              Quotes with a voice — for every trade
            </p>
            <h1 className="mt-6 text-[2.75rem] leading-[1] font-extrabold tracking-[-0.035em] text-balance sm:text-7xl">
              Quotes approved by&nbsp;voice.
              <span className="mt-1 block text-sunset">Deposits paid today.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Send a quote with a 60-second voice walkthrough and site photos. Your client listens, asks questions, and taps
              Approve &amp; Pay — from one link, no login. You get the job booked and the deposit secured.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" variant="hivis" size="lg">
                Send your first quote free <ArrowRightIcon className="transition group-hover/btn:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg" className="lg:hidden">
                Try the live demo ↓
              </ButtonLink>
            </div>
            <ul className="mt-8 grid gap-2.5 text-sm font-semibold text-ink-soft sm:grid-cols-2">
              {["No app for clients to install", "Works on any phone", "Price locked on approval", "Stripe-secured deposits"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-go-soft text-go">
                    <CheckIcon width={13} height={13} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div id="demo" className="min-w-0 scroll-mt-24 animate-rise [animation-delay:150ms]">
            <p className="mx-auto mb-3 w-fit rounded-full bg-white/85 px-3.5 py-1.5 text-center text-sm font-bold text-ink shadow-card backdrop-blur lg:mx-0">
              ▶ Live demo — play the voice note, reply, then approve
            </p>
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* Trades marquee */}
      <section aria-label="Built for every trade" className="relative border-y border-line bg-canvas py-5">
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          {[0, 1].map((dup) => (
            <ul
              key={dup}
              aria-hidden={dup === 1}
              className="flex shrink-0 animate-marquee items-center gap-3 pr-3 motion-reduce:animate-none"
            >
              {TRADES.map((t) => (
                <li key={t} className="rounded-full bg-surface px-4 py-2 text-sm font-bold whitespace-nowrap text-ink-soft shadow-card">
                  {t}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28">
        <p className="text-sm font-extrabold tracking-[0.12em] text-bubblegum uppercase">How it works</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          From site visit to booked job in <span className="text-sunset">one link.</span>
        </h2>
        <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
          <div aria-hidden className="absolute top-10 right-[16%] left-[16%] hidden h-0.5 bg-[linear-gradient(90deg,#ffb020,#ff4f9a,#7b5cff)] opacity-40 md:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-card bg-surface p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span className={cn("grid size-12 place-items-center rounded-2xl", s.tile)}>
                  <s.icon />
                </span>
                <span className="font-display text-sm font-extrabold text-muted">Step {i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="relative bg-canvas">
        <div aria-hidden className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="text-sm font-extrabold tracking-[0.12em] text-grape uppercase">Why SayPay</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Everything a PDF quote can&apos;t do.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-card bg-surface p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className={cn("grid size-12 place-items-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:-rotate-6", f.tile)}>
                  <f.icon />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark band: numbers + trust */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 22rem at 90% 0%, rgba(123,92,255,0.45), transparent 60%), radial-gradient(36rem 20rem at 0% 100%, rgba(255,79,154,0.35), transparent 60%), radial-gradient(30rem 18rem at 50% 50%, rgba(255,176,32,0.12), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              ["60s", "to record and send a quote"],
              ["1 tap", "for your client to approve"],
              ["0 apps", "for your client to download"],
            ].map(([n, l]) => (
              <div key={n}>
                <p className="bg-[linear-gradient(100deg,#ffd15c,#ff8a3d_40%,#ff7ab8_70%,#b5a1ff)] bg-clip-text font-display text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
                  {n}
                </p>
                <p className="mt-2 font-semibold text-white/70">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              [ShieldIcon, "Private by design", "Every client link is a 192-bit random token. Media is served via short-lived signed URLs."],
              [LockIcon, "Tamper-evident approvals", "Approved terms are frozen in a snapshot and protected at the database level."],
              [CardIcon, "Payments by Stripe", "Card details never touch SayPay. Deposits go straight to your connected account."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof ShieldIcon;
              return (
                <div key={t as string} className="rounded-card bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur ring-inset">
                  <I className="text-hivis" />
                  <p className="mt-4 font-display text-lg font-extrabold">{t as string}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">{b as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28">
        <p className="text-center text-sm font-extrabold tracking-[0.12em] text-tangerine uppercase">Pricing</p>
        <h2 className="mt-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
          Simple pricing. <span className="text-sunset">Pays for itself</span> on one job.
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          <div className="rounded-card bg-surface p-8 shadow-card">
            <h3 className="text-lg font-extrabold">Starter</h3>
            <p className="mt-3 font-display text-5xl font-extrabold tracking-tight">Free</p>
            <p className="mt-1 font-semibold text-muted">Your first 5 quotes</p>
            <ul className="mt-7 space-y-3 text-ink-soft">
              {["Voice-note quotes", "Client magic links", "Photos, video & messaging", "Approval audit trail"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-go-soft text-go">
                    <CheckIcon width={13} height={13} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="secondary" size="lg" className="mt-8 w-full">
              Start free
            </ButtonLink>
          </div>
          <div className="relative rounded-card shadow-lift ring-sunset">
            <div className="p-[calc(2rem-2px)]">
              <h3 className="flex items-center justify-between text-lg font-extrabold">
                Pro <span className="rounded-full bg-sunset px-3 py-1 font-sans text-xs font-extrabold text-white">Most popular</span>
              </h3>
              <p className="mt-3 font-display text-5xl font-extrabold tracking-tight">
                £19<span className="text-lg font-bold text-muted">/month</span>
              </p>
              <p className="mt-1 font-semibold text-muted">Unlimited quotes</p>
              <ul className="mt-7 space-y-3 text-ink-soft">
                {["Everything in Starter", "Unlimited quotes & storage", "Card deposits via Stripe", "Your logo & brand colour"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-sunset text-white">
                      <CheckIcon width={13} height={13} strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/login?mode=signup" variant="hivis" size="lg" className="mt-8 w-full">
                Go Pro <ArrowRightIcon className="transition group-hover/btn:translate-x-1" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20">
          <SunsetMesh className="inset-0" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white text-balance drop-shadow-[0_2px_12px_rgb(13_16_51/0.25)] sm:text-5xl">
              Your next quote could be approved by tonight.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg font-semibold text-white/90">
              Free for your first 5 quotes. No card needed. Set up in two minutes.
            </p>
            <ButtonLink href="/login?mode=signup" size="lg" className="mt-8">
              Send your first quote free <ArrowRightIcon className="transition group-hover/btn:translate-x-1" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="font-semibold">© {new Date().getFullYear()} SayPay · Made for the trades 🧡</p>
        </div>
      </footer>
    </div>
  );
}
