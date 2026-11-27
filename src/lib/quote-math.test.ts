import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, parseMoneyToCents, formatMoney } from "./quote-math.ts";

const items = [
  { id: "a", description: "Labour", quantity: 2.5, unit_price_cents: 4000 },
  { id: "b", description: "Materials", quantity: 1, unit_price_cents: 12999 },
];

test("computes subtotal, tax, total and percent deposit", () => {
  const t = computeTotals(items, 20, { type: "percent", percent: 25 });
  assert.equal(t.subtotal_cents, 22999);
  assert.equal(t.tax_cents, 4600);
  assert.equal(t.total_cents, 27599);
  assert.equal(t.deposit_cents, 6900);
});

test("fixed deposit is capped at total", () => {
  const t = computeTotals(items, 0, { type: "fixed", cents: 1_000_000 });
  assert.equal(t.deposit_cents, t.total_cents);
});

test("parses money strings", () => {
  assert.equal(parseMoneyToCents("12.50"), 1250);
  assert.equal(parseMoneyToCents("£1,200"), 120000);
  assert.equal(parseMoneyToCents("12,5"), 1250);
  assert.equal(parseMoneyToCents("abc"), null);
});

test("formats money", () => {
  assert.equal(formatMoney(120000, "GBP"), "£1,200");
  assert.equal(formatMoney(1250, "GBP"), "£12.50");
});

test("payment helpers", async () => {
  const { paymentReference, formatSortCode, isFullPayment } = await import("./format.ts");
  assert.equal(paymentReference("1b14c442-fa99-4b14-8879-cd880f9e4aa2"), "SP-1B14C4");
  assert.equal(formatSortCode("112233"), "11-22-33");
  assert.equal(isFullPayment(84960, 84960), true);
  assert.equal(isFullPayment(21240, 84960), false);
  assert.equal(isFullPayment(0, 0), false);
});
