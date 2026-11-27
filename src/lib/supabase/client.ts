"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";
import { publicEnv } from "../env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Browser client (anon key only). Used for uploads to pre-signed URLs. */
export function getBrowserClient() {
  client ??= createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  return client;
}
