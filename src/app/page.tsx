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
  { icon: CardIcon, title: "Deposit or full payment", body: "Ask for a deposit or the whole amount. Clients pay by card or bank transfer the moment they accept." },
  { icon: CameraIcon, title: "Photos, both ways", body: "Attach site photos and video. Clients can send back measurements, damage and access shots." },
  { icon: ChatIcon, title: "One thread per job", body: "Questions, replies and change requests stay with the quote — not lost in your texts." },
  { icon: LockIcon, title: "Locked, time-stamped acceptance", body: "When a client accepts, the terms freeze with who, when and from which device." },
  { icon: PhoneIcon, title: "Made for your phone", body: "Quote from the van in a couple of minutes. Install SayPay on your home screen like an app." },
];

const WAVE = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4, 0.8, 0.55, 0.9, 0.5, 0.65, 0.4, 0.75, 0.5];

function Wave({ played = 9, count = 22 }: { played?: number; count?: number }) {
  return (
    <span className="flex h-7 flex-1 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`w-full max-w-1 flex-1 rounded-full ${i < played ? "bg-hivis" : "bg-[#3a3f3a]"}`}
          style={{ height: `${(WAVE[i % WAVE.length] ?? 0.5) * 100}%` }}
        />
      ))}
    </span>
  );
}

/** Lime tick in a circle. */
function Tick({ size = 22 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-hivis text-on-accent" style={{ width: size, height: size }}>
      <CheckIcon width={size * 0.55} height={size * 0.55} strokeWidth={3} />
    </span>
  );
}

