"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "opportunity";
  const ref = searchParams.get("ref") || "EUK-SUBMISSION";

  const typeLabels: Record<string, { title: string; subtitle: string }> = {
    land: {
      title: "Land Submission Received",
      subtitle: "Thank you for submitting your land details to Entire UK.",
    },
    property: {
      title: "Property Submission Received",
      subtitle: "Thank you for submitting your property details to Entire UK.",
    },
    opportunity: {
      title: "Opportunity Submission Received",
      subtitle: "Thank you for submitting this development opportunity to Entire UK.",
    },
    partner: {
      title: "Partnership Inquiry Received",
      subtitle: "Thank you for your partnership inquiry with Entire UK.",
    },
  };

  const currentLabel = typeLabels[type] || typeLabels.opportunity;

  return (
    <div className="pt-28 sm:pt-36 pb-24 bg-brand-surface min-h-screen">
      <Container size="narrow">
        <div className="bg-white border border-brand-edge rounded-sm p-8 sm:p-12 shadow-sm space-y-8">
          {/* Header Status */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="eyebrow justify-center">Persistence Confirmed</span>

            <h1 className="text-3xl sm:text-4xl font-extralight text-brand-graphite tracking-tight">
              {currentLabel.title}
            </h1>

            <p className="text-base font-light text-brand-silver max-w-lg mx-auto leading-relaxed">
              {currentLabel.subtitle}
            </p>

            <div className="inline-block px-4 py-2 rounded-sm bg-brand-surface border border-brand-edge text-xs font-mono text-brand-graphite">
              Submission Reference: <span className="font-semibold text-brand-electric">{ref}</span>
            </div>
          </div>

          {/* Truthful Status Card */}
          <div className="p-6 rounded-sm bg-brand-surface border border-brand-edge space-y-3 text-xs sm:text-sm font-light text-brand-silver leading-relaxed">
            <h2 className="text-sm font-medium text-brand-graphite flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-electric" />
              <span>What Happens Next</span>
            </h2>
            <p>
              We&apos;ve securely received the information you provided. Our acquisitions and planning
              team will review the submission against our current acquisition criteria and local planning policy.
            </p>
            <p>
              If the site aligns with our target development typologies and passes initial viability screening,
              a member of our team will be in contact directly using the details provided.
            </p>
          </div>

          {/* Strict Compliance Notice */}
          <div className="p-4 rounded-sm bg-white border border-brand-edge text-xs font-light text-brand-silver space-y-1">
            <p className="font-medium text-brand-graphite flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-silver" />
              <span>Commercial Statement:</span>
            </p>
            <p>
              Submission of information does not constitute an offer to purchase, an acceptance of the opportunity,
              or a commitment by Entire UK to proceed with any transaction. All proposals remain subject to contract,
              satisfactory title, planning and formal due diligence.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-brand-edge flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button href="/" variant="outline" size="md">
              Return to Homepage
            </Button>
            <Button href="/approach" variant="primary" size="md" showArrow>
              Explore Our Approach
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function SubmitSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 text-center text-brand-silver text-sm">
          Loading submission details…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
