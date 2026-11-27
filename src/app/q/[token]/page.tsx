import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AutoRefresh } from "@/components/auto-refresh";
import { AudioPlayer } from "@/components/media/audio-player";
import { MediaGallery } from "@/components/media/media-gallery";
import { ClientUploader } from "@/components/quote/client-uploader";
import { DecisionBar } from "@/components/quote/decision-bar";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { ClientComposer } from "@/components/thread/client-composer";
import { MessageThread } from "@/components/thread/message-thread";
import { Card, CardTitle } from "@/components/ui/card";
import { CheckIcon, LockIcon, PhoneIcon, ShieldIcon, XIcon } from "@/components/ui/icons";
import { StatusPill } from "@/components/ui/pill";
import { formatDateTime, initials, isFullPayment, paymentReference } from "@/lib/format";
import { isStripeConfigured } from "@/lib/env";
import { formatMoney } from "@/lib/quote-math";
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
  const dueLabel = payInFull ? "Payment" : "Deposit";
  // Card: Stripe Connect (verified at checkout time) or the contractor's own payment link — if this quote allows card.
  const cardAvailable = quote.accept_card && Boolean((isStripeConfigured() && ws.stripe_connect_account_id) || ws.deposit_link_url);
  // Bank details are only revealed once the quote is accepted.
  const bank =
    quote.status === "approved" && quote.accept_bank && ws.bank_account_name && ws.bank_sort_code && ws.bank_account_number
      ? { name: ws.bank_account_name, sortCode: ws.bank_sort_code, accountNumber: ws.bank_account_number, reference: paymentReference(quote.id) }
      : null;
  const bankOffered = quote.accept_bank && Boolean(ws.bank_account_number);

  return (
    <div className="min-h-dvh pb-64">
      <AutoRefresh intervalMs={15_000} />

      {/* Business header */}
      <header className="relative overflow-hidden text-white" style={{ backgroundColor: ws.brand_color }}>
        {/* Soft light + glow over the contractor's brand colour. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(32rem_18rem_at_100%_0%,rgb(255_255_255/0.1),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-2xl px-4 pt-5 pb-7">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/15 text-base font-semibold ring-1 ring-white/20 ring-inset">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-full object-cover" />
              ) : (
                initials(ws.business_name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-semibold">{ws.business_name}</p>
              {ws.trade && <p className="truncate text-sm text-white/70">{ws.trade}</p>}
            </div>
            {ws.contact_phone && (
              <a
                href={`tel:${ws.contact_phone.replace(/[^\d+]/g, "")}`}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20 ring-inset"
                aria-label={`Call ${ws.business_name}`}
              >
                <PhoneIcon />
              </a>
            )}
          </div>

          <h1 className="mt-7 text-4xl leading-[0.95] font-bold break-words sm:text-5xl">{quote.title}</h1>
          <p className="mt-1 text-white/70">
            For {quote.client_name} · {new Date(quote.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {quote.valid_until &&
              ` · ${expired ? "Expired" : "Valid until"} ${new Date(quote.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.02em] tabular">{formatMoney(quote.total_cents, quote.currency)}</p>

          {walkthrough && (
            <div className="mt-5">
              <p className="mb-2.5 text-[11px] font-medium text-white/70">Voice walkthrough from {firstName}</p>
              <AudioPlayer src={walkthrough.url} durationHint={walkthrough.duration_seconds} tone="brand" size="lg" label="Play walkthrough" />
            </div>
          )}
        </div>
      </header>

      <main className="relative mx-auto -mt-3 max-w-2xl space-y-4 px-4 pb-4">
        {/* State banners */}
        {quote.status === "approved" && (
          <div className="flex gap-3 rounded-card bg-go-soft p-4 text-go-ink ring-1 ring-go/30 ring-inset" role="status">
            <LockIcon className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Approved by {quote.decided_by_name}</p>
              {quote.decided_at && <p className="text-sm">{formatDateTime(quote.decided_at)}</p>}
              <p className="mt-1 text-sm opacity-80">The price and scope are locked. {firstName} has been notified.</p>
              {quote.deposit_cents > 0 && (
                <p className="mt-2 font-semibold">
                  {quote.deposit_status === "paid"
                    ? `✓ ${dueLabel} of ${formatMoney(quote.deposit_cents, quote.currency)} received — you're booked in.`
                    : justPaid
                      ? "Payment received — confirming with your bank…"
                      : payInFull
                        ? `Payment of ${formatMoney(quote.deposit_cents, quote.currency)} due.`
                        : `Deposit of ${formatMoney(quote.deposit_cents, quote.currency)} due to secure your booking.`}
                </p>
              )}
            </div>
          </div>
        )}
        {quote.status === "declined" && (
          <div className="flex gap-3 rounded-card bg-stop-soft p-4 text-stop ring-1 ring-stop/30 ring-inset">
            <XIcon className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">You declined this quote</p>
              {quote.decided_at && <p className="text-sm">{formatDateTime(quote.decided_at)}</p>}
              <p className="mt-1 text-sm">Changed your mind? Send {firstName} a message below.</p>
            </div>
          </div>
        )}
        {quote.status === "changes_requested" && (
          <div className="rounded-card bg-hivis-soft p-4 text-hivis-ink ring-1 ring-hivis/30 ring-inset">
            <p className="font-semibold">Changes requested</p>
            <p className="text-sm">{firstName} will update the quote — this page refreshes automatically. You can still approve as-is.</p>
          </div>
        )}

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Quote</CardTitle>
            <StatusPill status={quote.status} />
          </div>
          {quote.scope && <p className="mb-4 leading-relaxed whitespace-pre-wrap text-ink-soft">{quote.scope}</p>}
          <QuoteSummary quote={quote} />
        </Card>

        <Card className="space-y-4">
          <CardTitle>Photos & video</CardTitle>
          <MediaGallery items={gallery} emptyText="No photos yet. Add your own to show the space, measurements or anything you're unsure about." />
          <ClientUploader token={token} clientName={quote.client_name} />
        </Card>

        <Card className="space-y-4" id="messages">
          <div>
            <CardTitle>Questions? Ask {firstName}</CardTitle>
            <p className="mt-1 text-sm text-muted">Type, send a voice note, or share photos. Replies show up here.</p>
          </div>
          <MessageThread messages={thread} viewer="client" />
          <ClientComposer token={token} defaultName={quote.client_name} />
        </Card>

        <footer className="space-y-2 px-2 pt-4 text-center text-xs text-muted">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldIcon width={14} height={14} /> Private link for {quote.client_name}. Please don&apos;t share it.
          </p>
          <p>
            Powered by{" "}
            <a href="https://saypay.co" className="font-semibold text-ink-soft underline-offset-2 hover:underline">
              SayPay
            </a>
          </p>
        </footer>
      </main>

      <DecisionBar
        token={token}
        status={quote.status}
        depositStatus={quote.deposit_status}
        depositCents={quote.deposit_cents}
        totalCents={quote.total_cents}
        currency={quote.currency}
        clientName={quote.client_name}
        businessName={ws.business_name}
        expired={expired}
        payInFull={payInFull}
        cardAvailable={cardAvailable}
        bankOffered={bankOffered}
        bank={bank}
      />
      {quote.status === "approved" && quote.deposit_status === "paid" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe backdrop-blur">
          <p className="mx-auto flex min-h-14 max-w-2xl items-center justify-center gap-2 px-4 pt-3 font-semibold text-go-ink">
            <CheckIcon /> All set — {payInFull ? "paid in full" : "deposit paid"}
          </p>
        </div>
      )}
    </div>
  );
}
