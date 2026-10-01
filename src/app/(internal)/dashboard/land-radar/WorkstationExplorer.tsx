'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SiteGeoMap, MapSiteItem } from '@/components/internal/SiteGeoMap';
import { formatArea } from '@/lib/land-radar/geometry';

export interface WorkstationCandidate {
  id: string;
  internal_reference: string;
  name: string;
  location: string;
  source: string;
  area_sqm: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNPRIORITISED';
  priorityReasons: string[];
  recommendedNextActions: string[];
  positiveSignals: string[];
  constraints: string[];
  isBrownfield: boolean;
  completenessPct: number;
  assessedCount: number;
  totalChecks: number;
  visualUnknowns: Array<{ category: string; description: string }>;
  geometry: any;
  centroid: any;
  marketStrength?: string;
  medianPrice?: number | null;
  potentiallyDevelopableHa?: number | null;
  developmentPotential?: string;
  // Phase 11: Ownership & Availability indicators
  ownershipComplexity?: 'SINGLE_TITLE' | 'MULTI_TITLE' | 'FRAGMENTED' | 'UNKNOWN';
  availabilityState?: string;
}

interface WorkstationExplorerProps {
  pilotId: string;
  geographyName: string;
  screeningStrategy: string;
  retrievalModes: Record<string, string>;
  initialCandidates: WorkstationCandidate[];
}

