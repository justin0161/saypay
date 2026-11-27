import type { Metadata } from "next";
import { openBillingPortal, startConnectOnboarding, startSubscriptionCheckout } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { requireWorkspace } from "@/lib/auth";
import { freeQuoteLimit, isStripeConfigured } from "@/lib/env";
import { signPaths } from "@/lib/quotes";
import { getStripe, isSubscriptionActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { LogoUploader } from "./logo-uploader";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Settings" };

async function connectStatus(accountId: string | null): Promise<"none" | "pending" | "active"> {
  if (!accountId || !isStripeConfigured()) return "none";
  try {
    const account = await getStripe().accounts.retrieve(accountId);
    return account.charges_enabled ? "active" : "pending";
  } catch {
    return "pending";
  }
}

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const sp = await searchParams;
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const stripeOn = isStripeConfigured();
  const active = isSubscriptionActive(workspace.subscription_status);
  const connect = await connectStatus(workspace.stripe_connect_account_id);
  const logoUrl = workspace.logo_path ? ((await signPaths(supabase, [workspace.logo_path])).get(workspace.logo_path) ?? null) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span className="text-sunset">Settings</span>
      </h1>

      {sp.billing === "success" && (
        <p className="rounded-2xl bg-go-soft p-4 font-semibold text-go-ink ring-1 ring-emerald-200 ring-inset">You&apos;re on SayPay Pro. Thanks! It can take a few seconds to show below.</p>
      )}
      {sp.connect === "done" && (
        <p className="rounded-2xl bg-go-soft p-4 font-semibold text-go-ink ring-1 ring-emerald-200 ring-inset">Stripe setup saved. Card deposits switch on once Stripe verifies your details.</p>
      )}

      <Card className="space-y-4">
        <CardTitle>Branding</CardTitle>
        <LogoUploader logoUrl={logoUrl} businessName={workspace.business_name} brandColor={workspace.brand_color} />
      </Card>

      <Card>
        <CardTitle className="mb-4">Business profile</CardTitle>
        <ProfileForm workspace={workspace} />
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Card deposits</CardTitle>
          {connect === "active" ? <Pill tone="success">Live</Pill> : connect === "pending" ? <Pill tone="warning">Finish setup</Pill> : null}
        </div>
        <p className="text-ink-soft">
          When a client approves, they can pay the deposit by card. Money goes straight to your Stripe account. Prefer your own link?
          Add a payment link (Stripe, PayPal, SumUp…) in the profile above.
        </p>
        {stripeOn ? (
          <form action={startConnectOnboarding}>
            <Button type="submit" variant={connect === "active" ? "secondary" : "primary"}>
              {connect === "none" ? "Connect Stripe" : connect === "pending" ? "Continue Stripe setup" : "Update Stripe details"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted">Stripe isn&apos;t configured on this deployment.</p>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Plan & billing</CardTitle>
          <Pill tone={active ? "success" : "neutral"}>{active ? `Pro · ${workspace.subscription_status}` : "Starter"}</Pill>
        </div>
        {!stripeOn ? (
          <p className="text-sm text-muted">Billing is disabled (no STRIPE_SECRET_KEY). All features are unlocked.</p>
        ) : active ? (
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
            <p className="text-ink-soft">
              Starter includes {freeQuoteLimit()} quotes. Pro is unlimited, with card deposits and your branding.
            </p>
            <div className="flex flex-wrap gap-2">
              <form action={startSubscriptionCheckout}>
                <Button type="submit" variant="hivis">
                  Upgrade to Pro
                </Button>
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
    </div>
  );
}
