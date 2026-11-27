"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireWorkspace } from "@/lib/auth";
import { freeQuoteLimit, isBillingConfigured } from "@/lib/env";
import { kindFromMime } from "@/lib/media";
import { computeTotals } from "@/lib/quote-math";
import { baseMime, buildObjectPath, createSignedUpload, removeObjects, statObject, type SignedUpload } from "@/lib/storage";
import { isSubscriptionActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { generateShareToken } from "@/lib/tokens";
import type { ActionResult } from "@/lib/types";
import {
  confirmUploadSchema,
  fieldErrors,
  firstError,
  messageSchema,
  quoteInputSchema,
  uploadRequestSchema,
  uuidSchema,
  type QuoteInput,
} from "@/lib/validation";

function fail(error: string, fields?: Record<string, string>): { ok: false; error: string; fieldErrors?: Record<string, string> } {
  return { ok: false, error, fieldErrors: fields };
}

/** Load a quote the current contractor owns (RLS enforces ownership). */
async function ownedQuote(quoteId: string) {
  const id = uuidSchema.parse(quoteId);
  const supabase = await createClient();
  const { data, error } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Quote not found");
  return { supabase, quote: data };
}

// ---------------------------------------------------------------------------
// Uploads (contractor). Files go straight from the browser to Supabase Storage
// using a one-time signed upload URL; the server only mints & verifies.
// ---------------------------------------------------------------------------

/** `folderId` is the quote id — or the draft id while a quote is being built. */
export async function requestOwnerUpload(folderId: string, input: unknown): Promise<ActionResult<SignedUpload>> {
  const folder = uuidSchema.safeParse(folderId);
  const parsed = uploadRequestSchema.safeParse(input);
  if (!folder.success) return fail("Invalid upload target");
  if (!parsed.success) return fail(firstError(parsed.error));

  const { workspace } = await requireWorkspace();
  const mime = baseMime(parsed.data.mime_type);
  const path = buildObjectPath(workspace.id, folder.data, "contractor", mime);
  try {
    return { ok: true, data: await createSignedUpload(path) };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload failed");
  }
}

/** Attach an uploaded file to an existing quote (detail page: gallery or voice reply). */
export async function confirmOwnerUpload(quoteId: string, input: unknown): Promise<ActionResult> {
  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error));
  const { workspace } = await requireWorkspace();
  const { supabase, quote } = await ownedQuote(quoteId);
  const v = parsed.data;

  if (!v.path.startsWith(`${workspace.id}/${quote.id}/contractor-`)) return fail("Invalid file path");
  const stat = await statObject(v.path);
  if (!stat) return fail("Upload not found — please try again");
  if (kindFromMime(stat.mimetype) !== v.kind) return fail("File type mismatch");

  const { data: att, error } = await supabase
    .from("quote_attachments")
    .insert({
      quote_id: quote.id,
      uploaded_by: "contractor",
      kind: v.kind,
      storage_path: v.path,
      mime_type: stat.mimetype,
      size_bytes: stat.size,
      duration_seconds: v.duration_seconds ?? null,
      caption: v.caption,
    })
    .select("id")
    .single();
  if (error) return fail(error.message);

  if (v.as_message) {
    const { error: msgErr } = await supabase.from("quote_messages").insert({
      quote_id: quote.id,
      sender_role: "contractor",
      sender_name: workspace.contact_name || workspace.business_name,
      body: v.caption ?? "",
      attachment_id: att.id,
    });
    if (msgErr) return fail(msgErr.message);
  }

  revalidatePath(`/quotes/${quote.id}`);
  return { ok: true };
}

