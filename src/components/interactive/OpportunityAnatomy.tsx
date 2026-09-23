"use client";

import React, { useState } from "react";
import {
  MapPin,
  Lock,
  FileSearch,
  Route,
  ShieldAlert,
  Landmark,
  TrendingUp,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

interface AnatomyDimension {
  id: string;
  name: string;
  category: string;
  question: string;
  investigationMethod: string;
  criticalHurdle: string;
  fallacyWarning: string;
  icon: React.ElementType;
}

export function OpportunityAnatomy() {
  const dimensions: AnatomyDimension[] = [
    {
      id: "ownership",
      name: "Ownership & Cadastre",
      category: "Legal Framework",
      question: "Who holds the freehold, leaseholds, easements, and sub-surface mineral rights?",
      investigationMethod:
        "Full HM Land Registry Title Register & Title Plan review. Corporate ownership (CCOD) tracing through Companies House filings. Cross-matching spatial candidate polygons against discrete HMLR registered titles to detect unrecorded gaps.",
      criticalHurdle:
        "Confirmation of absolute freehold title (or clean long leasehold) without restrictive covenants prohibiting residential or commercial intensification.",
      fallacyWarning:
        "Cadastral Fallacy: Physical occupation or fence line != registered legal freehold boundary.",
      icon: Lock,
    },
    {
      id: "access",
      name: "Highways & Physical Access",
      category: "Infrastructure",
      question: "Is there an unencumbered, adopted vehicular access directly adjoining the boundary?",
      investigationMethod:
        "Warwickshire & county-level adopted highway extent extracts, Section 38/278 adoption certificates, visibility splay calculations under DMRB guidelines, and physical inspection of verge strips.",
      criticalHurdle:
        "Defensible continuous adopted highway frontage without third-party ransom strips or unregistered boundary margins.",
      fallacyWarning:
        "Road Adjacency Fallacy: Physical adjacency to a road != legal right of vehicular access. An intervening 0.3m strip under separate title can block development entirely.",
      icon: Route,
    },
    {
      id: "planning",
      name: "Planning History & Precedents",
      category: "Statutory Law",
      question: "What is the statutory planning status, decision history and inspectorate appeal context?",
      investigationMethod:
        "LPA planning registers, historical decision notices, Section 106 agreements, committee minutes, and national Planning Inspectorate (PINS) appeal precedent reviews.",
      criticalHurdle:
        "Demonstrable policy alignment, emerging draft allocation, or material change in circumstances that overcomes prior refusals.",
      fallacyWarning:
        "Permission Fallacy: An expired outline permission does not guarantee a new application will be granted under updated local development frameworks.",
      icon: FileSearch,
    },
    {
      id: "policy",
      name: "Local Plan & 5YHLS Policy",
      category: "Strategic Context",
      question: "Where does the site sit within the Local Development Scheme and spatial housing metrics?",
      investigationMethod:
        "Assessment of the adopted Local Plan, emerging Draft Local Plan consultations, Strategic Housing Land Availability Assessment (SHLAA) call-for-sites entries, and LPA Housing Delivery Test (HDT) performance.",
      criticalHurdle:
        "LPA five-year housing land supply deficit or settlement boundary expansion justification under NPPF presumption in favour of sustainable development.",
      fallacyWarning:
        "Call-for-Sites Fallacy: Submission to a council's call-for-sites is an expression of vendor interest, NOT an adopted council allocation.",
      icon: Landmark,
    },
    {
      id: "environmental",
      name: "Environmental Constraints",
      category: "Physical & Ecological",
      question: "Are there statutory flood risks, protected habitats, or topographical barriers?",
      investigationMethod:
        "Environment Agency Flood Map for Planning (Rivers & Sea Zone 2/3 and Surface Water RoFSW models), Natural England ancient woodland and SSSI buffers, tree preservation orders (TPOs), and Phase 1 ecology walkovers.",
      criticalHurdle:
        "Satisfying the Sequential and Exception Tests for flood risk and demonstrating deliverable 10% Biodiversity Net Gain (BNG) on or off-site.",
      fallacyWarning:
        "Green Field Fallacy: A dry, grassy field in August may sit entirely within Functional Floodplain Zone 3b during winter storm events.",
      icon: ShieldAlert,
    },
    {
      id: "physical",
      name: "Ground Conditions & Contamination",
      category: "Civil Engineering",
      question: "What historic uses, buried structures, or contamination affect the ground?",
      investigationMethod:
        "Historical Ordnance Survey cartographic reviews (1880–present), British Geological Survey (BGS) borehole records, Coal Authority mining legacy reports, and Phase 1 Environmental Desk Studies.",
      criticalHurdle:
        "Remediation costs quantified and accounted for within the land residual calculation without threatening scheme deliverability.",
      fallacyWarning:
        "Clean Surface Fallacy: A flat, cleared concrete yard can conceal significant hydrocarbon contamination or underground fuel storage tanks.",
      icon: Layers,
    },
    {
      id: "market",
      name: "Local Market Absorption & Pricing",
      category: "Commercial Economics",
      question: "What is the true transactional value and sales velocity in this specific micro-corridor?",
      investigationMethod:
        "HM Land Registry Price Paid Data (PPD) analysis, newly registered EPC certifications, local agent off-market transaction intelligence, and regional BCIS construction cost indexing.",
      criticalHurdle:
        "Sustainable end-sales values (£/sq ft) that comfortably exceed all-in acquisition, planning, construction, finance, and infrastructure costs with adequate commercial return.",
      fallacyWarning:
        "Portal Asking Price Fallacy: Asking prices on consumer property portals frequently overstate actual contracted completion values by 10–25%.",
      icon: TrendingUp,
    },
    {
      id: "location",
      name: "Settlement Geography & Infrastructure",
      category: "Spatial Context",
      question: "How does the site integrate into transport networks, schools, and utility capacity?",
      investigationMethod:
        "Geospatial network distance analysis to rail stations, A-roads, and secondary schools. Statutory water (Thames, Severn Trent, Anglian) capacity checks and DNO grid connection enquiry logs.",
      criticalHurdle:
        "Sustainable accessibility scores and adequate utility headroom without multi-million-pound off-site reinforcement requirements.",
      fallacyWarning:
        "Proximity Fallacy: A site located 200m from a town centre may be severed by a high-speed railway line with no pedestrian crossing.",
      icon: MapPin,
    },
  ];

  const [selectedId, setSelectedId] = useState(dimensions[0].id);
  const activeDim = dimensions.find((d) => d.id === selectedId) || dimensions[0];
  const ActiveIcon = activeDim.icon;

  return (
    <div className="rounded-sm border border-brand-edge bg-white overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: List of 8 Dimensions */}
        <div className="lg:col-span-5 border-r border-brand-edge bg-brand-surface/40">
          <div className="p-4 sm:p-5 border-b border-brand-edge bg-white">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
              8 Core Due Diligence Dimensions
            </span>
            <p className="text-xs font-light text-brand-silver mt-1">
              Select a dimension to inspect Entire UK&apos;s analytical methodology.
            </p>
          </div>

          <div className="divide-y divide-brand-edge/60">
            {dimensions.map((dim, idx) => {
              const isSelected = selectedId === dim.id;
              const Icon = dim.icon;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setSelectedId(dim.id)}
                  className={`w-full p-4 text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-white text-brand-graphite font-normal border-l-2 border-l-brand-electric"
                      : "text-brand-silver hover:bg-white hover:text-brand-graphite"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-brand-silver/60 w-5">
                      0{idx + 1}
                    </span>
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isSelected ? "text-brand-electric" : "text-brand-silver/70 group-hover:text-brand-electric"
                      }`}
                    />
                    <div>
                      <span className="text-xs font-medium block">{dim.name}</span>
                      <span className="text-[10px] text-brand-silver/70 font-light block">
                        {dim.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-brand-electric translate-x-0.5" : "text-brand-silver/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth Exploration Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-brand-edge pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-silver">
                    {activeDim.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light text-brand-graphite">
                    {activeDim.name}
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono text-brand-silver/50 hidden sm:inline">
                Dimension Ref #{activeDim.id.toUpperCase()}
              </span>
            </div>

            {/* Core Question */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand-electric font-medium">
                The Fundamental Question
              </span>
              <p className="text-base font-light text-brand-graphite leading-relaxed">
                &ldquo;{activeDim.question}&rdquo;
              </p>
            </div>

            {/* Investigation Method */}
            <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand-silver block font-medium">
                How Entire UK Investigates This
              </span>
              <p className="text-xs font-light text-brand-silver leading-relaxed">
                {activeDim.investigationMethod}
              </p>
            </div>

            {/* Critical Hurdle */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 block font-medium">
                Deliverability Hurdle
              </span>
              <p className="text-xs font-light text-brand-graphite leading-relaxed">
                {activeDim.criticalHurdle}
              </p>
            </div>

            {/* Common Industry Fallacy */}
            <div className="p-4 rounded-sm bg-amber-50/60 border border-amber-200/80 space-y-1.5 text-xs">
              <span className="font-mono uppercase tracking-wider text-amber-800 block font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Industry Fallacy We Guard Against</span>
              </span>
              <p className="font-light text-amber-900 leading-relaxed">
                {activeDim.fallacyWarning}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-edge flex items-center justify-between text-xs font-light text-brand-silver">
            <span>Every dimension must reconcile before acquisition commitment.</span>
            <span className="font-mono text-brand-electric font-medium">Verified Evidence Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
