import type { LineItem } from "./types.ts";

export type DepositInput = { type: "percent"; percent: number } | { type: "fixed"; cents: number };

export type QuoteTotals = {
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  deposit_cents: number;
};

/** Line total in minor units, rounded half-up. Quantity may be fractional (e.g. 2.5 hours). */
export function lineTotalCents(item: Pick<LineItem, "quantity" | "unit_price_cents">): number {
  return Math.round(item.quantity * item.unit_price_cents);
}

/**
 * Single source of truth for quote arithmetic. Used by the builder (live
 * preview) and by Server Actions (authoritative). Never trust client totals.
 */
export function computeTotals(items: LineItem[], taxRatePercent: number, deposit: DepositInput): QuoteTotals {
  const subtotal = items.reduce((sum, item) => sum + lineTotalCents(item), 0);
  const tax = Math.round((subtotal * clamp(taxRatePercent, 0, 100)) / 100);
  const total = subtotal + tax;
  const rawDeposit =
    deposit.type === "percent"
      ? Math.round((total * clamp(deposit.percent, 0, 100)) / 100)
      : Math.round(deposit.cents);
  return {
    subtotal_cents: subtotal,
    tax_cents: tax,
    total_cents: total,
    deposit_cents: clamp(rawDeposit, 0, total),
  };
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** "12.50" | "12,50" | "£1,200" -> 1250 / 120000 cents. Returns null when unparsable. */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return null;
  // Treat a trailing ",dd" as decimal comma; otherwise commas are thousands separators.
  const normalised = /,\d{1,2}$/.test(cleaned) && !cleaned.includes(".")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const value = Number(normalised);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function formatMoney(cents: number, currency = "GBP", locale = "en-GB"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
