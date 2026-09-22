import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/metadata";
import { FileCheck2, Scale, Compass, Shield, Coins, HardHat, TrendingUp } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Our Approach",
  description:
    "Explore Entire UK's disciplined 7-step acquisition, planning and development model for unlocking value in overlooked property assets.",
  path: "/approach",
});

export default function ApproachPage() {
  const steps = [
    {
      step: "01",
      title: "Identify",
      eyebrow: "Sourcing & Intelligence",
      icon: Compass,
      headline: "Uncovering overlooked parcels and underutilised assets.",
      content:
        "We identify sites through a combination of proprietary geospatial scanning (Land Radar) and established property networks. We search for properties where current use substantially diverges from potential value — such as unallocated edge-of-village pasture, vacant commercial buildings with permitted development rights, or complex title configurations requiring ransom resolution.",
      deliverables: ["Cadastral boundary review", "Title and covenant inspection", "Spatial constraint check"],
    },
    {
      step: "02",
      title: "Assess",
      eyebrow: "Due Diligence & Viability",
      icon: FileCheck2,
      headline: "Rigorous planning, technical and commercial evaluation.",
      content:
        "Every prospective site undergoes exhaustive multi-disciplinary scrutiny before we commit resource. We evaluate local plan housing land supply, five-year supply deficits, highways access, flood zones (EA River and Surface Water), ecological sensitivities (biodiversity net gain), contamination history, and residual land economics.",
      deliverables: ["Planning appraisal report", "Highways & services feasibility", "Residual financial model"],
    },
    {
      step: "03",
      title: "Structure",
      eyebrow: "Commercial Alignment",
      icon: Scale,
      headline: "Tailored deal structures aligned with landowner goals.",
      content:
        "There is no one-size-fits-all property transaction. We offer diverse acquisition and partnership mechanisms: unconditional cash purchases for immediate certainty; option agreements with agreed minimum floor prices; planning promotion agreements where Entire UK funds all planning risk in exchange for a performance fee; or joint venture vehicles.",
      deliverables: ["Option agreements", "Promotion agreements", "Unconditional contracts", "Joint venture SPVs"],
    },
    {
      step: "04",
      title: "Plan",
      eyebrow: "Consents & Optimization",
      icon: Shield,
      headline: "Navigating planning committees and statutory frameworks.",
      content:
        "We assemble top-tier planning consultants, architects, transport engineers, and legal specialists. We engage proactively with local planning authorities (LPAs), statutory consultees, and local communities to craft schemes of genuine architectural merit that maximize density while maintaining strong deliverability.",
      deliverables: ["Full or outline planning submission", "EIA & ecological mitigation", "S106 / CIL negotiations"],
    },
    {
      step: "05",
      title: "Fund",
      eyebrow: "Capital Architecture",
      icon: Coins,
      headline: "Structuring institutional capital and development finance.",
      content:
        "With consents secured, we deploy appropriate capital structures. We work alongside tier-one UK clearing banks, debt funds, institutional equity partners, and family offices to ensure development debt and equity are optimized for efficient construction cash flow and risk mitigation.",
      deliverables: ["Senior debt facilities", "Mezzanine & equity structuring", "Project bank accounts & bonds"],
    },
    {
      step: "06",
      title: "Develop",
      eyebrow: "Delivery & Construction",
      icon: HardHat,
      headline: "Executing construction through vetted contractor partnerships.",
      content:
        "We progress projects into physical delivery with comprehensive development management oversight. Working with reputable main contractors on JCT Design and Build contracts, we manage procurement, quality control, programme compliance, and health & safety to British standards.",
      deliverables: ["JCT building contracts", "Employer's Agent administration", "Quality & ESG monitoring"],
    },
    {
      step: "07",
      title: "Realise",
      eyebrow: "Value Crystallisation",
      icon: TrendingUp,
      headline: "Disposal, stabilization or institutional handover.",
      content:
        "Value is captured through strategic phased sales to owner-occupiers, forward-sales to registered housing providers (RPs), build-to-rent (BTR) bulk sales, or long-term operational retention within the wider Entire built-environment ecosystem.",
      deliverables: ["Sales and marketing management", "Institutional portfolio handover", "Turnkey completion"],
    },
  ];

  const transactionStructures = [
    {
      name: "Unconditional Purchase",
      idealFor: "Vendors requiring immediate liquidity and execution speed without planning conditionality.",
      howItWorks: "Entire UK acquires the freehold outright on fixed completion terms, absorbing 100% of the planning and delivery risk directly.",
    },
    {
      name: "Option Agreement",
      idealFor: "Landowners who want to secure a predetermined price or formula once planning consent is granted.",
      howItWorks: "Entire UK secures the legal right to purchase the site within an agreed window. We fund and manage the entire planning process at our own cost.",
    },
    {
      name: "Planning Promotion Agreement",
      idealFor: "Strategic acreage where long-term local plan allocation will yield maximum open-market value.",
      howItWorks: "Entire UK acts as the promotion partner, funding 100% of the planning costs. Once consented, the land is marketed on the open market, sharing the net proceeds.",
    },
    {
      name: "Joint Venture (JV)",
      idealFor: "Property owners wishing to retain an equity stake and participate directly in the completed scheme's profit.",
      howItWorks: "A dedicated Special Purpose Vehicle (SPV) is formed. Entire UK provides development management, planning, and funding execution.",
    },
  ];

  return (
    <div className="pt-24 sm:pt-28">
      {/* Hero Section */}
      <section className="bg-brand-void text-white py-16 sm:py-24 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">Disciplined Execution</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              Our Approach
            </h1>
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed">
              We take land and property from initial identification through technical
              due diligence, planning consent, capital structuring and construction.
              Here is how we work.
            </p>
          </div>
        </Container>
      </section>

      {/* The 7 Steps Deep Dive */}
      <Section>
        <Container>
          <div className="space-y-16 lg:space-y-24">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  id={`step-${item.step}`}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-12 border-t border-brand-edge first:border-t-0 first:pt-0"
                >
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extralight text-brand-electric font-mono">
                        {item.step}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-widest text-brand-silver">
                        {item.eyebrow}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-light text-brand-graphite">
                      {item.title}
                    </h2>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-lg sm:text-xl font-normal text-brand-graphite leading-snug">
                      {item.headline}
                    </h3>
                    <p className="text-sm sm:text-base font-light text-brand-silver leading-relaxed">
                      {item.content}
                    </p>

                    <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge">
                      <span className="text-xs font-mono uppercase tracking-wider text-brand-graphite block mb-2">
                        Core Outputs &amp; Deliverables
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.deliverables.map((d, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-sm bg-white border border-brand-edge text-xs font-light text-brand-graphite"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Transaction Structures Breakdown */}
      <Section surface={true}>
        <Container>
          <SectionHeader
            eyebrow="Commercial Models"
            title="How We Structure Opportunities"
            description="We offer commercial flexibility to suit landowners, family estates, corporate property owners and strategic partners."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {transactionStructures.map((struct, idx) => (
              <div
                key={idx}
                className="p-8 rounded-sm bg-white border border-brand-edge space-y-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-medium text-brand-graphite mb-2">
                    {struct.name}
                  </h3>
                  <div className="text-xs text-brand-electric font-medium mb-3">
                    {struct.idealFor}
                  </div>
                  <p className="text-sm font-light text-brand-silver leading-relaxed">
                    {struct.howItWorks}
                  </p>
                </div>
                <div className="pt-4 border-t border-brand-edge/60">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-brand-silver">
                    Entire UK Model 0{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-sm bg-brand-void text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-light text-white mb-1">
                Have a site you would like us to evaluate?
              </h4>
              <p className="text-xs font-light text-brand-mist/70">
                We review submissions within 3 working days with complete commercial discretion.
              </p>
            </div>
            <Button href="/submit" variant="primary" size="md" showArrow>
              Submit an Opportunity
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
