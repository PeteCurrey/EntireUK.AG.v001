import React from "react";
import { Hero } from "@/components/sections/Hero";
import { OpportunityThesis } from "@/components/sections/OpportunityThesis";
import { OpportunityCategories } from "@/components/sections/OpportunityCategories";
import { DataToDevelopment } from "@/components/sections/DataToDevelopment";
import { LandRadarFeature } from "@/components/sections/LandRadarFeature";
import { AudienceLandowners } from "@/components/sections/AudienceLandowners";
import { AudiencePropertyOwners } from "@/components/sections/AudiencePropertyOwners";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CtaSection } from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <OpportunityThesis />
      <OpportunityCategories />
      <DataToDevelopment />
      <LandRadarFeature />
      <AudienceLandowners />
      <AudiencePropertyOwners />
      <ProcessTimeline />
      <CtaSection />
    </>
  );
}
