"use client";

import React, { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Entire UK] Unhandled application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 bg-brand-surface">
      <Container size="narrow">
        <div className="bg-white border border-brand-edge rounded-sm p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="eyebrow justify-center">System Notice</div>
            <h1 className="text-2xl sm:text-3xl font-extralight text-brand-graphite">
              An unexpected error occurred
            </h1>
            <p className="text-sm font-light text-brand-silver max-w-md mx-auto leading-relaxed">
              The requested view could not be rendered. Our engineering team has been notified.
              If you were submitting an opportunity, your form progress in this browser session remains safe.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" onClick={() => reset()}>
              Try Again
            </Button>
            <Button href="/" variant="outline">
              Return to Homepage
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
