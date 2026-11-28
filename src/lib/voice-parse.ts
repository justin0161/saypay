/**
 * Free, on-device "fill the quote from what I said" parser. No AI and no
 * network: plain rules tuned for how UK tradespeople describe a quote, e.g.
 *
 *   "Boiler swap for Sarah Okafor. Supply and fit combi boiler, two thousand
 *    one hundred and fifty pounds. Magnetic filter, a hundred and twenty quid.
 *    Plus VAT, 25% deposit."
 *
 * It works best when each item is followed by its price. Anything it can't
 * find is left null so the user fills it in.
 */

export type VoiceQuoteDraft = {
  title: string | null;
  client_name: string | null;
  line_items: { description: string; quantity: number; unit_price: number | null }[];
  vat: { enabled: boolean | null; rate: number | null };
  payment: { type: "none" | "percent" | "fixed" | "full" | null; percent: number | null; amount: number | null };
};

// ---------------------------------------------------------------------------
// Spoken numbers → digits
// ---------------------------------------------------------------------------

const SMALL: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const SCALE = new Set(["hundred", "thousand", "grand"]);

const isNumWord = (w: string) => w in SMALL || w in TENS || SCALE.has(w);

/** Converts runs like "two thousand one hundred and fifty" into "2150", and "two grand" into "2000 pounds". */
export function wordsToDigits(input: string): string {
  const tokens = input.split(/(\s+)/);
  const out: string[] = [];
  let total = 0;
  let current = 0;
  let inNumber = false;
  let money = false;
  let pendingSpace = "";

  const flush = () => {
    if (inNumber) {
      out.push(String(total + current) + (money ? " pounds" : ""));
      if (pendingSpace) out.push(pendingSpace);
    }
    total = 0;
    current = 0;
    inNumber = false;
    money = false;
    pendingSpace = "";
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i] ?? "";
    if (/^\s+$/.test(tok)) {
      if (inNumber) pendingSpace = tok;
      else out.push(tok);
      continue;
    }
    const m = tok.match(/^([a-z]+)([^a-z]*)$/i);
    const word = m ? (m[1] ?? "").toLowerCase() : "";
    const trail = m ? (m[2] ?? "") : "";
    const next = (tokens.slice(i + 1).find((t) => !/^\s+$/.test(t)) ?? "").toLowerCase().replace(/[^a-z]/g, "");
    const digit = tok.match(/^(\d+(?:\.\d+)?)([^\d.]*)$/);

    // "a hundred", "a thousand", "a grand"
    if (!inNumber && (word === "a" || word === "an") && SCALE.has(next) && !trail) {
      inNumber = true;
      current = 1;
      continue;
    }
    // "2 thousand" / "2 grand"
    if (digit && !digit[2] && SCALE.has(next) && !inNumber) {
      inNumber = true;
      current = Number(digit[1]);
      continue;
    }
    if (word && isNumWord(word)) {
      inNumber = true;
      pendingSpace = ""; // the space before this word was inside the number
      if (word in SMALL) current += SMALL[word] ?? 0;
      else if (word in TENS) current += TENS[word] ?? 0;
      else if (word === "hundred") current = (current || 1) * 100;
      else {
        total += (current || 1) * 1000;
        current = 0;
        if (word === "grand") money = true;
      }
      if (trail) {
        out.push(String(total + current) + (money ? " pounds" : ""));
        out.push(trail);
        total = current = 0;
        inNumber = money = false;
        pendingSpace = "";
      }
      continue;
    }
    // "and" between number words ("one hundred and fifty")
    if (inNumber && word === "and" && !trail && isNumWord(next)) {
      pendingSpace = "";
      continue;
    }
    flush();
    out.push(tok);
  }
  flush();
  return out.join("");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const titleCase = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bMc([a-z])/g, (_, c: string) => `Mc${c.toUpperCase()}`);

/** Words that end a client name ("for Sarah Okafor supply and fit…"). */
const NAME_STOP = new Set([
  "supply", "supplying", "fit", "fitting", "replace", "replacing", "install", "installing", "remove", "removing", "repair", "repairing",
  "fix", "fixing", "and", "the", "a", "an", "to", "at", "with", "plus", "item", "items", "labour", "new", "old", "of", "in", "on", "it",
  "is", "for", "then", "next", "first", "please", "job", "quote", "price", "materials", "who", "lives", "address",
  "rebuild", "rebuilding", "build", "building", "paint", "painting", "service", "servicing", "renew", "renewing", "upgrade",
  "upgrading", "clean", "cleaning", "strip", "stripping", "lay", "laying", "tile", "tiling", "plaster", "plastering", "wire",
  "rewire", "rewiring", "convert", "converting", "change", "changing", "swap", "swapping", "check", "checking", "test", "testing",
]);

const FILLER_START = /^(?:(?:and|then|next|also|plus|item|line|another|first|second|third|after that|so|ok|okay|right|um|uh|the|for|is|it's|its|that's|thats)\b[\s,:.-]*)+/i;
const FILLER_END = /(?:[\s,:.-]*\b(?:at|for|costs?|costing|is|which is|that's|thats|it's|its|comes to|coming to|priced at|price|will be|would be|that|and|of|about|around|roughly)\b)+[\s,:.-]*$/i;

