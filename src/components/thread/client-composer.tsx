"use client";

import { confirmClientUpload, postClientMessage, requestClientUpload } from "@/actions/client-quote";
import { Composer } from "./composer";

export function ClientComposer({ token, defaultName }: { token: string; defaultName: string }) {
  return (
    <Composer
      askName
      defaultName={defaultName}
      placeholder="Ask a question or reply…"
      sendText={(body, name) => postClientMessage(token, { body, sender_name: name })}
      requestUpload={(meta) => requestClientUpload(token, meta)}
      confirmUpload={(input) => confirmClientUpload(token, input)}
    />
  );
}
