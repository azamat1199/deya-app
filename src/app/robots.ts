import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt. Everything public is crawlable; /api/ (the form-submit proxy)
 * is not a page. Note the proxy matcher already skips paths with a dot, so this
 * and /sitemap.xml are served directly instead of being redirected to /ru/...
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
