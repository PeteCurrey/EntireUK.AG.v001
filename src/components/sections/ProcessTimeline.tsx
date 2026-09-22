import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { Button } from "../ui/Button";

export function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      name: "Identify",
      summary: "Find overlooked land and property opportunities.",
      desc: "Using our proprietary Land Radar data engine alongside deep on-the-ground property networks, we discover parcels and assets whose true development potential is not yet recognised by the market.",
    },
    {
      num: "02",
      name: "Assess",
      summary: "Analyse planning, constraints, market conditions and development potential.",
      desc: "Detailed technical, planning and commercial feasibility assessment. We evaluate local plan policies, highways, ecology, title restrictions and micro-location demand before progressing.",
    },
    {
      num: "03",
      name: "Structure",
      summary: "Determine the appropriate acquisition or partnership strategy.",
      desc: "We agree tailored transaction structures that suit the landowner or asset owner: unconditional acquisition, option agreements, planning promotion agreements or joint ventures.",
    },
    {
      num: "04",
      name: "Plan",
      summary: "Work through planning and professional due diligence.",
      desc: "We appoint top-tier UK planning consultants, architects, environmental specialists and legal counsel to assemble robust planning submissions designed to withstand committee scrutiny.",
    },
    {
      num: "05",
      name: "Fund",
      summary: "Structure appropriate development funding and capital partnerships.",
      desc: "We structure senior debt, mezzanine finance, institutional equity and development capital alongside trusted UK institutional lenders and family offices.",
    },
    {
      num: "06",
      name: "Develop",
      summary: "Progress viable projects towards delivery.",
      desc: "Working with vetted main contractors and professional project managers, we advance consented schemes through procurement, groundworks and high-specification construction.",
    },
    {
      num: "07",
      name: "Realise",
      summary: "Create and capture the resulting commercial value.",
      desc: "Value is crystallised through disciplined phased disposal, build-to-rent stabilisation, or turnkey delivery to registered housing providers or institutional investors.",
    },
  ];

  return (
    <Section id="our-approach">
      <Container>
        <SectionHeader
          eyebrow="Our Approach"
          title="The 7-Step Value Creation Model"
          description="A disciplined, repeatable process transforming overlooked UK land and buildings into consented, deliverable development assets."
        />

        <div className="border-t border-brand-edge">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="py-10 sm:py-12 border-b border-brand-edge grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline group hover:bg-brand-surface/40 transition-colors px-4 -mx-4 rounded-sm"
            >
              <div className="lg:col-span-2 flex items-baseline gap-4">
                <span className="text-2xl sm:text-3xl font-extralight text-brand-electric font-mono">
                  {step.num}
                </span>
                <span className="text-xl sm:text-2xl font-light text-brand-graphite">
                  {step.name}
                </span>
              </div>

              <div className="lg:col-span-5">
                <p className="text-base sm:text-lg font-normal text-brand-graphite leading-snug">
                  {step.summary}
                </p>
              </div>

              <div className="lg:col-span-5">
                <p className="text-sm font-light text-brand-silver leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between flex-wrap gap-4 pt-4">
          <p className="text-sm text-brand-silver font-light">
            Read our in-depth operational approach and commercial terms.
          </p>
          <Button href="/approach" variant="outline" size="md" showArrow>
            Explore Complete Methodology
          </Button>
        </div>
      </Container>
    </Section>
  );
}
