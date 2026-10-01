import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { CriteriaFilterWidget } from "@/components/interactive/CriteriaFilterWidget";
import { generatePageMetadata } from "@/lib/metadata";
import {
  Trees,
  Building2,
  Factory,
  Layers,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Compass,
  MapPin,
  Scale,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";

export const metadata = generatePageMetadata({
  title: "Target Acquisition Criteria & Parameters",
  description:
    "Comprehensive acquisition parameters for Entire UK. Explore our target asset typologies, geographic focus, viability prerequisites, fatal planning constraints, and commercial deal structures.",
  path: "/criteria",
});

export default function CriteriaPage() {
  const typologies = [
    {
      id: "residential-land",
      title: "Residential Development Land",
      scale: "1 to 50+ Acres (0.4 – 20+ Hectares)",
      planningContext: "Allocated, draft-allocated, edge-of-settlement, or infill parcels.",
      icon: Trees,
      keyCriteria: [
        "Immediately adjacent to established village or urban settlement boundaries",
        "Adopted public highway frontage or clear enforceable vehicular right-of-way",
        "Outside Flood Zone 3b and statutory conservation designations",
        "Local planning authorities with demonstrated housing delivery deficits (under 5YHLS)",
      ],
      preferredStructures: "Unconditional Purchase, Planning Promotion, or Subject-to-Planning Option",
    },
    {
      id: "brownfield-regeneration",
      title: "Brownfield & Regeneration Sites",
      scale: "0.5 to 20+ Acres (0.2 – 8+ Hectares)",
      planningContext: "Previously Developed Land (PDL), former industrial or redundant commercial yards.",
      icon: Factory,
      keyCriteria: [
        "Derelict industrial premises, transport yards, utilities land, or obsolete depots",
        "Manageable ground condition and contamination profiles with viable remediation paths",
        "Supportive brownfield-first planning policy framework (NPPF Paragraph 124)",
        "Urban infill or edge-of-centre locations with existing services and utility infrastructure",
      ],
      preferredStructures: "Unconditional Purchase or Phased Joint Venture",
    },
    {
      id: "commercial-conversion",
      title: "Commercial & Industrial Conversion",
      scale: "10,000 to 100,000+ sq ft (GIA)",
      planningContext: "Class MA Permitted Development, Class Q agricultural, or full change-of-use.",
      icon: Building2,
      keyCriteria: [
        "Vacant or short-income commercial buildings, business parks, and light industrial units",
        "Floorplate configurations compatible with residential subdivision and natural daylight standards",
        "Structural viability for conversion without requiring complete substructure replacement",
        "Outside designated Class MA article 4 exemption zones (or priced to reflect full planning risk)",
      ],
      preferredStructures: "Unconditional Freehold, Short-completion Purchase, or Promotion",
    },
    {
      id: "strategic-land",
      title: "Strategic Land & Local Plan Promotion",
      scale: "5 to 100+ Acres (2 – 40+ Hectares)",
      planningContext: "Longer-term Local Plan call-for-sites, greenfield urban extensions, or Green Belt reviews.",
      icon: Layers,
      keyCriteria: [
        "Sustainable settlement adjacency along established public transport or highways corridors",
        "Absence of severe statutory environmental impediments (SSSI, Ancient Woodland, Flood Zone 3)",
        "Capacity to deliver significant community infrastructure, public open space, and biodiversity net gain",
        "Landowner willingness to enter a partnership alignment to maximize gross land value",
      ],
      preferredStructures: "Planning Promotion Agreement (100% funded by Entire UK) or Long Option",
    },
    {
      id: "land-assembly",
      title: "Complex Land Assembly & Title Unlocking",
      scale: "Any Scale (Where Multi-Owner Assembly Unlocks Viability)",
      planningContext: "Fragmented ownerships, ransom strips, rights of light, or access easements.",
      icon: Compass,
      keyCriteria: [
        "Sites where individual parcels are unviable until assembled under unified control",
        "Opportunities requiring proactive resolution of ransom strips or unadopted roadway gaps",
        "Multi-owner consortiums seeking coordinated representation and equalisation agreements",
        "Clear cadastral pathways to establish unencumbered, insurable title boundaries",
      ],
      preferredStructures: "Consortium Promotion Agreement, Conditional Contracts, or Option Assembly",
    },
  ];

  const regions = [
    {
      region: "Midlands Growth Engine",
      focus: "West Midlands & East Midlands Core",
      counties: "Warwickshire, Worcestershire, Leicestershire, Nottinghamshire, Northamptonshire, Derbyshire, West Midlands Conurbation",
      priority: "Primary Growth Focus",
    },
    {
      region: "Northern Growth Corridors",
      focus: "North West, Yorkshire & Humber",
      counties: "Greater Manchester, Cheshire, Lancashire, West Yorkshire, South Yorkshire",
      priority: "Active Sourcing",
    },
    {
      region: "South West & Western Gateway",
      focus: "M4 / M5 Corridors & Severn Region",
      counties: "Gloucestershire, Wiltshire, Somerset, Bristol & Bath, Devon",
      priority: "Active Sourcing",
    },
    {
      region: "Cross-Border Strategic",
      focus: "Wales & Scotland Growth Centres",
      counties: "South Wales Metro Corridor, Central Belt Scotland, Strategic Rail & Road Hubs",
      priority: "Selective Strategic Promotion",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Target Acquisition Criteria"
        title="Clear Parameters."
        subtitle="Disciplined Sourcing."
        description="Entire UK acquires, promotes and funds land and property opportunities across England, Scotland and Wales. We provide transparent parameters so landowners, agents and advisers know exactly what we buy and how we structure."
        imageSrc="/images/what-we-look-for-bg.jpg"
        imageAlt="Aerial view of UK settlement edge and development land parcels"
        badge="Direct Principal Buyer"
      >
        <div className="flex flex-wrap gap-4 pt-2">
          <Button href="#criteria-checker" variant="primary" showArrow>
            Test Site Compatibility
          </Button>
          <Button href="/submit" variant="secondary">
            Submit an Opportunity
          </Button>
        </div>
      </PageHero>

      {/* Corporate Position Statement */}
      <section className="bg-brand-carbon border-b border-brand-edge-dark py-6 text-xs font-light text-brand-mist/80">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-electric flex-shrink-0" />
              <p>
                <strong className="text-white font-medium">Principal Acquisition Mandate:</strong>{" "}
                We act as a direct buyer, promoter and development partner utilizing private capital. We are not an estate agency, broker, or fund.
              </p>
            </div>
            <Link
              href="/approach"
              className="text-brand-electric hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>Our 7-Stage Process</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Interactive Self-Assessment Section */}
      <Section id="criteria-checker" dark={true} className="border-b border-brand-edge-dark">
        <Container>
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="eyebrow eyebrow-dark block mb-2">Instant Pre-Screening</span>
            <h2 className="text-3xl sm:text-4xl font-extralight text-white">
              Does Your Site Match Our Mandate?
            </h2>
            <p className="text-sm font-light text-brand-mist/80 mt-3">
              Use our interactive parameters tool to determine how Entire UK would evaluate your parcel or built asset.
            </p>
          </div>
          <CriteriaFilterWidget />
        </Container>
      </Section>

      {/* Target Typologies Detailed Matrix */}
      <Section id="typologies" className="border-b border-brand-edge-light bg-white">
        <Container>
          <div className="max-w-3xl mb-12">
            <span className="eyebrow eyebrow-light block mb-2">Acquisition Typologies</span>
            <h2 className="text-3xl sm:text-4xl font-extralight text-brand-carbon tracking-tight">
              Target Asset Classes &amp; Scope
            </h2>
            <p className="text-base font-light text-brand-slate mt-3 leading-relaxed">
              We evaluate opportunities across five distinct asset typologies. Each requires tailored spatial diligence, planning justification, and commercial execution.
            </p>
          </div>

          <div className="space-y-8">
            {typologies.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-sm border border-brand-edge-light p-6 sm:p-8 shadow-sm hover:border-brand-steel transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-brand-edge-light">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-sm bg-brand-surface border border-brand-edge-light text-brand-electric flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-light text-brand-carbon">
                          {t.title}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-wider text-brand-electric font-medium mt-1">
                          Scale: {t.scale}
                        </p>
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <span className="text-xs font-mono uppercase tracking-wider text-brand-slate/60 block">
                        Planning Context
                      </span>
                      <p className="text-xs sm:text-sm font-light text-brand-carbon mt-0.5">
                        {t.planningContext}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-brand-carbon font-semibold mb-3">
                        Key Viability Requirements
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm font-light text-brand-slate">
                        {t.keyCriteria.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-brand-surface/60 rounded-sm p-5 border border-brand-edge-light flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-brand-slate/60 block">
                          Preferred Transaction Mechanism
                        </span>
                        <p className="text-sm font-medium text-brand-carbon mt-1">
                          {t.preferredStructures}
                        </p>
                        <p className="text-xs font-light text-brand-slate/80 mt-2 leading-relaxed">
                          We tailor commercial agreements to landowner circumstances, funding all planning promotion costs or completing unconditional acquisitions where title is clean.
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-brand-edge-light/60 flex items-center justify-between">
                        <Link
                          href={`/submit?typology=${t.id}`}
                          className="text-xs font-medium text-brand-electric hover:underline flex items-center gap-1.5"
                        >
                          <span>Submit this asset type</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Viability Anatomy vs Fatal Constraints */}
      <Section id="fatal-constraints" dark={true} className="border-b border-brand-edge-dark">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: What Makes a Site Viable */}
            <div className="space-y-6">
              <span className="eyebrow eyebrow-dark block">Anatomy of Viability</span>
              <h2 className="text-3xl font-extralight text-white leading-tight">
                What Makes a Site Commercial &amp; Deliverable
              </h2>
              <p className="text-sm font-light text-brand-mist/80 leading-relaxed">
                Land value is not created by hope value or optimistic sketches. Viability depends on five empirical pillars that satisfy both local planning policy and real-world construction delivery economics.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Adopted Highways & Enforceable Access",
                    desc: "Verifiable direct physical and legal frontage to an adopted public highway with visibility splays meeting DMRB or Manual for Streets standards. No unresolvable ransom strips.",
                  },
                  {
                    title: "Settlement Hierarchy Alignment",
                    desc: "Physical connection to established settlements with access to sustainable public transit, primary education, healthcare and employment centres.",
                  },
                  {
                    title: "Drainage & Infrastructure Capacity",
                    desc: "Gravity surface water outfall paths, sewer capacity without prohibitive off-site reinforcement, and viable electrical grid connection availability.",
                  },
                  {
                    title: "Topography & Ground Viability",
                    desc: "Manageable slope gradients avoiding excessive cut-and-fill retaining structures. Absence of shallow unrecorded mine workings or severe ground contamination.",
                  },
                  {
                    title: "Housing Land Supply & Policy Tailwinds",
                    desc: "Districts with under-delivery against housing targets, outdated local plans, or brownfield-first statutory presumptions.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-sm bg-brand-carbon border border-white/10 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-electric flex-shrink-0" />
                      <h4 className="text-sm font-medium text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs font-light text-brand-mist/75 leading-relaxed pl-6">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Disciplined Rejection Standards / Fatal Constraints */}
            <div className="space-y-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 block">
                Disciplined Rejection Standards
              </span>
              <h2 className="text-3xl font-extralight text-white leading-tight">
                Fatal Constraints: When We Say No
              </h2>
              <p className="text-sm font-light text-brand-mist/80 leading-relaxed">
                We believe disciplined rejection protects capital, landowner time, and professional focus. We will not pursue sites encumbered by absolute statutory blockers.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Flood Zone 3b (Functional Floodplain)",
                    desc: "NPPF strictly prohibits residential development. Where land is designed to convey or store water in an extreme flood event, it is rejected.",
                  },
                  {
                    title: "Statutory Environmental Exclusions",
                    desc: "Sites within or causing direct irreparable harm to Sites of Special Scientific Interest (SSSI), Special Areas of Conservation (SAC), SPAs, RAMSAR sites, or Ancient Woodland.",
                  },
                  {
                    title: "Unresolvable Legal Ransoms",
                    desc: "Parcels landlocked behind third-party ownerships where title deeds provide no enforceable right of access and the owner is untraceable or unwilling to negotiate reasonable terms.",
                  },
                  {
                    title: "Prohibitive Contamination / Slope Instability",
                    desc: "Ground conditions where remediation costs exceed the gross development value (GDV) of the finished scheme, rendering delivery mathematically unviable.",
                  },
                  {
                    title: "Isolated Unsustainable Greenfield",
                    desc: "Remote rural parcels detached from any existing settlement boundary with zero pedestrian or transit connectivity, carrying insurmountable NPPF countryside conflict.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-sm bg-brand-carbon/60 border border-amber-500/20 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-amber-200">{item.title}</h4>
                    </div>
                    <p className="text-xs font-light text-brand-mist/75 leading-relaxed pl-6">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Geographic Coverage */}
      <Section id="geographic-focus" surface={true} className="border-b border-brand-edge-light">
        <Container>
          <div className="max-w-3xl mb-12">
            <span className="eyebrow eyebrow-light block mb-2">Regional Reach</span>
            <h2 className="text-3xl sm:text-4xl font-extralight text-brand-carbon tracking-tight">
              Geographic Focus &amp; Core Hubs
            </h2>
            <p className="text-base font-light text-brand-slate mt-3 leading-relaxed">
              We operate across England, Wales and Scotland, with deep operational familiarity and active intelligence hubs concentrated in key regional growth corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regions.map((r, idx) => (
              <div
                key={idx}
                className="bg-white rounded-sm border border-brand-edge-light p-6 sm:p-7 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-brand-electric font-semibold">
                    {r.priority}
                  </span>
                  <MapPin className="w-4 h-4 text-brand-slate/50" />
                </div>
                <h3 className="text-xl font-light text-brand-carbon">
                  {r.region}
                </h3>
                <p className="text-xs font-medium text-brand-slate">
                  {r.focus}
                </p>
                <p className="text-xs font-light text-brand-slate/80 leading-relaxed pt-1">
                  <strong className="text-brand-carbon font-medium">Coverage:</strong> {r.counties}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Commercial Structuring Mechanisms */}
      <Section dark={true} className="border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl mb-12">
            <span className="eyebrow eyebrow-dark block mb-2">Commercial Flexibility</span>
            <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight">
              How We Transact
            </h2>
            <p className="text-base font-light text-brand-mist/80 mt-3 leading-relaxed">
              We structure acquisitions and partnerships around landowner priorities — whether that is immediate unconditional certainty, maximum long-term value, or joint-venture participation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-electric block">
                Direct Certainty
              </span>
              <h3 className="text-lg font-normal text-white">Unconditional Freehold Purchase</h3>
              <p className="text-xs font-light text-brand-mist/80 leading-relaxed">
                For sites with existing consent or clear permitted development potential. We commit private funds, exchange swiftly, and complete on agreed dates without protracted conditional delays.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-electric block">
                Aligned Value
              </span>
              <h3 className="text-lg font-normal text-white">Planning Promotion Agreement</h3>
              <p className="text-xs font-light text-brand-mist/80 leading-relaxed">
                Entire UK funds 100% of the technical, architectural, environmental and legal planning promotion costs through Local Plan adoption and planning consent. We take the downside risk; the landowner retains ownership until sale at open market value.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-electric block">
                Structured Option
              </span>
              <h3 className="text-lg font-normal text-white">Subject-to-Planning Option</h3>
              <p className="text-xs font-light text-brand-mist/80 leading-relaxed">
                Pre-agreed option agreement granting Entire UK the right to purchase the site at a formula discount to market value upon grant of a satisfactory planning permission, providing complete downside protection.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Conversion Banner */}
      <section className="bg-brand-void py-16 sm:py-20 text-white">
        <Container>
          <div className="rounded-sm border border-brand-edge-dark bg-gradient-to-r from-brand-carbon to-brand-void p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <span className="eyebrow eyebrow-dark block">Direct Engagement</span>
              <h2 className="text-2xl sm:text-3xl font-extralight text-white">
                Have a Site That Aligns With Our Criteria?
              </h2>
              <p className="text-sm font-light text-brand-mist/80">
                Submit your land or property opportunity directly to our acquisition desk. Every submission receives an authoritative preliminary cadastral and planning appraisal within 5 business days.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <Button href="/submit" variant="primary" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/contact" variant="secondary">
                Speak With Our Desk
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
