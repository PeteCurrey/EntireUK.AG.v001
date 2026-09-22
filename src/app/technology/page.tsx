import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/metadata";
import {
  Radar,
  Database,
  Layers,
  MapPin,
  Cpu,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Technology & Land Radar",
  description:
    "Property intelligence, powered by data. Discover how Entire UK combines geospatial mapping, planning data and human property expertise to identify development opportunities.",
  path: "/technology",
});

export default function TechnologyPage() {
  const radarDataStreams = [
    {
      title: "Statutory Planning Data",
      desc: "Local planning authority (LPA) decisions, refusal appeals, strategic housing land availability assessments (SHLAA), and local plan call-for-sites submissions.",
    },
    {
      title: "Geospatial & Boundary Mapping",
      desc: "HM Land Registry title boundaries, Ordnance Survey MasterMap geometry, topographic contours, highway boundaries and rights of way.",
    },
    {
      title: "Statutory Environmental Constraints",
      desc: "Environment Agency flood risk zones (Zones 2 & 3, surface water), Green Belt designations, AONB, SSSI, Ancient Woodland, and conservation areas.",
    },
    {
      title: "Demographic & Market Absorption",
      desc: "ONS migration trends, regional housing delivery test (HDT) performance, 5-year housing supply shortfalls and commercial space demand.",
    },
    {
      title: "Infrastructure & Utilities",
      desc: "Grid connection proximity, water and wastewater networks, railway stations, strategic road networks, and major infrastructure corridors.",
    },
    {
      title: "Development Economics",
      desc: "Dynamic residual land appraisal models factoring build cost benchmarks (BCIS), local GDV averages, Section 106 obligations and CIL tariffs.",
    },
  ];

  const currentCapabilities = [
    "Integrated spatial screening of planning designations and environmental constraints across priority UK local planning authorities.",
    "Title boundary matching against local plan development boundaries and emerging spatial framework allocations.",
    "Standardised financial residual land valuation modelling with verified regional build cost indicators.",
    "Comprehensive manual due diligence and human commercial evaluation on every shortlisted site.",
  ];

  const futurePipeline = [
    "Automated continuous scanning of all 300+ UK local planning authority register updates to identify freshly rejected or withdrawn applications with salvage potential.",
    "Geospatial parcel boundary correlation identifying 'ransom strips' and landlocked assembly opportunities.",
    "Machine-assisted planning text extraction synthesizing inspectorate appeal precedents across comparable appeal decisions.",
    "Predictive planning risk scoring to benchmark likely committee outcomes based on historical local voting patterns.",
  ];

  return (
    <div className="pt-24 sm:pt-28">
      {/* Page Hero */}
      <section className="bg-brand-void text-white py-16 sm:py-24 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">Technology-Led Sourcing</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              Property intelligence, <br />
              <span className="font-normal">powered by data.</span>
            </h1>
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed">
              Entire UK is developing proprietary systems that combine planning data,
              geospatial intelligence, property records and development economics to identify
              promising opportunities faster and with greater accuracy.
            </p>
          </div>
        </Container>
      </section>

      {/* Critical Philosophy Banner */}
      <section className="bg-brand-surface py-8 border-b border-brand-edge">
        <Container>
          <div className="p-6 rounded-sm bg-white border border-brand-edge flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
                Our Tech Philosophy
              </span>
              <p className="text-sm font-light text-brand-graphite leading-relaxed max-w-2xl">
                <strong>Technology is an unfair advantage, not a product we sell.</strong> Entire UK is not a SaaS vendor or software company. We deploy proprietary software internally to uncover off-market development sites for acquisition and development.
              </p>
            </div>
            <Button href="/submit" variant="primary" size="sm" showArrow>
              Submit a Site
            </Button>
          </div>
        </Container>
      </section>

      {/* Land Radar Deep Dive */}
      <Section dark={true}>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/[0.04] border border-white/10 text-xs font-mono text-brand-electric">
                <Radar className="w-3.5 h-3.5 animate-pulse" />
                <span>Proprietary Land Intelligence Platform</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white tracking-tight leading-tight">
                LAND RADAR
              </h2>
              <p className="text-base sm:text-lg font-light text-brand-mist/80 leading-relaxed">
                Land Radar is our proprietary technology platform currently under active development.
                It connects fragmented public and commercial databases into a single spatial intelligence engine,
                allowing our acquisition team to pinpoint where current property use and future development value diverge.
              </p>
              <p className="text-sm font-light text-brand-mist/70 leading-relaxed">
                Instead of waiting for sites to be marketed on open property portals with inflated pricing,
                Land Radar helps us discover off-market opportunities before they enter the public domain.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-sm bg-brand-carbon border border-brand-edge-dark space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-mist/50">
                  Radar Architecture
                </span>
                <div className="space-y-3 text-xs font-light text-brand-mist/80">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-sm flex items-center justify-between">
                    <span>1. Ingestion Layer</span>
                    <span className="text-brand-electric font-mono">Ordnance Survey / LPAs / HMLR</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-sm flex items-center justify-between">
                    <span>2. Spatial Normalisation</span>
                    <span className="text-brand-electric font-mono">Geospatial Polygons &amp; Constraints</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-sm flex items-center justify-between">
                    <span>3. Policy Matching</span>
                    <span className="text-brand-electric font-mono">Local Plan / SHLAA / NPPF Deficits</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-sm flex items-center justify-between">
                    <span>4. Viability Scoring</span>
                    <span className="text-brand-electric font-mono">Residual Model &amp; GDV Benchmark</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-sm flex items-center justify-between">
                    <span>5. Human Sourcing Review</span>
                    <span className="text-white font-medium">Acquisition Team Appraisals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {radarDataStreams.map((stream, idx) => (
              <div
                key={idx}
                className="p-6 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark"
              >
                <span className="text-xs font-mono text-brand-electric tracking-widest block mb-2">
                  Stream 0{idx + 1}
                </span>
                <h3 className="text-base font-medium text-white mb-2">{stream.title}</h3>
                <p className="text-xs sm:text-sm font-light text-brand-mist/70 leading-relaxed">
                  {stream.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Truth in Technology: Current Capability vs Developing Pipeline */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Technology Roadmap"
            title="Current Capability &amp; Active Development"
            description="We are committed to absolute transparency. We clearly distinguish between what is operational today and what is currently in development within our engineering roadmap."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Capability */}
            <div className="p-8 rounded-sm bg-white border border-brand-edge space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-electric">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Live Operational Capability</span>
              </div>
              <h3 className="text-2xl font-light text-brand-graphite">
                Operational Today
              </h3>
              <p className="text-sm font-light text-brand-silver leading-relaxed">
                These workflows are currently used daily by our acquisitions and planning team to evaluate opportunities:
              </p>

              <ul className="space-y-3.5 pt-2">
                {currentCapabilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-light text-brand-graphite">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* In Development */}
            <div className="p-8 rounded-sm bg-brand-surface border border-brand-edge space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-silver">
                <Clock className="w-4 h-4 text-brand-electric" />
                <span className="text-brand-electric font-medium">Technology In Active Development</span>
              </div>
              <h3 className="text-2xl font-light text-brand-graphite">
                Engineering Roadmap
              </h3>
              <p className="text-sm font-light text-brand-silver leading-relaxed">
                Proprietary automation capabilities currently being engineered into the next version of Land Radar:
              </p>

              <ul className="space-y-3.5 pt-2">
                {futurePipeline.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-light text-brand-graphite">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-electric mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm font-light text-brand-silver mb-4">
              Have you identified an opportunity you would like us to evaluate through our data pipeline?
            </p>
            <Button href="/submit" variant="primary" size="lg" showArrow>
              Submit an Opportunity
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
