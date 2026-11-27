import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { requireServerEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe signs the exact bytes it sends, so read the raw body and never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, requireServerEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.warn("Stripe webhook signature failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      default:
        // Acknowledge everything else so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook ${event.type} failed`, err);
    // 500 => Stripe retries with backoff. Handlers are idempotent.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = createAdminClient();

  if (session.mode === "payment" && session.metadata?.kind === "deposit") {
    const quoteId = session.metadata.quote_id;
    if (!quoteId || session.payment_status !== "paid") return;
    const { error } = await admin
      .from("quotes")
      .update({
        deposit_status: "paid",
        deposit_paid_at: new Date().toISOString(),
        deposit_checkout_session_id: session.id,
      })
      .eq("id", quoteId)
      .eq("status", "approved");
    if (error) throw new Error(error.message);
    await admin.from("quote_messages").insert({
      quote_id: quoteId,
      sender_role: "client",
      sender_name: session.customer_details?.name || "Client",
      body:
        session.amount_total != null && session.currency
          ? `💳 Paid ${new Intl.NumberFormat("en-GB", { style: "currency", currency: session.currency.toUpperCase() }).format(session.amount_total / 100)} by card.`
          : "💳 Paid by card.",
    });
    return;
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    const workspaceId = session.client_reference_id ?? session.metadata?.workspace_id ?? null;
    await syncSubscription(subscription, workspaceId);
  }
}

async function syncSubscription(subscription: Stripe.Subscription, workspaceIdHint: string | null = null) {
  const admin = createAdminClient();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const workspaceId = workspaceIdHint ?? subscription.metadata?.workspace_id ?? null;
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end;

  const values = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_price_id: item?.price.id ?? null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  };

  const query = admin.from("workspaces").update(values);
  const { data, error } = await (workspaceId ? query.eq("id", workspaceId) : query.eq("stripe_customer_id", customerId)).select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) console.warn(`No workspace matched Stripe customer ${customerId}`);
}
