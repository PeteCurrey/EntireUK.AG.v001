"use client";

import React, { useState } from "react";
import {
  Layers,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  Maximize2,
} from "lucide-react";

export function LandRadarVisualizer() {
  const [activeLayers, setActiveLayers] = useState({
    cadastral: true,
    highways: true,
    environmental: true,
    planning: true,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const allOn =
    activeLayers.cadastral &&
    activeLayers.highways &&
    activeLayers.environmental &&
    activeLayers.planning;

  return (
    <div className="rounded-sm border border-brand-edge-dark bg-brand-carbon p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 block mb-1">
            Interactive GIS Layer Demonstration
          </span>
          <h3 className="text-xl sm:text-2xl font-light text-white">
            Multi-Layer Cadastral Reconciliation
          </h3>
          <p className="text-xs sm:text-sm font-light text-brand-mist/80 mt-1 max-w-xl">
            See how Land Radar layers authoritative statutory data to isolate genuine development opportunities from unviable acreage.
          </p>
        </div>

        {/* Layer toggle buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLayer("cadastral")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeLayers.cadastral
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "bg-white/5 text-brand-mist/60 border border-white/10 hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayers.cadastral ? "bg-blue-400" : "bg-white/30"}`} />
            Cadastral Title
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("highways")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeLayers.highways
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-white/5 text-brand-mist/60 border border-white/10 hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayers.highways ? "bg-amber-400" : "bg-white/30"}`} />
            Adopted Highway
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("environmental")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeLayers.environmental
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-white/5 text-brand-mist/60 border border-white/10 hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayers.environmental ? "bg-emerald-400" : "bg-white/30"}`} />
            Flood &amp; Ecology
          </button>

          <button
            type="button"
            onClick={() => toggleLayer("planning")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeLayers.planning
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-white/5 text-brand-mist/60 border border-white/10 hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeLayers.planning ? "bg-purple-400" : "bg-white/30"}`} />
            Settlement Boundary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Map / Cadastral Graphic Representation */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-sm bg-brand-void border border-white/10 overflow-hidden flex items-center justify-center p-4">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 600 400"
            className="w-full h-full relative z-10 select-none"
            aria-label="Cadastral Map Visualization"
          >
            {/* Base settlement background polygon */}
            <path
              d="M 20 20 L 220 30 L 250 160 L 160 220 L 30 200 Z"
              fill="#1e293b"
              fillOpacity="0.4"
              stroke="#334155"
              strokeWidth="1"
            />
            <text x="50" y="80" fill="#64748b" fontSize="12" fontFamily="monospace">
              Established Settlement (Urban Core)
            </text>

            {/* Layer 4: Planning / Settlement Boundary */}
            {activeLayers.planning && (
              <g>
                <path
                  d="M 15 15 L 230 25 L 265 165 L 170 235 L 25 210 Z"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <text x="60" y="240" fill="#c084fc" fontSize="11" fontFamily="monospace">
                  -- Local Plan Settlement Boundary
                </text>
              </g>
            )}

            {/* Layer 3: Environmental / Flood Zone Constraint */}
            {activeLayers.environmental && (
              <g>
                <path
                  d="M 380 200 C 440 220, 520 260, 580 340 L 590 390 L 320 390 C 340 320, 350 250, 380 200 Z"
                  fill="#059669"
                  fillOpacity="0.25"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                <text x="400" y="320" fill="#34d399" fontSize="11" fontFamily="monospace">
                  Flood Zone 3b (Excluded)
                </text>
              </g>
            )}

            {/* Layer 2: Adopted Highway Network */}
            {activeLayers.highways && (
              <g>
                {/* Main highway */}
                <path
                  d="M 20 180 L 260 170 L 450 190 L 580 210"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Secondary adopted access road */}
                <path
                  d="M 260 170 L 320 80 L 480 70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="320" y="60" fill="#fbbf24" fontSize="10" fontFamily="monospace">
                  Adopted B-Road (DMRB Frontage)
                </text>
              </g>
            )}

            {/* Layer 1: Cadastral Title Boundary (Target Site) */}
            {activeLayers.cadastral && (
              <g>
                {/* Candidate Opportunity Parcel */}
                <polygon
                  points="270,95 440,85 430,175 280,165"
                  fill="#2563eb"
                  fillOpacity="0.35"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                <circle cx="355" cy="130" r="4" fill="#60a5fa" />
                <text x="300" y="125" fill="#ffffff" fontSize="12" fontWeight="500" fontFamily="monospace">
                  TARGET PARCEL: 4.8 Ha
                </text>
                <text x="300" y="142" fill="#93c5fd" fontSize="10" fontFamily="monospace">
                  Direct Frontage: 140m
                </text>

                {/* Adjoining rejected parcel */}
                <polygon
                  points="445,90 540,80 520,180 435,175"
                  fill="#ef4444"
                  fillOpacity="0.15"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x="450" y="130" fill="#f87171" fontSize="10" fontFamily="monospace">
                  Landlocked (No Access)
                </text>
              </g>
            )}

            {/* Waterway buffer */}
            <path
              d="M 520 0 Q 480 180 420 400"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeDasharray="2 3"
              opacity="0.6"
            />
          </svg>

          {/* Coordinate overlay badge */}
          <div className="absolute bottom-3 left-3 bg-brand-void/90 border border-white/10 px-2.5 py-1 rounded-sm text-[10px] font-mono text-brand-silver">
            OS National Grid EPSG:27700 · Authoritative Boundary Match
          </div>
        </div>

        {/* Right: Synthesis & Epistemic Audit Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-sm bg-brand-void border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-[11px] font-mono uppercase text-brand-mist/60">
                Cadastral Signal Synthesis
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-sm border border-cyan-500/20">
                {allOn ? "Reconciliation Complete" : "Partial Layer View"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-light">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-white">
                  <strong className="font-medium text-blue-300">Title Boundary:</strong> 4.8 Hectares
                  verified against HM Land Registry index polygons.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-white">
                  <strong className="font-medium text-amber-300">Highway Frontage:</strong> 140m contiguous
                  frontage to adopted highway with verified visibility splays.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-white">
                  <strong className="font-medium text-emerald-300">Ecology / Flood:</strong> Outside
                  Flood Zone 3b. Flood Zone 1 (Low Risk). Zero SSSI or Ancient Woodland conflict.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-white">
                  <strong className="font-medium text-purple-300">Settlement Adjacency:</strong> Immediately
                  abuts established settlement edge in an LPA with a 3.4-year housing land supply shortfall.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-brand-mist/60">
              <span>Deterministic Screening: PASSED</span>
              <span className="text-white">Next: Director Ground Inspection</span>
            </div>
          </div>

          <p className="text-xs font-light text-brand-mist/70 leading-relaxed">
            Unlike commercial portals that generate speculative AI scores, Land Radar isolates verified physical facts. Every spatial relationship is derived from statutory source geometry and recorded in an immutable Truth Ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
