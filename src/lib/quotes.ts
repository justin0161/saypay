import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";
import { storageBucket } from "./env";
import type { LineItem, MediaItem, Quote, QuoteAttachment, QuoteMessage, QuoteRecord, ThreadMessage } from "./types";
import { lineItemSchema } from "./validation";

type Client = SupabaseClient<Database>;

export function parseLineItems(value: Json): LineItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const parsed = lineItemSchema.safeParse(raw);
    return parsed.success ? [parsed.data] : [];
  });
}

export function toQuote(record: QuoteRecord): Quote {
  return { ...record, line_items: parseLineItems(record.line_items) };
}

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Batch-sign storage paths. Works with either the user client (RLS) or admin client. */
export async function signPaths(client: Client, paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const { data } = await client.storage.from(storageBucket).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  }
  return map;
}

export function toMediaItem(a: QuoteAttachment, urls: Map<string, string>): MediaItem {
  return {
    id: a.id,
    kind: a.kind,
    mime_type: a.mime_type,
    caption: a.caption,
    duration_seconds: a.duration_seconds,
    uploaded_by: a.uploaded_by,
    is_walkthrough: a.is_walkthrough,
    created_at: a.created_at,
    url: urls.get(a.storage_path) ?? null,
  };
}

export type QuoteBundle = {
  walkthrough: MediaItem | null;
  gallery: MediaItem[];
  thread: ThreadMessage[];
};

/** Load attachments + messages for a quote and shape them for the UI. */
export async function loadQuoteBundle(client: Client, quoteId: string): Promise<QuoteBundle> {
  const [attachmentsRes, messagesRes] = await Promise.all([
    client.from("quote_attachments").select("*").eq("quote_id", quoteId).order("created_at", { ascending: true }),
    client.from("quote_messages").select("*").eq("quote_id", quoteId).order("created_at", { ascending: true }),
  ]);
  if (attachmentsRes.error) throw new Error(attachmentsRes.error.message);
  if (messagesRes.error) throw new Error(messagesRes.error.message);

  const attachments: QuoteAttachment[] = attachmentsRes.data ?? [];
  const messages: QuoteMessage[] = messagesRes.data ?? [];
  const urls = await signPaths(
    client,
    attachments.map((a) => a.storage_path),
  );

  const byId = new Map(attachments.map((a) => [a.id, a]));
  const messageAttachmentIds = new Set(messages.map((m) => m.attachment_id).filter(Boolean));

  const walkthroughRow = attachments.find((a) => a.is_walkthrough) ?? null;
  const gallery = attachments
    .filter((a) => !a.is_walkthrough && !messageAttachmentIds.has(a.id))
    .map((a) => toMediaItem(a, urls));

  const thread: ThreadMessage[] = messages.map((m) => {
    const att = m.attachment_id ? byId.get(m.attachment_id) : undefined;
    return {
      id: m.id,
      sender_role: m.sender_role,
      sender_name: m.sender_name,
      body: m.body,
      created_at: m.created_at,
      audio: att ? toMediaItem(att, urls) : null,
    };
  });

  return { walkthrough: walkthroughRow ? toMediaItem(walkthroughRow, urls) : null, gallery, thread };
}
