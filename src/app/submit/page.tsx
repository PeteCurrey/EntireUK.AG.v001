import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { generatePageMetadata } from "@/lib/metadata";
import { Trees, Building2, MapPin, Handshake, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Submit an Opportunity",
  description:
    "Opportunity submission gateway for Entire UK. Select your submission pathway: landowners, building owners, site introducers, or development partners.",
  path: "/submit",
});

export default function SubmitGatewayPage() {
  const pathways = [
    {
      id: "land",
      title: "I own land",
      eyebrow: "Landowners",
      desc: "For owners of greenfield, agricultural, brownfield or strategic acreage who want to explore development potential.",
      href: "/submit/land",
      cta: "Submit Land",
      icon: Trees,
    },
    {
      id: "property",
      title: "I own a property",
      eyebrow: "Property Owners",
      desc: "For owners of commercial, light industrial or residential buildings with conversion, extension or redevelopment potential.",
      href: "/submit/property",
      cta: "Submit Property",
      icon: Building2,
    },
    {
      id: "opportunity",
      title: "I've identified an opportunity",
      eyebrow: "Agents, Surveyors & Introducers",
      desc: "For commercial agents, surveyors, professionals or individuals with knowledge of an off-market site.",
      href: "/submit/opportunity",
      cta: "Submit Opportunity",
      icon: MapPin,
    },
    {
      id: "partner",
      title: "I'm a professional / potential partner",
      eyebrow: "Institutional & Industry Partners",
      desc: "For planning consultants, architects, institutional capital providers, senior lenders and delivery contractors.",
      href: "/submit/partner",
      cta: "Partner With Us",
      icon: Handshake,
    },
  ];

  return (
    <div>
      {/* Full-Screen Editorial Hero */}
      <PageHero
        eyebrow="Opportunity Intake Gateway"
        badge="Confidential Review"
        title="HAVE YOU FOUND AN"
        subtitle="OPPORTUNITY?"
        description="Whether you own the land, own the property or know of a site with development potential, tell us what you know. We review every submission against our acquisition criteria."
        imageSrc="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80"
        imageAlt="UK aerial land parcels and strategic opportunity screening"
      >
        <div className="flex items-center gap-3 text-xs font-mono text-brand-mist/70">
          <span>Choose your intake pathway below</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-electric" />
        </div>
      </PageHero>

      {/* Gateway Selection Grid */}
      <Section surface={true}>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
            {pathways.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="group p-8 sm:p-10 rounded-sm bg-white border border-brand-edge hover:border-brand-electric/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric group-hover:bg-brand-electric/10 group-hover:border-brand-electric/30 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest text-brand-silver">
                        Pathway 0{idx + 1}
                      </span>
                    </div>

                    <span className="eyebrow mb-2">{item.eyebrow}</span>
                    <h2 className="text-2xl sm:text-3xl font-light text-brand-graphite mb-3">
                      {item.title}
                    </h2>
                    <p className="text-sm font-light text-brand-silver leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-brand-edge flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-brand-electric">
                      {item.cta}
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Privacy & Professional Standards Notice */}
          <div className="p-8 rounded-sm bg-white border border-brand-edge flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-2xl">
              <ShieldCheck className="w-6 h-6 text-brand-electric shrink-0 mt-1" />
              <div className="space-y-1">
                <h3 className="text-base font-medium text-brand-graphite">
                  Commercial Confidentiality Guarantee
                </h3>
                <p className="text-xs sm:text-sm font-light text-brand-silver leading-relaxed">
                  All opportunities submitted to Entire UK are handled under non-disclosure protocols.
                  We do not market your site to third parties or disclose information without formal agreement.
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="text-xs text-brand-silver hover:text-brand-graphite font-medium underline underline-offset-4 shrink-0"
            >
              Have a general inquiry instead?
            </Link>
          </div>
        </Container>
      </Section>
    </div>
  );
}
