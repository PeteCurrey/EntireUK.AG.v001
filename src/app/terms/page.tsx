import React from "react";
import { Container } from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "Terms of Use",
  description: "Terms of website use, regulatory disclaimers, and opportunity submission conditions for Entire UK.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="py-20 sm:py-28 bg-white min-h-[70vh]">
      <Container size="narrow">
        <div className="space-y-4 mb-12">
          <div className="eyebrow">Legal &amp; Compliance</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-brand-graphite tracking-tight">
            Terms of Website Use
          </h1>
          <p className="text-sm font-light text-brand-silver">
            Last updated: September 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none font-light text-brand-silver space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website (<a href="https://entire-uk.com" className="text-brand-electric underline">entire-uk.com</a>), you accept and agree to be bound by these Terms of Use. If you do not agree with these terms, please do not use this website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">2. Nature of the Company</h2>
            <p>
              Entire UK is a land acquisition and property development company. We are <strong>not</strong> an estate agency, mortgage broker, financial advisor, property investment scheme, training academy, or collective investment undertaking.
            </p>
            <p>
              Nothing on this website constitutes financial, legal, tax, or investment advice. Any financial metrics, planning discussions, or case studies presented represent general illustrative frameworks and do not guarantee future performance or specific planning approvals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">3. Opportunity Submissions</h2>
            <p>
              Submitting land, property, or partnership details through this website constitutes an invitation to treat and an expression of interest. Submission does <strong>not</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create an agency agreement or client relationship.</li>
              <li>Commit Entire UK to acquire, option, or promote any site.</li>
              <li>Guarantee a formal valuation, acquisition offer, or site inspection.</li>
            </ul>
            <p>
              All formal commercial engagements are subject to non-disclosure agreements, formal due diligence, legal contract, and board approval.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">4. Intellectual Property</h2>
            <p>
              All content on this website, including text, architectural diagrams, Land Radar specifications, brand marks, and software components, is the exclusive intellectual property of Entire UK or its licensors and is protected by UK and international copyright laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-normal text-brand-graphite">5. Governing Law</h2>
            <p>
              These Terms of Use and any disputes arising from your use of this website are governed exclusively by the laws of England and Wales and subject to the exclusive jurisdiction of the English courts.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
