import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { MultiStepOpportunityForm } from "@/components/forms/MultiStepOpportunityForm";
import { generatePageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Submit Land",
  description:
    "Landowner submission portal for Entire UK. Submit agricultural parcels, greenfield acreage, infill sites or strategic land for planning review.",
  path: "/submit/land",
});

export default function SubmitLandPage() {
  return (
    <div className="bg-brand-surface min-h-screen pb-20">
      <PageHero
        eyebrow="Pathway: Landowners"
        badge="Direct Acquisition & Promotion"
        title="SUBMIT YOUR"
        subtitle="LAND OR ACREAGE."
        description="Provide details of your parcel, greenfield land, or strategic acreage. We assess planning policy, density potential, infrastructure capacity, and residual land value at our own cost."
        imageSrc="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80"
        imageAlt="UK agricultural and development acreage"
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
          <span className="text-xs font-light text-brand-mist/60">Complete the assessment form below</span>
        </div>
      </PageHero>

      <Container size="narrow">
        <MultiStepOpportunityForm
          category="land"
          categoryTitle="Land Acquisition Assessment"
          categorySubtitle="Land &amp; Parcel Details"
        />
      </Container>
    </div>
  );
}
