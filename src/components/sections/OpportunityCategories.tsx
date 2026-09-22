import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Building2, Trees, Factory, Landmark, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function OpportunityCategories() {
  const categories = [
    {
      icon: Trees,
      title: "Development Land",
      subtitle: "Residential & Commercial Sites",
      description:
        "Parcels with immediate or medium-term potential for residential housing developments, commercial expansion, or mixed-use schemes.",
      criteria: "Edge-of-settlement, allocated or unallocated with sensible access.",
      planningContext: "Local Plan allocations, call-for-sites promotion, SHLAA reviews.",
      targetPath: "/submit/land",
      cta: "Submit Land",
    },
    {
      icon: Factory,
      title: "Brownfield & Regeneration",
      subtitle: "Previously Developed Land",
      description:
        "Former industrial premises, redundant yards, transport depots, and previously developed urban land where remediation can unlock substantial renewal.",
      criteria: "Urban infill, redundant yards, former employment sites.",
      planningContext: "NPPF Annex 2 brownfield presumption, urban renewal corridors.",
      targetPath: "/submit/property",
      cta: "Submit Brownfield Site",
    },
    {
      icon: Building2,
      title: "Conversion Opportunities",
      subtitle: "Repurposing Built Assets",
      description:
        "Existing commercial, retail, agricultural, or office buildings suitable for conversion to residential or modern commercial uses via Permitted Development (PD) or full planning.",
      criteria: "Class MA, Class Q, redundant offices, vacant high-street premises.",
      planningContext: "Permitted Development rights, Class MA commercial-to-residential.",
      targetPath: "/submit/property",
      cta: "Submit Property",
    },
    {
      icon: Landmark,
      title: "Strategic Land",
      subtitle: "Long-Term Policy Promotion",
      description:
        "Medium-to-long term land parcels aligned with local plan reviews, infrastructure corridors, and spatial development strategies across the UK.",
      criteria: "10 to 100+ acres adjoining existing sustainable settlements.",
      planningContext: "5-10 year strategic promotion, Green Belt reviews, infrastructure nodes.",
      targetPath: "/submit/land",
      cta: "Submit Strategic Land",
    },
    {
      icon: MapPin,
      title: "Underutilised Property",
      subtitle: "Sub-Optimal Density or Use",
      description:
        "Properties where existing floorplate, height, or use classification substantially undervalues the underlying site potential.",
      criteria: "Low-density retail parks, car parks, assembly spaces, yard storage.",
      planningContext: "Airspace development, densification, mixed-use commercial masterplanning.",
      targetPath: "/submit/opportunity",
      cta: "Submit Opportunity",
    },
  ];

  return (
    <Section id="what-we-look-for">
      <Container>
        <ScrollReveal>
          <SectionHeader
            eyebrow="Target Typologies"
            title="What We Look For"
            description="We assess diverse asset types across England, Scotland and Wales. Every site is rigorously evaluated on its planning merits, physical feasibility and commercial deliverability."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <ScrollReveal key={idx} delayMs={idx * 75}>
                <div
                  className="group border border-brand-edge rounded-sm p-8 bg-white hover:border-brand-electric/50 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden card-spatial"
                >
                  {/* Subtle top indicator bar on hover */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-brand-electric opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-11 h-11 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric group-hover:bg-brand-electric/10 group-hover:border-brand-electric/30 group-hover:scale-105 transition-all">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-brand-silver">
                        Type 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-medium text-brand-graphite mb-1 group-hover:text-brand-graphite transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-brand-silver mb-3">
                      {cat.subtitle}
                    </p>
                    <p className="text-sm font-light text-brand-silver leading-relaxed mb-6">
                      {cat.description}
                    </p>

                    {/* Progressive Reveal Details on Hover */}
                    <div className="pt-4 border-t border-brand-edge/60 space-y-2 mb-6">
                      <p className="text-xs text-brand-graphite font-normal">
                        <span className="text-brand-silver font-light">Key Indicators: </span>
                        {cat.criteria}
                      </p>
                      <p className="text-[11px] text-brand-silver/90 font-light max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                        <span className="text-brand-graphite font-medium">Planning Context: </span>
                        {cat.planningContext}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={cat.targetPath}
                    className="text-xs uppercase tracking-wider text-brand-electric font-medium inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{cat.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}

          {/* Quick Criteria Callout Card */}
          <ScrollReveal delayMs={categories.length * 75}>
            <div className="border border-brand-edge-dark rounded-sm p-8 bg-brand-graphite text-white flex flex-col justify-between h-full relative overflow-hidden card-spatial">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-brand-electric" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-brand-electric" />
                  <span className="eyebrow eyebrow-dark">Acquisition Discipline</span>
                </div>
                <h3 className="text-xl font-light text-white mb-3">
                  Subject to Planning &amp; Due Diligence
                </h3>
                <p className="text-sm font-light text-brand-mist/80 leading-relaxed mb-4">
                  Not every site will be developable. We conduct meticulous due diligence
                  on legal title, access rights, ecology, flood risk and planning policy before
                  committing to an acquisition or promotion agreement.
                </p>
                <div className="p-3 rounded-sm bg-white/[0.04] border border-white/10 text-xs font-mono text-brand-mist/70">
                  Zero speculative bids without verified title &amp; access.
                </div>
              </div>
              <div className="pt-6 border-t border-white/[0.08] mt-6">
                <Link
                  href="/submit"
                  className="text-xs uppercase tracking-wider text-white font-medium inline-flex items-center gap-2 hover:text-brand-electric transition-colors"
                >
                  <span>Submit Any Site For Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
