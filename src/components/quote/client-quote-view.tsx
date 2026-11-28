import { AudioPlayer } from "@/components/media/audio-player";
import { MediaGallery } from "@/components/media/media-gallery";
import { ClientUploader } from "@/components/quote/client-uploader";
import { DecisionBar, type BankDetails } from "@/components/quote/decision-bar";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { ClientComposer } from "@/components/thread/client-composer";
import { MessageThread } from "@/components/thread/message-thread";
import { ChatIcon, CheckIcon, LockIcon, PhoneIcon, ShieldIcon } from "@/components/ui/icons";
import { formatDateTime, initials } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import type { MediaItem, Quote, ThreadMessage } from "@/lib/types";

export type ClientQuoteViewProps = {
  token: string;
  quote: Quote;
  business: { name: string; trade: string | null; phone: string | null; brandColor: string; logoUrl: string | null; firstName: string };
  walkthrough: MediaItem | null;
  gallery: MediaItem[];
  thread: ThreadMessage[];
  expired: boolean;
  justPaid: boolean;
  payInFull: boolean;
  cardAvailable: boolean;
  bankOffered: boolean;
  bank: BankDetails | null;
};

const shortDate = (iso: string, withYear = true) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });

/** What the client sees when they open a quote link: light, simple, one clear action. */
export function ClientQuoteView(props: ClientQuoteViewProps) {
  const { token, quote, business: biz, walkthrough, gallery, thread, expired, justPaid, payInFull } = props;
  const due = formatMoney(quote.deposit_cents, quote.currency);
  const paid = quote.deposit_status === "paid";
  const hasMessages = thread.length > 0;

  return (
    <div className="min-h-dvh bg-canvas pb-56">
      {/* Business bar */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <div
            className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: biz.brandColor }}
          >
            {biz.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={biz.logoUrl} alt="" className="size-full object-cover" />
            ) : (
              initials(biz.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{biz.name}</p>
            {biz.trade && <p className="truncate text-sm text-muted">{biz.trade}</p>}
          </div>
          {biz.phone && (
            <a
              href={`tel:${biz.phone.replace(/[^\d+]/g, "")}`}
              className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-hivis ring-1 ring-[#d5dcea] ring-inset hover:bg-raised"
              aria-label={`Call ${biz.name}`}
            >
              <PhoneIcon width={16} height={16} /> Call
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-4 pt-6">
        {/* Title + total */}
        <section className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line ring-inset sm:p-6">
          <p className="text-sm text-muted">
            Quote for {quote.client_name} · {shortDate(quote.created_at)}
          </p>
          <h1 className="mt-1 text-2xl leading-tight font-bold break-words sm:text-3xl">{quote.title}</h1>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="text-sm text-muted">Total</p>
              <p className="tabular text-3xl font-bold tracking-[-0.02em]">{formatMoney(quote.total_cents, quote.currency)}</p>
            </div>
            {quote.deposit_cents > 0 && (
              <p className="text-right text-sm text-ink-soft">
                {payInFull ? "Pay in full when you accept" : (
                  <>
                    <span className="tabular font-semibold text-ink">{due}</span> deposit to book
                  </>
                )}
              </p>
            )}
          </div>
          {quote.valid_until && (
            <p className={`mt-3 text-sm ${expired ? "font-medium text-stop" : "text-muted"}`}>
              {expired ? "This quote has expired" : `Valid until ${shortDate(quote.valid_until, false)}`}
            </p>
          )}
        </section>

        {/* Status */}
        {quote.status === "approved" && (
          <section className="flex gap-3 rounded-2xl bg-go-soft p-4 text-go-ink" role="status">
            {paid ? <CheckIcon className="mt-0.5 shrink-0" /> : <LockIcon className="mt-0.5 shrink-0" />}
            <div className="text-sm">
              <p className="text-base font-semibold">
                {paid ? (payInFull ? "Paid in full — thank you!" : "Deposit paid — you're booked in!") : `Accepted by ${quote.decided_by_name}`}
              </p>
              {!paid && (
                <p className="mt-0.5">
                  {justPaid ? "Payment received — confirming with your bank…" : quote.deposit_cents > 0 ? `${due} to pay — choose how below.` : `${biz.firstName} will be in touch to book you in.`}
                </p>
              )}
              {quote.decided_at && <p className="mt-1 opacity-75">Accepted {formatDateTime(quote.decided_at)} · price locked</p>}
            </div>
          </section>
        )}
        {quote.status === "declined" && (
          <section className="rounded-2xl bg-stop-soft p-4 text-sm text-stop">
            <p className="text-base font-semibold">You declined this quote</p>
            <p className="mt-0.5">Changed your mind? Send {biz.firstName} a message below.</p>
          </section>
        )}
        {quote.status === "changes_requested" && (
          <section className="rounded-2xl bg-hivis-soft p-4 text-sm text-hivis-ink">
            <p className="text-base font-semibold">Changes requested</p>
            <p className="mt-0.5">{biz.firstName} will update the quote and this page will refresh. You can still accept it as it is.</p>
          </section>
        )}

        {/* Voice note */}
        {walkthrough?.url && (
          <section className="rounded-2xl bg-hivis-soft p-4 ring-1 ring-hivis/15 ring-inset sm:p-5">
            <p className="mb-3 font-semibold text-hivis-ink">Listen to {biz.firstName} explain the job</p>
            <AudioPlayer src={walkthrough.url} durationHint={walkthrough.duration_seconds} tone="light" size="lg" label="Play voice note" />
          </section>
        )}

        {/* Items */}
        <section className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line ring-inset sm:p-6">
          <h2 className="mb-4 text-base font-semibold">What&apos;s included</h2>
          {quote.scope && <p className="mb-4 leading-relaxed whitespace-pre-wrap text-ink-soft">{quote.scope}</p>}
          <QuoteSummary quote={quote} />
        </section>

        {/* Photos (only if there are some) */}
        {gallery.length > 0 && (
          <section className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line ring-inset sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Photos</h2>
            <MediaGallery items={gallery} />
          </section>
        )}

        {/* Questions — tucked away until needed */}
        <details id="messages" className="group rounded-2xl bg-surface shadow-card ring-1 ring-line ring-inset" open={hasMessages}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-semibold">
            <ChatIcon width={20} height={20} className="text-hivis" />
            <span className="flex-1">{hasMessages ? "Messages" : `Questions? Message ${biz.firstName}`}</span>
            <span className="text-muted transition group-open:rotate-90">›</span>
          </summary>
          <div className="space-y-4 border-t border-line p-5">
            <MessageThread messages={thread} viewer="client" />
            <ClientComposer token={token} defaultName={quote.client_name} />
            <div className="border-t border-line pt-4">
              <p className="mb-2 text-sm text-muted">Want to show {biz.firstName} something? Add a photo or video.</p>
              <ClientUploader token={token} clientName={quote.client_name} />
            </div>
          </div>
        </details>

        <footer className="space-y-1.5 pt-4 text-center text-xs text-muted">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldIcon width={13} height={13} /> Private link for {quote.client_name}
          </p>
          <p>
            Sent with{" "}
            <a href="/" className="font-semibold text-ink-soft hover:underline">
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
        businessName={biz.name}
        expired={expired}
        payInFull={payInFull}
        cardAvailable={props.cardAvailable}
        bankOffered={props.bankOffered}
        bank={props.bank}
      />
    </div>
  );
}
