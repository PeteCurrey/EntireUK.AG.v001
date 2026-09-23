"use client";

import React, { useState } from "react";
import { Database, Cpu, UserCheck, FileSearch, ShieldCheck, ArrowRight } from "lucide-react";

interface EpistemicLayer {
  layerNum: number;
  id: string;
  name: string;
  typeLabel: string;
  description: string;
  truthPrinciple: string;
  examples: string[];
  icon: React.ElementType;
}

export function EpistemicDiagram() {
  const layers: EpistemicLayer[] = [
    {
      layerNum: 1,
      id: "source_fact",
      name: "Source Fact",
      typeLabel: "Raw Sourced Data (Immutable)",
      description:
        "Direct observation or record retrieved unmodified from an authoritative statutory origin. Represents the exact state of statutory records at the timestamp of ingestion.",
      truthPrinciple:
        "A source fact is never altered or synthesized. If Ordnance Survey Open Roads returns a 45m distance, that 45m measurement is logged permanently, even if a highway audit later refines vehicular access.",
      examples: [
        "OS MasterMap geometric polygon (EPSG:27700)",
        "HMLR Title Register official copy (Title No. WK29101)",
        "Environment Agency Flood Map for Planning Shapefile",
      ],
      icon: Database,
    },
    {
      layerNum: 2,
      id: "derived_evidence",
      name: "Derived Evidence",
      typeLabel: "Deterministic Computational Output",
      description:
        "Output produced by running transparent, auditable rules over source facts. Never produces financial fictions, speculative valuations, or arbitrary numerical scores.",
      truthPrinciple:
        "Deterministic-First: The same source facts combined with the same rule version will always yield the exact same derived result. Absence of data is recorded as 'unknown', never 'clear'.",
      examples: [
        "Cadastral centroid calculation via PostGIS ST_Centroid",
        "Spatial overlap percentage between site polygon and Green Belt boundary",
        "Title-to-candidate parcel relationship classification (FRAGMENTED / MULTI_TITLE)",
      ],
      icon: Cpu,
    },
    {
      layerNum: 3,
      id: "analyst_interpretation",
      name: "Analyst Interpretation",
      typeLabel: "Human Professional Judgment",
      description:
        "Attributable professional assessment recorded by an experienced property analyst. Bridges computational screening and physical site reality.",
      truthPrinciple:
        "Attributability Mandate: Every interpretation requires an authenticated analyst ID, an explicit rationale, and a timestamp. An algorithm never makes a commercial acquisition decision.",
      examples: [
        "Classification of title tenure as 'likely single freehold with potential ransom margin'",
        "Planning officer pre-application sentiment summary",
        "Site walkover notes confirming physical access gate locations",
      ],
      icon: UserCheck,
    },
    {
      layerNum: 4,
      id: "external_evidence",
      name: "External Evidence",
      typeLabel: "Third-Party Documentary Evidence",
      description:
        "Independent technical surveys, conveyancing deeds, local authority records, or communications received from vendors, agents, or statutory bodies.",
      truthPrinciple:
        "Contradiction Preservation: If external evidence contradicts a derived computational signal, both are preserved independently in the Truth Ledger to trigger a formal resolution workflow.",
      examples: [
        "Warwickshire County Council Section 38 Highways Adoption Certificate",
        "Phase 2 Environmental intrusive borehole lab soil analysis",
        "Formal written letter from vendor's instructed commercial disposal agent",
      ],
      icon: FileSearch,
    },
    {
      layerNum: 5,
      id: "real_world_outcome",
      name: "Real-World Outcome",
      typeLabel: "Commercial & Statutory Ground Truth",
      description:
        "The verified real-world event that resolves all prior hypotheses: contractual exchange, planning committee determination, or commercial disposal.",
      truthPrinciple:
        "Ground Truth Calibration: Operational outcomes continuously benchmark the precision of our screening models without permitting vanity accuracy claims.",
      examples: [
        "Unconditional contract exchanged and registered at HM Land Registry",
        "Planning permission granted under decision notice W/26/0411",
        "Site placed on formal hold following discovery of subterranean contamination",
      ],
      icon: ShieldCheck,
    },
  ];

  const [activeLayerIdx, setActiveLayerIdx] = useState(0);
  const activeLayer = layers[activeLayerIdx];
  const ActiveIcon = activeLayer.icon;

  return (
    <div className="rounded-sm border border-brand-edge bg-brand-surface p-6 sm:p-10 lg:p-12">
      <div className="max-w-3xl mb-8 space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
          Epistemic Truth Standard
        </span>
        <h3 className="text-2xl sm:text-3xl font-extralight text-brand-graphite tracking-tight">
          How Entire UK Distinguishes Fact from Assumption
        </h3>
        <p className="text-sm font-light text-brand-silver leading-relaxed">
          The property industry frequently confuses algorithms with reality. At Entire UK, every piece of intelligence sits within a strict 5-layer epistemic hierarchy.
        </p>
      </div>

      {/* Interactive Layer Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 5 Layer Steps */}
        <div className="lg:col-span-5 space-y-2.5">
          {layers.map((layer, idx) => {
            const isSelected = activeLayerIdx === idx;
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayerIdx(idx)}
                className={`w-full p-4 rounded-sm border text-left transition-all flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? "bg-white border-brand-electric shadow-sm text-brand-graphite"
                    : "bg-white/60 border-brand-edge hover:bg-white text-brand-silver hover:text-brand-graphite"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-sm flex items-center justify-center font-mono text-xs font-medium ${
                      isSelected
                        ? "bg-brand-electric text-white"
                        : "bg-brand-surface border border-brand-edge text-brand-silver"
                    }`}
                  >
                    L{layer.layerNum}
                  </div>
                  <div>
                    <span className="text-sm font-medium block">{layer.name}</span>
                    <span className="text-[11px] font-light text-brand-silver/80 block">
                      {layer.typeLabel}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? "text-brand-electric translate-x-1" : "text-brand-silver/40"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Layer Detail View */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-sm bg-white border border-brand-edge space-y-6">
          <div className="flex items-center justify-between border-b border-brand-edge pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-silver">
                  Layer {activeLayer.layerNum} · {activeLayer.typeLabel}
                </span>
                <h4 className="text-xl font-light text-brand-graphite">
                  {activeLayer.name}
                </h4>
              </div>
            </div>
            <span className="text-xs font-mono text-brand-electric font-medium">
              Attributable &amp; Auditable
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-silver block font-medium">
              Layer Function
            </span>
            <p className="text-xs sm:text-sm font-light text-brand-graphite leading-relaxed">
              {activeLayer.description}
            </p>
          </div>

          <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-electric block font-medium">
              Non-Negotiable Epistemic Rule
            </span>
            <p className="text-xs font-light text-brand-graphite leading-relaxed">
              {activeLayer.truthPrinciple}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-silver block font-medium">
              Representative Data Points
            </span>
            <ul className="space-y-1.5 text-xs font-light text-brand-silver">
              {activeLayer.examples.map((ex, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-electric shrink-0" />
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
