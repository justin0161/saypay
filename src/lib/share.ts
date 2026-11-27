import { formatMoney } from "./quote-math";

type ShareQuote = {
  share_token: string;
  title: string;
  client_name: string;
  client_phone: string | null;
  total_cents: number;
  deposit_cents: number;
  currency: string;
};

export function shareUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/$/, "")}/q/${token}`;
}

export function shareMessage(siteUrl: string, q: ShareQuote, businessName: string): string {
  const first = q.client_name.split(/\s+/)[0] || q.client_name;
  const deposit = q.deposit_cents > 0 ? ` (${formatMoney(q.deposit_cents, q.currency)} deposit to book)` : "";
  return [
    `Hi ${first}, here's your quote for "${q.title}" from ${businessName}: ${formatMoney(q.total_cents, q.currency)}${deposit}.`,
    `I've recorded a quick voice note walking you through it. You can reply, send photos, or approve here:`,
    shareUrl(siteUrl, q.share_token),
  ].join("\n\n");
}

/** Digits-only international number for wa.me. Assumes UK if a leading 0 is used. */
export function whatsappNumber(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return digits.length >= 8 ? digits : null;
}

export function whatsappLink(phone: string | null, text: string): string {
  const n = whatsappNumber(phone);
  return `https://wa.me/${n ?? ""}?text=${encodeURIComponent(text)}`;
}

export function smsLink(phone: string | null, text: string): string {
  // `?&body=` works on both iOS and Android.
  return `sms:${phone?.replace(/[^\d+]/g, "") ?? ""}?&body=${encodeURIComponent(text)}`;
}
