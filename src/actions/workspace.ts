"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth";
import { kindFromMime } from "@/lib/media";
import { baseMime, buildObjectPath, createSignedUpload, removeObjects, statObject, type SignedUpload } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { fieldErrors, firstError, uploadRequestSchema, workspaceSchema } from "@/lib/validation";

export type WorkspaceFormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function updateWorkspace(_: WorkspaceFormState, formData: FormData): Promise<WorkspaceFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = workspaceSchema.safeParse({ ...raw, currency: String(raw.currency ?? "").toUpperCase() });
  if (!parsed.success) return { error: firstError(parsed.error), fieldErrors: fieldErrors(parsed.error) };

  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update(parsed.data).eq("id", workspace.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function requestLogoUpload(input: unknown): Promise<ActionResult<SignedUpload>> {
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  if (parsed.data.kind !== "image") return { ok: false, error: "Logo must be an image" };
  const { workspace } = await requireWorkspace();
  const path = buildObjectPath(workspace.id, "branding", "branding", baseMime(parsed.data.mime_type));
  return { ok: true, data: await createSignedUpload(path) };
}

export async function saveLogo(path: string): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  if (!path.startsWith(`${workspace.id}/branding/`)) return { ok: false, error: "Invalid path" };
  const stat = await statObject(path);
  if (!stat || kindFromMime(stat.mimetype) !== "image") return { ok: false, error: "Upload not found" };
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ logo_path: path }).eq("id", workspace.id);
  if (error) return { ok: false, error: error.message };
  if (workspace.logo_path && workspace.logo_path !== path) await removeObjects([workspace.logo_path]);
  revalidatePath("/settings");
  return { ok: true };
}
