import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/metadata";
import { CheckCircle2, ShieldCheck, Lock, MapPin, Compass } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Selected Opportunities",
  description:
    "Entire UK selectively pursues land and property across England, Scotland and Wales where there is a credible opportunity to unlock development value.",
  path: "/opportunities",
});

export default function OpportunitiesPage() {
  const criteria = [
    {
      title: "Geographic Scope",
      value: "England, Scotland & Wales",
      desc: "Priority focus on regional growth corridors, edge-of-settlement expansions, and well-connected urban centres.",
    },
    {
      title: "Scale & Acreage",
      value: "1 to 100+ Acres",
      desc: "From single commercial buildings or 1-acre brownfield infill parcels up to 100+ acre strategic land releases.",
    },
    {
      title: "Acquisition Structures",
      value: "Flexible & Tailored",
      desc: "Unconditional freehold purchases, option agreements, planning promotion agreements and joint venture partnerships.",
    },
    {
      title: "Confidentiality & Discretion",
      value: "100% Off-Market Due Diligence",
      desc: "Initial appraisals and site visits are carried out discreetly to protect landowner privacy and commercial sensitivity.",
    },
  ];

  return (
    <div className="pt-24 sm:pt-28">
      {/* Page Header */}
      <section className="bg-brand-void text-white py-16 sm:py-24 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">Pipeline Portfolio</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              Selected Opportunities
            </h1>
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed">
              We selectively pursue land and property where there is a credible opportunity
              to unlock additional value through planning, repositioning and development.
            </p>
          </div>
        </Container>
      </section>

      {/* Portfolio Status Section with Truthful State */}
      <Section surface={true}>
        <Container>
          <div className="mb-12">
            <EmptyState
              type="empty"
              title="Pipeline Opportunities Under Assessment"
              description="Entire UK is currently conducting due diligence on a portfolio of off-market land parcels and conversion assets across the UK. In line with our strict commercial privacy standards, opportunities are only published publicly following formal contractual agreement or commencement of public planning consultation."
              actionText="Submit a Site For Confidential Review"
              actionHref="/submit"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-brand-edge">
            {criteria.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-sm bg-white border border-brand-edge"
              >
                <span className="text-[11px] font-mono uppercase tracking-widest text-brand-electric block mb-2">
                  {item.title}
                </span>
                <p className="text-base font-medium text-brand-graphite mb-2">
                  {item.value}
                </p>
                <p className="text-xs font-light text-brand-silver leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Acquisition Requirements / Criteria */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow">Target Criteria</span>
              <h2 className="text-3xl sm:text-4xl font-extralight text-brand-graphite tracking-tight">
                Our Acquisition Profile
              </h2>
              <p className="text-base font-light text-brand-silver leading-relaxed">
                We operate as active principals backed by committed capital. We evaluate all
                opportunities against clear commercial, environmental and legal hurdles:
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Clear, defensible vehicular and services access (or viable ransom resolution).",
                  "Demonstrable planning angle: emerging local plan allocation, brownfield status, or Class MA conversion.",
                  "Deliverable ground conditions and manageable environmental or flood constraints.",
                  "Motivated vendors seeking professional execution and speed of contract.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm font-light text-brand-graphite">
                    <CheckCircle2 className="w-4 h-4 text-brand-electric shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button href="/submit" variant="primary" size="md" showArrow>
                  Submit an Opportunity
                </Button>
                <Button href="/contact" variant="outline" size="md">
                  Discuss a Potential Site
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-sm bg-brand-surface border border-brand-edge space-y-6">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-silver">
                  <ShieldCheck className="w-4 h-4 text-brand-electric" />
                  <span>Principal Buyer &amp; Partner Guarantee</span>
                </div>
                <h3 className="text-xl font-normal text-brand-graphite">
                  Direct Decisions Without Agent Chains
                </h3>
                <p className="text-sm font-light text-brand-silver leading-relaxed">
                  We are not commercial brokers or intermediaries. When Entire UK assesses a site,
                  we review it directly with our planning and investment committee. Introducers and
                  commercial agents are protected and retained where terms are agreed.
                </p>

                <div className="p-4 rounded-sm bg-white border border-brand-edge text-xs font-light text-brand-silver space-y-1">
                  <p className="font-medium text-brand-graphite">Are you an introducing agent or surveyor?</p>
                  <p>We welcome off-market introductions. Non-disclosure agreements (NDAs) issued promptly.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
