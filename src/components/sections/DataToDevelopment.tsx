import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { ArrowRight, Database, Cpu, Search, FileText, CheckCircle, Hammer } from "lucide-react";

export function DataToDevelopment() {
  const steps = [
    { icon: Database, label: "Data", detail: "Ordnance survey, land registry, planning portals, environmental maps" },
    { icon: Cpu, label: "Intelligence", detail: "Constraint mapping, policy matching, spatial correlation" },
    { icon: Search, label: "Assessment", detail: "Experienced human evaluation, site viability and density review" },
    { icon: FileText, label: "Opportunity", detail: "Commercial structuring, acquisition or promotion agreement" },
    { icon: CheckCircle, label: "Planning", detail: "Specialist consultancy, architectural design and committee consent" },
    { icon: Hammer, label: "Development", detail: "Delivery with vetted construction partners and institutional funding" },
  ];

  return (
    <Section surface={true} id="methodology">
      <Container>
        <SectionHeader
          eyebrow="Proprietary Methodology"
          title="From Data to Development"
          description="Technology enables us to scan and prioritise vast datasets across the UK. Experienced human property professionals ensure that only viable, high-quality schemes are taken forward."
        />

        {/* Visual Pipeline Chain */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white border border-brand-edge rounded-sm flex flex-col justify-between relative group hover:border-brand-electric/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-brand-electric">
                      0{idx + 1}
                    </span>
                    <Icon className="w-4 h-4 text-brand-silver group-hover:text-brand-electric transition-colors" />
                  </div>
                  <h3 className="text-base font-medium text-brand-graphite mb-2">
                    {step.label}
                  </h3>
                  <p className="text-xs font-light text-brand-silver leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-brand-edge">
                    <ArrowRight className="w-4 h-4 text-brand-silver/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Human + Tech Balance Explanation */}
        <div className="mt-12 p-8 rounded-sm bg-white border border-brand-edge grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h4 className="text-xl font-light text-brand-graphite">
              Technology accelerates discovery. Human expertise secures execution.
            </h4>
            <p className="text-sm font-light text-brand-silver leading-relaxed">
              We do not believe algorithmic models can replace the nuance of British planning law,
              local politics, highways engineering or commercial negotiation. Entire UK uses data to
              find the needle in the haystack — then applies decades of built-environment experience to
              deliver the result.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <a
              href="/technology"
              className="px-5 py-3 rounded-sm bg-brand-surface border border-brand-edge text-xs font-medium uppercase tracking-wider text-brand-graphite hover:border-brand-electric/50 transition-colors inline-flex items-center gap-2"
            >
              <span>Explore Land Radar</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-electric" />
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
