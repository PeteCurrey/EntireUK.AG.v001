import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/submit/success",
        "/dashboard",
        "/land-radar",
        "/review",
        "/validation",
        "/data-health",
        "/sign-in",
      ],
    },
    sitemap: `${SITE_CONFIG.domain}/sitemap.xml`,
  };
}
