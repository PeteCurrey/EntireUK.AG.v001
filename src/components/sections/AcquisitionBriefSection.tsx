import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Button } from "../ui/Button";
import { CheckCircle2, ArrowRight, ShieldCheck, MapPin, Scale, Layers } from "lucide-react";
import Link from "next/link";

export function AcquisitionBriefSection() {
  const briefCriteria = [
    {
      label: "Geographic Focus",
      requirement: "England, Scotland & Wales",
      details: "Priority corridors include the Midlands Growth Engine, Western Gateway, Thames Valley growth arc, and well-connected regional settlements with demonstrably strong economic fundamentals.",
    },
    {
      label: "Land & Site Typologies",
      requirement: "Brownfield, Edge-of-Settlement & Commercial Conversion",
      details: "Previously developed land (PDL), redundant transport or industrial depots, vacant commercial buildings with Class MA conversion potential, and strategic agricultural parcels immediately adjoining settlement boundaries.",
    },
    {
      label: "Target Scale & Acreage",
      requirement: "1 to 50+ Acres (or 10,000+ sq ft Built Assets)",
      details: "From urban infill parcels and single redundant commercial buildings through to strategic greenfield expansions capable of delivering 20 to 500+ residential dwellings or mixed-use employment.",
    },
    {
      label: "Access & Infrastructure",
      requirement: "Defensible Vehicular Access",
      details: "Sites must either possess direct frontage to adopted public highway or clear, unencumbered private rights of way. We also actively evaluate sites with access ransoms where structured legal assembly is achievable.",
    },
    {
      label: "Planning Policy Context",
      requirement: "Demonstrable Planning Angle",
      details: "Brownfield land under the NPPF presumption, unallocated parcels adjoining settlements where the LPA suffers a 5-year housing land supply deficit, or call-for-sites entries within emerging Local Development Schemes.",
    },
    {
      label: "Commercial Structures",
      requirement: "Tailored to Landowner & Asset Circumstances",
      details: "Unconditional freehold purchases for immediate certainty, planning promotion agreements with 100% funded planning risk, option agreements with defined floor values, and collaborative joint ventures.",
    },
  ];

  return (
    <Section id="acquisition-brief" className="bg-white border-t border-brand-edge">
      <Container>
        <ScrollReveal>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Acquisition Brief</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              What We Are Looking For
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Entire UK operates as a disciplined principal buyer and development partner backed by committed capital. We evaluate all opportunities against clear planning, environmental and commercial criteria.
            </p>
          </div>
        </ScrollReveal>

        {/* 6-Criteria Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {briefCriteria.map((item, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 60}>
              <div className="p-7 rounded-sm bg-brand-surface border border-brand-edge flex flex-col justify-between h-full card-spatial">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-brand-electric">
                      Brief #{idx + 1}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-brand-electric" />
                  </div>
                  <h3 className="text-base font-medium text-brand-graphite">
                    {item.label}
                  </h3>
                  <div className="text-xs font-mono uppercase tracking-wider text-brand-graphite bg-white px-2.5 py-1 rounded-sm border border-brand-edge w-fit">
                    {item.requirement}
                  </div>
                  <p className="text-xs font-light text-brand-silver leading-relaxed pt-1">
                    {item.details}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Call to Action Banner */}
        <ScrollReveal delayMs={150}>
          <div className="p-8 sm:p-10 rounded-sm bg-brand-void text-white border border-brand-edge-dark flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-electric">
                Have a Site That Fits This Brief?
              </span>
              <h4 className="text-2xl sm:text-3xl font-extralight text-white tracking-tight">
                Submit an opportunity for confidential principal review.
              </h4>
              <p className="text-xs sm:text-sm font-light text-brand-mist/80 leading-relaxed">
                We review submissions within 5 business days. Direct principal decisions without speculative broker chains.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Button href="/submit" variant="primary" size="lg" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/contact" variant="ghost" size="lg">
                Speak With Our Team
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
