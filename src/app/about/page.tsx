import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { EditorialMedia } from "@/components/ui/EditorialMedia";
import { generatePageMetadata } from "@/lib/metadata";
import {
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  FileCheck2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "About Us — Built Around the Land",
  description:
    "Learn about Entire UK: our purpose, our disciplined property development principles, our built-environment synergy with EntireFM, and how we manage acquisition risk.",
  path: "/about",
});

export default function AboutPage() {
  const operatingPrinciples = [
    {
      title: "Evidence Over Assumption",
      principleNumber: "01",
      desc: "We never speculate where evidence is missing. If vehicular access, ground conditions, or title covenants are unverified, we classify them as unknown and investigate them directly before committing capital.",
    },
    {
      title: "Long-Term Value Creation",
      principleNumber: "02",
      desc: "We are not short-term land flippers or brokers looking for quick intermediation fees. We focus on unlocking durable, lasting value through planning permission, infrastructure delivery, and high-quality construction.",
    },
    {
      title: "Disciplined Acquisition",
      principleNumber: "03",
      desc: "We say no to the vast majority of sites we evaluate. A disciplined acquisition strategy requires knowing when to walk away from unresolvable ransoms, defective titles, or unviable planning economics.",
    },
    {
      title: "Development With Purpose",
      principleNumber: "04",
      desc: "Land is only the starting point. Every scheme we deliver is designed with architectural merit, generous public realm, sustainable drainage, and long-term operational stewardship in mind.",
    },
    {
      title: "Technology With Judgement",
      principleNumber: "05",
      desc: "Our proprietary Land Radar platform gives us a remarkable research advantage, but an algorithm never makes an acquisition decision. Experienced human property professionals guide every commitment.",
    },
    {
      title: "Transparency About Uncertainty",
      principleNumber: "06",
      desc: "We communicate with landowners, partners, and local authorities with total candour. When constraints exist, we address them openly rather than attempting to paper over cracks.",
    },
  ];

  const riskTaxonomy = [
    {
      area: "Cadastral & Title Risk",
      mitigation:
        "Full HMLR official copy deed audits, title gap detection, and covenant review before contract exchange. Defective titles are resolved via deeds of variation or indemnity insurance.",
    },
    {
      area: "Access & Highways Ransom Risk",
      mitigation:
        "Adopted highway boundary verification against county records. Physical site walkovers verify visibility splays and ensure no third-party ransom margins sever access.",
    },
    {
      area: "Planning & Policy Risk",
      mitigation:
        "Rigorous 5-year housing land supply (5YHLS) monitoring, pre-application consultation with council planning officers, and appointment of tier-one planning barristers for complex sites.",
    },
    {
      area: "Ground Conditions & Environmental",
      mitigation:
        "Historical cartographic reviews, BGS borehole logs, and Phase 2 intrusive soil testing ensure geotechnical and contamination remediation costs are strictly quantified.",
    },
    {
      area: "Commercial & Construction Risk",
      mitigation:
        "Fixed-price JCT Design & Build building contracts with vetted main contractors, independent Employer's Agent oversight, and prudent residual financial modelling.",
    },
  ];

  return (
    <div>
      {/* Full-Screen Editorial Hero */}
      <PageHero
        eyebrow="Company Purpose"
        badge="Ecosystem Principal"
        title="BUILT AROUND"
        subtitle="THE LAND."
        description="Entire UK is a dedicated land acquisition and property development company. We identify, assess, secure, and deliver development opportunities across England, Scotland, and Wales."
        imageSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Modern sustainable built environment architectural perspective in the UK"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/submit" variant="primary" size="lg" showArrow>
            Submit an Opportunity
          </Button>
          <Button href="#principles" variant="ghost" size="lg">
            Our Principles
          </Button>
        </div>
      </PageHero>

      {/* Why Entire UK Exists */}
      <Section className="bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow">Our Origins &amp; Mission</span>
              <h2 className="text-3xl sm:text-4xl font-extralight text-brand-graphite tracking-tight leading-tight">
                Identifying Overlooked Potential with Institutional Discipline
              </h2>
              <p className="text-base font-light text-brand-silver leading-relaxed">
                The UK property development sector has historically been divided into two extremes: small-scale speculative developers operating on informal local networks, and large corporate housebuilders constrained by rigid corporate land acquisition quotas.
              </p>
              <p className="text-sm font-light text-brand-silver leading-relaxed">
                Entire UK was established to occupy the decisive middle ground: combining institutional capital discipline, proprietary spatial intelligence, and agile commercial structuring to unlock sites that others overlook.
              </p>
              <p className="text-sm font-light text-brand-silver leading-relaxed">
                Whether untangling a complex multi-title brownfield depot in the Midlands or promoting a 40-acre strategic greenfield extension adjoining a growing market town, we bring exhaustive evidence and experienced execution to every opportunity.
              </p>
            </div>

            {/* Visual Narrative Chain */}
            <div className="lg:col-span-6 p-8 rounded-sm bg-brand-surface border border-brand-edge space-y-6 card-spatial">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-electric">
                The Delivery Progression
              </span>
              <h3 className="text-xl font-normal text-brand-graphite">
                From Raw Land to Realised Asset
              </h3>
              <div className="space-y-3 font-mono text-xs text-brand-graphite">
                <div className="p-3 bg-white border border-brand-edge rounded-sm flex items-center justify-between">
                  <span>1. Spatial Sourcing</span>
                  <span className="text-brand-electric">Land Radar Screening</span>
                </div>
                <div className="p-3 bg-white border border-brand-edge rounded-sm flex items-center justify-between">
                  <span>2. Truth Ledger Due Diligence</span>
                  <span className="text-brand-electric">Title &amp; Highways Proof</span>
                </div>
                <div className="p-3 bg-white border border-brand-edge rounded-sm flex items-center justify-between">
                  <span>3. Contractual Control</span>
                  <span className="text-brand-electric">Unconditional / Promotion</span>
                </div>
                <div className="p-3 bg-white border border-brand-edge rounded-sm flex items-center justify-between">
                  <span>4. Planning Consent</span>
                  <span className="text-brand-electric">Architectural Excellence</span>
                </div>
                <div className="p-3 bg-white border border-brand-edge rounded-sm flex items-center justify-between">
                  <span>5. Physical Construction</span>
                  <span className="text-brand-electric">JCT Main Contracting</span>
                </div>
                <div className="p-3 bg-white border border-brand-edge rounded-sm flex items-center justify-between">
                  <span>6. Commercial Handover</span>
                  <span className="text-brand-electric">Occupier Realisation</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Operating Principles */}
      <Section surface={true} id="principles">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Operating Principles</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              How Entire UK Conducts Business
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Our reputation among landowners, commercial agents, planning authorities, and institutional partners is founded on six non-negotiable principles:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {operatingPrinciples.map((op, idx) => (
              <div
                key={idx}
                className="p-8 rounded-sm bg-white border border-brand-edge space-y-3 h-full flex flex-col justify-between card-spatial"
              >
                <div className="space-y-2">
                  <span className="text-xs font-mono text-brand-electric">
                    Principle {op.principleNumber}
                  </span>
                  <h3 className="text-lg font-medium text-brand-graphite">
                    {op.title}
                  </h3>
                  <p className="text-xs font-light text-brand-silver leading-relaxed">
                    {op.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* The Entire Ecosystem & EntireFM Synergy */}
      <Section className="bg-white">
        <Container>
          <EditorialMedia
            variant="split"
            primaryImage={{
              src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
              alt: "Modern sustainable commercial built-environment development",
              badge: "Built-Environment Synergy",
              caption: "Entire UK operates in close coordination with EntireFM across the full lifecycle of built assets.",
              aspectRatio: "video",
            }}
            title="The Entire Built-Environment Ecosystem"
            subtitle="Strategic Synergy With EntireFM"
            description="Entire UK operates alongside EntireFM within the wider Entire group. This structure gives our acquisition and development business a unique operational perspective: we do not merely design schemes to secure planning consent; we design schemes with complete understanding of operational engineering, statutory compliance, energy efficiency, and long-term estate management."
          >
            <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge text-xs font-light text-brand-graphite space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-graphite">EntireFM Group</span>
                <a
                  href="https://www.entirefm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-electric hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Visit entirefm.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-brand-silver">
                Nationwide facilities management, mechanical &amp; electrical engineering, statutory asset compliance, and built-environment operations across commercial, logistics, and residential sectors.
              </p>
            </div>
          </EditorialMedia>
        </Container>
      </Section>

      {/* How We Think About Risk */}
      <Section surface={true} id="risk-framework">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Risk Governance</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              How We Think About Risk
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Property development involves unavoidable statutory, technical, and commercial complexities. Our role as principals is not to avoid risk, but to identify it truthfully, price it accurately, and manage it systematically.
            </p>
          </div>

          <div className="space-y-4">
            {riskTaxonomy.map((risk, idx) => (
              <div
                key={idx}
                className="p-6 rounded-sm bg-white border border-brand-edge grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center card-spatial"
              >
                <div className="lg:col-span-4 flex items-center gap-3">
                  <span className="text-xs font-mono text-brand-electric w-6">
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-medium text-brand-graphite">
                    {risk.area}
                  </h3>
                </div>
                <div className="lg:col-span-8 text-xs font-light text-brand-silver leading-relaxed">
                  {risk.mitigation}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-light text-brand-graphite mb-2">
              Interested in collaborating, introducing a site, or exploring development partnership?
            </h3>
            <p className="text-sm font-light text-brand-silver max-w-xl mx-auto mb-6">
              Our directors and acquisition team are directly accessible to landowners, surveyors, and institutional partners.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="/submit" variant="primary" size="lg" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Talk to Entire UK
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
