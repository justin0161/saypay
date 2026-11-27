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
  PlayIcon,
  ShieldIcon,
} from "@/components/ui/icons";

const FEATURES = [
  { icon: MicIcon, title: "Voice notes on every quote", body: "Record up to 60 seconds explaining the job, the options and why. Clients listen in one tap." },
  { icon: CameraIcon, title: "Photos, both ways", body: "Attach site photos and video. Clients can send back measurements, damage and access shots." },
  { icon: ChatIcon, title: "One thread per job", body: "Questions, replies and change requests stay with the quote — not lost in your texts." },
  { icon: LockIcon, title: "Locked, time-stamped acceptance", body: "When a client accepts, the terms freeze with who, when and from which device." },
  { icon: CardIcon, title: "Deposits on acceptance", body: "Clients pay the deposit by card the moment they accept, straight to your account via Stripe." },
  { icon: PhoneIcon, title: "Made for your phone", body: "Quote from the van in a couple of minutes. Install SayPay on your home screen like an app." },
];

const WAVE = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8, 0.55, 0.9, 0.5, 0.65, 0.4, 0.75, 0.5];

/** Small waveform used in illustrations. */
function Wave({ className = "bg-hivis", count = 22, played = 9 }: { className?: string; count?: number; played?: number }) {
  return (
    <span className="flex h-7 flex-1 items-center gap-[3px]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`w-full max-w-1 flex-1 rounded-full ${i < played ? className : "bg-current opacity-25"}`}
          style={{ height: `${(WAVE[i % WAVE.length] ?? 0.5) * 100}%` }}
        />
      ))}
    </span>
  );
}

/** Notification chip floating around the hero phone (wide screens only). */
function Chip({ className, icon, title, sub }: { className: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className={`absolute z-10 hidden items-center gap-3 rounded-2xl bg-surface py-3 pr-5 pl-3 shadow-chip xl:flex ${className}`}>
      {icon}
      <div className="leading-tight">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{sub}</p>
      </div>
    </div>
  );
}

