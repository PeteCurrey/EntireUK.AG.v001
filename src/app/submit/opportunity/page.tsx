import { PageHero } from "@/components/ui/PageHero";
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
    <div className="bg-brand-surface min-h-screen pb-20">
      <PageHero
        eyebrow="Pathway: Surveyors, Agents & Introducers"
        badge="Off-Market Introduction"
        title="SUBMIT AN"
        subtitle="OPPORTUNITY."
        description="For commercial agents, surveyors, land consultants, and introducers with off-market site intelligence. Introducing fees and agency representation are fully respected and protected."
        imageSrc="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
        imageAlt="UK commercial development and professional site introduction"
        containerSize="narrow"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-mist/80 hover:text-white px-3 py-1.5 rounded-sm border border-white/10 hover:border-white/30 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gateway</span>
          </Link>
          <span className="text-xs font-light text-brand-mist/60">Provide site intelligence below</span>
        </div>
      </PageHero>

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