/** Notification chip floating near the hero phone (wide screens only). */
function Chip({ className, title, sub }: { className: string; title: string; sub: string }) {
  return (
    <div className={`absolute z-10 hidden items-center gap-3 rounded-2xl bg-surface/95 py-3 pr-5 pl-3 shadow-chip backdrop-blur xl:flex ${className}`}>
      <Tick size={36} />
      <div className="leading-tight">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{sub}</p>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, accent, body, center = false }: { eyebrow: string; title: string; accent?: string; body?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-semibold text-hivis">{eyebrow}</p>
      <h2 className="mt-3 text-4xl leading-[1.02] font-bold sm:text-[3.5rem]">
        {title} {accent && <span className="text-muted">{accent}</span>}
      </h2>
      {body && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{body}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-canvas">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {[
              ["#why", "Why voice"],
              ["#how", "How it works"],
              ["#payments", "Payments"],
              ["#pricing", "Pricing"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hidden min-h-10 items-center px-3.5 text-[15px] text-ink-soft transition hover:text-ink md:flex">
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
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute top-24 right-[-10%] size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.16),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pt-12 pb-24 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:pb-32">
          <div className="min-w-0 animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-surface py-1.5 pr-4 pl-1.5 text-sm text-ink-soft ring-1 ring-line ring-inset">
              <span className="rounded-full bg-hivis px-2 py-0.5 text-xs font-semibold text-on-accent">New</span>
              Card and bank transfer payments
            </p>
            <h1 className="mt-7 text-[3.1rem] leading-[0.98] font-bold tracking-[-0.05em] text-balance sm:text-[4.75rem]">
              Quotes with your voice. <span className="text-hivis">Paid on the spot.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              Add a voice note to every quote. Clients understand the job, accept in one tap, and pay a deposit or in full — by card or bank
              transfer.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" size="lg">
                Start free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="#demo" variant="secondary" size="lg">
                <PlayIcon width={15} height={15} /> Try the live demo
              </ButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {["Free for 5 quotes", "No app for clients", "Payments by Stripe"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon width={15} height={15} strokeWidth={2.75} className="text-hivis" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div id="demo" className="relative min-w-0 scroll-mt-24 animate-rise [animation-delay:120ms]">
            <Chip className="top-[11%] -right-28 animate-pop [animation-delay:600ms]" title="Priya played your voice note" sub="0:34 · 2 min ago" />
            <Chip className="-bottom-14 -right-20 animate-pop [animation-delay:900ms]" title="Deposit paid · £212.40" sub="By card · just now" />
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* Why voice */}
      <section id="why" className="scroll-mt-20 border-t border-line/60">
        <div className="mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHead
              eyebrow="Why voice"
              title="A PDF can't explain itself."
              accent="You can."
              body="Quotes get lost when the client doesn't understand the price, or never gets round to replying. A voice note fixes both: they hear what's included, why it costs what it does, and who'll be doing the work."
            />
            <ul className="mt-9 space-y-4">
              {[
                ["Builds trust", "Clients hear a real person, not a spreadsheet."],
                ["Answers questions up front", "Scope, options and timings, in your own words."],
                ["Gets a decision", "Accept and pay — deposit or in full — in the same tap."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <Tick />
                  <p className="text-ink-soft">
                    <span className="font-semibold text-ink">{t}.</span> {b}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div className="rounded-3xl bg-surface/60 p-5 ring-1 ring-line ring-inset sm:mb-12">
              <p className="text-xs font-medium tracking-[0.06em] text-muted uppercase">A typical quote</p>
              <div className="mt-4 rounded-2xl bg-raised p-4">
                <p className="text-sm font-medium text-ink-soft">Quote_0142_final.pdf</p>
                <div className="mt-3 space-y-2">
                  {[100, 85, 92, 60, 78].map((w, i) => (
                    <span key={i} className="block h-2 rounded-full bg-[#2c3136]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                <span className="size-2 rounded-full bg-muted/60" /> Opened · no reply yet
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-5 shadow-lift">
              <p className="text-xs font-medium tracking-[0.06em] text-hivis uppercase">With SayPay</p>
              <div className="mt-4 rounded-2xl bg-night p-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hivis text-on-accent">
                    <PlayIcon width={15} height={15} />
                  </span>
                  <Wave />
                </div>
                <p className="mt-2.5 px-1 text-xs text-muted">Voice note from Dan · 0:34</p>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <CheckIcon width={16} height={16} strokeWidth={3} className="text-hivis" /> Accepted by Priya
                </p>
                <p className="flex items-center gap-2 font-semibold">
                  <CardIcon width={16} height={16} className="text-hivis" /> £212.40 deposit paid
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-line/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <SectionHead eyebrow="How it works" title="Site visit to paid," accent="in three steps." />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Build the quote, add your voice",
                b: "Add line items and site photos, then record a short voice note explaining the job.",
                art: (
                  <div className="w-full max-w-[15rem] rounded-2xl bg-surface p-4 ring-1 ring-line ring-inset">
                    <p className="flex items-center gap-2 text-xs font-semibold text-stop">
                      <span className="size-2 animate-pulse rounded-full bg-stop" /> Recording · 0:42
                    </p>
                    <div className="mt-3">
                      <Wave played={22} />
                    </div>
                    <div className="mt-4 flex justify-center">
                      <span className="grid size-11 place-items-center rounded-full bg-stop">
                        <span className="size-3.5 rounded-sm bg-night" />
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                n: "02",
                t: "Send one link",
                b: "Share by WhatsApp or text. Your client opens it straight away — no app, no login, no PDF.",
                art: (
                  <div className="w-full max-w-[15rem]">
                    <div className="ml-auto w-[90%] rounded-2xl rounded-br-md bg-[#144d37] p-3 text-[13px] leading-snug text-[#e9f7ef]">
                      Hi Priya, here&apos;s your quote with a quick voice note from me:
                      <span className="mt-1.5 block font-semibold text-[#8fd3ff] underline">saypay.co/q/x8Kf…</span>
                    </div>
                    <p className="mt-2 pr-1 text-right text-[11px] text-muted">Sent on WhatsApp</p>
                  </div>
                ),
              },
              {
                n: "03",
                t: "Accepted and paid",
                b: "They accept in one tap and pay a deposit or in full, by card or bank transfer. The price locks in.",
                art: (
                  <div className="w-full max-w-[15rem] rounded-2xl bg-surface p-4 ring-1 ring-line ring-inset">
                    <div className="flex items-center gap-3">
                      <Tick size={38} />
                      <div>
                        <p className="text-sm font-semibold">Deposit paid</p>
                        <p className="text-xs text-muted">Priya Shah · just now</p>
                      </div>
                    </div>
                    <p className="tabular mt-3 font-display text-3xl font-bold tracking-[-0.04em]">£212.40</p>
                    <p className="mt-1 text-xs text-hivis">Quote accepted · terms locked</p>
                  </div>
                ),
              },
            ].map((s) => (
              <div key={s.n} className="flex flex-col rounded-card bg-surface ring-1 ring-line ring-inset">
                <div className="m-2 grid h-52 place-items-center rounded-[1rem] bg-night p-6">{s.art}</div>
                <div className="p-6 pt-4">
                  <p className="tabular text-sm font-semibold text-hivis">{s.n}</p>
                  <h3 className="mt-2 text-2xl font-bold">{s.t}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{s.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payments */}
      <section id="payments" className="scroll-mt-20 border-t border-line/60">
        <div className="mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <SectionHead
              eyebrow="Payments"
              title="Get paid your way."
              body="For every quote, choose what you need upfront — and let clients pay however suits them. No chasing, no awkward phone calls."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ["How much", [["A deposit", "25%, 50% or any amount you set"], ["Pay in full", "The whole quote, paid on acceptance"]]],
                ["How they pay", [["Card", "Secure checkout by Stripe, straight to your account"], ["Bank transfer", "Your details and a job reference, shown after they accept"]]],
              ].map(([head, items]) => (
                <div key={head as string} className="rounded-3xl bg-surface p-6 ring-1 ring-line ring-inset">
                  <p className="text-sm font-semibold text-hivis">{head as string}</p>
                  <ul className="mt-4 space-y-4">
                    {(items as string[][]).map(([t, b]) => (
                      <li key={t} className="flex gap-3">
                        <Tick />
                        <p>
                          <span className="block font-semibold">{t}</span>
                          <span className="text-sm text-ink-soft">{b}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute inset-0 -z-0 scale-125 rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.12),transparent)]" />
            <div className="relative rounded-[1.75rem] bg-surface p-6 shadow-lift">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Harper &amp; Sons · Quote #0142</p>
                <span className="rounded-full bg-go-soft px-2.5 py-1 text-xs font-semibold text-go-ink">Accepted</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold tracking-[-0.03em]">Combi boiler replacement</p>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-hivis-soft px-4 py-3 font-semibold text-hivis-ink">
                <span>Pay in full</span>
                <span className="tabular">£2,724.00</span>
              </div>
              <div className="mt-4 space-y-2.5">
                <span className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-hivis font-semibold text-on-accent">
                  <CardIcon width={18} height={18} /> Pay £2,724.00 by card
                </span>
                <span className="flex min-h-13 items-center justify-center rounded-full font-semibold ring-1 ring-[#2f343a] ring-inset">
                  Pay by bank transfer
                </span>
              </div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
                <LockIcon width={13} height={13} /> Card payments secured by Stripe
              </p>
            </div>
            <div className="relative -mt-5 ml-auto w-[88%] rounded-3xl bg-raised p-5 shadow-lift sm:-mr-8">
              <p className="text-sm font-semibold text-hivis">Bank transfer details</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {[
                  ["Account name", "Harper & Sons Ltd"],
                  ["Reference", "SP-2F449C"],
                  ["Sort code", "12-34-56"],
                  ["Account no.", "12345678"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="tabular font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <SectionHead eyebrow="Features" title="Everything you need" accent="to close the job." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-card bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-canvas p-8 transition hover:bg-surface">
                <span className="grid size-11 place-items-center rounded-xl bg-hivis-soft text-hivis transition group-hover:bg-hivis group-hover:text-on-accent">
                  <f.icon width={20} height={20} />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-line/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <SectionHead
            eyebrow="Security"
            title="Safe for your clients."
            accent="Solid for you."
            body="Every quote link is private, every acceptance is recorded, and card payments are handled by Stripe."
          />
          <div className="grid gap-4">
            {[
              [ShieldIcon, "Private links", "Every client link is a long random code that can't be guessed. Photos and voice notes use short-lived secure links."],
              [LockIcon, "A record that stands up", "When a quote is accepted, the price and scope are locked with who accepted it, when, and from which device."],
              [CardIcon, "Payments by Stripe", "Card details never touch SayPay. Payments go straight to your own connected account."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof ShieldIcon;
              return (
                <div key={t as string} className="flex gap-4 rounded-3xl bg-surface p-6 ring-1 ring-line ring-inset">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-hivis-soft text-hivis">
                    <I width={20} height={20} />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold tracking-[-0.02em]">{t as string}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{b as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-line/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <SectionHead center eyebrow="Pricing" title="Simple pricing." body="One accepted quote pays for months of SayPay." />
          <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2">
            {[
              {
                name: "Starter",
                price: "Free",
                per: "",
                note: "Your first 5 quotes",
                items: ["Voice notes on quotes", "Private client links", "Deposit or full payment", "Card and bank transfer", "Photos, video and messaging"],
                featured: false,
              },
              {
                name: "Pro",
                price: "£19",
                per: "/month",
                note: "Unlimited quotes",
                items: ["Everything in Starter", "Unlimited quotes", "Cancel any time"],
                featured: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-card p-8 sm:p-10 ${plan.featured ? "bg-surface shadow-lift ring-1 ring-hivis/60 ring-inset" : "bg-surface ring-1 ring-line ring-inset"}`}
              >
                {plan.featured && (
                  <span className="absolute top-8 right-8 rounded-full bg-hivis px-3 py-1 text-xs font-semibold text-on-accent sm:top-10 sm:right-10">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-4 font-display text-6xl font-bold tracking-[-0.05em]">
                  {plan.price}
                  <span className="ml-1 font-sans text-base font-normal tracking-normal text-muted">{plan.per}</span>
                </p>
                <p className="mt-2 text-muted">{plan.note}</p>
                <ul className="mt-8 flex-1 space-y-3.5 border-t border-line pt-8 text-ink-soft">
                  {plan.items.map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <CheckIcon width={16} height={16} strokeWidth={2.75} className="shrink-0 text-hivis" /> {t}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/login?mode=signup" variant={plan.featured ? "primary" : "secondary"} size="lg" className="mt-10 w-full">
                  {plan.featured ? "Go Pro" : "Start free"}
                </ButtonLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-surface px-6 py-20 text-center ring-1 ring-line ring-inset sm:px-12 sm:py-24">
          <div aria-hidden className="absolute -bottom-48 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.22),transparent)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl leading-[1.02] font-bold text-balance sm:text-6xl">
              Your next quote could be <span className="text-hivis">paid tonight.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink-soft">Free for your first 5 quotes. No card needed. Set up in two minutes.</p>
            <ButtonLink href="/login?mode=signup" size="lg" className="mt-10">
              Start free <ArrowRightIcon width={18} height={18} className="transition group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <div className="flex flex-wrap items-center gap-6">
            <a href="#why" className="transition hover:text-ink">Why voice</a>
            <a href="#payments" className="transition hover:text-ink">Payments</a>
            <a href="#pricing" className="transition hover:text-ink">Pricing</a>
            <Link href="/login" className="transition hover:text-ink">Log in</Link>
          </div>
          <p>© {new Date().getFullYear()} SayPay</p>
        </div>
      </footer>
    </div>
  );
}
