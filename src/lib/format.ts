import type { DepositStatus, QuoteStatus } from "./types";

export const STATUS_META: Record<QuoteStatus, { label: string; tone: Tone }> = {
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Viewed", tone: "info" },
  changes_requested: { label: "Changes requested", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
};

export const DEPOSIT_META: Record<DepositStatus, { label: string; tone: Tone }> = {
  not_required: { label: "No deposit", tone: "neutral" },
  unpaid: { label: "Payment due", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
};

export type Tone = "neutral" | "info" | "warning" | "success" | "danger";

export function isDecided(status: QuoteStatus): boolean {
  return status === "approved" || status === "declined";
}

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.round((now - new Date(iso).getTime()) / 1000);
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.round(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Short, bank-friendly payment reference for a quote, e.g. "SP-1B14C4". */
export function paymentReference(quoteId: string): string {
  return `SP-${quoteId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/** "112233" → "11-22-33". */
export function formatSortCode(code: string): string {
  return code.replace(/\D/g, "").replace(/^(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3");
}

/** True when the amount due on acceptance is the whole quote (pay in full rather than a deposit). */
export function isFullPayment(depositCents: number, totalCents: number): boolean {
  return totalCents > 0 && depositCents >= totalCents;
}
