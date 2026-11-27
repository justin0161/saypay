import type { Metadata } from "next";
import { openBillingPortal, openStripeDashboard, startConnectOnboarding, startSubscriptionCheckout } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { CheckIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { requireWorkspace } from "@/lib/auth";
import { freeQuoteLimit, isBillingConfigured } from "@/lib/env";
import { getPaymentSetup } from "@/lib/payments";
import { signPaths } from "@/lib/quotes";
import { isSubscriptionActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { LogoUploader } from "./logo-uploader";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Settings" };

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
        done ? "bg-go text-white" : "bg-raised text-ink ring-1 ring-line ring-inset",
      )}
    >
      {done ? <CheckIcon width={16} height={16} strokeWidth={3} /> : n}
    </span>
  );
}

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const sp = await searchParams;
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const billingOn = isBillingConfigured();
  const active = isSubscriptionActive(workspace.subscription_status);
  const [pay, logoUrls] = await Promise.all([
    getPaymentSetup(workspace),
    workspace.logo_path ? signPaths(supabase, [workspace.logo_path]) : Promise.resolve(new Map<string, string>()),
  ]);
  const logoUrl = workspace.logo_path ? (logoUrls.get(workspace.logo_path) ?? null) : null;
  const stripe = pay.stripe;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Settings</h1>

      {sp.billing === "success" && (
        <p className="rounded-2xl bg-go-soft p-4 font-semibold text-go-ink ring-1 ring-go/30 ring-inset">
          You&apos;re on SayPay Pro. Thanks! It can take a few seconds to show below.
        </p>
      )}
      {sp.connect === "done" && (
        <p className="rounded-2xl bg-go-soft p-4 font-semibold text-go-ink ring-1 ring-go/30 ring-inset">
          {stripe === "active"
            ? "Stripe is connected — you can take card payments now."
            : "Stripe details saved. Card payments switch on as soon as Stripe has checked your details — usually within minutes."}
        </p>
      )}
      {sp.connect === "retry" && (
        <p className="rounded-2xl bg-hivis-soft p-4 font-semibold text-hivis-ink ring-1 ring-hivis/30 ring-inset">
          That Stripe link expired. Tap &ldquo;Continue Stripe setup&rdquo; below to carry on where you left off.
        </p>
      )}

      {/* Get paid */}
      <Card id="get-paid" className="scroll-mt-24 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Get paid</h2>
          <p className="mt-1 text-ink-soft">Set up how clients pay you. Each quote then lets you choose card, bank transfer, or both.</p>
        </div>

        {/* Step 1: bank transfer */}
        <div className="flex gap-4">
          <StepBadge n={1} done={pay.bank} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Bank transfer</p>
            {pay.bank ? (
              <p className="mt-1 text-sm text-ink-soft">
                Set up. When a client accepts, they see your account details and a reference for the job. When the money arrives, open
                the quote and tap <span className="font-semibold text-ink">Mark payment received</span>.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-ink-soft">
                  Add the account name, sort code and account number clients should pay into. They only see these after accepting a quote.
                </p>
                <a href="#bank" className="mt-3 inline-flex min-h-10 items-center rounded-full bg-hivis px-4 text-sm font-semibold text-on-accent">
                  Add bank details
                </a>
              </>
            )}
          </div>
        </div>

        {/* Step 2: card payments with Stripe */}
        <div className="flex gap-4 border-t border-line pt-6">
          <StepBadge n={2} done={stripe === "active"} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">Card payments with Stripe</p>
              {stripe === "active" && <Pill tone="success">Live</Pill>}
              {stripe === "pending" && <Pill tone="warning">Finish setup</Pill>}
            </div>

            {stripe === "unavailable" && (
              <p className="mt-1 text-sm text-ink-soft">
                Card payments aren&apos;t switched on for SayPay yet. You can take bank transfers in the meantime.
              </p>
            )}

            {stripe === "none" && (
              <>
                <p className="mt-1 text-sm text-ink-soft">
                  Clients pay by card when they accept, and the money goes straight to your own bank account. Stripe is the payment company
                  behind it — it&apos;s free to set up and takes a small fee per card payment.
                </p>
                <ol className="mt-3 space-y-1.5 text-sm text-ink-soft">
                  {[
                    "Tap Connect Stripe below — it opens Stripe's secure form.",
                    "Enter your business details, date of birth and home address (Stripe has to check who you are).",
                    "Add the bank account your money should be paid into.",
                    "You come straight back here, and card payments switch on.",
                  ].map((t, i) => (
                    <li key={t} className="flex gap-2">
                      <span className="tabular w-4 shrink-0 font-semibold text-hivis">{i + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-sm text-muted">Takes about 5 minutes. Have your bank details handy.</p>
                <form action={startConnectOnboarding} className="mt-3">
                  <Button type="submit">Connect Stripe</Button>
                </form>
              </>
            )}

            {stripe === "pending" && (
              <>
                <p className="mt-1 text-sm text-ink-soft">
                  Stripe needs a few more details (or is still checking them) before you can take card payments. Carry on where you left
                  off — nothing is lost.
                </p>
                <form action={startConnectOnboarding} className="mt-3">
                  <Button type="submit">Continue Stripe setup</Button>
                </form>
              </>
            )}

            {stripe === "active" && (
              <>
                <p className="mt-1 text-sm text-ink-soft">
                  You can take card payments. Stripe pays the money into your bank automatically — your first payout can take up to 7 days,
                  then it&apos;s usually a couple of working days.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={openStripeDashboard}>
                    <Button type="submit" variant="secondary">
                      See payments &amp; payouts
                    </Button>
                  </form>
                  <form action={startConnectOnboarding}>
                    <Button type="submit" variant="ghost">
                      Update details
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Business details</CardTitle>
        <ProfileForm workspace={workspace} />
      </Card>

      <Card className="space-y-4">
        <CardTitle>Your logo</CardTitle>
        <LogoUploader logoUrl={logoUrl} businessName={workspace.business_name} brandColor={workspace.brand_color} />
      </Card>

      {billingOn && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Plan &amp; billing</CardTitle>
            <Pill tone={active ? "success" : "neutral"}>{active ? `Pro · ${workspace.subscription_status}` : "Starter"}</Pill>
          </div>
          {active ? (
            <>
              {workspace.current_period_end && (
                <p className="text-ink-soft">Renews {new Date(workspace.current_period_end).toLocaleDateString("en-GB", { dateStyle: "long" })}.</p>
              )}
              <form action={openBillingPortal}>
                <Button type="submit" variant="secondary">
                  Manage billing
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-ink-soft">Starter includes {freeQuoteLimit()} quotes. Pro gives you unlimited quotes.</p>
              <div className="flex flex-wrap gap-2">
                <form action={startSubscriptionCheckout}>
                  <Button type="submit">Upgrade to Pro</Button>
                </form>
                {workspace.stripe_customer_id && (
                  <form action={openBillingPortal}>
                    <Button type="submit" variant="ghost">
                      Billing history
                    </Button>
                  </form>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
