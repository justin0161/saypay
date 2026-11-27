"use client";

import { confirmOwnerUpload, postContractorMessage, requestOwnerUpload } from "@/actions/quotes";
import { Composer } from "./composer";

export function ContractorComposer({ quoteId }: { quoteId: string }) {
  return (
    <Composer
      askName={false}
      placeholder="Reply to your client…"
      sendText={(body) => postContractorMessage(quoteId, body)}
      requestUpload={(meta) => requestOwnerUpload(quoteId, meta)}
      confirmUpload={(input) => confirmOwnerUpload(quoteId, input)}
    />
  );
}
