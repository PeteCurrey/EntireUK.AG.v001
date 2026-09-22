"use client";
import React from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function AudienceLandowners() {
  const points = [
    "Comprehensive planning policy evaluation at no upfront cost to the landowner.",
    "Flexible structuring: unconditional freehold purchase, option agreements, or promotion agreements.",
    "Entire UK covers professional planning fees, architectural design and technical reports.",
    "Transparent alignment of interests aimed at maximising net land value.",
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-brand-edge">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal>
              <div className="eyebrow">For Landowners</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-2">
                Is your land worth more <br className="hidden sm:inline" />
                than you think?
              </h2>
              <p className="text-base sm:text-lg font-light text-brand-silver leading-relaxed max-w-xl mt-3">
                Securing planning permission can increase land value by multiples.
                However, navigating local planning committees, environmental impact assessments and
                highways authority requirements is complex and capital-intensive.
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
                  href="/submit/land"
                  variant="primary"
                  size="lg"
                  showArrow
                  onClick={() =>
                    trackEvent({
                      name: "cta_submit_land_clicked",
                      properties: { location: "landowner_section" },
                    })
                  }
                >
                  Submit Your Land
                </Button>
                <Button href="/contact" variant="outline" size="lg">
                  Talk to Entire UK
                </Button>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5">
            <ScrollReveal delayMs={150}>
              <div className="p-8 sm:p-10 rounded-sm bg-brand-surface border border-brand-edge space-y-6 card-spatial">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-silver">
                  Land Valuation Reality
                </span>
                <h3 className="text-xl font-normal text-brand-graphite">
                  Maximising Value Without Risk
                </h3>
                <p className="text-sm font-light text-brand-silver leading-relaxed">
                  We fund 100% of the planning risk, surveys and specialist consultant costs.
                  If permission is not achieved, you owe nothing. If consented, you participate
                  directly in the heightened commercial land value.
                </p>
                <div className="pt-4 border-t border-brand-edge text-xs font-mono text-brand-electric">
                  Agricultural · Greenfield · Edge of Settlement · Brownfield
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
