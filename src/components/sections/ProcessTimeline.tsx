"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Check, ArrowRight } from "lucide-react";

export function ProcessTimeline() {
  const steps = [
    {
      num: "01",
      name: "Identify",
      summary: "Find overlooked land and property opportunities.",
      desc: "Using our proprietary Land Radar data engine alongside deep on-the-ground property networks, we discover parcels and assets whose true development potential is not yet recognised by the market.",
      milestone: "Candidate surfaced via spatial & statutory screening",
    },
    {
      num: "02",
      name: "Assess",
      summary: "Analyse planning, constraints, market conditions and development potential.",
      desc: "Detailed technical, planning and commercial feasibility assessment. We evaluate local plan policies, highways, ecology, title restrictions and micro-location demand before progressing.",
      milestone: "Candidate Truth Ledger & Highways audit completed",
    },
    {
      num: "03",
      name: "Structure",
      summary: "Determine the appropriate acquisition or partnership strategy.",
      desc: "We agree tailored transaction structures that suit the landowner or asset owner: unconditional acquisition, option agreements, planning promotion agreements or joint ventures.",
      milestone: "Commercial structure agreed with vendor",
    },
    {
      num: "04",
      name: "Plan",
      summary: "Work through planning and professional due diligence.",
      desc: "We appoint top-tier UK planning consultants, architects, environmental specialists and legal counsel to assemble robust planning submissions designed to withstand committee scrutiny.",
      milestone: "Consented planning application secured",
    },
    {
      num: "05",
      name: "Fund",
      summary: "Structure appropriate development funding and capital partnerships.",
      desc: "We structure senior debt, mezzanine finance, institutional equity and development capital alongside trusted UK institutional lenders and family offices.",
      milestone: "Institutional development capital drawn down",
    },
    {
      num: "06",
      name: "Develop",
      summary: "Progress viable projects towards delivery.",
      desc: "Working with vetted main contractors and professional project managers, we advance consented schemes through procurement, groundworks and high-specification construction.",
      milestone: "Practical completion by vetted main contractors",
    },
    {
      num: "07",
      name: "Realise",
      summary: "Create and capture the resulting commercial value.",
      desc: "Value is crystallised through disciplined phased disposal, build-to-rent stabilisation, or turnkey delivery to registered housing providers or institutional investors.",
      milestone: "Crystallised value distributed to stakeholders",
    },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.45;
      let currentIndex = 0;

      stepRefs.current.forEach((el, idx) => {
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollY >= top) {
            currentIndex = idx;
          }
        }
      });

      setActiveStepIndex(currentIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Section id="our-approach">
      <Container>
        <ScrollReveal>
          <SectionHeader
            eyebrow="Our Approach"
            title="The 7-Step Value Creation Model"
            description="A disciplined, repeatable process transforming overlooked UK land and buildings into consented, deliverable development assets."
          />
        </ScrollReveal>

        {/* Dynamic Timeline Wrapper */}
        <div className="relative mt-8">
          <div className="border-t border-brand-edge divide-y divide-brand-edge">
            {steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = activeStepIndex > idx;

              return (
                <div
                  key={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className={`py-10 sm:py-12 px-5 -mx-5 rounded-sm transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline group ${
                    isActive
                      ? "bg-brand-surface border-l-2 border-l-brand-electric shadow-sm"
                      : isPast
                      ? "opacity-85 hover:opacity-100 hover:bg-brand-surface/40"
                      : "opacity-60 hover:opacity-100 hover:bg-brand-surface/30"
                  }`}
                >
                  {/* Step Number and Name */}
                  <div className="lg:col-span-3 flex items-baseline gap-4">
                    <span
                      className={`text-2xl sm:text-3xl font-extralight font-mono transition-colors ${
                        isActive
                          ? "text-brand-electric font-normal"
                          : isPast
                          ? "text-brand-electric/70"
                          : "text-brand-silver/50"
                      }`}
                    >
                      {step.num}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-light text-brand-graphite">
                          {step.name}
                        </span>
                        {isPast && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-brand-electric animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-silver block mt-0.5">
                        {step.milestone}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-4">
                    <p
                      className={`text-base sm:text-lg font-normal leading-snug transition-colors ${
                        isActive ? "text-brand-graphite" : "text-brand-graphite/90"
                      }`}
                    >
                      {step.summary}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-5">
                    <p className="text-sm font-light text-brand-silver leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Link & CTA */}
        <ScrollReveal delayMs={100}>
          <div className="mt-12 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-brand-edge/60">
            <div>
              <span className="text-xs uppercase tracking-widest text-brand-silver font-mono">
                Commercial Partnerships
              </span>
              <p className="text-sm text-brand-silver font-light mt-0.5">
                We work flexibly via unconditional acquisition, options, promotion agreements, or joint ventures.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button href="/approach" variant="outline" size="md">
                Explore Complete Methodology
              </Button>
              <Button href="/submit" variant="primary" size="md" showArrow>
                Submit a Site
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
