import type { AttachmentKind, DepositStatus, QuoteStatus, SenderRole, Tables } from "./database.types";

export type { AttachmentKind, DepositStatus, QuoteStatus, SenderRole };

export type Workspace = Tables<"workspaces">;
export type QuoteRecord = Tables<"quotes">;
export type QuoteMessage = Tables<"quote_messages">;
export type QuoteAttachment = Tables<"quote_attachments">;

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
};

/** A quote with line_items parsed into a typed array. */
export type Quote = Omit<QuoteRecord, "line_items"> & { line_items: LineItem[] };

/** Attachment enriched with a short-lived signed URL for display. */
export type MediaItem = Pick<
  QuoteAttachment,
  "id" | "kind" | "mime_type" | "caption" | "duration_seconds" | "uploaded_by" | "is_walkthrough" | "created_at"
> & { url: string | null };

export type ThreadMessage = Pick<QuoteMessage, "id" | "sender_role" | "sender_name" | "body" | "created_at"> & {
  audio: MediaItem | null;
};

/** Public business info rendered on the client magic-link page. */
export type BusinessCard = Pick<
  Workspace,
  "business_name" | "contact_name" | "contact_phone" | "contact_email" | "trade" | "brand_color"
> & { logo_url: string | null };

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
