import type { AttachmentKind } from "./types";

/** Upload limits per media kind. Keep video <= the Supabase project's global file size limit. */
export const MEDIA_LIMITS: Record<AttachmentKind, { maxBytes: number; label: string }> = {
  image: { maxBytes: 15 * 1024 * 1024, label: "15 MB" },
  video: { maxBytes: 50 * 1024 * 1024, label: "50 MB" },
  audio: { maxBytes: 10 * 1024 * 1024, label: "10 MB" },
};

export const VOICE_NOTE_MAX_SECONDS = 60;
export const MAX_ATTACHMENTS_PER_QUOTE = 40;

export function kindFromMime(mime: string): AttachmentKind | null {
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  if (base.startsWith("image/")) return "image";
  if (base.startsWith("video/")) return "video";
  if (base.startsWith("audio/")) return "audio";
  return null;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

export function extensionForMime(mime: string): string {
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? "";
  return EXT[base] ?? "bin";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.round(seconds ?? 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
