"use client";

import { useEffect, useState, useTransition } from "react";
import { decideQuote, startDepositPayment } from "@/actions/client-quote";
import { formatMoney } from "@/lib/quote-math";
import type { DepositStatus, QuoteStatus } from "@/lib/types";
import { Button } from "../ui/button";
import { inputClass } from "../ui/field";
import { CardIcon, CheckIcon, ShieldIcon } from "../ui/icons";
import { cn } from "../ui/cn";

type Sheet = null | "approve" | "request_changes" | "decline";

/**
 * Sticky, thumb-reachable decision bar for the client magic link.
 * Approve → (deposit) pay; Request changes (note required); Decline (optional reason).
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
}) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [name, setName] = useState(clientName);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [paying, startPay] = useTransition();

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
    if (!sheet) return;
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

  const open = status === "sent" || status === "viewed" || status === "changes_requested";
  const needsDeposit = status === "approved" && depositCents > 0 && depositStatus !== "paid";

  if (!open && !needsDeposit) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe shadow-float backdrop-blur">
        <div className="mx-auto max-w-2xl space-y-2 px-4 pt-3">
          {needsDeposit ? (
            <>
              <Button variant="go" size="lg" className="w-full" onClick={pay} disabled={paying}>
                <CardIcon /> {paying ? "Opening secure checkout…" : `Pay ${formatMoney(depositCents, currency)} deposit`}
              </Button>
              {payError && <p className="text-center text-sm font-medium text-ink-soft">{payError}</p>}
            </>
          ) : expired ? (
            <p className="py-2 text-center text-sm font-medium text-ink-soft">
              This quote has expired — send {businessName} a message below for an updated one.
            </p>
          ) : (
            <>
              <Button variant="go" size="lg" className="w-full" onClick={() => setSheet("approve")}>
                <CheckIcon /> {depositCents > 0 ? "Approve & pay deposit" : "Approve quote"}
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={() => setSheet("request_changes")}>
                  Request changes
                </Button>
                <Button variant="ghost" className="flex-1 text-rose-700" onClick={() => setSheet("decline")}>
                  Decline
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center" onClick={() => !pending && setSheet(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            className="w-full max-w-lg space-y-4 rounded-t-3xl bg-surface p-5 pb-safe sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <h2 id="decision-title" className="text-xl font-extrabold">
              {sheet === "approve" ? "Approve this quote" : sheet === "request_changes" ? "Request changes" : "Decline this quote"}
            </h2>

            {sheet === "approve" && (
              <div className="space-y-2 rounded-2xl bg-canvas p-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular">{formatMoney(totalCents, currency)}</span>
                </div>
                {depositCents > 0 && (
                  <div className="flex justify-between text-ink-soft">
                    <span>Deposit due now</span>
                    <span className="tabular font-semibold">{formatMoney(depositCents, currency)}</span>
                  </div>
                )}
                <p className="flex gap-2 pt-1 text-sm text-muted">
                  <ShieldIcon width={18} height={18} className="shrink-0 text-go" />
                  Your approval is time-stamped and the price is locked. {businessName} can&apos;t change it afterwards.
                </p>
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">{sheet === "approve" ? "Type your full name to sign" : "Your name"}</span>
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
              <p className="text-sm font-medium text-rose-700" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" size="lg" onClick={() => setSheet(null)} disabled={pending}>
                Cancel
              </Button>
              <Button
                variant={sheet === "decline" ? "danger" : sheet === "approve" ? "go" : "primary"}
                size="lg"
                className="flex-1"
                onClick={submit}
                disabled={pending || !name.trim() || (sheet === "request_changes" && note.trim().length < 3)}
              >
                {pending
                  ? "Sending…"
                  : sheet === "approve"
                    ? `Approve ${formatMoney(totalCents, currency)}`
                    : sheet === "request_changes"
                      ? "Send request"
                      : "Decline quote"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
