import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { requireWorkspace } from "@/lib/auth";

export const metadata: Metadata = { title: "New quote" };

export default async function NewQuotePage() {
  const { workspace } = await requireWorkspace();
  // The quote id is allocated up-front so uploads can go straight to their final folder.
  const draftId = randomUUID();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-3xl font-semibold tracking-[-0.035em] sm:text-[2.25rem]">New quote</h1>
      <p className="mb-5 text-muted">Title, client, a few items and a voice note. About 60 seconds.</p>
      <QuoteBuilder
        mode="create"
        draftId={draftId}
        currency={workspace.currency}
        taxLabel={workspace.tax_label}
        defaultTaxRate={Number(workspace.default_tax_rate)}
        defaultDepositPercent={Number(workspace.default_deposit_percent)}
      />
    </div>
  );
}
