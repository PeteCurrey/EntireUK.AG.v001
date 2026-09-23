import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { OpportunityAnatomy } from "@/components/interactive/OpportunityAnatomy";
import { generatePageMetadata } from "@/lib/metadata";
import {
  Trees,
  Building2,
  Factory,
  Landmark,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Opportunities With Development Potential",
  description:
    "Explore the types of land and property opportunities Entire UK evaluates across the UK, from brownfield and edge-of-settlement land to commercial conversions and complex title assemblies.",
  path: "/opportunities",
});

export default function OpportunitiesPage() {
  const typologies = [
    {
      id: "land",
      title: "Development Land",
      subtitle: "Greenfield & Edge-of-Settlement Parcels",
      icon: Trees,
      desc: "Agricultural parcels, edge-of-village paddocks, and strategic acreage immediately adjoining established settlements. We focus on parcels capable of accommodating sustainable residential or mixed-use expansions where local planning authorities face housing land supply deficits.",
      evidenceNeeded: "Title register boundaries, adopted highways frontage, and local plan spatial status.",
      planningPath: "Call-for-sites promotion, draft allocation, or speculative outline planning application.",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "brownfield",
      title: "Brownfield & Regeneration",
      subtitle: "Previously Developed Land (PDL)",
      icon: Factory,
      desc: "Former industrial premises, redundant rail sidings, transport yards, commercial scrap facilities, and vacant utilities land. We assess ground contamination, historical foundations, and environmental constraints to repurpose underused urban footprints.",
      evidenceNeeded: "Phase 1 environmental desk study, historical mapping, and ground condition reports.",
      planningPath: "NPPF brownfield presumption, urban renewal policy, and full commercial/residential consent.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "property",
      title: "Commercial & Industrial Conversion",
      subtitle: "Repurposing Existing Built Assets",
      icon: Building2,
      desc: "Vacant or under-occupied commercial buildings, outdated logistics warehouses, redundant high-street upper parts, and agricultural barns suitable for adaptive reuse into residential, healthcare, or modern workspace.",
      evidenceNeeded: "Existing floorplans, structural condition surveys, asbestos registers, and EPC certificates.",
      planningPath: "Permitted Development rights (Class MA, Class Q) or full change-of-use planning permission.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "strategic",
      title: "Strategic Land Parcels",
      subtitle: "Long-Term Spatial Policy Promotion",
      icon: Landmark,
      desc: "Large acreage (10 to 100+ acres) positioned within long-term infrastructure and regional economic growth corridors. We fund 100% of the technical, transport, and planning promotion costs over 3-to-10 year Local Plan review cycles.",
      evidenceNeeded: "Agricultural land classification, landscape sensitivity, and utility network capacity.",
      planningPath: "Strategic Housing Land Availability Assessment (SHLAA) and Local Development Scheme promotion.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "complex",
      title: "Complex Assemblies & Ransoms",
      subtitle: "Multi-Title Resolution & Legal Rectification",
      icon: Layers,
      desc: "Sites encumbered by fragmented multi-title ownership, unadopted boundary strips, access ransom positions, or restrictive covenants. Our legal and spatial research untangles title defects that deter conventional property buyers.",
      evidenceNeeded: "Comprehensive HMLR title plan overlays, deed conveyancing audits, and ransom valuations.",
      planningPath: "Deed of grant of easement, Section 227 purchase, or consensual multi-party option assembly.",
      image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const pipelineProgression = [
    { num: "01", step: "Discovery & Intake", desc: "Site submitted by vendor/agent or surfaced by Land Radar spatial screening." },
    { num: "02", step: "Initial Screen", desc: "Automated verification against Green Belt, flood zones (EA 3b), and SSSI statutory boundaries." },
    { num: "03", step: "Evidence Gathering", desc: "HMLR title deeds, highways boundary certificates, and LPA planning registers compiled." },
    { num: "04", step: "Analyst Investigation", desc: "Attributable human evaluation of density, massing, access rights, and local demographics." },
    { num: "05", step: "Vendor Engagement", desc: "Direct dialogue with freehold owner or instructed commercial agent regarding terms." },
    { num: "06", step: "Technical Due Diligence", desc: "Phase 1 environmental study, topographical mapping, and drainage strategy." },
    { num: "07", step: "Investment Gate", desc: "Formal commercial gate review by Entire UK investment and planning committee." },
    { num: "08", step: "Contractual Control", desc: "Unconditional exchange, promotion agreement execution, or option contract." },
    { num: "09", step: "Planning & Delivery", desc: "Statutory planning application, consultant coordination, and construction procurement." },
  ];

  const disciplinedRejections = [
    "Functional Floodplain (Zone 3b) where residential use is prohibited by national policy.",
    "Unresolvable vehicular ransom strip where third-party owners demand economically unviable ransoms.",
    "Irremovable restrictive covenants preventing commercial or residential redevelopment.",
    "Severe sub-surface contamination where remediation costs exceed realistic residual land value.",
    "Sites without realistic planning defensibility or five-year supply justification within unyielding Green Belt.",
    "Unrealistic vendor pricing expectations disconnected from independent RICS Red Book appraisals.",
  ];

  return (
    <div>
      {/* Full-Screen Editorial Hero */}
      <PageHero
        eyebrow="Pipeline & Typologies"
        badge="Off-Market Portfolio"
        title="OPPORTUNITIES WITH"
        subtitle="DEVELOPMENT POTENTIAL."
        description="Entire UK is not a consumer property portal or estate agent. We are active principal buyers, promoters, and developers. Here is how we define, investigate, and progress opportunities across the UK."
        imageSrc="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Aerial panorama of UK strategic land parcels and edge-of-settlement development opportunities"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/submit" variant="primary" size="lg" showArrow>
            Submit an Opportunity
          </Button>
          <Button href="#site-anatomy" variant="ghost" size="lg">
            Inspect Site Anatomy
          </Button>
        </div>
      </PageHero>

      {/* Editorial Philosophy Statement */}
      <Section surface={true} className="border-b border-brand-edge">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
                Our Acquisition Distinction
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-brand-graphite tracking-tight">
                Principals with committed capital. Not brokers.
              </h2>
              <p className="text-sm font-light text-brand-silver leading-relaxed">
                We do not solicit sites to market to third parties. When an opportunity is reviewed by Entire UK, it is evaluated directly for our own balance sheet and development partnerships. Opportunities under live investigation remain confidential until contractual control or public planning notices commence.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Button href="/submit" variant="primary" size="md" showArrow>
                Submit an Opportunity
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Typologies Deep Dive */}
      <Section>
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Opportunity Typologies</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              What Constitutes an Opportunity?
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              We focus on situations where existing physical use understates future planning and commercial potential. Five primary categories define our acquisition focus:
            </p>
          </div>

          <div className="space-y-8">
            {typologies.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  className="p-6 sm:p-8 rounded-sm bg-white border border-brand-edge grid grid-cols-1 lg:grid-cols-12 gap-8 items-center card-spatial shadow-sm"
                >
                  <div className="lg:col-span-4 relative aspect-[16/10] w-full rounded-sm overflow-hidden border border-brand-edge bg-brand-surface">
                    <img
                      src={t.image}
                      alt={t.title}
                      className="w-full h-full object-cover filter brightness-95"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/15">
                        Typology 0{idx + 1}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-light text-brand-graphite">
                          {t.title}
                        </h3>
                        <span className="text-xs font-mono uppercase text-brand-silver/70">
                          {t.subtitle}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-light text-brand-silver leading-relaxed">
                      {t.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-light">
                      <div className="p-3 rounded-sm bg-brand-surface border border-brand-edge">
                        <span className="font-medium text-brand-graphite block mb-1">
                          Primary Evidence Sourced
                        </span>
                        <span className="text-brand-silver">{t.evidenceNeeded}</span>
                      </div>
                      <div className="p-3 rounded-sm bg-brand-surface border border-brand-edge">
                        <span className="font-medium text-brand-graphite block mb-1">
                          Statutory Planning Route
                        </span>
                        <span className="text-brand-silver">{t.planningPath}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Interactive Opportunity Anatomy Explorer */}
      <Section surface={true} id="site-anatomy">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Site Anatomy</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              The 8 Dimensions of an Opportunity
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Every parcel and building undergoes multi-dimensional scrutiny before financial commitments are made. Click each dimension to inspect our due diligence requirements and common industry fallacies.
            </p>
          </div>

          <OpportunityAnatomy />
        </Container>
      </Section>

      {/* From Opportunity to Acquisition Progression */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Operational Progression</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              From Opportunity to Acquisition
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              A transparent, 9-stage progression governing how opportunities move from raw intake to consented delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {pipelineProgression.map((pipe) => (
              <div
                key={pipe.num}
                className="p-6 rounded-sm bg-brand-surface border border-brand-edge space-y-2 card-spatial"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-electric font-semibold">
                    Stage {pipe.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-brand-electric" />
                </div>
                <h3 className="text-base font-medium text-brand-graphite">
                  {pipe.step}
                </h3>
                <p className="text-xs font-light text-brand-silver leading-relaxed">
                  {pipe.desc}
                </p>
              </div>
            ))}
          </div>

          {/* What We Do Not Do: Disciplined Rejection Standards */}
          <div className="p-8 sm:p-10 rounded-sm bg-rose-50/50 border border-rose-200/80 space-y-6">
            <div className="flex items-center gap-2.5 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-xs font-mono uppercase tracking-widest font-semibold">
                Disciplined Rejection Standards · What We Do Not Pursue
              </span>
            </div>
            <h3 className="text-2xl font-light text-brand-graphite">
              Why Opportunities Stop in Due Diligence
            </h3>
            <p className="text-sm font-light text-brand-silver leading-relaxed max-w-3xl">
              We reject significantly more sites than we acquire. A disciplined acquisition strategy requires knowing when to walk away before capital is deployed into unviable schemes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {disciplinedRejections.map((rej, i) => (
                <div key={i} className="flex items-start gap-3 text-xs font-light text-brand-graphite bg-white p-3.5 rounded-sm border border-rose-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                  <span>{rej}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Bottom CTA Banner */}
      <section className="bg-brand-void text-white py-16 sm:py-20 border-t border-brand-edge-dark">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="eyebrow eyebrow-dark">Confidential Submission</span>
              <h3 className="text-2xl sm:text-3xl font-extralight text-white tracking-tight">
                Do you have land or property that fits our profile?
              </h3>
              <p className="text-sm font-light text-brand-mist/80 leading-relaxed">
                Submit details directly to our acquisition team. All submissions are handled under strict commercial discretion.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Button href="/submit" variant="primary" size="lg" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/contact" variant="ghost" size="lg">
                Contact Acquisitions Team
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
