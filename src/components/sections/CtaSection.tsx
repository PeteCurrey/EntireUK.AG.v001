import React from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";

export function CtaSection() {
  return (
    <section className="on-dark bg-brand-void py-24 sm:py-32 relative overflow-hidden border-t border-brand-edge-dark">
      {/* Subtle geometric lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center max-w-4xl mx-auto">
        <ScrollReveal>
          <span className="eyebrow eyebrow-dark mb-6 justify-center">
            Begin an Assessment
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white leading-[1.1] mb-6">
            Have you found a site? <br />
            Own land with development potential?
          </h2>

          <p className="text-base sm:text-xl font-light text-brand-mist/80 max-w-2xl mx-auto leading-relaxed mb-10">
            Whether you are a freehold owner, an introducing agent, a surveyor or a development partner,
            tell us about the opportunity. Our team will review the fundamentals confidentially.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="/submit" variant="primary" size="lg" showArrow>
              Submit an Opportunity
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              Talk to Entire UK
            </Button>
          </div>

          <p className="mt-8 text-xs font-light text-brand-mist/50">
            All submissions are reviewed confidentially. Submitting a site does not create an obligation or commitment to proceed.
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
