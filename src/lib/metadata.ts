import type { Metadata } from "next";
import { SITE_CONFIG } from "./constants";

export function generatePageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${SITE_CONFIG.domain}${path}`;
  const fullTitle = `${title} | Entire UK — Land & Development`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function getOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: SITE_CONFIG.domain,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    description: SITE_CONFIG.description,
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    parentOrganization: {
      "@type": "Organization",
      name: SITE_CONFIG.parentBrand,
      url: SITE_CONFIG.sisterCompanyUrl,
    },
  };
}
