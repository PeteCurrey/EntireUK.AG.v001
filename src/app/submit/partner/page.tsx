import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { MultiStepOpportunityForm } from "@/components/forms/MultiStepOpportunityForm";
import { generatePageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Partner With Us",
  description:
    "Partnership enquiry portal for Entire UK. For planning consultancies, architects, developers, institutional capital partners and senior lenders.",
  path: "/submit/partner",
});

export default function SubmitPartnerPage() {
  return (
    <div className="bg-brand-surface min-h-screen pb-20">
      <PageHero
        eyebrow="Pathway: Partnerships & Capital"
        badge="Institutional & Industry Delivery"
        title="PARTNER WITH"
        subtitle="ENTIRE UK."
        description="We collaborate with planning consultancies, design architects, institutional development equity, senior clearing bank lenders, and vetted JCT main contractors. Tell us about your organization and partnership focus."
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Modern high-specification UK property development delivery and architectural collaboration"
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
          <span className="text-xs font-light text-brand-mist/60">Submit partnership inquiry below</span>
        </div>
      </PageHero>

      <Container size="narrow">
        <MultiStepOpportunityForm
          category="partner"
          categoryTitle="Professional Partnership"
          categorySubtitle="Collaboration &amp; Capabilities"
        />
      </Container>
    </div>
  );
}
