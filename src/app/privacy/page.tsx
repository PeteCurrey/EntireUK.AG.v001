import React from "react";
import { Container } from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/metadata";

import { PageHero } from "@/components/ui/PageHero";

export const metadata = generatePageMetadata({
  title: "Privacy Policy",
  description: "Entire UK privacy policy, data protection standards, and UK GDPR compliance statement.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pb-24">
      <PageHero
        eyebrow="Data Protection"
        badge="UK GDPR & DPA 2018"
        title="PRIVACY"
        subtitle="POLICY."
        description="How Entire UK protects your privacy, handles opportunity submission information, and maintains statutory data protection compliance."
        imageSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Data privacy and corporate security"
        containerSize="narrow"
      />
      <Container size="narrow" className="py-16 sm:py-20">

        <div className="prose prose-slate max-w-none font-light text-brand-silver space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">1. Introduction &amp; Data Controller</h2>
            <p>
              Entire UK (&ldquo;Entire UK&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a UK land acquisition and property development company operating within the Entire ecosystem. We are committed to protecting the privacy, confidentiality, and security of personal and commercial data entrusted to us.
            </p>
            <p>
              For the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, Entire UK acts as the data controller for personal data collected through <a href="https://entire-uk.com" className="text-brand-electric underline">entire-uk.com</a> and our opportunity submission pathways.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">2. Data We Collect</h2>
            <p>
              We collect information strictly necessary to evaluate land and property development opportunities and maintain professional communications:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Name, professional organisation, email address, telephone number, and communication preferences.</li>
              <li><strong>Opportunity Information:</strong> Property addresses, title references, boundary plans, site areas, existing use details, and planning documents submitted via our acquisition gateways.</li>
              <li><strong>Technical Metadata:</strong> Privacy-safe analytics events and server connection logs (without personally identifiable tracking).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">3. Confidentiality &amp; Commercial Diligence</h2>
            <p>
              We treat all land submissions, property details, and commercial proposals with strict discretion. Information submitted through our opportunity gateways is reviewed exclusively by authorised development and acquisition personnel. We do not sell, rent, or trade opportunity data to external marketing brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">4. Lawful Basis for Processing</h2>
            <p>
              We process personal data under the following lawful bases:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Legitimate Interests:</strong> Assessing property development feasibility, evaluating land suitability, and communicating with landowners and introducers.</li>
              <li><strong>Contractual Steps:</strong> Taking necessary due diligence steps prior to entering into option, promotion, or acquisition agreements.</li>
              <li><strong>Legal Obligations:</strong> Compliance with UK corporate, anti-money laundering (AML), and regulatory requirements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">5. Your Rights</h2>
            <p>
              Under UK data protection law, you have the right to request access to, rectification of, or erasure of your personal data, as well as the right to restrict or object to processing. To exercise any of these rights, please contact our data protection team at <a href="mailto:privacy@entire-uk.com" className="text-brand-electric underline">privacy@entire-uk.com</a>.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
