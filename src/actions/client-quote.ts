"use server";

/**
 * Magic-link (client) actions for /q/[token].
 *
 * Clients have no account. Every action:
 *   1. validates the share token format and the payload with zod,
 *   2. resolves the quote by token with the service-role client (server only),
 *   3. checks the quote's state allows the action,
 *   4. performs a narrowly-scoped write.
 * The token is the capability; it's 192 bits of randomness and never logged.
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { publicEnv } from "@/lib/env";
import { isFullPayment, paymentReference } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import { kindFromMime, MAX_ATTACHMENTS_PER_QUOTE } from "@/lib/media";
import { parseLineItems } from "@/lib/quotes";
import { baseMime, buildObjectPath, createSignedUpload, statObject, type SignedUpload } from "@/lib/storage";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidShareToken } from "@/lib/tokens";
import type { Database } from "@/lib/database.types";
import type { ActionResult, QuoteRecord, QuoteStatus } from "@/lib/types";
import { confirmUploadSchema, decisionSchema, firstError, messageSchema, uploadRequestSchema } from "@/lib/validation";

const OPEN_STATUSES = ["sent", "viewed", "changes_requested"] as const;

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

async function quoteByToken(token: unknown): Promise<QuoteRecord | null> {
  if (!isValidShareToken(token)) return null;
  const { data } = await createAdminClient().from("quotes").select("*").eq("share_token", token).maybeSingle();
  return data;
}

function refresh(token: string) {
  revalidatePath(`/q/${token}`);
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function postClientMessage(token: string, input: unknown): Promise<ActionResult> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const quote = await quoteByToken(token);
  if (!quote) return fail("This link is no longer valid.");

  const { error } = await createAdminClient().from("quote_messages").insert({
    quote_id: quote.id,
    sender_role: "client",
    sender_name: parsed.data.sender_name,
    body: parsed.data.body,
  });
  if (error) return fail("Couldn't send your message. Please try again.");
  refresh(token);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Uploads (client photos / videos / voice notes)
// ---------------------------------------------------------------------------

export async function requestClientUpload(token: string, input: unknown): Promise<ActionResult<SignedUpload>> {
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const quote = await quoteByToken(token);
  if (!quote) return fail("This link is no longer valid.");

  const { count } = await createAdminClient()
    .from("quote_attachments")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", quote.id);
  if ((count ?? 0) >= MAX_ATTACHMENTS_PER_QUOTE) return fail("This quote has reached its file limit.");

  const path = buildObjectPath(quote.workspace_id, quote.id, "client", baseMime(parsed.data.mime_type));
  try {
    return { ok: true, data: await createSignedUpload(path) };
  } catch {
    return fail("Upload couldn't start. Please try again.");
  }
}

export async function confirmClientUpload(token: string, input: unknown): Promise<ActionResult> {
  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const quote = await quoteByToken(token);
  if (!quote) return fail("This link is no longer valid.");
  const v = parsed.data;

  // The path must be one we minted for *this* quote.
  if (!v.path.startsWith(`${quote.workspace_id}/${quote.id}/client-`)) return fail("Invalid upload.");
  const stat = await statObject(v.path);
  if (!stat) return fail("Upload didn't finish — please try again.");
  if (kindFromMime(stat.mimetype) !== v.kind) return fail("File type mismatch.");

  const admin = createAdminClient();
  const { data: att, error } = await admin
    .from("quote_attachments")
    .insert({
      quote_id: quote.id,
      uploaded_by: "client",
      kind: v.kind,
      storage_path: v.path,
      mime_type: stat.mimetype,
      size_bytes: stat.size,
      duration_seconds: v.duration_seconds ?? null,
      caption: v.caption,
    })
    .select("id")
    .single();
  if (error) return fail("Couldn't save your file.");

  const senderName = v.sender_name || quote.client_name;
  const body =
    v.kind === "audio" ? (v.caption ?? "") : v.caption || (v.kind === "image" ? "Sent a photo" : "Sent a video");
  // Voice notes become a thread message; photos/videos also leave a breadcrumb in the thread.
  await admin.from("quote_messages").insert({
    quote_id: quote.id,
    sender_role: "client",
    sender_name: senderName,
    body: v.as_message || v.kind === "audio" ? body : `📎 ${body}`,
    attachment_id: v.as_message || v.kind === "audio" ? att.id : null,
  });

  refresh(token);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export async function decideQuote(token: string, input: unknown): Promise<ActionResult<{ status: string }>> {
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const quote = await quoteByToken(token);
  if (!quote) return fail("This link is no longer valid.");
  if (!OPEN_STATUSES.includes(quote.status as (typeof OPEN_STATUSES)[number])) {
    return fail("This quote has already been decided.");
  }
  if (quote.valid_until && new Date(`${quote.valid_until}T23:59:59Z`) < new Date() && parsed.data.decision === "approve") {
    return fail("This quote has expired. Ask for an updated quote in the messages below.");
  }

  const h = await headers();
  const meta = {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
  };
  const now = new Date().toISOString();
  const d = parsed.data;

  const status: QuoteStatus = d.decision === "approve" ? "approved" : d.decision === "decline" ? "declined" : "changes_requested";
  const update: Database["public"]["Tables"]["quotes"]["Update"] =
    d.decision === "approve"
      ? {
          status,
          decided_at: now,
          decided_by_name: d.name,
          decision_note: d.note,
          decision_meta: meta,
          approved_snapshot: {
            title: quote.title,
            scope: quote.scope,
            line_items: parseLineItems(quote.line_items),
            currency: quote.currency,
            subtotal_cents: quote.subtotal_cents,
            tax_label: quote.tax_label,
            tax_rate: quote.tax_rate,
            tax_cents: quote.tax_cents,
            total_cents: quote.total_cents,
            deposit_cents: quote.deposit_cents,
            approved_at: now,
          },
          deposit_status: quote.deposit_cents > 0 ? (quote.deposit_status === "paid" ? "paid" : "unpaid") : "not_required",
        }
      : {
          status,
          decided_at: d.decision === "decline" ? now : null,
          decided_by_name: d.name,
          decision_note: d.note,
          decision_meta: meta,
        };

  // Conditional update guards against double-submits / races.
  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from("quotes")
    .update(update)
    .eq("id", quote.id)
    .in("status", [...OPEN_STATUSES])
    .select("id")
    .maybeSingle();
  if (error) return fail("Couldn't record your decision. Please try again.");
  if (!updated) return fail("This quote has already been decided.");

  const summary =
    d.decision === "approve"
      ? `✅ Approved the quote${d.note ? ` — ${d.note}` : ""}`
      : d.decision === "decline"
        ? `Declined the quote${d.note ? ` — ${d.note}` : ""}`
        : `✏️ Requested changes: ${d.note}`;
  await admin.from("quote_messages").insert({ quote_id: quote.id, sender_role: "client", sender_name: d.name, body: summary });

  refresh(token);
  return { ok: true, data: { status } };
}

// ---------------------------------------------------------------------------
// Deposit payment
// ---------------------------------------------------------------------------

/**
 * Returns a URL to pay the deposit:
 *   1. Stripe Checkout on the contractor's connected account (destination charge), or
 *   2. the contractor's own payment link (deposit_link_url), or
 *   3. an error explaining the contractor will be in touch.
 */
