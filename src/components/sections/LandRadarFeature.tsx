"use client";

import React, { useState } from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";
import {
  Radar,
  ShieldAlert,
  FileSearch,
  TrendingUp,
  Map,
  Layers,
  ArrowRight,
  Compass,
  FileCheck2,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface CapabilityDimension {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  text: string;
  evidenceItems: string[];
  layerColor: string;
}

export function LandRadarFeature() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const dimensions: CapabilityDimension[] = [
    {
      id: "geospatial",
      icon: Map,
      title: "Geospatial & Cadastre",
      subtitle: "Boundaries & Topography",
      text: "Cadastral boundaries, INSPIRE index polygons, centroid calculation (EPSG:27700), highway proximity, and topography.",
      evidenceItems: ["INSPIRE Polygons", "OS Open Roads", "Centroid Coordinate"],
      layerColor: "#38bdf8", // cyan
    },
    {
      id: "planning",
      icon: FileSearch,
      title: "Planning Intelligence",
      subtitle: "Allocations & Precedents",
      text: "Statutory decisions, appeal records, Local Plan allocations (e.g. Policy DS11/DS15), and SHLAA submissions.",
      evidenceItems: ["Local Plan Allocations", "Planning History", "Call-for-Sites"],
      layerColor: "#60a5fa", // blue
    },
    {
      id: "constraints",
      icon: ShieldAlert,
      title: "Constraint Layering",
      subtitle: "Environmental Hazard Screening",
      text: "Green Belt, Functional Floodplain (Zone 3b), SSSI buffers, AONB, ancient woodland, and conservation areas.",
      evidenceItems: ["EA Flood Map", "Green Belt OGL v3", "NE Protected Sites"],
      layerColor: "#f59e0b", // amber
    },
    {
      id: "ownership",
      icon: Lock,
      title: "Ownership Intelligence",
      subtitle: "Candidate ≠ Parcel ≠ Title",
      text: "HM Land Registry title registers, corporate ownership (CCOD), title assembly detection, and ransom strip identification.",
      evidenceItems: ["HMLR Freehold Titles", "Multi-Title Assembly", "Ransom Verification"],
      layerColor: "#a855f7", // purple
    },
    {
      id: "market",
      icon: TrendingUp,
      title: "Market Comparable Signals",
      subtitle: "Transactional Micro-Location",
      text: "HMLR Price Paid Data (PPD), transaction velocity, comparable search radiuses, and localized pricing discounts.",
      evidenceItems: ["Price Paid Data", "Transaction Density", "Micro-Corridor Trends"],
      layerColor: "#10b981", // emerald
    },
    {
      id: "acquisition",
      icon: FileCheck2,
      title: "Acquisition Decision Gate",
      subtitle: "Human Due Diligence",
      text: "Candidate Truth Ledgers, formal highways audits, Phase 2 borehole surveys, vendor contact logs, and commercial gate sign-off.",
      evidenceItems: ["5-Layer Truth Ledger", "Highways Audit Sign-Off", "Commercial Decision Gate"],
      layerColor: "#ec4899", // pink
    },
  ];

  return (
    <Section dark={true} id="land-radar" className="relative overflow-hidden">
      {/* Background ambient radar glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-electric/[0.04] blur-[160px] pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="mb-4 flex items-center gap-2">
              <span className="eyebrow eyebrow-dark">Proprietary Infrastructure</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Engine Status: Live In Pilot
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white leading-tight">
              We are building the intelligence layer behind the opportunity search.
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light text-brand-mist/80 leading-relaxed">
              Entire UK uses proprietary Land Radar infrastructure to identify and prioritise potential opportunities across the UK. Experienced human acquisition expertise then investigates and validates them.
            </p>
          </div>
        </ScrollReveal>

        {/* Workflow Chain Visualizer */}
        <ScrollReveal delayMs={100}>
          <div className="mb-12 p-4 sm:p-5 rounded-sm bg-brand-carbon border border-brand-edge-dark flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-white">
                Acquisition Pipeline Architecture
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-brand-silver">
              <span className="text-brand-mist font-medium">DATA SOURCES</span>
              <span className="text-brand-steel">→</span>
              <span className="text-cyan-400 font-medium">LAND RADAR</span>
              <span className="text-brand-steel">→</span>
              <span className="text-brand-mist font-medium">CANDIDATES</span>
              <span className="text-brand-steel">→</span>
              <span className="text-amber-400 font-medium">STRUCTURED EVIDENCE</span>
              <span className="text-brand-steel">→</span>
              <span className="text-emerald-400 font-medium">HUMAN DUE DILIGENCE</span>
              <span className="text-brand-steel">→</span>
              <span className="text-white font-medium">ACQUISITION GATE</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Multi-Layer Visualization & Capabilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Conceptual Multi-Layer Spatial Radar Engine Linework (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-sm bg-brand-carbon border border-brand-edge-dark relative overflow-hidden">
              {/* Header inside radar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-brand-mist/90">
                    Spatial Linework Radar
                  </span>
                </div>
                <span className="text-[10px] font-mono text-brand-steel">
                  EPSG:27700 OSGB36
                </span>
              </div>

              {/* Conceptual Vector Canvas */}
              <div className="relative aspect-square w-full rounded-sm bg-brand-void border border-white/[0.06] overflow-hidden flex items-center justify-center">
                {/* 1. Radar Grid Circles & Axis Lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-[85%] h-[85%] rounded-full border border-white/30" />
                  <div className="w-[60%] h-[60%] rounded-full border border-white/25" />
                  <div className="w-[35%] h-[35%] rounded-full border border-white/20" />
                  <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                </div>

                {/* 2. Rotating Radar Sweep Beam */}
                <div
                  className="absolute inset-0 pointer-events-none animate-radar-sweep"
                  aria-hidden="true"
                >
                  <div
                    className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
                    style={{
                      background:
                        "conic-gradient(from 270deg, transparent 0deg, rgba(37, 99, 235, 0.15) 60deg, rgba(56, 189, 248, 0.45) 90deg)",
                    }}
                  />
                </div>

                {/* 3. Layer SVG Overlays (Responsive to activeLayer hover) */}
                <svg
                  viewBox="0 0 300 300"
                  className="w-full h-full relative z-10 transition-opacity duration-300"
                  aria-hidden="true"
                >
                  {/* Layer 1: Geospatial Cadastral Parcels */}
                  <g
                    className="transition-all duration-300"
                    opacity={!activeLayer || activeLayer === "geospatial" ? 1 : 0.2}
                  >
                    <polygon
                      points="60,80 110,65 140,110 80,130"
                      fill={activeLayer === "geospatial" ? "rgba(56,189,248,0.25)" : "rgba(56,189,248,0.08)"}
                      stroke="#38bdf8"
                      strokeWidth={activeLayer === "geospatial" ? "2" : "1.2"}
                      strokeDasharray="4 2"
                    />
                    <polygon
                      points="150,120 220,105 240,170 170,195 145,150"
                      fill={activeLayer === "geospatial" ? "rgba(56,189,248,0.3)" : "rgba(56,189,248,0.12)"}
                      stroke="#38bdf8"
                      strokeWidth={activeLayer === "geospatial" ? "2.5" : "1.5"}
                    />
                    <circle cx="185" cy="150" r="3" fill="#38bdf8" />
                    <text x="195" y="153" fill="#38bdf8" fontSize="8" fontFamily="monospace">
                      PARCEL-001
                    </text>
                  </g>

                  {/* Layer 2: Planning Allocation Corridor */}
                  <g
                    className="transition-all duration-300"
                    opacity={!activeLayer || activeLayer === "planning" ? 1 : 0.15}
                  >
                    <path
                      d="M 40,240 Q 120,200 260,220"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth={activeLayer === "planning" ? "3" : "1.5"}
                    />
                    <rect
                      x="130"
                      y="190"
                      width="50"
                      height="24"
                      fill={activeLayer === "planning" ? "rgba(96,165,250,0.25)" : "none"}
                      stroke="#60a5fa"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text x="135" y="205" fill="#60a5fa" fontSize="7" fontFamily="monospace">
                      POLICY DS11
                    </text>
                  </g>

                  {/* Layer 3: Constraint Zones (Flood & Green Belt) */}
                  <g
                    className="transition-all duration-300"
                    opacity={!activeLayer || activeLayer === "constraints" ? 1 : 0.15}
                  >
                    <path
                      d="M 20,40 Q 80,90 40,170 L 10,180 Z"
                      fill={activeLayer === "constraints" ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.1)"}
                      stroke="#f59e0b"
                      strokeWidth={activeLayer === "constraints" ? "2" : "1"}
                    />
                    <text x="15" y="110" fill="#f59e0b" fontSize="7" fontFamily="monospace">
                      ZONE 3b (BLOCKER)
                    </text>
                  </g>

                  {/* Layer 4: Ownership & Title Nodes */}
                  <g
                    className="transition-all duration-300"
                    opacity={!activeLayer || activeLayer === "ownership" ? 1 : 0.15}
                  >
                    <circle
                      cx="160"
                      cy="135"
                      r="4"
                      fill="#a855f7"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <line x1="160" y1="135" x2="215" y2="165" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle
                      cx="215"
                      cy="165"
                      r="4"
                      fill="#a855f7"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text x="170" y="130" fill="#a855f7" fontSize="7" fontFamily="monospace">
                      WK29101
                    </text>
                    <text x="220" y="180" fill="#a855f7" fontSize="7" fontFamily="monospace">
                      WK29102 (ASSEMBLY)
                    </text>
                  </g>

                  {/* Layer 5: Market Comparables */}
                  <g
                    className="transition-all duration-300"
                    opacity={!activeLayer || activeLayer === "market" ? 1 : 0.15}
                  >
                    <circle cx="210" cy="80" r="14" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="210" cy="80" r="2.5" fill="#10b981" />
                    <text x="228" y="83" fill="#10b981" fontSize="7" fontFamily="monospace">
                      PPD £310/sqft
                    </text>
                  </g>

                  {/* Layer 6: Acquisition Gate */}
                  <g
                    className="transition-all duration-300"
                    opacity={!activeLayer || activeLayer === "acquisition" ? 1 : 0.15}
                  >
                    <rect
                      x="180"
                      y="140"
                      width="10"
                      height="10"
                      fill="#ec4899"
                    />
                    <text x="195" y="148" fill="#ec4899" fontSize="7" fontFamily="monospace">
                      GATE PASS
                    </text>
                  </g>
                </svg>

                {/* Subtitle / Legal Disclaimer Stamped */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[9px] font-mono text-brand-mist/50 bg-brand-void/90 px-2 py-1 rounded border border-white/[0.04]">
                  <span>Candidate Evidence Layers</span>
                  <span className="text-cyan-400">Deterministic Engine</span>
                </div>
              </div>

              {/* Explanatory Caption */}
              <p className="mt-3 text-[11px] font-mono text-brand-steel text-center">
                * Illustrative system visualisation. Real-world candidate evidence requires human highways &amp; title audit.
              </p>
            </div>

            {/* Quick Link into Technology Page */}
            <div className="p-4 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark flex items-center justify-between">
              <span className="text-xs text-brand-mist font-light">
                Explore the underlying spatial evidence methodology
              </span>
              <Link
                href="/technology"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 shrink-0"
              >
                <span>Read Architecture</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* RIGHT: Interactive Capability Dimensions (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-steel">
                Core Evidence Dimensions
              </span>
              <span className="text-[11px] font-light text-brand-mist/60">
                Hover to illuminate evidence layer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dimensions.map((item) => {
                const Icon = item.icon;
                const isHovered = activeLayer === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveLayer(item.id)}
                    onMouseLeave={() => setActiveLayer(null)}
                    className={`p-5 rounded-sm bg-brand-carbon border transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? "border-cyan-400/80 bg-brand-carbon/90 shadow-lg shadow-cyan-950/20 translate-y-[-2px]"
                        : "border-brand-edge-dark hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-8 h-8 rounded-sm flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: `${item.layerColor}15`,
                          color: item.layerColor,
                          border: `1px solid ${item.layerColor}35`,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-brand-steel">
                        Layer Active
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-white mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-400/80 mb-2">
                      {item.subtitle}
                    </p>
                    <p className="text-xs font-light text-brand-mist/75 leading-relaxed mb-3">
                      {item.text}
                    </p>

                    <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                      {item.evidenceItems.map((ev, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-brand-mist/60 border border-white/5"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Callout Bar */}
            <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-mist/60">
                  Authorised Personnel Access
                </span>
                <p className="text-xs font-light text-brand-mist/80 mt-0.5">
                  Internal workstation with live pilot datasets across Warwick &amp; Rugby.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 rounded-sm bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/20 transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Land Radar Login</span>
                </Link>
                <Button href="/submit" variant="primary" size="sm" showArrow>
                  Submit Site
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
