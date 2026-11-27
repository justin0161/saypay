"use server";

import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/auth";
import { publicEnv, requireServerEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Ensure the workspace has a Stripe customer; Stripe ids are written with the service role only. */
async function ensureCustomer(): Promise<{ customerId: string; workspaceId: string }> {
  const { workspace, email } = await requireWorkspace();
  if (workspace.stripe_customer_id) return { customerId: workspace.stripe_customer_id, workspaceId: workspace.id };

  const customer = await getStripe().customers.create(
    {
      email: workspace.contact_email ?? email ?? undefined,
      name: workspace.business_name,
      metadata: { workspace_id: workspace.id },
    },
    { idempotencyKey: `customer-${workspace.id}` },
  );
  await createAdminClient().from("workspaces").update({ stripe_customer_id: customer.id }).eq("id", workspace.id);
  return { customerId: customer.id, workspaceId: workspace.id };
}

export async function startSubscriptionCheckout() {
  const { customerId, workspaceId } = await ensureCustomer();
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: workspaceId,
    line_items: [{ price: requireServerEnv("STRIPE_PRICE_ID"), quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { metadata: { workspace_id: workspaceId } },
    metadata: { kind: "subscription", workspace_id: workspaceId },
    success_url: `${publicEnv.siteUrl}/settings?billing=success`,
    cancel_url: `${publicEnv.siteUrl}/settings?billing=cancelled`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function openBillingPortal() {
  const { customerId } = await ensureCustomer();
  const portal = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${publicEnv.siteUrl}/settings`,
  });
  redirect(portal.url);
}

/** Stripe Connect Express onboarding so client deposits are paid to the contractor. */
export async function startConnectOnboarding() {
  const { workspace, email } = await requireWorkspace();
  const stripe = getStripe();
  let accountId = workspace.stripe_connect_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create(
      {
        type: "express",
        email: workspace.contact_email ?? email ?? undefined,
        business_profile: { name: workspace.business_name },
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { workspace_id: workspace.id },
      },
      { idempotencyKey: `connect-${workspace.id}` },
    );
    accountId = account.id;
    await createAdminClient().from("workspaces").update({ stripe_connect_account_id: accountId }).eq("id", workspace.id);
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${publicEnv.siteUrl}/settings?connect=retry`,
    return_url: `${publicEnv.siteUrl}/settings?connect=done`,
  });
  redirect(link.url);
}

/** Opens the contractor's own Stripe Express dashboard (payouts, payments, bank details). */
export async function openStripeDashboard() {
  const { workspace } = await requireWorkspace();
  if (!workspace.stripe_connect_account_id) redirect("/settings#get-paid");
  const login = await getStripe().accounts.createLoginLink(workspace.stripe_connect_account_id);
  redirect(login.url);
}
