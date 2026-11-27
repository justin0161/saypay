import { z } from "zod";
import { MEDIA_LIMITS, VOICE_NOTE_MAX_SECONDS } from "./media";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

export const uuidSchema = z.uuid();

export const lineItemSchema = z.object({
  id: z.string().min(1).max(64),
  description: trimmed(300).min(1, "Describe the item"),
  quantity: z.number().finite().positive("Quantity must be above 0").max(100_000),
  unit_price_cents: z.number().int().min(0).max(100_000_000),
});

export const depositSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("percent"), percent: z.number().min(0).max(100) }),
  z.object({ type: z.literal("fixed"), cents: z.number().int().min(0).max(100_000_000) }),
]);

export const stagedAttachmentSchema = z.object({
  path: z.string().min(1).max(500),
  kind: z.enum(["image", "video", "audio"]),
  caption: optionalText(280),
  duration_seconds: z.number().min(0).max(3600).nullable().optional(),
  is_walkthrough: z.boolean().default(false),
});

export const quoteInputSchema = z.object({
  draft_id: uuidSchema,
  title: trimmed(140).min(1, "Give the job a title"),
  scope: optionalText(5000),
  client_name: trimmed(120).min(1, "Who is this quote for?"),
  client_email: z
    .union([z.literal(""), z.email("Enter a valid email")])
    .optional()
    .nullable()
    .transform((v) => (v ? v.toLowerCase() : null)),
  client_phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s().-]*$/, "Use digits, spaces and + only")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  line_items: z.array(lineItemSchema).min(1, "Add at least one line item").max(100),
  tax_enabled: z.boolean(),
  tax_rate: z.number().min(0).max(100),
  deposit: depositSchema,
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  attachments: z.array(stagedAttachmentSchema).max(30).default([]),
});
export type QuoteInput = z.input<typeof quoteInputSchema>;

export const uploadRequestSchema = z
  .object({
    mime_type: z.string().min(3).max(100),
    size_bytes: z.number().int().positive(),
    kind: z.enum(["image", "video", "audio"]),
  })
  .superRefine((v, ctx) => {
    if (!v.mime_type.toLowerCase().startsWith(`${v.kind}/`)) {
      ctx.addIssue({ code: "custom", message: "File type does not match", path: ["mime_type"] });
    }
    const limit = MEDIA_LIMITS[v.kind];
    if (v.size_bytes > limit.maxBytes) {
      ctx.addIssue({ code: "custom", message: `Files must be under ${limit.label}`, path: ["size_bytes"] });
    }
  });
export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export const confirmUploadSchema = z.object({
  path: z.string().min(1).max(500),
  kind: z.enum(["image", "video", "audio"]),
  caption: optionalText(280),
  // Allow a little slack over the cap for encoder rounding.
  duration_seconds: z.number().min(0).max(VOICE_NOTE_MAX_SECONDS * 60).nullable().optional(),
  as_message: z.boolean().default(false),
  sender_name: optionalText(80),
});

export const messageSchema = z.object({
  body: trimmed(4000).min(1, "Write a message"),
  sender_name: trimmed(80).min(1, "Add your name"),
});

export const decisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve"), name: trimmed(80).min(1, "Type your name to approve"), note: optionalText(2000) }),
  z.object({
    decision: z.literal("request_changes"),
    name: trimmed(80).min(1, "Add your name"),
    note: trimmed(2000).min(3, "Tell them what you'd like changed"),
  }),
  z.object({ decision: z.literal("decline"), name: trimmed(80).min(1, "Add your name"), note: optionalText(2000) }),
]);
export type DecisionInput = z.input<typeof decisionSchema>;

export const workspaceSchema = z.object({
  business_name: trimmed(120).min(1, "Business name is required"),
  contact_name: optionalText(120),
  contact_phone: optionalText(40),
  contact_email: z
    .union([z.literal(""), z.email("Enter a valid email")])
    .optional()
    .transform((v) => (v ? v : null)),
  trade: optionalText(80),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex colour like #0B1220"),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code"),
  default_deposit_percent: z.coerce.number().min(0).max(100),
  default_tax_rate: z.coerce.number().min(0).max(100),
  tax_label: trimmed(20).min(1),
  deposit_link_url: z
    .union([z.literal(""), z.url({ protocol: /^https$/, message: "Use an https:// link" })])
    .optional()
    .transform((v) => (v ? v : null)),
});

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  business_name: trimmed(120).optional(),
});

export const magicLinkSchema = z.object({ email: z.email("Enter a valid email") });

/** Flatten zod issues to { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form";
}
