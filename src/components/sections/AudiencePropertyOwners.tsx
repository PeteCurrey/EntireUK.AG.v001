"use client";
import React from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function AudiencePropertyOwners() {
  const points = [
    "Expertise in Permitted Development Rights (Class MA commercial-to-residential, Class Q agricultural).",
    "Airspace, vertical intensification and rear extension capacity analysis.",
    "Fast freehold acquisitions for vacant, dilapidated or high-vacancy properties.",
    "Joint venture structures for building owners seeking to participate in development upside.",
  ];

  return (
    <section className="py-20 sm:py-28 bg-brand-surface border-y border-brand-edge">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <ScrollReveal delayMs={100}>
              <div className="p-8 sm:p-10 rounded-sm bg-white border border-brand-edge space-y-6 card-spatial">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-silver">
                  Asset Repurposing
                </span>
                <h3 className="text-xl font-normal text-brand-graphite">
                  Building Repurposing Paths
                </h3>
                <div className="space-y-4 text-xs font-light text-brand-silver">
                  <div className="p-3.5 bg-brand-surface border border-brand-edge rounded-sm">
                    <span className="font-medium text-brand-graphite block mb-1">
                      Commercial to Residential (Class MA)
                    </span>
                    Vacant offices, retail upper parts and high-street properties suitable for residential conversion.
                  </div>
                  <div className="p-3.5 bg-brand-surface border border-brand-edge rounded-sm">
                    <span className="font-medium text-brand-graphite block mb-1">
                      Industrial &amp; Warehousing
                    </span>
                    Redundant logistics, light-industrial and trade counter premises with site intensification potential.
                  </div>
                  <div className="p-3.5 bg-brand-surface border border-brand-edge rounded-sm">
                    <span className="font-medium text-brand-graphite block mb-1">
                      Sub-Optimal Footprints
                    </span>
                    Low-density single-storey structures where vertical massing or demolition and rebuild creates superior yield.
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <ScrollReveal>
              <div className="eyebrow">For Property Owners</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-2">
                The building may be worth more <br className="hidden sm:inline" />
                than its current use.
              </h2>
              <p className="text-base sm:text-lg font-light text-brand-silver leading-relaxed max-w-xl mt-3">
                Changes in UK planning policy, permitted development regulations and post-pandemic
                occupier demand have altered the economic viability of commercial and light industrial buildings.
                We identify opportunities where alternative uses can unlock substantial trapped value.
              </p>
            </ScrollReveal>

            <ScrollReveal delayMs={100}>
              <ul className="space-y-3 pt-2">
                {points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-brand-graphite font-light">
                    <span className="w-5 h-5 rounded-full bg-brand-electric/10 text-brand-electric flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delayMs={200}>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Button
                  href="/submit/property"
                  variant="primary"
                  size="lg"
                  showArrow
                  onClick={() =>
                    trackEvent({
                      name: "cta_submit_property_clicked",
                      properties: { location: "property_owner_section" },
                    })
                  }
                >
                  Submit a Property
                </Button>
                <Button href="/contact" variant="outline" size="lg">
                  Discuss an Asset
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
