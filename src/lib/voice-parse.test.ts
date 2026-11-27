import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSpokenQuote, wordsToDigits } from "./voice-parse.ts";

test("spoken numbers become digits", () => {
  assert.equal(wordsToDigits("two thousand one hundred and fifty pounds"), "2150 pounds");
  assert.equal(wordsToDigits("a hundred and twenty quid"), "120 quid");
  assert.equal(wordsToDigits("twenty five percent"), "25 percent");
  assert.equal(wordsToDigits("two grand"), "2000 pounds");
  assert.equal(wordsToDigits("fit the radiator"), "fit the radiator");
});

test("full sentence with punctuation", () => {
  const d = parseSpokenQuote(
    "Boiler swap for Sarah Okafor. Supply and fit combi boiler, two thousand one hundred and fifty pounds. Magnetic filter, a hundred and twenty quid. Plus VAT, 25% deposit.",
  );
  assert.equal(d.title, "Boiler swap");
  assert.equal(d.client_name, "Sarah Okafor");
  assert.deepEqual(d.line_items, [
    { description: "Supply and fit combi boiler", quantity: 1, unit_price: 2150 },
    { description: "Magnetic filter", quantity: 1, unit_price: 120 },
  ]);
  assert.deepEqual(d.vat, { enabled: true, rate: null });
  assert.deepEqual(d.payment, { type: "percent", percent: 25, amount: null });
});

test("no punctuation (Chrome-style)", () => {
  const d = parseSpokenQuote(
    "back bedroom radiator for priya shah remove old radiator 95 pounds supply and fit new radiator 245 pounds plus vat 25 percent deposit",
  );
  assert.equal(d.title, "Back bedroom radiator");
  assert.equal(d.client_name, "Priya Shah");
  assert.deepEqual(
    d.line_items.map((i) => [i.description, i.unit_price]),
    [
      ["Remove old radiator", 95],
      ["Supply and fit new radiator", 245],
    ],
  );
  assert.equal(d.vat.enabled, true);
  assert.equal(d.payment.percent, 25);
});

test("quantities with each, no VAT, pay in full", () => {
  const d = parseSpokenQuote("Radiator valves for Tom Wilkins. 2 thermostatic valves at £24 each. Labour £60. No VAT. Pay in full.");
  assert.equal(d.client_name, "Tom Wilkins");
  assert.deepEqual(d.line_items, [
    { description: "Thermostatic valves", quantity: 2, unit_price: 24 },
    { description: "Labour", quantity: 1, unit_price: 60 },
  ]);
  assert.equal(d.vat.enabled, false);
  assert.equal(d.payment.type, "full");
});

test("client is …, half upfront, grand", () => {
  const d = parseSpokenQuote("Job is new kitchen. Client is James Patel. Kitchen units two grand. Fitting 800 quid. Half upfront.");
  assert.equal(d.title, "New kitchen");
  assert.equal(d.client_name, "James Patel");
  assert.deepEqual(
    d.line_items.map((i) => [i.description, i.unit_price]),
    [
      ["Kitchen units", 2000],
      ["Fitting", 800],
    ],
  );
  assert.equal(d.payment.percent, 50);
});

test("fixed deposit and VAT rate", () => {
  const d = parseSpokenQuote("Garden wall for Mrs Jones, rebuild wall £1,450, VAT at 20 percent, deposit of £300");
  assert.equal(d.client_name, "Mrs Jones");
  assert.equal(d.line_items[0]?.unit_price, 1450);
  assert.deepEqual(d.vat, { enabled: true, rate: 20 });
  assert.deepEqual(d.payment, { type: "fixed", percent: null, amount: 300 });
});

test("says nothing useful → nothing invented", () => {
  const d = parseSpokenQuote("um hello testing");
  assert.equal(d.client_name, null);
  assert.deepEqual(d.line_items, []);
  assert.equal(d.payment.type, null);
  assert.equal(d.vat.enabled, null);
});

test("hours each, VAT stated first, money before description", () => {
  const d = parseSpokenQuote("Fuse box upgrade for Dan Lee plus VAT. New consumer unit £450. Labour 6 hours at £40 an hour. 25 percent deposit.");
  assert.equal(d.title, "Fuse box upgrade");
  assert.equal(d.client_name, "Dan Lee");
  assert.equal(d.vat.enabled, true);
  assert.deepEqual(d.line_items, [
    { description: "New consumer unit", quantity: 1, unit_price: 450 },
    { description: "Labour 6 hours", quantity: 6, unit_price: 40 },
  ]);
  assert.equal(d.payment.percent, 25);
});
