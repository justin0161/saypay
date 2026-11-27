import "server-only";
import { randomUUID } from "node:crypto";
import { storageBucket } from "./env";
import { extensionForMime } from "./media";
import { createAdminClient } from "./supabase/admin";
import type { SenderRole } from "./types";

export type SignedUpload = { bucket: string; path: string; token: string };

/** Path convention: {workspaceId}/{quoteId}/{role}-{uuid}.{ext} */
export function buildObjectPath(workspaceId: string, folder: string, role: SenderRole | "branding", mime: string) {
  return `${workspaceId}/${folder}/${role}-${randomUUID()}.${extensionForMime(mime)}`;
}

/** Mint a one-time signed upload URL. Call only after authorising the caller. */
export async function createSignedUpload(path: string): Promise<SignedUpload> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(storageBucket).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not create upload URL");
  return { bucket: storageBucket, path: data.path, token: data.token };
}

/**
 * Confirm an object exists and read its real size/mime from storage, rather
 * than trusting what the browser claims.
 */
export async function statObject(path: string): Promise<{ size: number; mimetype: string } | null> {
  const admin = createAdminClient();
  const slash = path.lastIndexOf("/");
  const dir = path.slice(0, slash);
  const name = path.slice(slash + 1);
  const { data, error } = await admin.storage.from(storageBucket).list(dir, { search: name, limit: 5 });
  if (error) return null;
  const obj = data?.find((o) => o.name === name);
  if (!obj) return null;
  const meta = (obj.metadata ?? {}) as { size?: number; mimetype?: string };
  return { size: Number(meta.size ?? 0), mimetype: String(meta.mimetype ?? "application/octet-stream") };
}

export async function removeObjects(paths: string[]) {
  if (paths.length === 0) return;
  await createAdminClient().storage.from(storageBucket).remove(paths);
}

export function baseMime(mime: string): string {
  return (mime.split(";")[0] ?? mime).trim().toLowerCase();
}
