import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import { publicEnv, requireServerEnv } from "../env";

let admin: ReturnType<typeof createClient<Database>> | undefined;

/**
 * Service-role client. BYPASSES RLS — only use from server code that has
 * already authorised the request (e.g. resolved a valid share_token, or a
 * verified Stripe webhook). The `server-only` import makes bundling this into
 * client code a build error.
 */
export function createAdminClient() {
  admin ??= createClient<Database>(publicEnv.supabaseUrl, requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
