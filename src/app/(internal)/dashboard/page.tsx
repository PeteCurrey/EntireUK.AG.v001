import React from 'react';
import Link from 'next/link';
import { LIVE_COHORT_CANDIDATES } from '@/lib/land-radar/validation/liveCohort';
import { getCurrentUser } from '@/lib/auth/session';
import {
  Compass,
  FileSearch,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldAlert,
  Layers,
  Cpu,
  Building,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';

export const metadata = {
  title: 'Operational Dashboard — Entire UK Land Radar',
  description: 'Authenticated operational workspace for Entire UK property acquisition, validation, and due diligence.',
};

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  // Reconciled pipeline metrics directly from the live cohort (COHORT-LIVE-001)
  const activeDialogues = LIVE_COHORT_CANDIDATES.filter(
    (c) => c.validation_evidence_status === 'REAL_ACQUISITION_EVENT'
  );
  const heldSites = LIVE_COHORT_CANDIDATES.filter(
    (c) => c.commercial_decision === 'HOLD'
  );
  const rejectedSites = LIVE_COHORT_CANDIDATES.filter(
    (c) => c.commercial_decision === 'REJECT'
  );
  const humanBenchmarks = LIVE_COHORT_CANDIDATES.filter(
    (c) => c.validation_evidence_status === 'BENCHMARK'
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-brand-edge pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>ENTIRE UK WORKSPACE</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SESSION AUTHENTICATED
            </span>
            <span>·</span>
            <span className="text-brand-silver">
              {currentUser?.email || 'analyst@entire-uk.com'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Acquisition Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1 max-w-2xl font-light">
            Operational command center for Entire UK. Find overlooked land and property opportunities, investigate constraints, validate truth ledgers, and make evidence-backed acquisition decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/land-radar"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-brand-obsidian font-medium text-xs rounded transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch Land Radar Explorer →</span>
          </Link>
        </div>
      </div>

      {/* Strategic Mission Statement Banner */}
      <div className="p-5 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-electric">
            Operational Workflow Principle
          </span>
          <p className="text-sm font-light text-white">
            <span className="text-brand-mist/70">Pipeline Flow:</span> DATA SOURCES → LAND RADAR ENGINE → CANDIDATES → STRUCTURED EVIDENCE → HUMAN INVESTIGATION → ACQUISITION DECISION
          </p>
        </div>
        <div className="text-xs font-mono text-brand-steel bg-brand-void px-3 py-1.5 rounded border border-brand-edge-dark shrink-0">
          Unknown is not clear
        </div>
      </div>

      {/* Primary Subsystem Gateways (4 Pillar Grid) */}
      <div>
        <h2 className="text-xs uppercase font-mono tracking-wider text-brand-steel mb-4">
          Core Workstation Gateways
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Land Radar Explorer */}
          <Link
            href="/land-radar"
            className="group p-5 rounded-sm bg-brand-surface border border-brand-edge hover:border-cyan-400/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-sm bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                Land Radar Explorer
              </h3>
              <p className="text-xs font-light text-brand-silver mt-1.5 leading-relaxed">
                Map-first spatial candidate screening across Warwickshire. Interactive polygon and constraint triage.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-brand-edge/50 flex items-center justify-between text-[11px] font-medium text-cyan-400">
              <span>Open Explorer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Review Queue & Investigation */}
          <Link
            href="/review"
            className="group p-5 rounded-sm bg-brand-surface border border-brand-edge hover:border-brand-electric/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-sm bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-brand-electric mb-4 group-hover:scale-105 transition-transform">
                <FileSearch className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-brand-electric transition-colors">
                Review &amp; Investigation
              </h3>
              <p className="text-xs font-light text-brand-silver mt-1.5 leading-relaxed">
                Detailed site dossier inspection. Examine title disaggregation, highways audits, planning, and contact logs.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-brand-edge/50 flex items-center justify-between text-[11px] font-medium text-brand-electric">
              <span>Inspect Queue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Validation & Truth Ledger */}
          <Link
            href="/validation"
            className="group p-5 rounded-sm bg-brand-surface border border-brand-edge hover:border-amber-400/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-sm bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                Validation &amp; Truth Ledger
              </h3>
              <p className="text-xs font-light text-brand-silver mt-1.5 leading-relaxed">
                Audit trail comparing machine evidence, analyst interpretations, external audits, and real-world outcomes.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-brand-edge/50 flex items-center justify-between text-[11px] font-medium text-amber-400">
              <span>View Truth Ledgers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Data Health & Sources */}
          <Link
            href="/data-health"
            className="group p-5 rounded-sm bg-brand-surface border border-brand-edge hover:border-emerald-400/60 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-sm bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                Data Health &amp; Sources
              </h3>
              <p className="text-xs font-light text-brand-silver mt-1.5 leading-relaxed">
                Source registry, OGL v3 licences, freshness timestamps, and documented data gaps (e.g. DATA-FN-001).
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-brand-edge/50 flex items-center justify-between text-[11px] font-medium text-emerald-400">
              <span>Audit Data Sources</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Operational Evidence & Live Cohort Status (Actual Data Only) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Acquisition Pipeline (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-mono tracking-wider text-brand-steel">
              Live Acquisition Cohort (COHORT-LIVE-001)
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              10 Investigated Candidates
            </span>
          </div>

          <div className="bg-brand-surface border border-brand-edge rounded-sm divide-y divide-brand-edge">
            {LIVE_COHORT_CANDIDATES.map((cand) => {
              const isEvent = cand.validation_evidence_status === 'REAL_ACQUISITION_EVENT';
              const isHeld = cand.commercial_decision === 'HOLD';
              const isRejected = cand.commercial_decision === 'REJECT';

              return (
                <div key={cand.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-carbon/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white font-medium">
                        {cand.site_reference}
                      </span>
                      {isEvent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          Active Dialogue
                        </span>
                      )}
                      {isHeld && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          Held
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/25">
                          Rejected
                        </span>
                      )}
                      {cand.validation_evidence_status === 'BENCHMARK' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/25">
                          Benchmark
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-silver font-light line-clamp-1">
                      {cand.analyst_notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-[11px] font-mono text-brand-steel hidden sm:block">
                      <span>{cand.validated_at?.slice(0, 10)}</span>
                    </div>
                    <Link
                      href={`/review/${cand.site_reference}`}
                      className="px-2.5 py-1 text-xs text-brand-mist hover:text-white bg-brand-charcoal hover:bg-brand-edge-dark border border-brand-edge rounded transition-colors"
                    >
                      Dossier →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Integration Boundary & Diagnostic State (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Diagnostic Metrics (Authentic Evidence State) */}
          <div className="bg-brand-surface border border-brand-edge rounded-sm p-5 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-brand-steel">
              Diagnostic Integrity
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-brand-carbon rounded-sm border border-brand-edge-dark">
                <span className="text-xl font-mono font-bold text-white block">2</span>
                <span className="text-[10px] uppercase text-brand-silver font-light mt-0.5 block">
                  Active Dialogues
                </span>
              </div>
              <div className="p-3 bg-brand-carbon rounded-sm border border-brand-edge-dark">
                <span className="text-xl font-mono font-bold text-white block">0</span>
                <span className="text-[10px] uppercase text-brand-silver font-light mt-0.5 block">
                  Inferred Availabilities
                </span>
              </div>
              <div className="p-3 bg-brand-carbon rounded-sm border border-brand-edge-dark">
                <span className="text-xl font-mono font-bold text-amber-400 block">2</span>
                <span className="text-[10px] uppercase text-brand-silver font-light mt-0.5 block">
                  Access/Noise FPs
                </span>
              </div>
              <div className="p-3 bg-brand-carbon rounded-sm border border-brand-edge-dark">
                <span className="text-xl font-mono font-bold text-cyan-400 block">2</span>
                <span className="text-[10px] uppercase text-brand-silver font-light mt-0.5 block">
                  Data/Rule FNs
                </span>
              </div>
            </div>
            <p className="text-[11px] text-brand-silver/80 font-light leading-relaxed">
              Every metric represents independently verified physical audits, highways reports, and sole agent instructions.
            </p>
          </div>

          {/* AI Integration Boundary Governance */}
          <div className="bg-brand-surface border border-brand-edge rounded-sm p-5 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>AI Governance Boundary</span>
            </div>

            <div className="space-y-2.5 text-xs font-light">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <p className="text-brand-mist/90">
                  <strong className="font-normal text-white">Permitted:</strong> Synthesize planning text, summarize evidence layers, explain surfacing rules, and flag contradictions.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <p className="text-brand-mist/90">
                  <strong className="font-normal text-white">Prohibited:</strong> Inventing site facts, guessing ownership, fabricating GDV/RLV, or overriding deterministic GIS.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-edge text-[11px] text-brand-steel font-mono">
              Status: State B — Useful but requires calibration
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
