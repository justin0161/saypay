"use client";

import { confirmClientUpload, requestClientUpload } from "@/actions/client-quote";
import { MediaPicker } from "../media/media-picker";

/** Lets a client add site photos / short videos to the quote from their phone. */
export function ClientUploader({ token, clientName }: { token: string; clientName: string }) {
  return (
    <MediaPicker
      label="Add your photos or video"
      requestUpload={(meta) => requestClientUpload(token, meta)}
      onUploaded={async (file) => {
        let name = clientName;
        try {
          name = localStorage.getItem("saypay:name") || clientName;
        } catch {
          /* ignore */
        }
        const res = await confirmClientUpload(token, {
          path: file.path,
          kind: file.kind,
          caption: null,
          duration_seconds: null,
          as_message: false,
          sender_name: name,
        });
        if (!res.ok) throw new Error(res.error);
      }}
    />
  );
}
