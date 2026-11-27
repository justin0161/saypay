import { isFullPayment } from "@/lib/format";
import { formatMoney, lineTotalCents } from "@/lib/quote-math";
import type { Quote } from "@/lib/types";

/** Line items + totals. Shared by contractor and client views. */
export function QuoteSummary({ quote }: { quote: Quote }) {
  const c = quote.currency;
  return (
    <div>
      <ul className="divide-y divide-line">
        {quote.line_items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="font-medium break-words">{item.description}</p>
              {item.quantity !== 1 && (
                <p className="tabular text-sm text-muted">
                  {item.quantity} × {formatMoney(item.unit_price_cents, c)}
                </p>
              )}
            </div>
            <p className="tabular shrink-0 font-semibold">{formatMoney(lineTotalCents(item), c)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t border-line pt-3">
        {quote.tax_cents > 0 && (
          <>
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular">{formatMoney(quote.subtotal_cents, c)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>
                {quote.tax_label} {Number(quote.tax_rate)}%
              </dt>
              <dd className="tabular">{formatMoney(quote.tax_cents, c)}</dd>
            </div>
          </>
        )}
        <div className="flex items-baseline justify-between pt-1">
          <dt className="font-display text-xl font-bold">Total</dt>
          <dd className="tabular text-2xl font-semibold">{formatMoney(quote.total_cents, c)}</dd>
        </div>
        {quote.deposit_cents > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-hivis-soft px-4 py-3 font-semibold text-hivis-ink">
            <dt>
              {isFullPayment(quote.deposit_cents, quote.total_cents)
                ? "Pay in full on acceptance"
                : `Deposit to book${quote.deposit_type === "percent" && quote.deposit_percent ? ` (${Number(quote.deposit_percent)}%)` : ""}`}
            </dt>
            <dd className="tabular">{formatMoney(quote.deposit_cents, c)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
