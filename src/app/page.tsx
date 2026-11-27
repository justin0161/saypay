import Link from "next/link";
import { LiveDemo } from "@/components/demo/live-demo";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CardIcon, CheckIcon, LinkIcon, LockIcon, Logo, MicIcon } from "@/components/ui/icons";

const STEPS = [
  { icon: MicIcon, title: "Say your quote", body: "Tap the mic and describe the job and prices. SayPay fills in the quote and adds your voice note." },
  { icon: LinkIcon, title: "Send one link", body: "Share it by WhatsApp, text or email. Your client opens it straight away — no app, no login." },
  { icon: CardIcon, title: "Get paid", body: "They accept in one tap and pay a deposit or in full, by card or bank transfer." },
];

function Tick() {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-hivis-soft text-hivis">
      <CheckIcon width={12} height={12} strokeWidth={3} />
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="SayPay home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            <a href="#how" className="hidden min-h-10 items-center px-3 text-[15px] text-ink-soft hover:text-ink md:flex">
              How it works
            </a>
            <a href="#pricing" className="hidden min-h-10 items-center px-3 text-[15px] text-ink-soft hover:text-ink md:flex">
              Pricing
            </a>
            <ButtonLink href="/login" variant="ghost" size="sm" className="ml-1">
              Log in
            </ButtonLink>
            <ButtonLink href="/login?mode=signup" size="sm" className="ml-1">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[linear-gradient(180deg,#ffffff,#f4f7ff)]">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-28">
          <div className="min-w-0">
            <h1 className="text-[2.75rem] leading-[1.06] font-bold tracking-[-0.03em] text-balance sm:text-[4rem]">
              Win more jobs with <span className="text-hivis">voice&nbsp;quotes.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft sm:text-xl">
              Send a quote with a voice note. Clients accept in one tap and pay a deposit or in full — by card or bank transfer.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login?mode=signup" size="lg">
                Get started free <ArrowRightIcon width={18} height={18} />
              </ButtonLink>
              <ButtonLink href="#how" variant="secondary" size="lg">
                See how it works
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {["Free for your first 5 quotes", "No app for clients", "Card payments by Stripe"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Tick /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div id="demo" className="min-w-0 scroll-mt-24">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <h2 className="max-w-xl text-3xl font-bold sm:text-[2.75rem] sm:leading-[1.1]">Quote, send, get paid.</h2>
          <p className="mt-3 max-w-xl text-lg text-ink-soft">Three steps, all from your phone.</p>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="grid size-12 place-items-center rounded-2xl bg-hivis-soft text-hivis">
                  <s.icon width={22} height={22} />
                </span>
                <p className="mt-5 text-sm font-semibold text-hivis">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Payments */}
      <section className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-[2.75rem] sm:leading-[1.1]">Get paid your way.</h2>
            <p className="mt-3 max-w-md text-lg text-ink-soft">
              Choose a deposit or the full amount on each quote, and let clients pay however suits them.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                ["Card", "Secure checkout by Stripe. Money goes straight to your bank."],
                ["Bank transfer", "Your details and a job reference, shown after they accept."],
                ["Deposit or pay in full", "25%, 50%, any amount — or the whole quote."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <Tick />
                  <p>
                    <span className="font-semibold">{t}.</span> <span className="text-ink-soft">{b}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* What the client sees */}
          <div className="mx-auto w-full max-w-sm rounded-3xl bg-surface p-6 shadow-lift ring-1 ring-line ring-inset">
            <p className="text-sm text-muted">Quote from Harper &amp; Sons</p>
            <p className="mt-1 text-xl font-bold tracking-[-0.02em]">Combi boiler replacement</p>
            <div className="mt-5 space-y-2.5 border-y border-line py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Total</span>
                <span className="tabular font-semibold">£2,724.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Deposit to book (25%)</span>
                <span className="tabular font-semibold">£681.00</span>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              <span className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-hivis font-semibold text-white">
                <CardIcon width={18} height={18} /> Pay £681.00 by card
              </span>
              <span className="flex min-h-12 items-center justify-center rounded-full font-semibold ring-1 ring-[#d5dcea] ring-inset">
                Pay by bank transfer
              </span>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <LockIcon width={13} height={13} /> Secured by Stripe
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-[2.75rem] sm:leading-[1.1]">Simple pricing.</h2>
            <p className="mt-3 text-lg text-ink-soft">Start free. Upgrade when you need more.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
            {[
              { name: "Starter", price: "Free", per: "", note: "Your first 5 quotes", items: ["Voice quotes", "Card and bank transfer", "Deposit or full payment"], cta: "Get started", featured: false },
              { name: "Pro", price: "£19", per: "/month", note: "Unlimited quotes", items: ["Everything in Starter", "Unlimited quotes", "Cancel any time"], cta: "Go Pro", featured: true },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl bg-surface p-8 ring-inset ${plan.featured ? "shadow-lift ring-2 ring-hivis" : "ring-1 ring-line"}`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 text-5xl font-bold tracking-[-0.04em]">
                  {plan.price}
                  <span className="ml-1 text-base font-normal tracking-normal text-muted">{plan.per}</span>
                </p>
                <p className="mt-1 text-muted">{plan.note}</p>
                <ul className="mt-6 flex-1 space-y-3 text-ink-soft">
                  {plan.items.map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <Tick /> {t}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/login?mode=signup" variant={plan.featured ? "primary" : "secondary"} size="lg" className="mt-8 w-full">
                  {plan.cta}
                </ButtonLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-hivis px-6 py-16 text-center text-white sm:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-5xl sm:leading-[1.08]">Send your first quote today.</h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-white/80">Free for your first 5 quotes. No card needed.</p>
          <ButtonLink href="/login?mode=signup" variant="inverse" size="lg" className="mt-8">
            Get started free <ArrowRightIcon width={18} height={18} />
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <div className="flex gap-6">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <Link href="/login" className="hover:text-ink">Log in</Link>
          </div>
          <p>© {new Date().getFullYear()} SayPay</p>
        </div>
      </footer>
    </div>
  );
}