export function WorkstationExplorer({
  pilotId,
  geographyName,
  screeningStrategy,
  retrievalModes,
  initialCandidates,
}: WorkstationExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BROWNFIELD' | 'HMLR'>('ALL');
  const [constraintFilter, setConstraintFilter] = useState<'ALL' | 'CLEAN' | 'CONSTRAINED'>('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialCandidates[0]?.id || ''
  );

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return initialCandidates.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = c.internal_reference.toLowerCase().includes(q);
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesLoc = c.location.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesLoc) return false;
      }

      // Priority
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) {
        return false;
      }

      // Type
      if (typeFilter === 'BROWNFIELD' && !c.isBrownfield) return false;
      if (typeFilter === 'HMLR' && c.isBrownfield) return false;

      // Constraint
      if (constraintFilter === 'CLEAN' && c.constraints.length > 0) return false;
      if (constraintFilter === 'CONSTRAINED' && c.constraints.length === 0) return false;

      return true;
    });
  }, [initialCandidates, searchQuery, priorityFilter, typeFilter, constraintFilter]);

  // Selected candidate object
  const selectedCandidate = useMemo(() => {
    return (
      initialCandidates.find((c) => c.id === selectedSiteId) ||
      filteredCandidates[0] ||
      initialCandidates[0]
    );
  }, [initialCandidates, filteredCandidates, selectedSiteId]);

  // Format Map Sites
  const mapSites: MapSiteItem[] = useMemo(() => {
    return filteredCandidates.map((c) => ({
      id: c.id,
      internal_reference: c.internal_reference,
      name: c.name,
      geometry: c.geometry,
      centroid: c.centroid,
      priority: c.priority,
      isBrownfield: c.isBrownfield,
    }));
  }, [filteredCandidates]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = initialCandidates.length;
    const high = initialCandidates.filter((c) => c.priority === 'HIGH').length;
    const medium = initialCandidates.filter((c) => c.priority === 'MEDIUM').length;
    const clean = initialCandidates.filter((c) => c.constraints.length === 0).length;
    return { total, high, medium, clean };
  }, [initialCandidates]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Pilot Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-brand-edge pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-semibold">
              ACQUISITION WORKSTATION
            </span>
            <span>·</span>
            <span>PILOT: {pilotId} ({geographyName})</span>
            <span>·</span>
            <span>STRATEGY: {screeningStrategy}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Land Radar Candidate Explorer
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Spatial vector inspection, multi-criteria prioritisation & explainable candidate intelligence.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-brand-surface border border-brand-edge px-3.5 py-1.5 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-brand-steel block">Surfaced</span>
            <span className="text-base font-bold text-white font-mono">{stats.total} Sites</span>
          </div>
          <div className="bg-brand-surface border border-emerald-500/30 px-3.5 py-1.5 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-emerald-400 block">High Priority</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{stats.high}</span>
          </div>
          <div className="bg-brand-surface border border-cyan-500/30 px-3.5 py-1.5 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block">Medium Priority</span>
            <span className="text-base font-bold text-cyan-400 font-mono">{stats.medium}</span>
          </div>
          <div className="bg-brand-surface border border-brand-edge px-3.5 py-1.5 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-brand-steel block">Unconstrained</span>
            <span className="text-base font-bold text-brand-silver font-mono">{stats.clean}</span>
          </div>
        </div>
      </div>

      {/* Epistemic Unknowns Awareness Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3.5 flex items-start space-x-3 text-xs text-amber-200">
        <span className="font-mono text-amber-400 font-bold mt-0.5 text-sm">⚠</span>
        <div className="space-y-0.5">
          <div className="font-semibold text-amber-300">
            ACTIVE EPISTEMIC UNKNOWNS: Local Plan Green Belt & Detailed Planning History
          </div>
          <p className="text-amber-200/80 leading-relaxed text-[11px]">
            In accordance with Land Radar epistemic integrity, absence of record is NEVER treated as absence of constraint. Green Belt datasets are deferred in this pilot and marked as <code className="bg-amber-950/60 px-1 py-0.5 rounded font-mono text-amber-300">unknown</code>. Analysts must verify Green Belt policy on the LPA map before progressing candidates to acquisition.
          </p>
        </div>
      </div>

      {/* Multi-Faceted Filter & Search Toolbar */}
      <div className="bg-brand-surface border border-brand-edge p-4 rounded-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div>
            <label className="block text-[10px] font-mono text-brand-steel uppercase mb-1">
              Search Candidates
            </label>
            <input
              type="text"
              placeholder="Search reference, name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-3 py-2 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-mono text-brand-steel uppercase mb-1">
              Explainable Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-3 py-2 focus:border-cyan-400 outline-none"
            >
              <option value="ALL">All Priorities ({initialCandidates.length})</option>
              <option value="HIGH">High Priority Only</option>
              <option value="MEDIUM">Medium Priority Only</option>
              <option value="LOW">Low Priority Only</option>
            </select>
          </div>

          {/* Candidate Source Type */}
          <div>
            <label className="block text-[10px] font-mono text-brand-steel uppercase mb-1">
              Candidate Origin
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-3 py-2 focus:border-cyan-400 outline-none"
            >
              <option value="ALL">All Origins</option>
              <option value="BROWNFIELD">DLUHC Brownfield Register</option>
              <option value="HMLR">HMLR Registered Title Parcels</option>
            </select>
          </div>

          {/* Constraint Status */}
          <div>
            <label className="block text-[10px] font-mono text-brand-steel uppercase mb-1">
              Physical Constraints
            </label>
            <select
              value={constraintFilter}
              onChange={(e) => setConstraintFilter(e.target.value as any)}
              className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-3 py-2 focus:border-cyan-400 outline-none"
            >
              <option value="ALL">All Sites</option>
              <option value="CLEAN">Clean (Zero Flood / SSSI Overlap)</option>
              <option value="CONSTRAINED">With Soft Constraints (Flood / SSSI)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-brand-edge/60 text-[11px] font-mono text-brand-steel">
          <div>
            Showing <span className="text-cyan-400 font-semibold">{filteredCandidates.length}</span> of {initialCandidates.length} candidate sites
          </div>
          {(searchQuery || priorityFilter !== 'ALL' || typeFilter !== 'ALL' || constraintFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('ALL');
                setTypeFilter('ALL');
                setConstraintFilter('ALL');
              }}
              className="text-xs text-brand-silver hover:text-cyan-400 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Candidate List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredCandidates.length === 0 ? (
            <div className="bg-brand-surface border border-brand-edge rounded-sm p-8 text-center text-xs text-brand-steel">
              No candidate sites match the selected filters.
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedSiteId(cand.id)}
                  className={`p-4 rounded-sm border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-charcoal border-cyan-400 shadow-md shadow-cyan-950/30'
                      : 'bg-brand-surface border-brand-edge hover:border-brand-steel/50 hover:bg-brand-charcoal/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-cyan-400 font-semibold">
                          {cand.internal_reference}
                        </span>
                        {cand.isBrownfield ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Brownfield
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            HMLR Title
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-1 line-clamp-1">
                        {cand.name}
                      </h3>
                      <p className="text-[11px] text-brand-silver line-clamp-1">
                        {cand.location}
                      </p>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        cand.priority === 'HIGH'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : cand.priority === 'MEDIUM'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {cand.priority}
                    </span>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-edge/60 text-[11px] font-mono text-brand-silver">
                    <div>
                      <span className="text-brand-steel block text-[9px] uppercase">Calculated Area</span>
                      <span>{formatArea(cand.area_sqm)}</span>
                    </div>
                    <div>
                      <span className="text-brand-steel block text-[9px] uppercase">Evidence Checks</span>
                      <span className="text-cyan-300">{cand.completenessPct}% ({cand.assessedCount}/{cand.totalChecks})</span>
                    </div>
                  </div>

                  {/* Priority Reasons snippet */}
                  <div className="mt-2.5 pt-2 border-t border-brand-edge/40 text-[11px] text-brand-silver">
                    <div className="text-brand-steel text-[10px] font-mono uppercase mb-1">
                      Why Surfaced:
                    </div>
                    <p className="line-clamp-2 text-slate-300">
                      {cand.priorityReasons[0] || cand.positiveSignals[0]}
                    </p>
                  </div>

                  {/* Constraint & Actions preview */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {cand.constraints.length > 0 ? (
                        <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {cand.constraints.length} Constraint
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          0 Constraints
                        </span>
                      )}
                      {cand.marketStrength && (
                        <span className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          {cand.marketStrength === 'STRONG_MARKET_EVIDENCE' ? 'Strong Mkt' : 'Mkt Data'}
                        </span>
                      )}
                      {cand.potentiallyDevelopableHa !== undefined && cand.potentiallyDevelopableHa !== null && (
                        <span className="text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                          ~{cand.potentiallyDevelopableHa} ha dev
                        </span>
                      )}
                      {/* Phase 11: Ownership & Availability concise indicators */}
                      <span className="text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {cand.ownershipComplexity === 'SINGLE_TITLE'
                          ? 'Single Title'
                          : cand.ownershipComplexity === 'MULTI_TITLE'
                          ? 'Multi-Title'
                          : cand.ownershipComplexity === 'FRAGMENTED'
                          ? 'Fragmented'
                          : 'Title: Unknown'}
                      </span>
                      <span className="text-brand-steel bg-brand-charcoal px-1.5 py-0.5 rounded border border-brand-edge">
                        {cand.availabilityState ? `Avail: ${cand.availabilityState}` : 'Avail: Unknown'}
                      </span>
                    </div>

                    <Link
                      href={`/review/${cand.internal_reference}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1 font-semibold"
                    >
                      <span>Inspect →</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Interactive Vector Map & Selected Site Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <SiteGeoMap
            sites={mapSites}
            selectedSiteId={selectedCandidate?.id}
            onSelectSite={(id) => setSelectedSiteId(id)}
            floodOverlap={selectedCandidate?.constraints.some((c) => c.toLowerCase().includes('flood'))}
            sssiOverlap={selectedCandidate?.constraints.some((c) => c.toLowerCase().includes('sssi'))}
            className="w-full"
          />

          {/* Selected Candidate Quick Dossier */}
          {selectedCandidate && (
            <div className="bg-brand-surface border border-brand-edge rounded-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-edge pb-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-cyan-400 font-bold">{selectedCandidate.internal_reference}</span>
                    <span className="text-brand-steel">·</span>
                    <span className="text-brand-silver">{selectedCandidate.source}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-xs text-brand-silver">{selectedCandidate.location}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                      selectedCandidate.priority === 'HIGH'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : selectedCandidate.priority === 'MEDIUM'
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    Priority: {selectedCandidate.priority}
                  </span>
                  <Link
                    href={`/review/${selectedCandidate.internal_reference}`}
                    className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-brand-obsidian font-semibold text-xs rounded transition-colors"
                  >
                    Open Intelligence File →
                  </Link>
                </div>
              </div>

              {/* Rationale & Recommended Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-brand-charcoal/50 p-3.5 rounded border border-brand-edge">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
                    Explainable Deterministic Rationale:
                  </span>
                  <ul className="space-y-1.5 text-brand-silver">
                    {selectedCandidate.priorityReasons.map((r, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-cyan-400 font-mono mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 bg-brand-charcoal/50 p-3.5 rounded border border-brand-edge">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
                    Recommended Investigation Next Actions:
                  </span>
                  <ul className="space-y-1.5 text-brand-silver">
                    {selectedCandidate.recommendedNextActions.map((a, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-mono mt-0.5">→</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
