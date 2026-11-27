"use client";

import { kindFromMime, MEDIA_LIMITS } from "./media";
import type { SignedUpload } from "./storage";
import { getBrowserClient } from "./supabase/client";
import type { ActionResult, AttachmentKind } from "./types";

export type RequestUpload = (meta: {
  mime_type: string;
  size_bytes: number;
  kind: AttachmentKind;
}) => Promise<ActionResult<SignedUpload>>;

export type UploadedFile = { path: string; kind: AttachmentKind; mime_type: string; size_bytes: number };

/** Strip codec params: "audio/webm;codecs=opus" -> "audio/webm" (bucket MIME rules match the base type). */
function cleanMime(type: string): string {
  return (type.split(";")[0] ?? type).trim().toLowerCase() || "application/octet-stream";
}

/**
 * Upload a file straight to Supabase Storage via a server-minted signed URL.
 * The service-role key never leaves the server; the browser only gets a
 * one-time token scoped to a single object path.
 */
export async function uploadMedia(file: Blob, requestUpload: RequestUpload): Promise<UploadedFile> {
  const mime = cleanMime(file.type);
  const kind = kindFromMime(mime);
  if (!kind) throw new Error("Only photos, videos and audio can be uploaded");
  if (file.size > MEDIA_LIMITS[kind].maxBytes) throw new Error(`Files must be under ${MEDIA_LIMITS[kind].label}`);

  const res = await requestUpload({ mime_type: mime, size_bytes: file.size, kind });
  if (!res.ok) throw new Error(res.error);

  const { bucket, path, token } = res.data;
  const { error } = await getBrowserClient()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: mime, upsert: false });
  if (error) throw new Error(error.message || "Upload failed");

  return { path, kind, mime_type: mime, size_bytes: file.size };
}