export async function deleteAttachment(attachmentId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(attachmentId);
  if (!id.success) return fail("Invalid attachment");
  await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quote_attachments")
    .delete()
    .eq("id", id.data)
    .eq("uploaded_by", "contractor")
    .select("storage_path, quote_id")
    .maybeSingle();
  if (error) return fail(error.message);
  if (!data) return fail("Attachment not found");
  await removeObjects([data.storage_path]);
  revalidatePath(`/quotes/${data.quote_id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Create / update quotes
// ---------------------------------------------------------------------------

function buildQuoteColumns(v: z.output<typeof quoteInputSchema>, currency: string, taxLabel: string) {
  const taxRate = v.tax_enabled ? v.tax_rate : 0;
  const totals = computeTotals(v.line_items, taxRate, v.deposit);
  return {
    title: v.title,
    scope: v.scope,
    client_name: v.client_name,
    client_email: v.client_email,
    client_phone: v.client_phone,
    line_items: v.line_items,
    currency,
    tax_label: taxLabel,
    tax_rate: taxRate,
    valid_until: v.valid_until,
    deposit_type: v.deposit.type,
    deposit_percent: v.deposit.type === "percent" ? v.deposit.percent : null,
    accept_card: v.accept_card,
    accept_bank: v.accept_bank,
    ...totals,
  };
}

async function attachStaged(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  quoteId: string,
  staged: z.output<typeof quoteInputSchema>["attachments"],
): Promise<string | null> {
  if (staged.length === 0) return null;
  const rows = [];
  let walkthroughSeen = false;
  for (const a of staged) {
    if (!a.path.startsWith(`${workspaceId}/${quoteId}/contractor-`)) return "Invalid file path";
    const stat = await statObject(a.path);
    if (!stat) return "One of your uploads didn't finish — please re-add it";
    if (kindFromMime(stat.mimetype) !== a.kind) return "File type mismatch";
    const isWalkthrough = a.is_walkthrough && a.kind === "audio" && !walkthroughSeen;
    if (isWalkthrough) walkthroughSeen = true;
    rows.push({
      quote_id: quoteId,
      uploaded_by: "contractor" as const,
      kind: a.kind,
      storage_path: a.path,
      mime_type: stat.mimetype,
      size_bytes: stat.size,
      duration_seconds: a.duration_seconds ?? null,
      caption: a.caption,
      is_walkthrough: isWalkthrough,
    });
  }
  if (walkthroughSeen) {
    // Replace any previous walkthrough (edit flow).
    const { data: old } = await supabase
      .from("quote_attachments")
      .delete()
      .eq("quote_id", quoteId)
      .eq("is_walkthrough", true)
      .select("storage_path");
    await removeObjects((old ?? []).map((o) => o.storage_path));
  }
  const { error } = await supabase.from("quote_attachments").insert(rows);
  return error ? error.message : null;
}

export async function createQuote(input: QuoteInput): Promise<ActionResult<{ id: string }>> {
  const parsed = quoteInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error), fieldErrors(parsed.error));
  const v = parsed.data;

  const { workspace } = await requireWorkspace();
  const supabase = await createClient();

  if (isBillingConfigured() && !isSubscriptionActive(workspace.subscription_status)) {
    const { count } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id);
    if ((count ?? 0) >= freeQuoteLimit()) {
      return fail(`You've used your ${freeQuoteLimit()} free quotes. Upgrade to SayPay Pro in Settings to keep sending.`);
    }
  }

  const columns = buildQuoteColumns(v, workspace.currency, workspace.tax_label);
  const { error } = await supabase.from("quotes").insert({
    id: v.draft_id,
    workspace_id: workspace.id,
    share_token: generateShareToken(),
    status: "sent",
    deposit_status: columns.deposit_cents > 0 ? "unpaid" : "not_required",
    ...columns,
  });
  if (error) {
    if (error.code === "23505") return fail("This quote was already saved — refresh the dashboard.");
    return fail(error.message);
  }

  const attachError = await attachStaged(supabase, workspace.id, v.draft_id, v.attachments);
  if (attachError) return fail(`Quote saved, but media failed: ${attachError}`);

  revalidatePath("/dashboard");
  redirect(`/quotes/${v.draft_id}?sent=1`);
}

export async function updateQuote(quoteId: string, input: QuoteInput): Promise<ActionResult<{ id: string }>> {
  const parsed = quoteInputSchema.safeParse(input);
  if (!parsed.success) return fail(firstError(parsed.error), fieldErrors(parsed.error));
  const v = parsed.data;
  const { workspace } = await requireWorkspace();
  const { supabase, quote } = await ownedQuote(quoteId);

  if (quote.status === "approved" || quote.status === "declined") {
    return fail("This quote has been decided and is locked.");
  }
  if (v.draft_id !== quote.id) return fail("Mismatched quote");

  const columns = buildQuoteColumns(v, quote.currency, quote.tax_label);
  const { error } = await supabase
    .from("quotes")
    .update({
      ...columns,
      status: "sent", // re-send: changes requested -> sent
      deposit_status:
        columns.deposit_cents <= 0 ? "not_required" : quote.deposit_status === "paid" ? "paid" : "unpaid",
    })
    .eq("id", quote.id);
  if (error) return fail(error.message);

  const attachError = await attachStaged(supabase, workspace.id, quote.id, v.attachments);
  if (attachError) return fail(`Saved, but media failed: ${attachError}`);

  await supabase.from("quote_messages").insert({
    quote_id: quote.id,
    sender_role: "contractor",
    sender_name: workspace.contact_name || workspace.business_name,
    body: "I've updated the quote — take another look when you get a sec.",
  });

  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quote.id}`);
  redirect(`/quotes/${quote.id}?sent=1`);
}

export async function deleteQuote(quoteId: string): Promise<ActionResult> {
  const { supabase, quote } = await ownedQuote(quoteId);
  if (quote.status === "approved") return fail("Approved quotes are kept for your records.");
  const { data: atts } = await supabase.from("quote_attachments").select("storage_path").eq("quote_id", quote.id);
  const { error } = await supabase.from("quotes").delete().eq("id", quote.id);
  if (error) return fail(error.message);
  await removeObjects((atts ?? []).map((a) => a.storage_path));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Thread & deposit
// ---------------------------------------------------------------------------

export async function postContractorMessage(quoteId: string, body: string): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const parsed = messageSchema.safeParse({ body, sender_name: workspace.contact_name || workspace.business_name });
  if (!parsed.success) return fail(firstError(parsed.error));
  const { supabase, quote } = await ownedQuote(quoteId);
  const { error } = await supabase.from("quote_messages").insert({
    quote_id: quote.id,
    sender_role: "contractor",
    sender_name: parsed.data.sender_name,
    body: parsed.data.body,
  });
  if (error) return fail(error.message);
  revalidatePath(`/quotes/${quote.id}`);
  return { ok: true };
}

/** Manual reconciliation for deposits paid by bank transfer, cash, or an external link. */
export async function setDepositPaid(quoteId: string, paid: boolean): Promise<ActionResult> {
  const { supabase, quote } = await ownedQuote(quoteId);
  if (quote.deposit_cents <= 0) return fail("This quote has no deposit.");
  const { error } = await supabase
    .from("quotes")
    .update({ deposit_status: paid ? "paid" : "unpaid", deposit_paid_at: paid ? new Date().toISOString() : null })
    .eq("id", quote.id);
  if (error) return fail(error.message);
  revalidatePath(`/quotes/${quote.id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
