"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  HelpCircle,
  Building2,
  Trees,
  Layers,
  Factory,
} from "lucide-react";

type TypologyOption = "greenfield" | "brownfield" | "commercial" | "strategic";
type ScaleOption = "sub_1" | "1_to_5" | "5_to_20" | "20_plus";
type AccessOption = "adopted" | "private" | "landlocked" | "unknown";
type SettlementOption = "adjoining" | "near" | "isolated";
type ConstraintOption = "none" | "greenbelt" | "flood_2_3a" | "flood_3b" | "sssi";

export function CriteriaFilterWidget() {
  const [typology, setTypology] = useState<TypologyOption>("greenfield");
  const [scale, setScale] = useState<ScaleOption>("1_to_5");
  const [access, setAccess] = useState<AccessOption>("adopted");
  const [settlement, setSettlement] = useState<SettlementOption>("adjoining");
  const [constraint, setConstraint] = useState<ConstraintOption>("none");

  // Deterministic evaluation logic reflecting Entire UK strict standards
  const evaluateSite = () => {
    // 1. Fatal Blocker checks
    if (constraint === "flood_3b") {
      return {
        status: "fatal",
        title: "Ineligible — Flood Zone 3b Functional Floodplain",
        description:
          "National Planning Policy Framework (NPPF) prohibits residential and vulnerable commercial development in Flood Zone 3b. Entire UK does not acquire or promote land within functional flood storage areas.",
        actionLabel: "View Rejection Standards",
        actionHref: "#fatal-constraints",
        badge: "Fatal Planning Blocker",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      };
    }

    if (constraint === "sssi") {
      return {
        status: "fatal",
        title: "Ineligible — Statutory Environmental Designation",
        description:
          "We operate strict environmental non-degradation standards. Sites containing SSSI, SAC, SPA, RAMSAR or Ancient Woodland are excluded from our acquisition mandate.",
        actionLabel: "View Rejection Standards",
        actionHref: "#fatal-constraints",
        badge: "Ecological Exclusion",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      };
    }

    if (access === "landlocked") {
      return {
        status: "warning",
        title: "High Complexity — Ransom Strip or Access Defect",
        description:
          "A parcel without direct highway access or enforceable easement requires title assembly or third-party ransom negotiation. We evaluate these only where commercial terms reflect the access risk.",
        actionLabel: "Submit for Title & Access Review",
        actionHref: "/submit/opportunity?type=ransom_assembly",
        badge: "Title Assembly Required",
        color: "text-amber-300 border-amber-500/25 bg-amber-500/5",
      };
    }

    if (settlement === "isolated" && typology !== "brownfield") {
      return {
        status: "warning",
        title: "Low Sustainability — Isolated Rural Greenfield",
        description:
          "Isolated countryside parcels unattached to existing settlements face severe planning barriers under UK sustainable transport and settlement hierarchy policies unless designated for specific rural housing exceptions.",
        actionLabel: "Discuss Strategic Feasibility",
        actionHref: "/contact",
        badge: "Policy Obstacle",
        color: "text-brand-silver border-white/15 bg-white/5",
      };
    }

    // 2. High Match Pathways
    if (
      (typology === "brownfield" || typology === "commercial") &&
      (scale === "1_to_5" || scale === "sub_1" || scale === "5_to_20")
    ) {
      return {
        status: "success",
        title: "Prime Candidate — Brownfield or Commercial Repurposing",
        description:
          "Strong fit for immediate appraisal. We target previously developed land and underutilised commercial assets with potential for Class MA conversion, residential redevelopment, or mixed-use consent.",
        actionLabel: "Submit Property for Unconditional or Option Review",
        actionHref: "/submit/property",
        badge: "Priority Typology",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      };
    }

    if (typology === "strategic" || scale === "20_plus" || constraint === "greenbelt") {
      return {
        status: "success",
        title: "Strategic Land Promotion Candidate",
        description:
          "Ideal fit for an Entire UK Planning Promotion Agreement. We fully fund 100% of the planning, environmental, transport and legal costs through the Local Plan allocation process, sharing gross value upon delivery.",
        actionLabel: "Submit for Strategic Promotion Appraisal",
        actionHref: "/submit/land?structure=promotion",
        badge: "Strategic Promotion Match",
        color: "text-brand-electric border-brand-electric/30 bg-brand-electric/10",
      };
    }

    // Default Viable Edge-of-Settlement Land
    return {
      status: "success",
      title: "Strong Match — Edge-of-Settlement Development Land",
      description:
        "Directly adjoining settlement boundaries with adopted highways access. This represents our core target profile for immediate acquisition or structured promotion agreements.",
      actionLabel: "Submit Land for Acquisition Assessment",
      actionHref: "/submit/land",
      badge: "Target Acquisition Criteria",
      color: "text-brand-electric border-brand-electric/30 bg-brand-electric/10",
    };
  };

  const result = evaluateSite();

  return (
    <div className="rounded-sm border border-brand-edge-dark bg-brand-carbon/90 p-6 sm:p-8 backdrop-blur-sm">
      <div className="border-b border-white/[0.08] pb-6 mb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-brand-electric block mb-2">
          Interactive Self-Assessment
        </span>
        <h3 className="text-xl sm:text-2xl font-light text-white">
          Preliminary Criteria Compatibility Checker
        </h3>
        <p className="text-xs sm:text-sm font-light text-brand-mist/80 mt-1 max-w-2xl">
          Test whether your land or property opportunity aligns with Entire UK&apos;s commercial parameters
          and UK planning policy realities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Left column: Selectors */}
        <div className="space-y-5">
          {/* Typology */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-brand-mist/70 block mb-2">
              1. Asset Typology
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "greenfield", label: "Edge-of-Settlement Land", icon: Trees },
                { id: "brownfield", label: "Brownfield / Industrial", icon: Factory },
                { id: "commercial", label: "Commercial / Built Asset", icon: Building2 },
                { id: "strategic", label: "Strategic Land (5+ Acres)", icon: Layers },
              ].map((item) => {
                const Icon = item.icon;
                const active = typology === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTypology(item.id as TypologyOption)}
                    className={`flex items-center gap-2 p-2.5 rounded-sm border text-left transition-colors ${
                      active
                        ? "border-brand-electric bg-brand-electric/10 text-white font-medium"
                        : "border-white/10 bg-brand-void/50 text-brand-mist/80 hover:border-white/25"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-electric flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-brand-mist/70 block mb-2">
              2. Approximate Size
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: "sub_1", label: "< 1 Acre" },
                { id: "1_to_5", label: "1 – 5 Acres" },
                { id: "5_to_20", label: "5 – 20 Acres" },
                { id: "20_plus", label: "20+ Acres" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScale(item.id as ScaleOption)}
                  className={`p-2 rounded-sm border text-center transition-colors ${
                    scale === item.id
                      ? "border-brand-electric bg-brand-electric/10 text-white font-medium"
                      : "border-white/10 bg-brand-void/50 text-brand-mist/80 hover:border-white/25"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Access */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-brand-mist/70 block mb-2">
              3. Highway Access &amp; Frontage
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "adopted", label: "Adopted Public Highway Frontage" },
                { id: "private", label: "Enforceable Private Easement" },
                { id: "landlocked", label: "No Direct Access / Potential Ransom" },
                { id: "unknown", label: "Access Status Unconfirmed" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAccess(item.id as AccessOption)}
                  className={`p-2.5 rounded-sm border text-left transition-colors ${
                    access === item.id
                      ? "border-brand-electric bg-brand-electric/10 text-white font-medium"
                      : "border-white/10 bg-brand-void/50 text-brand-mist/80 hover:border-white/25"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settlement Context & Environmental */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-brand-mist/70 block mb-2">
                4. Settlement Relation
              </label>
              <select
                aria-label="Settlement Relation"
                value={settlement}
                onChange={(e) => setSettlement(e.target.value as SettlementOption)}
                className="w-full bg-brand-void/80 border border-white/10 text-xs text-white p-2.5 rounded-sm focus:border-brand-electric focus:outline-none"
              >
                <option value="adjoining">Directly adjoins settlement</option>
                <option value="near">Within 500m of settlement</option>
                <option value="isolated">Isolated rural location (&gt; 1km)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-brand-mist/70 block mb-2">
                5. Known Constraint
              </label>
              <select
                aria-label="Known Constraint"
                value={constraint}
                onChange={(e) => setConstraint(e.target.value as ConstraintOption)}
                className="w-full bg-brand-void/80 border border-white/10 text-xs text-white p-2.5 rounded-sm focus:border-brand-electric focus:outline-none"
              >
                <option value="none">No statutory constraints known</option>
                <option value="greenbelt">Green Belt or AONB</option>
                <option value="flood_2_3a">Flood Zone 2 or 3a</option>
                <option value="flood_3b">Flood Zone 3b (Functional Floodplain)</option>
                <option value="sssi">SSSI / Ancient Woodland</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right column: Immediate Appraisal Result */}
        <div className="flex flex-col justify-between p-5 sm:p-6 rounded-sm bg-brand-void/80 border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-sm border ${result.color}`}>
                {result.badge}
              </span>
              {result.status === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              {result.status === "warning" && (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              {result.status === "fatal" && (
                <XCircle className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <h4 className="text-lg sm:text-xl font-normal text-white">
              {result.title}
            </h4>

            <p className="text-xs sm:text-sm font-light text-brand-mist/85 leading-relaxed">
              {result.description}
            </p>

            <div className="pt-2 border-t border-white/[0.08] space-y-2 text-xs font-light text-brand-mist/70">
              <p>
                <strong className="text-white font-medium">Selected Parameters:</strong>{" "}
                {typology.toUpperCase()} · {scale.replace("_", " ")} · {access.replace("_", " ")}
              </p>
              <p className="text-[11px] text-brand-mist/50">
                Note: Initial compatibility indicators do not constitute a formal acquisition offer or contract. Every site undergoes authoritative cadastral, planning and highways title scrutiny.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href={result.actionHref}
              className={`w-full py-3 px-4 rounded-sm flex items-center justify-between text-xs sm:text-sm font-medium tracking-wide transition-all ${
                result.status === "fatal"
                  ? "bg-white/10 text-white hover:bg-white/15 border border-white/20"
                  : "bg-brand-electric text-white hover:bg-brand-electric/90 shadow-md shadow-brand-electric/20"
              }`}
            >
              <span>{result.actionLabel}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
