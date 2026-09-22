"use client";
import React from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
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
            <div className="eyebrow">For Landowners</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight">
              Is your land worth more <br className="hidden sm:inline" />
              than you think?
            </h2>
            <p className="text-base sm:text-lg font-light text-brand-silver leading-relaxed max-w-xl">
              Securing planning permission can increase land value by multiples.
              However, navigating local planning committees, environmental impact assessments and
              highways authority requirements is complex and capital-intensive.
            </p>

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
          </div>

          <div className="lg:col-span-5">
            <div className="p-8 sm:p-10 rounded-sm bg-brand-surface border border-brand-edge space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-silver">
                Landowner Checklist
              </span>
              <h3 className="text-xl font-normal text-brand-graphite">
                Types of Land We Review
              </h3>
              <div className="space-y-4 text-xs font-light text-brand-silver">
                <div className="p-3.5 bg-white border border-brand-edge rounded-sm">
                  <span className="font-medium text-brand-graphite block mb-1">
                    Agricultural &amp; Greenfield
                  </span>
                  Sites adjoining established towns and villages with potential for future settlement expansion.
                </div>
                <div className="p-3.5 bg-white border border-brand-edge rounded-sm">
                  <span className="font-medium text-brand-graphite block mb-1">
                    Infill &amp; Edge Parcels
                  </span>
                  Unused pasture, paddock land, or redundant farm yards with immediate access to highway networks.
                </div>
                <div className="p-3.5 bg-white border border-brand-edge rounded-sm">
                  <span className="font-medium text-brand-graphite block mb-1">
                    Strategic Acreage
                  </span>
                  10–100+ acre parcels suitable for long-term promotion through Emerging Local Plans.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
