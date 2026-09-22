import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center bg-brand-surface">
      <Container size="narrow">
        <div className="text-center p-8 sm:p-12 rounded-sm bg-white border border-brand-edge shadow-sm max-w-lg mx-auto space-y-6">
          <div className="w-12 h-12 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center mx-auto text-brand-silver">
            <Compass className="w-6 h-6 text-brand-electric" />
          </div>

          <span className="eyebrow justify-center">Error 404</span>

          <h1 className="text-3xl sm:text-4xl font-extralight text-brand-graphite tracking-tight">
            Page Not Found
          </h1>

          <p className="text-sm font-light text-brand-silver leading-relaxed">
            The page or opportunity you are looking for cannot be located. It may have moved or the address may have been mistyped.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button href="/" variant="primary" size="md" showArrow>
              Return to Homepage
            </Button>
            <Button href="/submit" variant="outline" size="md">
              Submit an Opportunity
            </Button>
          </div>

          <div className="pt-4 border-t border-brand-edge text-xs font-light text-brand-silver">
            Need assistance? Contact our team at{" "}
            <Link href="/contact" className="text-brand-electric hover:underline">
              entire-uk.com/contact
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