export async function startDepositPayment(token: string): Promise<ActionResult<{ url: string }>> {
  const quote = await quoteByToken(token);
  if (!quote) return fail("This link is no longer valid.");
  if (quote.status !== "approved") return fail("Approve the quote first.");
  if (quote.deposit_status === "paid") return fail("The deposit has already been paid. Thank you!");
  if (quote.deposit_cents <= 0) return fail("No deposit is required.");

  const { data: ws } = await createAdminClient()
    .from("workspaces")
    .select("business_name, stripe_connect_account_id, deposit_link_url")
    .eq("id", quote.workspace_id)
    .single();
  if (!ws) return fail("Business not found.");

  if (process.env.STRIPE_SECRET_KEY && ws.stripe_connect_account_id) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(ws.stripe_connect_account_id);
      if (account.charges_enabled) {
        const feeBps = Math.max(0, Number(process.env.STRIPE_DEPOSIT_FEE_BPS ?? 0) || 0);
        const fee = Math.floor((quote.deposit_cents * feeBps) / 10_000);
        const base = `${publicEnv.siteUrl}/q/${token}`;
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: quote.client_email ?? undefined,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: quote.currency.toLowerCase(),
                unit_amount: quote.deposit_cents,
                product_data: {
                  name: `${isFullPayment(quote.deposit_cents, quote.total_cents) ? "Payment" : "Deposit"} — ${quote.title}`,
                  description: ws.business_name,
                },
              },
            },
          ],
          payment_intent_data: {
            transfer_data: { destination: ws.stripe_connect_account_id },
            ...(fee > 0 ? { application_fee_amount: fee } : {}),
            metadata: { kind: "deposit", quote_id: quote.id },
          },
          metadata: { kind: "deposit", quote_id: quote.id },
          success_url: `${base}?paid=1`,
          cancel_url: base,
        });
        await createAdminClient()
          .from("quotes")
          .update({ deposit_checkout_session_id: session.id })
          .eq("id", quote.id);
        if (session.url) return { ok: true, data: { url: session.url } };
      }
    } catch (e) {
      console.error("Deposit checkout failed", e instanceof Error ? e.message : e);
    }
  }

  if (ws.deposit_link_url) return { ok: true, data: { url: ws.deposit_link_url } };
  return fail(`${ws.business_name} will send you payment details shortly.`);
}

// ---------------------------------------------------------------------------
// Bank transfer
// ---------------------------------------------------------------------------

/**
 * The client says they've paid by bank transfer. We can't see the bank, so this
 * just posts a note in the quote thread; the contractor confirms the money has
 * arrived with "Mark payment received". Idempotent: repeat taps don't spam the thread.
 */
export async function notifyBankTransfer(token: string, input: unknown): Promise<ActionResult> {
  const quote = await quoteByToken(token);
  if (!quote) return fail("This link is no longer valid.");
  if (quote.status !== "approved") return fail("Approve the quote first.");
  if (quote.deposit_status === "paid" || quote.deposit_cents <= 0) return fail("Nothing is due on this quote.");

  const name = typeof input === "object" && input && "name" in input ? String((input as { name: unknown }).name ?? "").trim().slice(0, 80) : "";
  const admin = createAdminClient();
  const { data: ws } = await admin.from("workspaces").select("bank_account_number").eq("id", quote.workspace_id).single();
  if (!ws?.bank_account_number) return fail("Bank transfer isn't set up for this business.");

  const ref = paymentReference(quote.id);
  const body = `🏦 Paid ${formatMoney(quote.deposit_cents, quote.currency)} by bank transfer (reference ${ref}). Please confirm when it arrives.`;
  const { data: existing } = await admin
    .from("quote_messages")
    .select("id")
    .eq("quote_id", quote.id)
    .eq("sender_role", "client")
    .eq("body", body)
    .limit(1);
  if (!existing?.length) {
    const { error } = await admin
      .from("quote_messages")
      .insert({ quote_id: quote.id, sender_role: "client", sender_name: name || quote.client_name, body });
    if (error) return fail("Couldn't send that. Please try again.");
  }
  refresh(token);
  return { ok: true, data: undefined };
}
