import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { EditorialMedia } from "@/components/ui/EditorialMedia";
import { AcquisitionProcessExplorer } from "@/components/interactive/AcquisitionProcessExplorer";
import { generatePageMetadata } from "@/lib/metadata";
import {
  Compass,
  FileCheck2,
  Scale,
  Shield,
  Coins,
  HardHat,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Our Approach — From Discovery to Development",
  description:
    "Explore Entire UK's disciplined 7-stage acquisition, planning and development methodology for unlocking enduring commercial value in UK land and property.",
  path: "/approach",
});

export default function ApproachPage() {
  const transactionStructures = [
    {
      name: "Unconditional Freehold Purchase",
      idealFor: "Vendors requiring immediate execution certainty and clean capital exit without planning delays.",
      mechanism:
        "Entire UK exchanges and completes on fixed contractual terms, absorbing 100% of the planning, environmental, and delivery risk directly onto our balance sheet.",
      deliverables: "Rapid exchange within 28 days of due diligence; clean cash settlement; no retention hurdles.",
    },
    {
      name: "Planning Promotion Agreement",
      idealFor: "Landowners with strategic acreage (10 to 100+ acres) seeking to maximise open-market gross value.",
      mechanism:
        "Entire UK acts as promotion partner, funding 100% of the technical, architectural, environmental and legal planning costs. Once planning consent is secured, the land is marketed on the open market and net proceeds are shared.",
      deliverables: "Zero cost or financial risk to landowner; full alignment of interests; competitive open-market tender.",
    },
    {
      name: "Option Agreement",
      idealFor: "Owners seeking a guaranteed minimum baseline land value combined with planning upside.",
      mechanism:
        "Entire UK secures a legally binding option to purchase the site within an agreed planning window at an agreed price formula (or discounted market value), funding all application costs.",
      deliverables: "Guaranteed minimum price floor; planning costs covered; flexible completion timing.",
    },
    {
      name: "Joint Venture (JV) Partnership",
      idealFor: "Property owners or institutions wishing to retain equity participation and share in development profit.",
      mechanism:
        "A dedicated Special Purpose Vehicle (SPV) is created. The owner contributes the land or built asset while Entire UK provides development management, planning funding, and construction procurement.",
      deliverables: "Enhanced equity returns; transparent governance; aligned commercial objectives.",
    },
  ];

  const epistemicStatuses = [
    {
      status: "KNOWN",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Direct fact established from authoritative statutory origin (e.g. HMLR registered title boundary, adopted public highway extents, EA Zone 3b boundary).",
    },
    {
      status: "DERIVED",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Deterministic computational output produced by applying auditable spatial logic over source facts (e.g. centroid calculation, boundary overlap percentage).",
    },
    {
      status: "INTERPRETED",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Attributable human professional evaluation recorded by an experienced property analyst (e.g. planning risk assessment, title covenant interpretation).",
    },
    {
      status: "UNKNOWN",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Absence of data or unverified record. Governed by the non-negotiable rule: 'Unknown is not clear. Absence of a record does not equal absence of a constraint.'",
    },
    {
      status: "TO BE VERIFIED",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      description: "Identified data contradiction or pending statutory confirmation (e.g. unadopted boundary strip, conflicting planning register notices). Blocks progression.",
    },
  ];

  return (
    <div>
      {/* Full-Screen Editorial Hero */}
      <PageHero
        eyebrow="Execution Methodology"
        badge="7-Stage Value Creation Model"
        title="FROM DISCOVERY"
        subtitle="TO DEVELOPMENT."
        description="We take land and property opportunities from initial spatial identification through rigorous multi-disciplinary due diligence, contractual control, planning consent, capital structuring, construction delivery and asset realisation."
        imageSrc="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1920&q=80"
        imageAlt="UK civil infrastructure and land development execution"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/submit" variant="primary" size="lg" showArrow>
            Submit an Opportunity
          </Button>
          <Button href="#evidence-before-assumption" variant="ghost" size="lg">
            Our Truth Doctrine
          </Button>
        </div>
      </PageHero>

      {/* Interactive 7-Stage Process Explorer */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">The Complete Lifecycle</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              The Seven-Stage Acquisition Model
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Click through each stage to inspect the specific data inputs, mandatory evidence hurdles, attributable deliverables, and disciplined rejection grounds that govern our workflow.
            </p>
          </div>

          <AcquisitionProcessExplorer />
        </Container>
      </Section>

      {/* Editorial Principle: Evidence Before Assumption */}
      <Section surface={true} id="evidence-before-assumption">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow">Core Epistemic Doctrine</span>
              <h2 className="text-3xl sm:text-4xl font-extralight text-brand-graphite tracking-tight leading-tight">
                Evidence Before Assumption: <br />
                <span className="font-normal text-brand-electric">&ldquo;Unknown is not clear.&rdquo;</span>
              </h2>
              <p className="text-base font-light text-brand-silver leading-relaxed">
                In commercial property acquisition, the most catastrophic mistakes occur when teams confuse the absence of a recorded constraint with confirmation that a site is clear.
              </p>
              <p className="text-sm font-light text-brand-silver leading-relaxed">
                If an environmental database contains no record of land contamination, that does not prove the soil is clean — it merely proves no prior investigation was logged. If Ordnance Survey indicates a road is nearby, that does not prove you hold a legal right to cross the intervening verge.
              </p>
              <div className="p-4 rounded-sm bg-white border border-brand-edge text-xs font-light text-brand-graphite space-y-2">
                <span className="font-medium font-mono text-brand-electric uppercase tracking-wider block">
                  The Entire UK Truth Rule:
                </span>
                <p>
                  <strong>SOURCE → EVIDENCE → INTERPRETATION → HUMAN ACTION → REAL-WORLD OUTCOME.</strong>
                  <br />
                  We never permit: ASSUMPTION → SYSTEM DECISION → PRESENTED AS FACT.
                </p>
              </div>
            </div>

            {/* Epistemic Status Matrix */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-silver block mb-2">
                Classification of System Knowledge
              </span>
              {epistemicStatuses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-sm bg-white border border-brand-edge space-y-1.5 card-spatial"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeClass}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] font-mono text-brand-silver/50">Status 0{idx + 1}</span>
                  </div>
                  <p className="text-xs font-light text-brand-silver leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Human Judgement in Practice */}
      <Section className="bg-white">
        <Container>
          <EditorialMedia
            variant="split"
            primaryImage={{
              src: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80",
              alt: "Experienced development professionals conducting on-site technical inspection",
              badge: "On-Site Due Diligence",
              caption: "Physical ground investigation verifying vehicular sightlines, boundary topography and underground utility services.",
              aspectRatio: "video",
            }}
            title="Why Technology Never Replaces Human Judgement"
            subtitle="The Limits of Algorithmic Sourcing"
            description="Our proprietary Land Radar platform provides an exceptional research advantage, screening millions of statutory records in seconds. But an algorithm cannot walk a boundary line, negotiate with a neighbouring landowner to release a ransom strip, or gauge the political sentiment of a local planning committee. Experienced human property professionals lead every single commercial decision."
          >
            <div className="space-y-3 pt-3">
              {[
                "Highways Engineers verify visibility splays and adopted boundary pegs on site.",
                "Ecology Specialists perform seasonal Phase 1 habitat walkovers for protected species.",
                "Planning Counsel review emerging local plan policies and committee precedents.",
                "Development Directors structure commercial transactions directly with vendors.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-light text-brand-graphite">
                  <CheckCircle2 className="w-4 h-4 text-brand-electric shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </EditorialMedia>
        </Container>
      </Section>

      {/* When We Walk Away: Stage-Gate Exit Criteria */}
      <Section dark={true} className="border-y border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl mb-12">
            <span className="eyebrow eyebrow-dark block mb-2">Capital &amp; Risk Discipline</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white leading-tight">
              When We Walk Away: Disciplined Exit Gates
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-mist/80 leading-relaxed">
              Every stage of our acquisition model has defined termination criteria. If a defect cannot be solved legally or commercially, we abort the acquisition rather than gambling balance-sheet capital or partner time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                  Gate 1 Exit
                </span>
                <span className="text-[10px] font-mono text-brand-mist/60">Spatial Screening</span>
              </div>
              <h3 className="text-base font-medium text-white">Statutory &amp; Physical Blockers</h3>
              <p className="text-xs font-light text-brand-mist/75 leading-relaxed">
                Sites situated in Flood Zone 3b (Functional Floodplain), Ancient Woodland, or SSSI buffers are terminated immediately. No exceptions for speculative political lobbying.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                  Gate 2 Exit
                </span>
                <span className="text-[10px] font-mono text-brand-mist/60">Due Diligence</span>
              </div>
              <h3 className="text-base font-medium text-white">Unresolvable Ransoms &amp; Defective Title</h3>
              <p className="text-xs font-light text-brand-mist/75 leading-relaxed">
                If highway access relies on an unadopted verge where the owner cannot be identified or demands an extortionate premium that renders the development uninsurable, we walk away.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                  Gate 3 Exit
                </span>
                <span className="text-[10px] font-mono text-brand-mist/60">Contract &amp; Commercials</span>
              </div>
              <h3 className="text-base font-medium text-white">Unrealistic Vendor Valuation</h3>
              <p className="text-xs font-light text-brand-mist/75 leading-relaxed">
                Where vendors demand unconditional completion prices based on consented land values without absorbing planning or contamination discount, we step back respectfully until market conditions realign.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                  Gate 4 Exit
                </span>
                <span className="text-[10px] font-mono text-brand-mist/60">Planning Promotion</span>
              </div>
              <h3 className="text-base font-medium text-white">Unviable Planning Appeal Path</h3>
              <p className="text-xs font-light text-brand-mist/75 leading-relaxed">
                If a planning application is refused and leading planning counsel advises that an Inspectorate appeal has less than a defensible probability of success under NPPF guidelines, we conclude the promotion.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                  Gate 5 Exit
                </span>
                <span className="text-[10px] font-mono text-brand-mist/60">Capital &amp; Funding</span>
              </div>
              <h3 className="text-base font-medium text-white">Abnormal Infrastructure Costs</h3>
              <p className="text-xs font-light text-brand-mist/75 leading-relaxed">
                If post-consent ground surveys or utility connection quotes (S104 drainage, S278 junctions, DNO sub-stations) introduce abnormal costs exceeding 20% of GDV, we renegotiate land price or terminate the option.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-brand-carbon border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  The Result
                </span>
                <span className="text-[10px] font-mono text-brand-mist/60">Disciplined Portfolio</span>
              </div>
              <h3 className="text-base font-medium text-white">Only Deliverable Sites Reach Delivery</h3>
              <p className="text-xs font-light text-brand-mist/75 leading-relaxed">
                By maintaining strict exit criteria at every stage, we ensure every consented scheme Entire UK brings forward is physically deliverable, financially viable, and institutionally investable.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Commercial Structuring Mechanisms */}
      <Section surface={true} id="deal-structures">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="eyebrow">Transaction Mechanics</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-brand-graphite leading-tight mt-3">
              Tailored Transaction Structures
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-silver leading-relaxed">
              Every landowner has distinct financial, tax, and timing requirements. We offer flexible commercial mechanisms designed to align interests and deliver optimal value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {transactionStructures.map((struct, idx) => (
              <div
                key={idx}
                className="p-8 rounded-sm bg-white border border-brand-edge flex flex-col justify-between h-full card-spatial"
              >
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-brand-electric">
                    Structure 0{idx + 1}
                  </span>
                  <h3 className="text-xl font-medium text-brand-graphite">
                    {struct.name}
                  </h3>
                  <div className="p-3 rounded-sm bg-brand-surface border border-brand-edge text-xs font-light text-brand-silver">
                    <strong className="text-brand-graphite block mb-1">Ideal For:</strong>
                    {struct.idealFor}
                  </div>
                  <p className="text-xs font-light text-brand-silver leading-relaxed pt-1">
                    {struct.mechanism}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-edge text-[11px] font-mono text-brand-graphite">
                  <span className="text-brand-silver block font-sans">Deliverables:</span>
                  {struct.deliverables}
                </div>
              </div>
            ))}
          </div>

          {/* Direct CTA */}
          <div className="p-8 rounded-sm bg-brand-void text-white border border-brand-edge-dark flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-light text-white">
                Discuss an Acquisition Structure With Our Team
              </h4>
              <p className="text-xs font-light text-brand-mist/75 mt-1">
                We review sites confidentially and structure terms aligned with your objectives.
              </p>
            </div>
            <Button href="/submit" variant="primary" size="md" showArrow>
              Submit a Site
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