function cleanDescription(s: string): string {
  return capitalise(
    s
      .replace(/[\s,;:.!?-]+/g, " ")
      .trim()
      .replace(FILLER_START, "")
      .replace(FILLER_END, "")
      .trim(),
  );
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export function parseSpokenQuote(raw: string): VoiceQuoteDraft {
  const draft: VoiceQuoteDraft = {
    title: null,
    client_name: null,
    line_items: [],
    vat: { enabled: null, rate: null },
    payment: { type: null, percent: null, amount: null },
  };

  // 1. Normalise: lowercase, spoken numbers → digits, tidy money formats.
  let text = wordsToDigits(` ${raw.toLowerCase().replace(/[’']/g, "'")} `)
    .replace(/(\d),(?=\d{3}\b)/g, "$1") // 2,150 → 2150
    .replace(/(\d+(?:\.\d+)?)\s?k\b/g, (_, n: string) => `${Math.round(Number(n) * 1000)} pounds`) // 2.5k
    .replace(/£\s?(\d)/g, "£$1")
    .replace(/(\d)\s?%/g, "$1 percent")
    .replace(/\s+/g, " ");

  const cut = (re: RegExp) => {
    text = text.replace(re, " . ");
  };

  // 2. Payment terms.
  const full = /\b(?:pay(?:ment)?|paid|payable)\s+in\s+full\b|\bfull\s+(?:payment|amount|price)(?:\s+(?:up ?front|now|on acceptance))?\b|\b100 percent(?:\s+(?:deposit|up ?front))?\b|\bpay(?:\s+it)?\s+all\s+up ?front\b/;
  const none = /\bno\s+deposit\b|\bnothing\s+up ?front\b|\bpay(?:ment)?\s+on\s+completion\b|\bno\s+money\s+up ?front\b/;
  const pct = /\b(\d+(?:\.\d+)?)\s+percent\s+(?:deposit|up ?front|now)\b|\bdeposit\s+(?:of\s+)?(\d+(?:\.\d+)?)\s+percent\b/;
  const half = /\bhalf\s+(?:up ?front|deposit|now|the money up ?front)\b|\b50 50\b/;
  const fixed = /\b(?:£(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s+(?:pounds?|quid))\s+deposit\b|\bdeposit\s+(?:of\s+)?(?:£(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)(?:\s+(?:pounds?|quid))?)\b/;
  let m: RegExpMatchArray | null;
  if (full.test(text)) {
    draft.payment.type = "full";
    cut(new RegExp(full.source, "g"));
  } else if (none.test(text)) {
    draft.payment.type = "none";
    cut(new RegExp(none.source, "g"));
  } else if ((m = text.match(pct))) {
    const p = Number(m[1] ?? m[2]);
    if (p >= 0 && p <= 100) Object.assign(draft.payment, { type: p === 100 ? "full" : "percent", percent: p === 100 ? null : p });
    cut(pct);
  } else if (half.test(text)) {
    Object.assign(draft.payment, { type: "percent", percent: 50 });
    cut(half);
  } else if ((m = text.match(fixed))) {
    const amt = Number(m[1] ?? m[2] ?? m[3] ?? m[4]);
    if (amt > 0) Object.assign(draft.payment, { type: "fixed", amount: amt });
    cut(fixed);
  }

  // 3. VAT.
  const vatRate = /\bvat\s+(?:at\s+|of\s+)?(\d+(?:\.\d+)?)\s+percent\b|\b(\d+(?:\.\d+)?)\s+percent\s+vat\b/;
  const vatOff = /\b(?:no|without|excluding|exclude|zero)\s+vat\b|\bnot\s+vat\s+registered\b|\bvat\s+free\b/;
  const vatOn = /\b(?:plus|add|adding|with|including|inc|and|also)\s+vat\b|\bvat\s+on\s+top\b|\bvat\s+included\b|^\s*vat\b|[.,]\s*vat\b/;
  if ((m = text.match(vatRate))) {
    const r = Number(m[1] ?? m[2]);
    if (r > 0 && r <= 100) draft.vat = { enabled: true, rate: r };
    cut(vatRate);
  } else if (vatOff.test(text)) {
    draft.vat.enabled = false;
    cut(new RegExp(vatOff.source, "g"));
  } else if (vatOn.test(text)) {
    draft.vat.enabled = true;
    cut(new RegExp(vatOn.source, "g"));
  }

  // 4. Client name: "client is X", "customer X", or "... for X".
  const clientRe = /\b(?:client|customer)(?:'s name)?(?:\s+is|\s+name is|\s*:)?\s+([a-z][a-z'-]*(?:\s+[a-z][a-z'-]*){0,2})/;
  const forRe = /\bfor\s+((?:(?:mrs|mr|ms|miss|dr)\.?\s+)?[a-z][a-z'-]*(?:\s+[a-z][a-z'-]*){0,2})/;
  // Names are at most two words (plus a title like "Mrs"), so "for sarah okafor combi boiler…"
  // without punctuation still gives "Sarah Okafor".
  const takeName = (words: string) => {
    const kept: string[] = [];
    let limit = 2;
    for (const w of words.split(/\s+/)) {
      if (NAME_STOP.has(w) || /\d/.test(w) || kept.length >= limit) break;
      if (kept.length === 0 && /^(?:mrs|mr|ms|miss|dr)\.?$/.test(w)) limit = 3;
      kept.push(w);
    }
    return kept.length ? titleCase(kept.join(" ")) : null;
  };
  // Only look for "for X" before the first price, so "for the bathroom" later on isn't a client.
  const firstPrice = text.search(/£\d|\d+(?:\.\d+)?\s+(?:pounds?|quid)\b/);
  const head = firstPrice >= 0 ? text.slice(0, firstPrice) : text;
  let titleEnd = -1;
  if ((m = text.match(clientRe)) && m.index !== undefined) {
    draft.client_name = takeName(m[1] ?? "");
    if (draft.client_name) text = text.slice(0, m.index) + " . " + text.slice(m.index + m[0].length - (m[1]?.length ?? 0) + draft.client_name.length);
  } else if ((m = head.match(forRe)) && m.index !== undefined) {
    const name = takeName(m[1] ?? "");
    if (name) {
      draft.client_name = name;
      titleEnd = m.index;
      const nameEnd = m.index + m[0].indexOf(m[1] ?? "") + name.length;
      // Title is whatever came before "for <name>" in that sentence.
      const before = text.slice(0, m.index);
      const sentenceStart = Math.max(before.lastIndexOf(". "), before.lastIndexOf("? "), before.lastIndexOf("! "));
      const t = cleanDescription(before.slice(sentenceStart + 1).replace(/\b(?:quote|job|new quote)\b/g, " "));
      if (t && t.length <= 80) draft.title = t;
      text = text.slice(0, sentenceStart + 1) + " . " + text.slice(nameEnd);
    }
  }
  void titleEnd;

  // Explicit "job is X" / "job: X" title.
  if (!draft.title && (m = text.match(/\b(?:job|title)(?:\s+is|\s*:)\s+([^.]+?)(?=\s*(?:\.|$|£\d|\d))/))) {
    const t = cleanDescription(m[1] ?? "");
    if (t) {
      draft.title = t;
      text = text.replace(m[0], " . ");
    }
  }

  // 5. Line items: each price closes an item; its description is the text since the previous item.
  const money = /£(\d+(?:\.\d+)?)(\s+each|\s+per\s+[a-z]+|\s+an?\s+(?:hour|day|metre|meter|unit|room|item|sq m|square metre))?|(\d+(?:\.\d+)?)\s+(?:pounds?|quid)(\s+each|\s+per\s+[a-z]+|\s+an?\s+(?:hour|day|metre|meter|unit|room|item|sq m|square metre))?/g;
  const found = [...text.matchAll(money)];
  if (found.length) {
    let from = 0;
    for (const f of found) {
      const start = f.index ?? 0;
      const price = Number(f[1] ?? f[3]);
      const perUnit = Boolean(f[2] ?? f[4]);
      let desc = text.slice(from, start);
      // Description: keep only the last sentence-ish chunk before the price.
      const parts = desc.split(/\s[.!?;]\s|\.\s/);
      desc = parts[parts.length - 1] ?? desc;
      let quantity = 1;
      const qty = desc.match(/^\s*(?:and\s+|then\s+|plus\s+)?(\d+(?:\.\d+)?)\s+(?!percent)(.+)$/);
      const atPrice = /\bat\s*$/.test(desc.trim());
      if (qty && (perUnit || atPrice)) {
        quantity = Number(qty[1]);
        desc = qty[2] ?? desc;
      } else if (perUnit && (m = desc.match(/(\d+(?:\.\d+)?)\s+(?:hours?|days?|metres?|meters?|m|units?|x)\b/))) {
        quantity = Number(m[1]);
      }
      const description = cleanDescription(desc);
      if (description || draft.line_items.length === 0) {
        draft.line_items.push({ description: description || draft.title || "Work", quantity: quantity > 0 ? quantity : 1, unit_price: price });
      }
      from = start + f[0].length;
    }
  } else {
    // No currency words at all: treat "<description> <number>" chunks as items.
    for (const chunk of text.split(/\s[.!?;,]\s|[.!?;,]\s/)) {
      const c = chunk.trim().match(/^(.*\D)\s(\d+(?:\.\d+)?)$/);
      if (!c) continue;
      const description = cleanDescription(c[1] ?? "");
      const price = Number(c[2]);
      if (description && price > 0) draft.line_items.push({ description, quantity: 1, unit_price: price });
    }
  }

  // A single item with no title: use the item as the title.
  if (!draft.title && draft.line_items.length === 1) draft.title = draft.line_items[0]?.description ?? null;

  return draft;
}
