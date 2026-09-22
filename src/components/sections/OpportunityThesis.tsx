import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { ScrollReveal } from "../ui/ScrollReveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function OpportunityThesis() {
  const valuationDrivers = [
    {
      title: "Planning & Policy Allocation",
      desc: "Unlocking allocated land, draft local plan reviews, and brownfield exemptions to transform site viability.",
    },
    {
      title: "Use Classification & Permitted Development",
      desc: "Converting underperforming commercial, agricultural, and industrial space to higher-value residential or mixed-use.",
    },
    {
      title: "Density & Massing Optimisation",
      desc: "Architectural re-evaluation to achieve superior density while respecting local planning constraints and heritage.",
    },
    {
      title: "Infrastructure & Access Solutions",
      desc: "Resolving ransoms, access rights, easements, flood mitigation, and highways capacity.",
    },
    {
      title: "Market Demand Alignment",
      desc: "Targeting structural undersupply in regional UK growth corridors, logistics nodes, and residential hubs.",
    },
    {
      title: "Capital & Delivery Structuring",
      desc: "Structuring acquisition agreements that balance landowner objectives with institutional development delivery.",
    },
  ];

  return (
    <Section surface={true} id="thesis">
      <Container>
        <ScrollReveal>
          <SectionHeader
            eyebrow="The Valuation Thesis"
            title="Where current use and development potential diverge."
            description="Land and property values are rarely static. They are governed by planning frameworks, allowable density, infrastructure capacity and commercial demand. Entire UK exists to identify and close that gap."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {valuationDrivers.map((driver, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 60}>
              <div
                className="p-8 bg-white border border-brand-edge rounded-sm card-spatial h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-brand-electric tracking-widest">
                      0{idx + 1}
                    </span>
                    <div className="h-px flex-grow bg-brand-edge" />
                  </div>
                  <h3 className="text-lg font-medium text-brand-graphite mb-2.5">
                    {driver.title}
                  </h3>
                  <p className="text-sm font-light text-brand-silver leading-relaxed">
                    {driver.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delayMs={150}>
          <div className="mt-12 p-6 sm:p-8 rounded-sm bg-white border border-brand-edge flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-spatial">
            <div className="space-y-1 max-w-2xl">
              <h4 className="text-base font-medium text-brand-graphite">
                A disciplined approach to land acquisition
              </h4>
              <p className="text-sm font-light text-brand-silver">
                We evaluate hundreds of prospective sites to pursue only those where planning viability,
                commercial fundamentals and execution capability genuinely align.
              </p>
            </div>
            <Link
              href="/approach"
              className="text-sm text-brand-electric font-medium hover:underline inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Review Our 7-Step Model</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
