import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { ScrollReveal } from "../ui/ScrollReveal";
import { EditorialMedia } from "../ui/EditorialMedia";
import { Layers, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HiddenOpportunitySection() {
  const factors = [
    {
      label: "Current Physical Use",
      desc: "Agricultural grazing, low-density yard storage, or vacant commercial buildings frequently disguise strategic urban settlement context.",
    },
    {
      label: "Surrounding Settlement Growth",
      desc: "Neighbouring residential allocations and infrastructure expansions alter planning defensibility over 3-to-5 year policy cycles.",
    },
    {
      label: "Cadastral Assembly & Ransoms",
      desc: "Fragmented multi-title configurations and unadopted boundary strips prevent naive acquisition, creating opportunity for structured assembly.",
    },
    {
      label: "Emerging Statutory Policy",
      desc: "LPA five-year housing supply deficits and draft local plan call-for-sites open unexpected development windows before open-market awareness.",
    },
  ];

  return (
    <Section surface={true} id="hidden-opportunity" className="relative overflow-hidden">
      <Container>
        <ScrollReveal>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">The Core Thesis</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              The opportunity is often hidden.
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              The true development potential of UK land or property is rarely obvious from its present physical appearance. What looks like an unremarkable yard, edge-of-village paddock or obsolete commercial building may hold strategic development viability when viewed through planning policy, infrastructure capacity and title architecture.
            </p>
          </div>
        </ScrollReveal>

        {/* Editorial Split Media Component */}
        <ScrollReveal delayMs={100}>
          <EditorialMedia
            variant="split"
            primaryImage={{
              src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
              alt: "Aerial perspective of UK agricultural edge adjoining residential settlement corridor",
              badge: "Settlement Edge Analysis",
              caption: "Edge-of-settlement boundary inspection evaluating adopted highway interface and landscape capacity.",
              aspectRatio: "video",
            }}
            title="Beyond Present-Day Appearance"
            subtitle="How Value Diverges From Current Use"
            description="Conventional property searches rely on estate agents marketing consented plots with inflated premiums. Entire UK looks before the consensus forms — identifying land and buildings where policy evolution, access resolution, or assembly unlocks exceptional development potential."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {factors.map((f, i) => (
                <div key={i} className="p-3.5 rounded-sm bg-white border border-brand-edge space-y-1">
                  <span className="text-xs font-medium text-brand-graphite block">
                    {f.label}
                  </span>
                  <p className="text-[11px] font-light text-brand-silver leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/opportunities"
                className="text-xs font-mono uppercase tracking-wider text-brand-electric hover:underline inline-flex items-center gap-1.5"
              >
                <span>Explore Opportunity Typologies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </EditorialMedia>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
