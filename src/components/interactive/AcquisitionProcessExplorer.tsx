"use client";

import React, { useState } from "react";
import {
  Compass,
  FileCheck2,
  Scale,
  Shield,
  Coins,
  HardHat,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface ProcessStage {
  step: string;
  name: string;
  shortSummary: string;
  objective: string;
  inputs: string[];
  evidenceHurdles: string[];
  deliverables: string[];
  rejectionGrounds: string[];
  icon: React.ElementType;
}

export function AcquisitionProcessExplorer() {
  const stages: ProcessStage[] = [
    {
      step: "01",
      name: "DISCOVER",
      shortSummary: "Algorithmic screening & off-market spatial identification",
      objective: "Identify candidate parcels and properties where existing use substantially diverges from planning potential.",
      inputs: [
        "HM Land Registry cadastral index polygons",
        "Ordnance Survey MasterMap spatial geometries",
        "Local Plan call-for-sites & SHLAA registries",
        "Statutory planning decision histories & appeal notices",
      ],
      evidenceHurdles: [
        "Unregistered vs registered boundary discrepancy verification",
        "Geometric road proximity check (highways boundary separation check)",
        "Statutory flood zone screening (EA River & Surface Water)",
      ],
      deliverables: [
        "Candidate Spatial Dossier",
        "Cadastral Overlap Analysis",
        "Preliminary Planning History Extract",
      ],
      rejectionGrounds: [
        "Irresolvable Functional Floodplain (Zone 3b)",
        "Absolute statutory barrier (Ancient Woodland / SSSI direct overlap)",
      ],
      icon: Compass,
    },
    {
      step: "02",
      name: "ASSESS",
      shortSummary: "Multi-layered due diligence & technical constraint verification",
      objective: "Subject the candidate site to exhaustive planning, legal, highways, ecological and commercial scrutiny.",
      inputs: [
        "LPA 5-year housing land supply (5YHLS) monitoring reports",
        "Adopted highways boundary extracts & Section 38/278 records",
        "Topographical surveys & surface water catchment run-off",
        "British Geological Survey (BGS) borehole and contamination data",
      ],
      evidenceHurdles: [
        "Verified vehicular right-of-way without third-party ransom strip",
        "Biodiversity Net Gain (BNG) 10% baseline deliverability",
        "Residual land value viability under regional BCIS construction rates",
      ],
      deliverables: [
        "5-Layer Candidate Truth Ledger",
        "Highways & Ransom Technical Audit",
        "Residual Land Viability Model",
      ],
      rejectionGrounds: [
        "Defective vehicular access or unresolvable ransom strip",
        "Severe contamination or geotechnical remediation cost deficit",
        "Conflict with unyielding green belt policy without special circumstances",
      ],
      icon: FileCheck2,
    },
    {
      step: "03",
      name: "CONTROL",
      shortSummary: "Securing contractual control aligned with vendor objectives",
      objective: "Structure and execute legal agreements that balance vendor requirements with planning and delivery viability.",
      inputs: [
        "Vendor commercial motivations (liquidity, timing, legacy)",
        "Title register entries, restrictive covenants and easements",
        "Independent Red Book RICS valuation benchmarks",
      ],
      evidenceHurdles: [
        "Unconditional freehold purchase terms agreed, OR",
        "Promotion agreement terms with agreed minimum price thresholds, OR",
        "Option agreement with clear deduction formulas for Section 106 & abnormal costs",
      ],
      deliverables: [
        "Exchange of Contracts (Unconditional, Option or Promotion)",
        "Agreed Project Delivery Charter",
        "Vendor Discretion & Confidentiality Protocol",
      ],
      rejectionGrounds: [
        "Vendor pricing expectations exceeding realistic residual value",
        "Unresolvable title covenants preventing residential or commercial redevelopment",
      ],
      icon: Scale,
    },
    {
      step: "04",
      name: "PLAN",
      shortSummary: "Masterplanning, stakeholder engagement & committee consent",
      objective: "Assemble top-tier consultants to navigate planning frameworks and secure robust, deliverable statutory consents.",
      inputs: [
        "LPA Local Development Scheme & emerging spatial frameworks",
        "National Planning Policy Framework (NPPF) guidelines",
        "Pre-application advice meetings with local authority officers",
        "Statutory consultee feedback (Highways, Environment Agency, Heritage)",
      ],
      evidenceHurdles: [
        "Architectural scheme optimizing massing while respecting local character",
        "Environmental Impact Assessment (EIA) & flood mitigation sign-off",
        "Section 106 legal agreement and CIL liability agreement",
      ],
      deliverables: [
        "Full or Outline Planning Permission Notice",
        "Section 106 Bilateral Agreement",
        "Approved Reserved Matters Parameter Plans",
      ],
      rejectionGrounds: [
        "Planning committee refusal upheld on appeal due to insurmountable policy barrier",
        "Section 106 infrastructure demands that extinguish scheme economic viability",
      ],
      icon: Shield,
    },
    {
      step: "05",
      name: "FUND",
      shortSummary: "Structuring institutional capital & project facilities",
      objective: "Deploy optimal development finance and institutional equity to enable efficient project procurement.",
      inputs: [
        "Independent QS cost plan & schedule of abnormal groundworks",
        "Consented gross development value (GDV) appraisals",
        "Senior debt terms from UK tier-one clearing banks & funds",
      ],
      evidenceHurdles: [
        "Senior debt loan-to-cost (LTC) and loan-to-GDV covenants satisfied",
        "Equity draw-down agreements executed with institutional capital partners",
        "Independent Project Monitoring (IPM) sign-off on build contracts",
      ],
      deliverables: [
        "Senior Development Debt Facility Agreement",
        "Special Purpose Vehicle (SPV) Equity Commitment",
        "Approved Construction Escrow Account",
      ],
      rejectionGrounds: [
        "Debt market repricing causing interest burden to exceed project margin",
        "Failure of main contractor credit checks prior to contract execution",
      ],
      icon: Coins,
    },
    {
      step: "06",
      name: "DEVELOP",
      shortSummary: "Physical execution with vetted UK construction contractors",
      objective: "Progress the consented opportunity through site preparation, civil infrastructure, and high-specification build.",
      inputs: [
        "JCT Design & Build (D&B) contract documentation",
        "Building Regulations Part L & Future Homes Standard compliance packs",
        "NHBC / Premier Guarantee warranty warranties and warranties schedule",
      ],
      evidenceHurdles: [
        "Phase 1 & 2 remediation completion certificates verified",
        "Section 278 highways adoption works completed to council satisfaction",
        "Continuous Quality & ESG inspection sign-offs",
      ],
      deliverables: [
        "Completed Infrastructure & Utilities Connections",
        "Building Control Final Completion Certificates",
        "10-Year Structural Defect Warranty Documentation",
      ],
      rejectionGrounds: [
        "Major unforeseen subterranean obstruction requiring scheme redesign",
      ],
      icon: HardHat,
    },
    {
      step: "07",
      name: "REALISE",
      shortSummary: "Value crystallisation, institutional handover & long-term stewardship",
      objective: "Deliver completed assets to end-occupiers, institutional investors, or registered affordable housing providers.",
      inputs: [
        "Open-market residential marketing schedules",
        "Forward-sale commitments with Registered Housing Providers (RPs)",
        "Build-to-Rent (BTR) institutional investor acquisition agreements",
      ],
      evidenceHurdles: [
        "Section 106 affordable housing transfer completions",
        "Practical Completion handover sign-offs by Employer's Agent",
        "Operational estate management transition to Entire built-environment teams",
      ],
      deliverables: [
        "Turnkey Handover to Occupiers & Investors",
        "Final Investor Return Distributions",
        "Post-Occupancy Performance & Environmental Audit",
      ],
      rejectionGrounds: [
        "None (Project reaches terminal realisation)",
      ],
      icon: TrendingUp,
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeStage = stages[activeIdx];
  const ActiveIcon = activeStage.icon;

  return (
    <div className="rounded-sm border border-brand-edge bg-white overflow-hidden shadow-sm">
      {/* Stage Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border-b border-brand-edge bg-brand-surface/60">
        {stages.map((st, idx) => {
          const isSelected = activeIdx === idx;
          const Icon = st.icon;
          return (
            <button
              key={st.step}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`p-3.5 sm:p-4 text-left transition-all border-r border-b lg:border-b-0 border-brand-edge last:border-r-0 relative cursor-pointer ${
                isSelected
                  ? "bg-white text-brand-graphite shadow-sm"
                  : "text-brand-silver hover:bg-white/80 hover:text-brand-graphite"
              }`}
            >
              {isSelected && (
                <span className="absolute top-0 inset-x-0 h-0.5 bg-brand-electric" />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-medium ${
                    isSelected ? "text-brand-electric" : "text-brand-silver/70"
                  }`}
                >
                  {st.step}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? "text-brand-electric" : "text-brand-silver/50"
                  }`}
                />
              </div>
              <span className="block text-xs font-medium tracking-tight uppercase">
                {st.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="p-6 sm:p-10 lg:p-12 space-y-8">
        {/* Stage Overview Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-brand-edge">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric font-mono text-xs font-semibold">
                {activeStage.step}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-silver">
                Stage {activeStage.step} of 07
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extralight text-brand-graphite tracking-tight">
              {activeStage.name} — <span className="font-normal text-brand-electric">{activeStage.shortSummary}</span>
            </h3>
            <p className="text-sm font-light text-brand-silver max-w-2xl leading-relaxed">
              {activeStage.objective}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-2 text-xs font-medium border border-brand-edge rounded-sm text-brand-graphite hover:bg-brand-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prior Stage
            </button>
            <button
              type="button"
              disabled={activeIdx === stages.length - 1}
              onClick={() => setActiveIdx((prev) => Math.min(stages.length - 1, prev + 1))}
              className="px-3.5 py-2 text-xs font-medium bg-brand-graphite text-white rounded-sm hover:bg-brand-carbon disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next Stage →
            </button>
          </div>
        </div>

        {/* 4-Column Evidence & Execution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Column 1: Primary Inputs */}
          <div className="p-5 rounded-sm bg-brand-surface border border-brand-edge space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-silver block font-medium">
              Data &amp; Field Inputs
            </span>
            <ul className="space-y-2 text-xs font-light text-brand-graphite">
              {activeStage.inputs.map((inp, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-electric shrink-0 mt-1.5" />
                  <span>{inp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Evidence Hurdles */}
          <div className="p-5 rounded-sm bg-brand-surface border border-brand-edge space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-silver block font-medium">
              Mandatory Evidence Hurdles
            </span>
            <ul className="space-y-2 text-xs font-light text-brand-graphite">
              {activeStage.evidenceHurdles.map((eh, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{eh}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Deliverables */}
          <div className="p-5 rounded-sm bg-brand-surface border border-brand-edge space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-silver block font-medium">
              Attributable Deliverables
            </span>
            <ul className="space-y-2 text-xs font-light text-brand-graphite">
              {activeStage.deliverables.map((del, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Disciplined Rejection Grounds */}
          <div className="p-5 rounded-sm bg-rose-50/50 border border-rose-200/80 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-700 block font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Why Sites Stop Here</span>
            </span>
            <ul className="space-y-2 text-xs font-light text-rose-900">
              {activeStage.rejectionGrounds.map((rej, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{rej}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Epistemic Rule Reminder */}
        <div className="p-4 rounded-sm bg-brand-carbon text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-light">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-electric animate-pulse shrink-0" />
            <span>
              <strong>Entire UK Standard:</strong> Progression requires verified evidence across title, highways, planning and viability. We never substitute assumption for proof.
            </span>
          </div>
          <Link
            href="/submit"
            className="text-brand-electric hover:underline font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>Submit a Site to this Pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
