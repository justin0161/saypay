import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Workspace } from "./types";

/**
 * Resolve the signed-in contractor and their workspace. Redirects to /login
 * when there is no valid session. Cached per request.
 */
export const requireWorkspace = cache(async (): Promise<{ userId: string; email: string | null; workspace: Workspace }> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", auth.user.id)
    .maybeSingle();

  if (error) throw new Error(`Could not load workspace: ${error.message}`);
  if (!workspace) {
    // The on_auth_user_created trigger should have created it; fail loudly.
    throw new Error("Workspace missing for this account. Did you run supabase/migrations/001_init.sql?");
  }
  return { userId: auth.user.id, email: auth.user.email ?? null, workspace };
});
