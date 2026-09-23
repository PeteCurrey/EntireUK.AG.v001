import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { ScrollReveal } from "../ui/ScrollReveal";
import { EditorialMedia } from "../ui/EditorialMedia";
import { Button } from "../ui/Button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DevelopmentPurposeSection() {
  const pillars = [
    {
      title: "Architectural & Placemaking Merit",
      desc: "We commission designs that harmonise with regional vernacular while delivering forward-thinking energy performance, natural daylighting and generous public realm.",
    },
    {
      title: "Environmental Longevity & BNG",
      desc: "Schemes integrate sustainable urban drainage (SuDS), active ecological corridors and a minimum of 10% on-site Biodiversity Net Gain.",
    },
    {
      title: "Built-Environment Operational Synergy",
      desc: "Partnering with sister company EntireFM, our developments benefit from operational engineering, compliance and facilities maintenance expertise embedded from initial design.",
    },
    {
      title: "Community & Stakeholder Alignment",
      desc: "Constructive engagement with Parish Councils, local planning authorities and neighbouring residents to deliver deliverable schemes that meet local housing and commercial needs.",
    },
  ];

  return (
    <Section surface={true} id="development-with-purpose">
      <Container>
        <ScrollReveal>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Beyond Acquisition</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              Development with purpose.
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              A piece of land is only the beginning. Entire UK takes consented schemes into physical delivery — combining planning consent, institutional capital structuring, and vetted contractor execution to create enduring built assets.
            </p>
          </div>
        </ScrollReveal>

        {/* Dual Media Composition: Aerial Land + Completed High-Spec Architecture */}
        <ScrollReveal delayMs={100}>
          <EditorialMedia
            variant="dual"
            primaryImage={{
              src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
              alt: "High-quality residential development with thoughtful architectural design and landscaping",
              badge: "Delivery & Execution",
              caption: "Contemporary residential scheme demonstrating sensitive massing and sustainable materials.",
            }}
            secondaryImage={{
              src: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80",
              alt: "Active construction site delivery oversight by professional management team",
              badge: "Civil Delivery",
              caption: "Site infrastructure, groundworks and structural engineering execution.",
            }}
          />
        </ScrollReveal>

        {/* 4 Delivery Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {pillars.map((p, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 60}>
              <div className="p-6 rounded-sm bg-white border border-brand-edge h-full flex flex-col justify-between space-y-3 card-spatial">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-brand-electric">
                    Pillar 0{idx + 1}
                  </span>
                  <h3 className="text-base font-medium text-brand-graphite">
                    {p.title}
                  </h3>
                  <p className="text-xs font-light text-brand-silver leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
