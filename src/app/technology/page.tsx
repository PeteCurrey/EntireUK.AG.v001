import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { EditorialMedia } from "@/components/ui/EditorialMedia";
import { EpistemicDiagram } from "@/components/interactive/EpistemicDiagram";
import { generatePageMetadata } from "@/lib/metadata";
import {
  Radar,
  Database,
  Cpu,
  Layers,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Workflow,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Technology & Land Radar — Acquisition Intelligence",
  description:
    "Explore Land Radar, Entire UK's proprietary acquisition intelligence platform connecting spatial GIS, statutory planning history, title research, and environmental constraints into an epistemic research advantage.",
  path: "/technology",
});

export default function TechnologyPage() {
  const radarStreams = [
    {
      title: "Geospatial & Cadastral Mapping",
      subtitle: "GIS & Boundary Geometries",
      desc: "Ingestion of HM Land Registry INSPIRE cadastral index polygons, Ordnance Survey MasterMap topography, and statutory highway boundaries. All spatial geometries are projected and area-calculated directly in EPSG:27700 British National Grid to eliminate spatial distortion.",
      sources: ["HM Land Registry", "Ordnance Survey MasterMap", "Highways Authorities"],
    },
    {
      title: "Statutory Planning Intelligence",
      subtitle: "LPA Decisions, Appeals & Allocations",
      desc: "Structured tracking of Local Planning Authority decision registers, historical refusal notices, Planning Inspectorate (PINS) appeal determinations, and Strategic Housing Land Availability Assessment (SHLAA) call-for-sites registries across priority UK councils.",
      sources: ["Planning Portals", "PINS Appeal Decisions", "Local Development Schemes"],
    },
    {
      title: "Environmental & Hazard Screening",
      subtitle: "EA Flood, Ecology & Heritage",
      desc: "Multi-layered environmental hazard screening incorporating Environment Agency River and Surface Water (RoFSW) flood models, Natural England Sites of Special Scientific Interest (SSSI), Ancient Woodland inventories, and Historic England listed assets.",
      sources: ["Environment Agency", "Natural England", "Historic England"],
    },
    {
      title: "Ownership & Cadastral Assembly",
      subtitle: "HMLR Registers & Corporate Ownership",
      desc: "Correlating candidate land parcels against discrete registered freehold and leasehold titles. The platform detects fragmented multi-title configurations, corporate property ownership (CCOD), and perimeter gaps that indicate potential access ransom strips.",
      sources: ["HMLR Title Registers", "Companies House CCOD", "Conveyancing Deeds"],
    },
    {
      title: "Market Transaction Signals",
      subtitle: "Micro-Corridor Price Paid Data",
      desc: "Analysis of actual completed transaction values from HM Land Registry Price Paid Data (PPD) rather than unverified consumer asking prices. Corridors are benchmarked against regional build costs (BCIS) and statutory Section 106 infrastructure contributions.",
      sources: ["HMLR Price Paid Data", "Energy Performance Certificates (EPC)", "BCIS Indices"],
    },
    {
      title: "Evidence Reconciliation & Truth Ledgers",
      subtitle: "Deterministic Contradiction Detection",
      desc: "The system actively cross-checks independent evidence layers. When a spatial road proximity signal conflicts with an external highway audit, the platform never overwrites the data — it records a formal contradiction and alerts human analysts.",
      sources: ["Truth Ledger Architecture", "Audit Trail Verification", "Human Review Queue"],
    },
  ];

  return (
    <div className="pt-24 sm:pt-28">
      {/* Editorial Hero */}
      <section className="bg-brand-void text-white py-16 sm:py-24 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">Proprietary Technology</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              INTELLIGENCE BEHIND THE ACQUISITION.
            </h1>
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed">
              Land Radar is our proprietary internal acquisition intelligence platform. It gives Entire UK a decisive research advantage across UK land and property by combining spatial GIS, planning precedents, cadastral ownership and environmental data into an auditable research workflow.
            </p>
          </div>
        </Container>
      </section>

      {/* Philosophy Banner: Not a SaaS Vendor */}
      <Section surface={true} className="border-b border-brand-edge">
        <Container>
          <div className="p-6 sm:p-8 rounded-sm bg-white border border-brand-edge flex flex-col lg:flex-row lg:items-center justify-between gap-6 card-spatial">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
                Our Technology Philosophy
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-brand-graphite">
                Technology is our internal research advantage, not a product we sell.
              </h2>
              <p className="text-xs sm:text-sm font-light text-brand-silver leading-relaxed">
                Entire UK is not a software vendor, a data broker, or an AI startup. We build and operate Land Radar exclusively for our internal acquisition and development team. It enables us to discover off-market development sites before they enter the public domain.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <Button href="/submit" variant="primary" size="md" showArrow>
                Submit a Site For Review
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* What Land Radar Does: 6 Core Streams */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Intelligence Architecture</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              What Land Radar Does
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              UK property data is notoriously fragmented across hundreds of disconnected local authorities and government registries. Land Radar unifies these streams into a coherent spatial intelligence pipeline:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {radarStreams.map((stream, idx) => (
              <div
                key={idx}
                className="p-7 rounded-sm bg-brand-surface border border-brand-edge flex flex-col justify-between h-full card-spatial"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-brand-electric">
                      Stream 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-brand-silver/60 uppercase">
                      {stream.subtitle}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-brand-graphite">
                    {stream.title}
                  </h3>
                  <p className="text-xs font-light text-brand-silver leading-relaxed">
                    {stream.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-edge/80 mt-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-silver block mb-1.5">
                    Data Sourced From:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stream.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-brand-edge text-brand-graphite"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Deterministic-First Philosophy */}
      <Section surface={true} id="deterministic-first">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Methodological Foundation</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              Deterministic First: <br />
              <span className="font-normal text-brand-electric">&ldquo;The machine identifies evidence. The analyst decides what it means.&rdquo;</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              We reject opaque &ldquo;black-box&rdquo; property models that generate arbitrary viability scores or speculative automated valuations. Every calculation in Land Radar is 100% deterministic, reproducible, and tied directly to attributable statutory records.
            </p>
          </div>

          {/* Linear Execution Chain */}
          <div className="p-8 sm:p-10 rounded-sm bg-white border border-brand-edge shadow-sm mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { step: "SOURCE", desc: "Statutory Registry Record" },
                { step: "FACT", desc: "Immutable Ingested Data" },
                { step: "RULE", desc: "Auditable Spatial Calculation" },
                { step: "RESULT", desc: "Deterministic Derived Output" },
                { step: "ANALYST", desc: "Professional Interpretation" },
                { step: "DECISION", desc: "Commercial Action Gate" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-sm bg-brand-surface border border-brand-edge space-y-1">
                  <span className="text-[11px] font-mono text-brand-electric font-semibold block">
                    0{i + 1}
                  </span>
                  <span className="text-sm font-medium text-brand-graphite block">
                    {item.step}
                  </span>
                  <span className="text-[11px] text-brand-silver font-light block leading-tight">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Interactive Epistemic Architecture Diagram */}
      <Section className="bg-white" id="epistemic-architecture">
        <Container>
          <EpistemicDiagram />
        </Container>
      </Section>

      {/* What AI Does vs What AI Does NOT Do */}
      <Section surface={true} id="ai-boundaries">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Clear Technological Boundaries</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              The Exact Role of AI in Land Radar
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Entire UK maintains strict governance regarding where artificial intelligence is deployed. We differentiate ourselves sharply from generic &ldquo;AI property&rdquo; claims:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* What AI Does */}
            <div className="p-8 rounded-sm bg-white border border-brand-edge space-y-4 card-spatial">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="text-lg font-medium text-brand-graphite">
                  What AI Does at Entire UK
                </h3>
              </div>
              <ul className="space-y-3 text-xs font-light text-brand-graphite">
                {[
                  "Synthesises hundreds of pages of complex local authority planning committee minutes.",
                  "Extracts key conditions and inspector reasoning from historical appeal decisions.",
                  "Assists human analysts in structuring unstructured document archives.",
                  "Surfaces potential relationships between neighbouring planning applications.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What AI Does NOT Do */}
            <div className="p-8 rounded-sm bg-rose-50/50 border border-rose-200/80 space-y-4 card-spatial">
              <div className="flex items-center gap-2.5 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <h3 className="text-lg font-medium text-rose-950">
                  What AI NEVER Does at Entire UK
                </h3>
              </div>
              <ul className="space-y-3 text-xs font-light text-rose-900">
                {[
                  "Never invents planning permissions or manufactures false development certainty.",
                  "Never declares legal ownership or boundary extents without official HMLR copy deeds.",
                  "Never determines commercial acquisition decisions or offers.",
                  "Never turns an 'unknown' record into an assumed 'clear' site.",
                  "Never replaces on-site physical walkovers, borehole testing or highways audits.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Technology in Practice & Internal Workstation */}
      <Section className="bg-brand-void text-white" id="workstation">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow eyebrow-dark">Technology in Practice</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white leading-tight">
                The Internal Acquisition Workstation
              </h2>
              <p className="text-base font-light text-brand-mist/80 leading-relaxed">
                Land Radar equips Entire UK analysts with a high-precision workstation. From candidate queue management and title contradiction resolution to highways adoption audits and commercial decision gates, every action is logged to an immutable truth ledger.
              </p>
              <div className="space-y-3 pt-2 text-xs font-light text-brand-mist/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Deterministic Next-Action Engine guiding progressive investigation.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>8-dimension evidence checklists verifying all constraints before progression.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Cryptographically auditable timeline tracking all evidence updates.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-sm bg-brand-carbon border border-brand-edge-dark space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono text-cyan-400">
                  <span>LAND RADAR OPERATIONAL WORKBENCH</span>
                  <span className="text-[10px] text-brand-mist/50">SECURE INTERNAL PORTAL</span>
                </div>
                <div className="space-y-2.5 font-mono text-xs text-brand-mist/80">
                  <div className="p-3 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <span>Validation Cohort</span>
                    <span className="text-white">Active UK Growth Corridors</span>
                  </div>
                  <div className="p-3 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <span>Evidence Pipeline</span>
                    <span className="text-emerald-400">Deterministic · No Guesswork</span>
                  </div>
                  <div className="p-3 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                    <span>Contradiction Engine</span>
                    <span className="text-amber-400">Active · Preserves Discrepancies</span>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 hover:underline"
                  >
                    <span>Authorised Analyst Sign-In →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
