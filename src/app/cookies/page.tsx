import React from "react";
import { Container } from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/metadata";

import { PageHero } from "@/components/ui/PageHero";

export const metadata = generatePageMetadata({
  title: "Cookie Policy",
  description: "Entire UK cookie policy and technical session storage overview.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <div className="bg-white min-h-screen pb-24">
      <PageHero
        eyebrow="Technical Standards"
        badge="Session & Analytics"
        title="COOKIE"
        subtitle="POLICY."
        description="Information regarding essential technical cookies and anonymous analytics utilized across Entire UK digital services."
        imageSrc="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Digital infrastructure and technical transparency"
        containerSize="narrow"
      />
      <Container size="narrow" className="py-16 sm:py-20">

        <div className="prose prose-slate max-w-none font-light text-brand-silver space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">1. Our Minimalist Cookie Approach</h2>
            <p>
              Entire UK operates a strictly privacy-respecting website. We do not use intrusive third-party advertising cookies, behavioural retargeting pixels, or cross-site commercial tracking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">2. Essential Technologies &amp; Session Storage</h2>
            <p>
              We utilize technical storage strictly necessary for the operation of the website and submission gateways:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Session Storage (Form Preservation):</strong> We temporarily retain form draft values in your browser&rsquo;s local <code>sessionStorage</code> (e.g., <code>euk_form_land</code>) to prevent loss of your submission data if you navigate between steps or reload the page. This data never leaves your browser until you explicitly click &ldquo;Submit&rdquo;.</li>
              <li><strong>Technical Session State:</strong> Ephemeral cookies required for network security, load balancing, and CSRF protection.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">3. Privacy-Safe Analytics</h2>
            <p>
              Where analytics are configured, we measure aggregated traffic metrics to understand which conversion pathways are most effective. We do not transmit personal names, addresses, or unencrypted opportunity references to analytical third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">4. Managing Cookies in Your Browser</h2>
            <p>
              You can configure your web browser to reject cookies or clear existing cookies at any time via your browser settings. Please note that disabling essential storage may impact the continuity of multi-step form submissions.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
