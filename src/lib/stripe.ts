import "server-only";
import Stripe from "stripe";
import { publicEnv, requireServerEnv } from "./env";

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  stripe ??= new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
    appInfo: { name: "SayPay", url: publicEnv.siteUrl },
    typescript: true,
  });
  return stripe;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isSubscriptionActive(status: string | null | undefined): boolean {
  return Boolean(status && ACTIVE_STATUSES.has(status));
}
