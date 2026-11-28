import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AutoRefresh } from "@/components/auto-refresh";
import { ClientQuoteView } from "@/components/quote/client-quote-view";
import { isFullPayment, paymentReference } from "@/lib/format";
import { isStripeConfigured } from "@/lib/env";
import { loadQuoteBundle, signPaths, toQuote } from "@/lib/quotes";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidShareToken } from "@/lib/tokens";

// Always fresh: decisions, messages and signed URLs change.
export const dynamic = "force-dynamic";

/**
 * Resolve a share token -> quote + public business card. Server-only: uses the
 * service role *after* validating the token format. Cached per request so
 * generateMetadata and the page share one lookup.
 */
const loadByToken = cache(async (token: string) => {
  if (!isValidShareToken(token)) return null;
  const admin = createAdminClient();
  const { data: quote } = await admin.from("quotes").select("*").eq("share_token", token).maybeSingle();
  if (!quote) return null;
  const { data: ws } = await admin
    .from("workspaces")
    .select(
      "business_name, contact_name, contact_phone, contact_email, trade, brand_color, logo_path, stripe_connect_account_id, deposit_link_url, bank_account_name, bank_sort_code, bank_account_number",
    )
    .eq("id", quote.workspace_id)
    .single();
  if (!ws) return null;
  return { quote, ws };
});

export async function generateMetadata({ params }: PageProps<"/q/[token]">): Promise<Metadata> {
  const { token } = await params;
  const found = await loadByToken(token);
  return {
    title: found ? `${found.quote.title} — ${found.ws.business_name}` : "Quote",
    robots: { index: false, follow: false },
  };
}

export default async function ClientQuotePage({ params, searchParams }: PageProps<"/q/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const found = await loadByToken(token);
  if (!found) notFound();

  const admin = createAdminClient();
  const { ws } = found;
  let record = found.quote;

  // First open: mark as viewed (contractor sees "Opened" on the dashboard).
  if (record.status === "sent") {
    const { data } = await admin
      .from("quotes")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", record.id)
      .eq("status", "sent")
      .select("*")
      .maybeSingle();
    if (data) record = data;
  }

  const quote = toQuote(record);
  const [{ walkthrough, gallery, thread }, logoUrls] = await Promise.all([
    loadQuoteBundle(admin, quote.id),
    signPaths(admin, ws.logo_path ? [ws.logo_path] : []),
  ]);
  const logoUrl = ws.logo_path ? (logoUrls.get(ws.logo_path) ?? null) : null;
  const firstName = ws.contact_name?.split(" ")[0] ?? ws.business_name;
  const expired = Boolean(quote.valid_until && new Date(`${quote.valid_until}T23:59:59Z`) < new Date());
  const justPaid = sp.paid === "1";
  const payInFull = isFullPayment(quote.deposit_cents, quote.total_cents);
  // Card: Stripe Connect (verified at checkout time) or the contractor's own payment link — if this quote allows card.
  const cardAvailable = quote.accept_card && Boolean((isStripeConfigured() && ws.stripe_connect_account_id) || ws.deposit_link_url);
  // Bank details are only revealed once the quote is accepted.
  const bank =
    quote.status === "approved" && quote.accept_bank && ws.bank_account_name && ws.bank_sort_code && ws.bank_account_number
      ? { name: ws.bank_account_name, sortCode: ws.bank_sort_code, accountNumber: ws.bank_account_number, reference: paymentReference(quote.id) }
      : null;
  const bankOffered = quote.accept_bank && Boolean(ws.bank_account_number);

  return (
    <>
      <AutoRefresh intervalMs={15_000} />
      <ClientQuoteView
        token={token}
        quote={quote}
        business={{
          name: ws.business_name,
          trade: ws.trade,
          phone: ws.contact_phone,
          brandColor: ws.brand_color,
          logoUrl,
          firstName,
        }}
        walkthrough={walkthrough}
        gallery={gallery}
        thread={thread}
        expired={expired}
        justPaid={justPaid}
        payInFull={payInFull}
        cardAvailable={cardAvailable}
        bankOffered={bankOffered}
        bank={bank}
      />
    </>
  );
}
