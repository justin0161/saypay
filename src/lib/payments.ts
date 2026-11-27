import "server-only";
import { isStripeConfigured } from "./env";
import { getStripe } from "./stripe";
import type { Workspace } from "./types";

export type StripeStatus =
  /** SayPay itself has no Stripe key yet, so nobody can connect. */
  | "unavailable"
  /** Not started. */
  | "none"
  /** Started, but Stripe still needs details before payments can be taken. */
  | "pending"
  /** Ready to take card payments. */
  | "active";

export type PaymentSetup = {
  stripe: StripeStatus;
  /** Clients can pay by card (Stripe connected, or the business's own payment link). */
  card: boolean;
  /** Clients can pay by bank transfer (bank details saved). */
  bank: boolean;
};

export async function getStripeStatus(accountId: string | null): Promise<StripeStatus> {
  if (!isStripeConfigured()) return "unavailable";
  if (!accountId) return "none";
  try {
    const account = await getStripe().accounts.retrieve(accountId);
    return account.charges_enabled ? "active" : "pending";
  } catch {
    return "pending";
  }
}

/** What a business can currently accept, for the quote builder and Settings. */
export async function getPaymentSetup(workspace: Workspace): Promise<PaymentSetup> {
  const stripe = await getStripeStatus(workspace.stripe_connect_account_id);
  return {
    stripe,
    card: stripe === "active" || Boolean(workspace.deposit_link_url),
    bank: Boolean(workspace.bank_account_number && workspace.bank_sort_code && workspace.bank_account_name),
  };
}
