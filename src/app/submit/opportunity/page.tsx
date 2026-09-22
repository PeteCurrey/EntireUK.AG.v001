import React from "react";
import { Container } from "@/components/ui/Container";
import { MultiStepOpportunityForm } from "@/components/forms/MultiStepOpportunityForm";
import { generatePageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Submit an Opportunity",
  description:
    "Third-party opportunity submission portal for Entire UK. For agents, surveyors and site introducers with off-market development intelligence.",
  path: "/submit/opportunity",
});

export default function SubmitOpportunityPage() {
  return (
    <div className="pt-24 sm:pt-28 bg-brand-surface min-h-screen pb-20">
      <div className="bg-brand-void text-white py-12 sm:py-16 border-b border-brand-edge-dark mb-10">
        <Container size="narrow">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 text-xs font-light text-brand-mist/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gateway</span>
          </Link>
          <span className="eyebrow eyebrow-dark mb-3">Pathway: Site Introducer / Professional</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white mb-3">
            Submit an Opportunity
          </h1>
          <p className="text-sm sm:text-base font-light text-brand-mist/80 max-w-xl leading-relaxed">
            For agents, surveyors, land consultants and introducers who have identified a potential
            development site. Introducing fees and agency representation respected on agreed terms.
          </p>
        </Container>
      </div>

      <Container size="narrow">
        <MultiStepOpportunityForm
          category="opportunity"
          categoryTitle="Third-Party Introduction"
          categorySubtitle="Opportunity &amp; Site Details"
        />
      </Container>
    </div>
  );
}
