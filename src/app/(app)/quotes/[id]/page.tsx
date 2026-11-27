import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { AudioPlayer } from "@/components/media/audio-player";
import { DeleteQuoteButton, DepositToggle, OwnerGallery } from "@/components/quote/owner-controls";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { ShareActions } from "@/components/quote/share-actions";
import { ContractorComposer } from "@/components/thread/contractor-composer";
import { MessageThread } from "@/components/thread/message-thread";
import { buttonClass } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { LockIcon, PencilIcon } from "@/components/ui/icons";
import { DepositPill, StatusPill } from "@/components/ui/pill";
import { requireWorkspace } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { formatDateTime, isDecided } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import { loadQuoteBundle, toQuote } from "@/lib/quotes";
import { shareMessage, shareUrl } from "@/lib/share";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Quote" };

export default async function QuoteDetailPage({ params, searchParams }: PageProps<"/quotes/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!uuidSchema.safeParse(id).success) notFound();

  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const quote = toQuote(data);
  const { walkthrough, gallery, thread } = await loadQuoteBundle(supabase, quote.id);

  const url = shareUrl(publicEnv.siteUrl, quote.share_token);
  const message = shareMessage(publicEnv.siteUrl, quote, workspace.business_name);
  const decided = isDecided(quote.status);
  const justSent = sp.sent === "1";
  const meta = (quote.decision_meta ?? null) as { ip?: string | null; user_agent?: string | null } | null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
      <AutoRefresh />
      <div className="space-y-4">
        <div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-ink">
            ← All quotes
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight break-words sm:text-3xl">{quote.title}</h1>
              <p className="text-muted">
                {quote.client_name}
                {quote.client_phone ? ` · ${quote.client_phone}` : ""}
                {quote.viewed_at ? ` · Opened ${formatDateTime(quote.viewed_at)}` : " · Not opened yet"}
              </p>
            </div>
            {!decided && (
              <Link href={`/quotes/${quote.id}/edit`} className={buttonClass("secondary", "sm")}>
                <PencilIcon width={16} height={16} /> Edit
              </Link>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusPill status={quote.status} />
            <DepositPill status={quote.deposit_status} />
          </div>
        </div>

        {/* Share */}
        <Card className={justSent ? "bg-ink text-white ring-0" : ""}>
          {justSent ? (
            <>
              <p className="text-xl font-extrabold">Quote ready — send it to {quote.client_name.split(" ")[0]} 🚀</p>
              <p className="mt-1 mb-4 text-white/70">They can listen, reply and approve from this link. No login needed.</p>
            </>
          ) : (
            <CardTitle className="mb-3">Client link</CardTitle>
          )}
          <p className="mb-3 truncate rounded-xl bg-canvas px-3 py-2.5 font-mono text-sm text-ink-soft">{url}</p>
          <ShareActions url={url} message={message} phone={quote.client_phone} layout={justSent ? "full" : "compact"} />
        </Card>

        {/* Decision audit */}
        {(decided || quote.status === "changes_requested") && quote.decided_by_name && (
          <Card
            className={
              quote.status === "approved"
                ? "bg-go-soft ring-1 ring-emerald-200 ring-inset"
                : quote.status === "declined"
                  ? "bg-rose-50 ring-1 ring-rose-200 ring-inset"
                  : "bg-hivis-soft ring-1 ring-amber-200 ring-inset"
            }
          >
            <p className="flex items-center gap-2 font-bold">
              {quote.status === "approved" && <LockIcon width={18} height={18} />}
              {quote.status === "approved" ? "Approved" : quote.status === "declined" ? "Declined" : "Changes requested"} by{" "}
              {quote.decided_by_name}
            </p>
            {quote.decided_at && <p className="text-sm opacity-80">{formatDateTime(quote.decided_at)}</p>}
            {quote.decision_note && <p className="mt-2 whitespace-pre-wrap">“{quote.decision_note}”</p>}
            {quote.status === "approved" && (
              <p className="mt-2 text-xs opacity-70">
                Terms locked at approval{meta?.ip ? ` · IP ${meta.ip}` : ""}
                {meta?.user_agent ? ` · ${meta.user_agent.slice(0, 60)}…` : ""}
              </p>
            )}
            {quote.status === "changes_requested" && (
              <Link href={`/quotes/${quote.id}/edit`} className={buttonClass("primary", "md", "mt-3")}>
                Update & re-send
              </Link>
            )}
          </Card>
        )}

        {/* Deposit */}
        {quote.deposit_cents > 0 && quote.status === "approved" && (
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Deposit</CardTitle>
              <p className="mt-1 text-xl font-extrabold">
                {formatMoney(quote.deposit_cents, quote.currency)}{" "}
                <span className="text-base font-semibold text-muted">
                  {quote.deposit_status === "paid"
                    ? `paid ${quote.deposit_paid_at ? formatDateTime(quote.deposit_paid_at) : ""}`
                    : "awaiting payment"}
                </span>
              </p>
            </div>
            <DepositToggle quoteId={quote.id} paid={quote.deposit_status === "paid"} />
          </Card>
        )}

        <Card className="space-y-4">
          <CardTitle>Your voice walkthrough</CardTitle>
          {walkthrough ? (
            <AudioPlayer src={walkthrough.url} durationHint={walkthrough.duration_seconds} size="lg" />
          ) : (
            <p className="text-sm text-muted">
              No voice note yet.{" "}
              {!decided && (
                <Link href={`/quotes/${quote.id}/edit`} className="font-semibold text-ink underline">
                  Record one
                </Link>
              )}
            </p>
          )}
          {quote.scope && <p className="leading-relaxed whitespace-pre-wrap text-ink-soft">{quote.scope}</p>}
          <QuoteSummary quote={quote} />
        </Card>

        <Card className="space-y-3">
          <CardTitle>Photos & video</CardTitle>
          <OwnerGallery items={gallery} locked={decided} />
        </Card>

        {quote.status !== "approved" && (
          <div className="pt-2">
            <DeleteQuoteButton quoteId={quote.id} />
          </div>
        )}
      </div>

      {/* Thread */}
      <Card className="space-y-4 lg:sticky lg:top-24">
        <CardTitle>Messages</CardTitle>
        <div className="max-h-[60vh] overflow-y-auto">
          <MessageThread messages={thread} viewer="contractor" />
        </div>
        <ContractorComposer quoteId={quote.id} />
      </Card>
    </div>
  );
}
