/**
 * Database types mirroring supabase/migrations/001_init.sql.
 * Regenerate with: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type QuoteStatus = "sent" | "viewed" | "changes_requested" | "approved" | "declined";
export type DepositStatus = "not_required" | "unpaid" | "paid";
export type SenderRole = "contractor" | "client";
export type AttachmentKind = "image" | "video" | "audio";

type WorkspaceRow = {
  id: string;
  owner_id: string;
  business_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  trade: string | null;
  logo_path: string | null;
  brand_color: string;
  currency: string;
  default_deposit_percent: number;
  default_tax_rate: number;
  tax_label: string;
  deposit_link_url: string | null;
  bank_account_name: string | null;
  bank_sort_code: string | null;
  bank_account_number: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_price_id: string | null;
  current_period_end: string | null;
  stripe_connect_account_id: string | null;
  created_at: string;
  updated_at: string;
};

type QuoteRow = {
  id: string;
  workspace_id: string;
  share_token: string;
  title: string;
  scope: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  line_items: Json;
  currency: string;
  subtotal_cents: number;
  tax_label: string;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  deposit_type: "percent" | "fixed";
  deposit_percent: number | null;
  deposit_cents: number;
  valid_until: string | null;
  status: QuoteStatus;
  viewed_at: string | null;
  decision_note: string | null;
  decided_at: string | null;
  decided_by_name: string | null;
  decision_meta: Json | null;
  approved_snapshot: Json | null;
  deposit_status: DepositStatus;
  deposit_paid_at: string | null;
  deposit_checkout_session_id: string | null;
  last_message_role: SenderRole | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  quote_id: string;
  sender_role: SenderRole;
  sender_name: string;
  body: string;
  attachment_id: string | null;
  created_at: string;
};

type AttachmentRow = {
  id: string;
  quote_id: string;
  uploaded_by: SenderRole;
  kind: AttachmentKind;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  duration_seconds: number | null;
  caption: string | null;
  is_walkthrough: boolean;
  created_at: string;
};

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: WorkspaceRow;
        Insert: Optional<WorkspaceRow, Exclude<keyof WorkspaceRow, "owner_id">>;
        Update: Partial<WorkspaceRow>;
        Relationships: [];
      };
      quotes: {
        Row: QuoteRow;
        Insert: Optional<
          QuoteRow,
          Exclude<keyof QuoteRow, "workspace_id" | "share_token" | "title" | "client_name">
        >;
        Update: Partial<QuoteRow>;
        Relationships: [
          {
            foreignKeyName: "quotes_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_messages: {
        Row: MessageRow;
        Insert: Optional<MessageRow, "id" | "body" | "attachment_id" | "created_at">;
        Update: Partial<MessageRow>;
        Relationships: [
          {
            foreignKeyName: "quote_messages_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_attachments: {
        Row: AttachmentRow;
        Insert: Optional<AttachmentRow, "id" | "duration_seconds" | "caption" | "is_walkthrough" | "created_at">;
        Update: Partial<AttachmentRow>;
        Relationships: [
          {
            foreignKeyName: "quote_attachments_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_workspace_owner: { Args: { ws_id: string }; Returns: boolean };
      owns_quote: { Args: { q_id: string }; Returns: boolean };
    };
    Enums: {
      quote_status: QuoteStatus;
      deposit_status: DepositStatus;
      sender_role: SenderRole;
      attachment_kind: AttachmentKind;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
