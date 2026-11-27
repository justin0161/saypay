import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Only run where auth matters. Client magic links (/q/*), static assets and
    // the Stripe webhook are excluded so they stay fast and cookie-free.
    "/dashboard/:path*",
    "/quotes/:path*",
    "/settings/:path*",
    "/login",
    "/auth/:path*",
  ],
};
