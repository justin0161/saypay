"use server";

/**
 * Voice fill for the quote builder: the browser turns speech into text, and
 * this action uses Claude to turn that text into structured quote fields.
 * Nothing is saved here — the result only pre-fills the form for the user to check.
 */

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { requireWorkspace } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

const VoiceQuoteSchema = z.object({
  title: z.string().nullable().describe("Short job title, e.g. 'Combi boiler replacement'. Null if not said."),
  scope: z.string().nullable().describe("A sentence or two describing the work, in the tradesperson's words. Null if nothing beyond the items."),
  client_name: z.string().nullable(),
  client_phone: z.string().nullable(),
  client_email: z.string().nullable(),
  line_items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().describe("Defaults to 1 when not said."),
        unit_price: z.number().nullable().describe("Price for ONE unit in pounds, e.g. 2150 or 24.5. Null if no price was said."),
      }),
    )
    .describe("Each priced item or piece of work mentioned, in the order said."),
  vat: z
    .object({
      enabled: z.boolean().nullable().describe("True if they said to add/include VAT, false if they said no VAT, null if not mentioned."),
      rate: z.number().nullable().describe("VAT rate in percent if a specific rate was said, else null."),
    })
    .describe("VAT instructions."),
  payment: z
    .object({
      type: z
        .enum(["none", "percent", "fixed", "full"])
        .nullable()
        .describe("'percent' for a % deposit, 'fixed' for a set deposit amount, 'full' to pay the whole amount upfront, 'none' for nothing upfront, null if not mentioned."),
      percent: z.number().nullable().describe("Deposit percent when type is 'percent' (e.g. 'half upfront' = 50)."),
      amount: z.number().nullable().describe("Deposit amount in pounds when type is 'fixed'."),
    })
    .describe("What the client pays when they accept."),
});

export type VoiceQuoteDraft = z.infer<typeof VoiceQuoteSchema>;

const SYSTEM = `You fill in a quote form for a UK tradesperson (plumber, electrician, builder, etc.) from what they said out loud.

The text comes from speech recognition, so expect missing punctuation, numbers written as words ("two thousand one hundred and fifty", "two grand", "a hundred and twenty quid"), and phone numbers or emails spoken aloud ("oh seven seven double oh", "sarah at gmail dot com"). Convert these to normal digits and addresses.

Rules:
- Only use what was actually said. Never invent a client, item, price, phone number or email — use null instead.
- Prices are in pounds (GBP). If an item is "2 valves at £24 each", quantity is 2 and unit_price is 24. If only a total is given for several units, use quantity 1 and that total.
- Keep item descriptions short and professional (e.g. "Supply & fit combi boiler"), keeping the tradesperson's meaning.
- "Plus VAT" / "add VAT" means VAT enabled. "No VAT" / "I'm not VAT registered" means disabled.
- Payment: "25% deposit" is percent 25; "half upfront" is percent 50; "£200 deposit" is fixed 200; "paid in full" / "full payment upfront" is full; "no deposit" / "pay on completion" is none.`;

const MAX_TRANSCRIPT = 6000;

export async function parseQuoteFromSpeech(transcript: unknown): Promise<ActionResult<VoiceQuoteDraft>> {
  await requireWorkspace(); // signed-in contractors only
  const text = typeof transcript === "string" ? transcript.trim() : "";
  if (text.length < 3) return { ok: false, error: "I didn't catch anything — try again and describe the job." };
  if (text.length > MAX_TRANSCRIPT) return { ok: false, error: "That's a bit long — try describing the quote in under a few minutes." };
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Voice fill isn't switched on yet (ANTHROPIC_API_KEY is missing). You can still type the quote." };
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // Server-side fallback: if a safety classifier declines, the API retries on a recommended model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // Simple extraction: low effort keeps it quick and cheap.
      output_config: { effort: "low", format: betaZodOutputFormat(VoiceQuoteSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: `Here is what the tradesperson said:\n\n<speech>\n${text}\n</speech>` }],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, error: "I couldn't turn that into a quote. Please fill it in by hand." };
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return { ok: false, error: "I couldn't make sense of that — try again, describing one item at a time." };
    }
    return { ok: true, data: response.parsed_output };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Voice fill: invalid ANTHROPIC_API_KEY");
      return { ok: false, error: "Voice fill isn't set up correctly (the API key was rejected)." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "Voice fill is busy right now — please try again in a moment." };
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Voice fill API error", error.status, error.message);
    } else {
      console.error("Voice fill failed", error instanceof Error ? error.message : error);
    }
    return { ok: false, error: "Something went wrong reading that. Please try again." };
  }
}
