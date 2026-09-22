import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/opportunities",
    "/approach",
    "/technology",
    "/about",
    "/contact",
    "/submit",
    "/submit/land",
    "/submit/property",
    "/submit/opportunity",
    "/submit/partner",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  return routes.map((route) => ({
    url: `${SITE_CONFIG.domain}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/submit") ? 0.9 : 0.7,
  }));
}
