import React from "react";
import { Hero } from "@/components/sections/Hero";
import { HiddenOpportunitySection } from "@/components/sections/HiddenOpportunitySection";
import { OpportunityCategories } from "@/components/sections/OpportunityCategories";
import { AcquisitionProcessExplorer } from "@/components/interactive/AcquisitionProcessExplorer";
import { LandRadarFeature } from "@/components/sections/LandRadarFeature";
import { DataToDevelopment } from "@/components/sections/DataToDevelopment";
import { AcquisitionBriefSection } from "@/components/sections/AcquisitionBriefSection";
import { AudienceLandowners } from "@/components/sections/AudienceLandowners";
import { AudiencePropertyOwners } from "@/components/sections/AudiencePropertyOwners";
import { DevelopmentPurposeSection } from "@/components/sections/DevelopmentPurposeSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HiddenOpportunitySection />
      <OpportunityCategories />

      {/* Interactive 7-Stage Process Framework */}
      <Section id="acquisition-framework" className="bg-white">
        <Container>
          <ScrollReveal>
            <div className="max-w-3xl mb-12 sm:mb-16">
              <span className="eyebrow">Our Methodology</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
                Our Acquisition Framework
              </h2>
              <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
                A disciplined seven-stage process guiding opportunities from initial spatial discovery through technical due diligence, contractual control, planning consent, capital structuring, construction and realization.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={100}>
            <AcquisitionProcessExplorer />
          </ScrollReveal>
        </Container>
      </Section>

      <LandRadarFeature />
      <DataToDevelopment />
      <AcquisitionBriefSection />
      <AudienceLandowners />
      <AudiencePropertyOwners />
      <DevelopmentPurposeSection />
      <CtaSection />
    </>
  );
}

