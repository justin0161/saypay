import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { requireWorkspace } from "@/lib/auth";
import { getPaymentSetup } from "@/lib/payments";
import { loadQuoteBundle, toQuote } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit quote" };

export default async function EditQuotePage({ params }: PageProps<"/quotes/[id]/edit">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  if (data.status === "approved" || data.status === "declined") redirect(`/quotes/${id}`);

  const quote = toQuote(data);
  const [bundle, pay] = await Promise.all([loadQuoteBundle(supabase, id), getPaymentSetup(workspace)]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-5xl leading-none font-bold sm:text-6xl">Edit quote</h1>
      <p className="mb-5 text-muted">Saving re-sends it — your client&apos;s link stays the same.</p>
      <QuoteBuilder
        mode="edit"
        draftId={quote.id}
        currency={quote.currency}
        taxLabel={quote.tax_label}
        defaultTaxRate={Number(workspace.default_tax_rate)}
        defaultDepositPercent={Number(workspace.default_deposit_percent)}
        initial={{
          title: quote.title,
          scope: quote.scope,
          client_name: quote.client_name,
          client_email: quote.client_email,
          client_phone: quote.client_phone,
          line_items: quote.line_items,
          tax_rate: Number(quote.tax_rate),
          deposit_type: quote.deposit_type,
          deposit_percent: quote.deposit_percent === null ? null : Number(quote.deposit_percent),
          deposit_cents: quote.deposit_cents,
          valid_until: quote.valid_until,
          accept_card: quote.accept_card,
          accept_bank: quote.accept_bank,
        }}
        cardReady={pay.card}
        bankReady={pay.bank}
        existingWalkthrough={bundle.walkthrough}
        existingMedia={bundle.gallery.filter((m) => m.uploaded_by === "contractor")}
      />
    </div>
  );
}
