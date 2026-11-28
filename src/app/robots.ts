import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    // Quote links (/q/…) are private to each client, so keep them out of search.
    rules: { userAgent: "*", allow: ["/", "/login", "/privacy", "/terms"], disallow: ["/q/", "/dashboard", "/quotes", "/settings", "/api/", "/auth/"] },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
