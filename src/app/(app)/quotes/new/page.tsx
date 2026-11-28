import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { requireWorkspace } from "@/lib/auth";
import { getPaymentSetup } from "@/lib/payments";

export const metadata: Metadata = { title: "New quote" };

export default async function NewQuotePage() {
  const { workspace } = await requireWorkspace();
  // The quote id is allocated up-front so uploads can go straight to their final folder.
  const draftId = randomUUID();
  const pay = await getPaymentSetup(workspace);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-3xl font-bold sm:text-4xl">New quote</h1>
      <p className="mb-5 text-muted">Add your prices and a voice note — then send the link.</p>
      <QuoteBuilder
        mode="create"
        draftId={draftId}
        currency={workspace.currency}
        taxLabel={workspace.tax_label}
        defaultTaxRate={Number(workspace.default_tax_rate)}
        defaultDepositPercent={Number(workspace.default_deposit_percent)}
        cardReady={pay.card}
        bankReady={pay.bank}
      />
    </div>
  );
}
