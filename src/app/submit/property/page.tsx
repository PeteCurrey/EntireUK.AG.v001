import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { MultiStepOpportunityForm } from "@/components/forms/MultiStepOpportunityForm";
import { generatePageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Submit Property",
  description:
    "Property owner submission portal for Entire UK. Submit commercial premises, offices, industrial units or redundant buildings for conversion and redevelopment.",
  path: "/submit/property",
});

export default function SubmitPropertyPage() {
  return (
    <div className="bg-brand-surface min-h-screen pb-20">
      <PageHero
        eyebrow="Pathway: Property Owners"
        badge="Repurposing & Commercial Conversion"
        title="SUBMIT A"
        subtitle="PROPERTY OR BUILDING."
        description="Provide details of your commercial building, industrial unit, retail premises, or redundant built asset. We assess adaptive reuse, Class MA permitted development rights, vertical massing, and unconditional freehold acquisition."
        imageSrc="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80"
        imageAlt="UK commercial and industrial property repurposing opportunity"
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
          <span className="text-xs font-light text-brand-mist/60">Complete the property details below</span>
        </div>
      </PageHero>

      <Container size="narrow">
        <MultiStepOpportunityForm
          category="property"
          categoryTitle="Property Repurposing Assessment"
          categorySubtitle="Building &amp; Asset Details"
        />
      </Container>
    </div>
  );
}
