"use client";

import { useEffect, useState, useTransition } from "react";
import { decideQuote, notifyBankTransfer, startDepositPayment } from "@/actions/client-quote";
import { formatSortCode } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import type { DepositStatus, QuoteStatus } from "@/lib/types";
import { Button } from "../ui/button";
import { inputClass } from "../ui/field";
import { CopyButton } from "../copy-button";
import { CardIcon, CheckIcon, ShieldIcon } from "../ui/icons";
import { cn } from "../ui/cn";

type Sheet = null | "approve" | "request_changes" | "decline" | "bank";

export type BankDetails = { name: string; sortCode: string; accountNumber: string; reference: string };

/**
 * Sticky, thumb-reachable decision bar for the client magic link.
 * Approve → pay (deposit or in full, by card and/or bank transfer); Request changes (note required); Decline (optional reason).
 */
export function DecisionBar({
  token,
  status,
  depositStatus,
  depositCents,
  totalCents,
  currency,
  clientName,
  businessName,
  expired,
  payInFull,
  cardAvailable,
  bankOffered,
  bank,
}: {
  token: string;
  status: QuoteStatus;
  depositStatus: DepositStatus;
  depositCents: number;
  totalCents: number;
  currency: string;
  clientName: string;
  businessName: string;
  expired: boolean;
  payInFull: boolean;
  cardAvailable: boolean;
  /** The business accepts bank transfer (details are only sent once the quote is accepted). */
  bankOffered: boolean;
  bank: BankDetails | null;
}) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [name, setName] = useState(clientName);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [paying, startPay] = useTransition();
  const [bankSent, setBankSent] = useState(false);
  const [notifying, startNotify] = useTransition();
  const due = formatMoney(depositCents, currency);
  const dueWord = payInFull ? "in full" : "deposit";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("saypay:name");
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheet]);

  const submit = () => {
    if (!sheet || sheet === "bank") return;
    setError(null);
    start(async () => {
      const res = await decideQuote(token, { decision: sheet, name: name.trim(), note: note.trim() || null });
      if (!res.ok) return setError(res.error);
      try {
        localStorage.setItem("saypay:name", name.trim());
      } catch {
        /* ignore */
      }
      navigator.vibrate?.([20, 40, 20]);
      setSheet(null);
      setNote("");
    });
  };

  const pay = () => {
    setPayError(null);
    startPay(async () => {
      const res = await startDepositPayment(token);
      if (!res.ok) return setPayError(res.error);
      window.location.assign(res.data.url);
    });
  };

  const sentBankTransfer = () => {
    setPayError(null);
    startNotify(async () => {
      const res = await notifyBankTransfer(token, { name: name.trim() });
      if (!res.ok) return setPayError(res.error);
      setBankSent(true);
      setSheet(null);
    });
  };

  const open = status === "sent" || status === "viewed" || status === "changes_requested";
  const needsDeposit = status === "approved" && depositCents > 0 && depositStatus !== "paid";

  if (!open && !needsDeposit) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-safe shadow-[0_-8px_24px_-16px_rgb(10_26_58/0.25)] backdrop-blur">
        <div className="mx-auto max-w-xl space-y-2 px-4 pt-3">
          {needsDeposit ? (
            <>
              {bankSent && (
                <p className="rounded-2xl bg-go-soft px-4 py-3 text-center text-sm font-semibold text-go-ink" role="status">
                  Thanks — {businessName} will confirm when your transfer arrives.
                </p>
              )}
              {(cardAvailable || !bank) && (
                <Button size="lg" className="w-full" onClick={pay} disabled={paying}>
                  <CardIcon /> {paying
                    ? "Opening secure checkout…"
                    : `Pay ${due}${payInFull ? "" : " deposit"}${cardAvailable ? " by card" : ""}`}
                </Button>
              )}
              {bank && (
                <Button variant={cardAvailable ? "secondary" : "primary"} size="lg" className="w-full" onClick={() => setSheet("bank")}>
                  Pay {cardAvailable ? "" : `${due} `}by bank transfer
                </Button>
              )}
              {payError && <p className="text-center text-sm font-medium text-ink-soft">{payError}</p>}
            </>
          ) : expired ? (
            <p className="py-2 text-center text-sm font-medium text-ink-soft">
              This quote has expired — send {businessName} a message below for an updated one.
            </p>
          ) : (
            <>
              <Button size="lg" className="w-full" onClick={() => setSheet("approve")}>
                <CheckIcon /> {depositCents > 0 ? (payInFull ? "Accept & pay" : "Accept & pay deposit") : "Accept quote"}
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={() => setSheet("request_changes")}>
                  Ask for changes
                </Button>
                <Button variant="ghost" className="flex-1 text-muted" onClick={() => setSheet("decline")}>
                  Decline
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center" onClick={() => !pending && setSheet(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            className="w-full max-w-lg animate-rise space-y-4 rounded-t-3xl bg-surface p-6 pb-safe shadow-lift sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-raised sm:hidden" />
            {sheet === "bank" && bank ? (
              <>
                <h2 id="decision-title" className="text-3xl leading-none font-bold">
                  Pay by bank transfer
                </h2>
                <p className="text-ink-soft">
                  Send <span className="font-semibold text-ink">{due}</span> {payInFull ? "" : "(your deposit) "}from your banking app using these
                  details. Please include the reference so {businessName} can match your payment.
                </p>
                <dl className="divide-y divide-line rounded-2xl bg-canvas px-4">
                  {(
                    [
                      ["Amount", due, (depositCents / 100).toFixed(2)],
                      ["Account name", bank.name, bank.name],
                      ["Sort code", formatSortCode(bank.sortCode), bank.sortCode],
                      ["Account number", bank.accountNumber, bank.accountNumber],
                      ["Reference", bank.reference, bank.reference],
                    ] as const
                  ).map(([label, shown, copy]) => (
                    <div key={label} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-muted">{label}</dt>
                        <dd className="tabular truncate font-semibold">{shown}</dd>
                      </div>
                      <CopyButton text={copy} variant="ghost" className="shrink-0 px-3!">
                        Copy
                      </CopyButton>
                    </div>
                  ))}
                </dl>
                {payError && (
                  <p className="text-sm font-medium text-stop" role="alert">
                    {payError}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" size="lg" onClick={() => setSheet(null)} disabled={notifying}>
                    Close
                  </Button>
                  <Button size="lg" className="flex-1" onClick={sentBankTransfer} disabled={notifying}>
                    <CheckIcon /> {notifying ? "Letting them know…" : "I've sent the payment"}
                  </Button>
                </div>
              </>
            ) : (
            <>
            <h2 id="decision-title" className="text-3xl leading-none font-bold">
              {sheet === "approve" ? "Accept this quote" : sheet === "request_changes" ? "Ask for changes" : "Decline this quote"}
            </h2>

            {sheet === "approve" && (
              <div className="space-y-2 rounded-2xl bg-canvas p-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular">{formatMoney(totalCents, currency)}</span>
                </div>
                {depositCents > 0 && (
                  <div className="flex justify-between text-ink-soft">
                    <span>{payInFull ? "To pay now (in full)" : "Deposit due now"}</span>
                    <span className="tabular font-semibold">{due}</span>
                  </div>
                )}
                {depositCents > 0 && (cardAvailable || bankOffered) && (
                  <p className="text-sm text-ink-soft">
                    Pay by {[cardAvailable && "card", bankOffered && "bank transfer"].filter(Boolean).join(" or ")} next.
                  </p>
                )}
                <p className="flex gap-2 pt-1 text-sm text-muted">
                  <ShieldIcon width={18} height={18} className="shrink-0 text-go" />
                  Your acceptance is time-stamped and the price is locked. {businessName} can&apos;t change it afterwards.
                </p>
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">{sheet === "approve" ? "Your full name" : "Your name"}</span>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">
                {sheet === "request_changes" ? "What would you like changed?" : sheet === "decline" ? "Reason (optional)" : "Note (optional)"}
              </span>
              <textarea
                className={cn(inputClass, "min-h-24")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder={
                  sheet === "request_changes"
                    ? "e.g. Can we use a white radiator instead, and start the week after?"
                    : sheet === "decline"
                      ? "e.g. Going with another option for now"
                      : "e.g. Mornings work best for us"
                }
                required={sheet === "request_changes"}
              />
            </label>

            {error && (
              <p className="text-sm font-medium text-stop" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" size="lg" onClick={() => setSheet(null)} disabled={pending}>
                Cancel
              </Button>
              <Button
                variant={sheet === "decline" ? "danger" : "primary"}
                size="lg"
                className="flex-1"
                onClick={submit}
                disabled={pending || !name.trim() || (sheet === "request_changes" && note.trim().length < 3)}
              >
                {pending
                  ? "Sending…"
                  : sheet === "approve"
                    ? `Accept ${formatMoney(totalCents, currency)}`
                    : sheet === "request_changes"
                      ? "Send request"
                      : "Decline quote"}
              </Button>
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
