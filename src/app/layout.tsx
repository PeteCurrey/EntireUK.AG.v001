import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getOrganizationStructuredData } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: "Entire UK | Property Acquisition & Development Opportunities",
    template: "%s | Entire UK",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "UK land acquisition",
    "property development",
    "land intelligence",
    "brownfield regeneration",
    "strategic land UK",
    "property conversion",
    "planning potential",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_CONFIG.domain,
    title: "Entire UK | Property Acquisition & Development Opportunities",
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Entire UK | Property Acquisition & Development Opportunities",
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = getOrganizationStructuredData();

  return (
    <html lang="en-GB" className="font-sans">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-brand-graphite selection:bg-brand-electric/15 selection:text-brand-graphite">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-graphite focus:text-white focus:rounded-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-electric"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