function StepCard({ n, title, body, children }: { n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-card bg-surface p-3 shadow-card">
      <div className="grid h-52 place-items-center rounded-[1.1rem] bg-cream p-6">{children}</div>
      <div className="p-5">
        <p className="text-sm font-semibold text-gold">Step {n}</p>
        <h3 className="mt-1.5 text-2xl font-bold">{title}</h3>
        <p className="mt-2 leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-canvas">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {[
              ["#why", "Why voice"],
              ["#how", "How it works"],
              ["#pricing", "Pricing"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hidden min-h-10 items-center px-3.5 text-[15px] font-medium text-ink-soft transition hover:text-ink md:flex">
                {label}
              </a>
            ))}
            <ButtonLink href="/login" variant="ghost" size="sm" className="ml-1">
              Log in
            </ButtonLink>
            <ButtonLink href="/login?mode=signup" size="sm" className="ml-1">
              Start free
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-14 px-4 pt-10 pb-20 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:pb-28">
        <div className="min-w-0 animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-hivis-soft py-1.5 pr-4 pl-1.5 text-sm font-semibold text-hivis-ink">
            <span className="grid size-6 place-items-center rounded-full bg-hivis text-ink">
              <MicIcon width={13} height={13} strokeWidth={2.5} />
            </span>
            Quoting software for trades
          </p>
          <h1 className="mt-6 text-[3rem] leading-[0.98] font-bold tracking-[-0.045em] text-balance sm:text-[4.5rem]">
            Win more quotes with a{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">voice note.</span>
              <span aria-hidden className="absolute inset-x-[-0.1em] bottom-[0.06em] z-0 h-[0.32em] rounded-full bg-hivis" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            Add a quick voice note to your quote and explain the job like you would on the doorstep. Clients understand it, trust it, accept it
            — and pay the deposit there and then.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/login?mode=signup" size="lg">
              Send your first quote free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="#demo" variant="secondary" size="lg">
              <PlayIcon width={16} height={16} /> Try the live demo
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted">Free for your first 5 quotes · No card needed · Works on any phone</p>
        </div>

        <div id="demo" className="relative min-w-0 scroll-mt-24 animate-rise [animation-delay:120ms]">
          {/* Solid brand shape behind the phone */}
          <div aria-hidden className="absolute top-[54%] left-1/2 size-[22rem] -translate-1/2 rounded-full bg-hivis sm:size-[34rem]" />
          <Chip
            className="top-[9%] -right-32 animate-pop [animation-delay:500ms]"
            icon={<span className="grid size-10 place-items-center rounded-full bg-[#eaf1fb] font-display text-sm font-bold text-[#1d4a80]">P</span>}
            title="Priya played your voice note"
            sub="0:34 · 2 min ago"
          />
          <Chip
            className="bottom-4 -left-32 animate-pop [animation-delay:800ms]"
            icon={
              <span className="grid size-10 place-items-center rounded-full bg-go-soft text-go">
                <CheckIcon width={18} height={18} strokeWidth={3} />
              </span>
            }
            title="Quote accepted"
            sub="Radiator & flush · £849.60"
          />
          <Chip
            className="-bottom-2 -right-28 animate-pop [animation-delay:1100ms]"
            icon={
              <span className="grid size-10 place-items-center rounded-full bg-hivis text-ink">
                <CardIcon width={18} height={18} />
              </span>
            }
            title="Deposit paid · £212.40"
            sub="Booked in for Tuesday"
          />
          <div className="relative">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* Why voice */}
      <section id="why" className="scroll-mt-20 px-3 sm:px-4">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-hivis px-5 py-20 sm:px-10 sm:py-24 lg:px-16">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-4xl leading-[1.02] font-bold sm:text-[3.5rem]">A PDF can&apos;t explain itself. You can.</h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/80">
                Quotes get lost when the client doesn&apos;t understand the price, or never gets round to replying. A voice note fixes both: they
                hear what&apos;s included, why it costs what it does, and who&apos;ll be doing the work.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ["Builds trust", "Clients hear a real person, not a spreadsheet."],
                  ["Answers questions up front", "Scope, options and timings, in your own words."],
                  ["Gets a decision", "Accept and pay the deposit in the same tap."],
                ].map(([t, b]) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ink text-hivis">
                      <CheckIcon width={13} height={13} strokeWidth={3} />
                    </span>
                    <p className="text-ink/80">
                      <span className="font-semibold text-ink">{t}.</span> {b}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Before / after */}
            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <div className="rounded-3xl bg-white/55 p-5 ring-1 ring-ink/10 sm:mb-10">
                <p className="text-xs font-semibold tracking-[0.04em] text-ink/55 uppercase">A typical quote</p>
                <div className="mt-4 rounded-2xl bg-white/80 p-4">
                  <p className="text-sm font-semibold text-ink/70">Quote_0142_final.pdf</p>
                  <div className="mt-3 space-y-2">
                    {[100, 85, 92, 60, 78].map((w, i) => (
                      <span key={i} className="block h-2 rounded-full bg-ink/10" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm font-medium text-ink/55">
                  <span className="size-2 rounded-full bg-ink/30" /> Opened · no reply yet
                </p>
              </div>
              <div className="rounded-3xl bg-surface p-5 shadow-lift">
                <p className="text-xs font-semibold tracking-[0.04em] text-gold uppercase">With SayPay</p>
                <div className="mt-4 rounded-2xl bg-ink p-3 text-white">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hivis text-ink">
                      <PlayIcon width={15} height={15} />
                    </span>
                    <Wave />
                  </div>
                  <p className="mt-2.5 px-1 text-xs text-white/60">Voice note from Dan · 0:34</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2 font-semibold text-go-ink">
                    <CheckIcon width={16} height={16} strokeWidth={3} className="text-go" /> Accepted by Priya
                  </p>
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    <CardIcon width={16} height={16} className="text-gold" /> £212.40 deposit paid
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="text-4xl leading-[1.02] font-bold sm:text-[3.5rem]">From site visit to deposit paid, in three steps.</h2>
          <p className="mt-5 text-lg text-ink-soft">No PDFs and no chasing. It takes about as long as making a brew.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <StepCard n={1} title="Build the quote, add your voice" body="Add a few line items and site photos, then record a short voice note explaining the job.">
            <div className="w-full max-w-[15rem] rounded-2xl bg-surface p-4 shadow-card">
              <p className="flex items-center gap-2 text-xs font-semibold text-stop">
                <span className="size-2 animate-pulse rounded-full bg-stop" /> Recording · 0:42
              </p>
              <div className="mt-3 text-ink">
                <Wave className="bg-ink" played={22} />
              </div>
              <div className="mt-4 flex justify-center">
                <span className="grid size-11 place-items-center rounded-full bg-stop">
                  <span className="size-3.5 rounded-sm bg-white" />
                </span>
              </div>
            </div>
          </StepCard>
          <StepCard n={2} title="Send one link" body="Share by WhatsApp or text. Your client opens it straight away — no app, no login, no PDF.">
            <div className="w-full max-w-[15rem] space-y-2">
              <div className="ml-auto w-[90%] rounded-2xl rounded-br-md bg-[#d9fdd3] p-3 text-[13px] leading-snug text-ink shadow-card">
                Hi Priya, here&apos;s your quote with a quick voice note from me:
                <span className="mt-1.5 block font-semibold text-[#1d4a80] underline">saypay.co/q/x8Kf…</span>
              </div>
              <p className="pr-1 text-right text-[11px] text-muted">Sent on WhatsApp</p>
            </div>
          </StepCard>
          <StepCard n={3} title="Accepted and paid" body="They accept in one tap and pay the deposit by card. The price locks and you book the job in.">
            <div className="w-full max-w-[15rem] rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-go text-white">
                  <CheckIcon width={18} height={18} strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Deposit paid</p>
                  <p className="text-xs text-muted">Priya Shah · just now</p>
                </div>
              </div>
              <p className="tabular mt-3 font-display text-3xl font-bold tracking-[-0.03em]">£212.40</p>
              <p className="mt-1 text-xs font-medium text-go-ink">Quote accepted · terms locked</p>
            </div>
          </StepCard>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 className="max-w-xl text-4xl leading-[1.02] font-bold sm:text-[3.5rem]">Everything you need to close the job.</h2>
          <p className="max-w-md text-lg text-ink-soft">Built for the way you actually work — on site, on your phone, between jobs.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-card bg-surface p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="grid size-12 place-items-center rounded-2xl bg-hivis-soft text-gold">
                <f.icon width={22} height={22} />
              </span>
              <h3 className="mt-6 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="px-3 sm:px-4">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-ink px-5 py-20 text-white sm:px-10 sm:py-24 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div>
              <h2 className="text-4xl leading-[1.02] font-bold sm:text-[3.5rem]">
                Safe for your clients. <span className="text-hivis">Solid for you.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg text-white/65">Every quote link is private, every acceptance is recorded, and payments are handled by Stripe.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [ShieldIcon, "Private links", "Every client link is a long random code that can't be guessed. Photos and voice notes use short-lived secure links."],
                [LockIcon, "A record that stands up", "When a quote is accepted, the price and scope are locked with who accepted it, when, and from which device."],
                [CardIcon, "Payments by Stripe", "Card details never touch SayPay. Deposits go straight to your own connected account."],
              ].map(([Icon, t, b]) => {
                const I = Icon as typeof ShieldIcon;
                return (
                  <div key={t as string} className="flex flex-col gap-4 rounded-3xl bg-white/[0.06] p-6 lg:flex-row">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-hivis text-ink">
                      <I width={20} height={20} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold">{t as string}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/60">{b as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
        <div className="text-center">
          <h2 className="text-4xl leading-[1.02] font-bold sm:text-[3.5rem]">Simple pricing.</h2>
          <p className="mt-4 text-lg text-ink-soft">One accepted quote pays for months of SayPay.</p>
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-card bg-surface p-8 shadow-card sm:p-10">
            <h3 className="text-xl font-bold">Starter</h3>
            <p className="mt-4 font-display text-6xl font-bold tracking-[-0.04em]">Free</p>
            <p className="mt-2 text-muted">Your first 5 quotes</p>
            <ul className="mt-8 flex-1 space-y-3.5 text-ink-soft">
              {["Voice notes on quotes", "Private client links", "Photos, video and messaging", "Acceptance record"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-go-soft text-go">
                    <CheckIcon width={12} height={12} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="secondary" size="lg" className="mt-10 w-full">
              Start free
            </ButtonLink>
          </div>
          <div className="relative flex flex-col rounded-card bg-ink p-8 text-white shadow-lift sm:p-10">
            <span className="absolute top-8 right-8 rounded-full bg-hivis px-3 py-1 text-xs font-semibold text-ink sm:top-10 sm:right-10">Most popular</span>
            <h3 className="text-xl font-bold">Pro</h3>
            <p className="mt-4 font-display text-6xl font-bold tracking-[-0.04em]">
              £19<span className="ml-1 font-sans text-lg font-medium tracking-normal text-white/55">/month</span>
            </p>
            <p className="mt-2 text-white/60">Unlimited quotes</p>
            <ul className="mt-8 flex-1 space-y-3.5 text-white/80">
              {["Everything in Starter", "Unlimited quotes and storage", "Card deposits via Stripe", "Your logo and brand colour"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-hivis text-ink">
                    <CheckIcon width={12} height={12} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login?mode=signup" variant="hivis" size="lg" className="mt-10 w-full">
              Go Pro <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-3 pb-6 sm:px-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-hivis px-6 py-20 text-center sm:px-12 sm:py-24">
          <div aria-hidden className="absolute -bottom-24 -left-24 size-72 rounded-full bg-[#ffc757]" />
          <div aria-hidden className="absolute -top-28 -right-16 size-80 rounded-full bg-[#ffa90f]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl leading-[1.02] font-bold text-balance sm:text-6xl">Your next quote could be accepted tonight.</h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink/75">Free for your first 5 quotes. No card needed. Set up in two minutes.</p>
            <ButtonLink href="/login?mode=signup" size="lg" className="mt-10">
              Send your first quote free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a href="#why" className="transition hover:text-ink">
              Why voice
            </a>
            <a href="#how" className="transition hover:text-ink">
              How it works
            </a>
            <a href="#pricing" className="transition hover:text-ink">
              Pricing
            </a>
            <Link href="/login" className="transition hover:text-ink">
              Log in
            </Link>
          </div>
          <p>© {new Date().getFullYear()} SayPay</p>
        </div>
      </footer>
    </div>
  );
}
