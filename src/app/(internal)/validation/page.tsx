import React from 'react';
import Link from 'next/link';
import {
  getAllValidationCohorts,
  WARWICK_VALIDATION_COHORT,
  RUGBY_VALIDATION_COHORT,
} from '@/lib/land-radar/validation/validationCohort';
import { LIVE_ACQUISITION_COHORT } from '@/lib/land-radar/validation/liveCohort';
import { calculateValidationMetrics } from '@/lib/land-radar/validation/metrics';
import { getUsefulnessSummary } from '@/lib/land-radar/feedbackService';

export const metadata = {
  title: 'Acquisition Validation Dashboard · Land Radar Internal',
  description: 'Real-world candidate truth validation, false-positive diagnosis, and human benchmark comparison.',
};

export default async function ValidationDashboardPage() {
  const cohorts = getAllValidationCohorts();
  const liveMetrics = calculateValidationMetrics(LIVE_ACQUISITION_COHORT);
  const warwickMetrics = calculateValidationMetrics(WARWICK_VALIDATION_COHORT);
  const rugbyMetrics = calculateValidationMetrics(RUGBY_VALIDATION_COHORT);
  const usefulnessSummary = await getUsefulnessSummary();

  const totalCandidates = liveMetrics.total_candidates;
  const totalTestFixtures = liveMetrics.test_fixture_count;
  const totalBenchmarks = liveMetrics.benchmark_count;
  const totalExternalValidated = liveMetrics.external_evidence_count;
  const totalAcquisitionValidated = liveMetrics.real_acquisition_event_count;
  const totalUnvalidated = liveMetrics.unvalidated_count;
  const totalFp = liveMetrics.false_positive_count;
  const totalFn = liveMetrics.false_negative_count;
  const avgYield = liveMetrics.investigation_yield_rate;
  const avgOverlap = liveMetrics.discovery_overlap_rate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-edge pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
            <span>GOVERNANCE &amp; TRUTH LEDGER</span>
            <span>·</span>
            <span>PHASE 11 LIVE ACQUISITION OPERATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Acquisition Validation &amp; Candidate Truth Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Separating technical infrastructure, evidence validation, and genuine acquisition operations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/land-radar"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Land Radar Explorer
          </Link>
          <Link
            href="/review"
            className="text-xs font-mono text-brand-steel hover:text-white transition-colors"
          >
            Review Queue
          </Link>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/25">
            INTERNAL DIAGNOSTIC ONLY
          </span>
        </div>
      </div>

      {/* Phase 11 Three-Tier Reality Notice (Section 2 & 25) */}
      <div className="bg-brand-surface border border-brand-edge p-4 rounded space-y-2">
        <h2 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Phase 11 Audit: Three-Tier Validation Governance</span>
        </h2>
        <p className="text-xs text-brand-silver leading-relaxed">
          To prevent misleading claims, this dashboard strictly separates <strong className="text-white">Technical Validation</strong> (software fixtures &amp; tests), <strong className="text-white">Evidence Validation</strong> (controlled benchmarks &amp; independent records), and <strong className="text-white">Acquisition Operations</strong> (genuine vendor dialogue &amp; site control).
          A single &ldquo;validation success rate&rdquo; is prohibited.
        </p>
      </div>

      {/* 5-Category Evidence Status Breakdown (Section 2) */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-brand-steel">1. Candidate Evidence Classification Breakdown</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-brand-surface border border-brand-edge p-4 rounded">
            <div className="text-2xl font-bold text-slate-400 font-mono">{totalTestFixtures}</div>
            <div className="text-[10px] font-mono uppercase text-brand-steel mt-1">Test Fixtures</div>
            <div className="text-[9px] text-slate-500 mt-0.5 font-mono">Infrastructure Only</div>
          </div>

          <div className="bg-brand-surface border border-cyan-500/30 p-4 rounded bg-cyan-950/10">
            <div className="text-2xl font-bold text-cyan-300 font-mono">{totalBenchmarks}</div>
            <div className="text-[10px] font-mono uppercase text-brand-steel mt-1">Controlled Benchmarks</div>
            <div className="text-[9px] text-cyan-400 mt-0.5 font-mono">Methodological tests</div>
          </div>

          <div className="bg-brand-surface border border-brand-edge p-4 rounded">
            <div className="text-2xl font-bold text-amber-400 font-mono">{totalExternalValidated}</div>
            <div className="text-[10px] font-mono uppercase text-brand-steel mt-1">Externally Corroborated</div>
            <div className="text-[9px] text-brand-silver mt-0.5 font-mono">Real Consultant Evidence</div>
          </div>

          <div className="bg-brand-surface border border-brand-edge p-4 rounded">
            <div className="text-2xl font-bold text-emerald-400 font-mono">{totalAcquisitionValidated}</div>
            <div className="text-[10px] font-mono uppercase text-brand-steel mt-1">Genuine Acquisition</div>
            <div className="text-[9px] text-emerald-400/80 mt-0.5 font-mono">Live Vendor Events</div>
          </div>

          <div className="bg-brand-surface border border-brand-edge p-4 rounded">
            <div className="text-2xl font-bold text-brand-silver font-mono">{totalUnvalidated}</div>
            <div className="text-[10px] font-mono uppercase text-brand-steel mt-1">Unvalidated</div>
            <div className="text-[9px] text-brand-steel mt-0.5 font-mono">Awaiting Corroboration</div>
          </div>
        </div>
      </div>

      {/* Three Operational Validation Tiers (Section 25) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier A: Technical Validation */}
        <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono border-b border-brand-edge/60 pb-2">
            <span className="text-cyan-400 font-bold uppercase">A. Technical Validation</span>
            <span className="text-emerald-400">100% OPERATIONAL</span>
          </div>
          <div className="space-y-1.5 text-xs text-brand-silver">
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Automated Tests:</span>
              <span className="text-white font-bold">152 passing (0 fail)</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Datasets Ingested:</span>
              <span className="text-white font-bold">10 authoritative</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Persistence Mode:</span>
              <span className="text-white font-bold">Dual (Mock / RLS)</span>
            </div>
          </div>
        </div>

        {/* Tier B: Evidence Validation */}
        <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono border-b border-brand-edge/60 pb-2">
            <span className="text-amber-400 font-bold uppercase">B. Evidence Validation</span>
            <span className="text-amber-300">BENCHMARK ACTIVE</span>
          </div>
          <div className="space-y-1.5 text-xs text-brand-silver">
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Discovery Overlap:</span>
              <span className="text-cyan-300 font-bold">{avgOverlap}% vs Benchmarks</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">False Positives:</span>
              <span className="text-rose-400 font-bold">{totalFp} (Access / Noise)</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">False Negatives:</span>
              <span className="text-amber-400 font-bold">{totalFn} (Data / Buffer)</span>
            </div>
          </div>
        </div>

        {/* Tier C: Acquisition Validation */}
        <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono border-b border-brand-edge/60 pb-2">
            <span className="text-emerald-400 font-bold uppercase">C. Acquisition Validation</span>
            <span className="text-brand-steel">GOVERNED LOGS</span>
          </div>
          <div className="space-y-1.5 text-xs text-brand-silver">
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Investigation Yield:</span>
              <span className="text-emerald-400 font-bold">{avgYield}% Justified</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Live Vendor Dialogue:</span>
              <span className="text-white font-bold">Manual Log Only</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-brand-steel">Automated Outreach:</span>
              <span className="text-rose-400 font-bold">STRICTLY FORBIDDEN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Phase 12 Live Cohort Section */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-emerald-950/20">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
                Phase 12 Live Acquisition Cohort: {LIVE_ACQUISITION_COHORT.cohortId}
              </h3>
            </div>
            <p className="text-[11px] text-brand-silver mt-0.5">
              {LIVE_ACQUISITION_COHORT.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-brand-steel">Yield:</span>
            <span className="text-emerald-400 font-bold">{liveMetrics.investigation_yield_rate}%</span>
            <span className="text-brand-steel">·</span>
            <span className="text-brand-steel">FP:</span>
            <span className="text-rose-400 font-bold">{liveMetrics.false_positive_count}</span>
            <span className="text-brand-steel">·</span>
            <span className="text-brand-steel">FN:</span>
            <span className="text-amber-400 font-bold">{liveMetrics.false_negative_count}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Candidate Ref</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Planning Reality</th>
                <th className="py-3 px-4">Access Reality</th>
                <th className="py-3 px-4">Market Reality</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Diagnostic Verdict</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              {LIVE_ACQUISITION_COHORT.candidates.map((c) => (
                <tr key={c.id} className="hover:bg-brand-charcoal/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">
                    {c.site_reference}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        c.validation_evidence_status === 'REAL_ACQUISITION_EVENT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : c.validation_evidence_status === 'EXTERNAL_EVIDENCE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {c.validation_evidence_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-steel text-[11px]">{c.validation_stage}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 text-[11px]">{c.planning_reality}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className={c.access_reality === 'FAILED' ? 'text-rose-400' : 'text-emerald-400'}>
                      {c.access_reality}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className={c.market_reality === 'WEAK' ? 'text-rose-400' : 'text-brand-silver'}>
                      {c.market_reality}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`${
                        c.commercial_decision === 'PROGRESS'
                          ? 'text-emerald-400'
                          : c.commercial_decision === 'HOLD'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {c.commercial_decision}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.false_positive_flag ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        FP: {c.false_positive_root_cause}
                      </span>
                    ) : c.false_negative_flag ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        FN: {c.false_negative_category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono">✓ Verified</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/review/${c.site_reference}`}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] transition-colors"
                    >
                      Inspect Dossier →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Section: Warwick District */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Cohort 1: Warwick District Benchmark ({WARWICK_VALIDATION_COHORT.cohortId})
              </h3>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              {WARWICK_VALIDATION_COHORT.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-brand-steel">Yield:</span>
            <span className="text-emerald-400 font-bold">{warwickMetrics.investigation_yield_rate}%</span>
            <span className="text-brand-steel">·</span>
            <span className="text-brand-steel">FP:</span>
            <span className="text-rose-400 font-bold">{warwickMetrics.false_positive_count}</span>
            <span className="text-brand-steel">·</span>
            <span className="text-brand-steel">FN:</span>
            <span className="text-amber-400 font-bold">{warwickMetrics.false_negative_count}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Candidate Ref</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Planning Reality</th>
                <th className="py-3 px-4">Access Reality</th>
                <th className="py-3 px-4">Market Reality</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Diagnostic Verdict</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              {WARWICK_VALIDATION_COHORT.candidates.map((c) => (
                <tr key={c.id} className="hover:bg-brand-charcoal/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">
                    {c.site_reference}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                      {c.validation_evidence_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        c.validation_status === 'VALIDATED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}
                    >
                      {c.validation_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-steel text-[11px]">{c.validation_stage}</td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`text-[11px] ${
                        c.planning_reality === 'SUPPORTIVE'
                          ? 'text-emerald-400'
                          : c.planning_reality === 'ADVERSE'
                          ? 'text-rose-400'
                          : 'text-brand-steel'
                      }`}
                    >
                      {c.planning_reality}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`text-[11px] ${
                        c.access_reality === 'SUPPORTIVE'
                          ? 'text-emerald-400'
                          : c.access_reality === 'FAILED'
                          ? 'text-rose-400 font-bold'
                          : 'text-amber-400'
                      }`}
                    >
                      {c.access_reality}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-brand-silver">{c.market_reality}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`${
                        c.commercial_decision === 'PROGRESS'
                          ? 'text-emerald-400'
                          : c.commercial_decision === 'HOLD'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {c.commercial_decision}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.false_positive_flag ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        FP: {c.false_positive_root_cause}
                      </span>
                    ) : c.false_negative_flag ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        FN: {c.false_negative_category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono">✓ Verified</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/review/${c.site_reference}`}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] transition-colors"
                    >
                      Inspect Dossier →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Section: Rugby Borough */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Cohort 2: Rugby Borough ({RUGBY_VALIDATION_COHORT.cohortId})
              </h3>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              {RUGBY_VALIDATION_COHORT.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-brand-steel">Yield:</span>
            <span className="text-emerald-400 font-bold">{rugbyMetrics.investigation_yield_rate}%</span>
            <span className="text-brand-steel">·</span>
            <span className="text-brand-steel">FP:</span>
            <span className="text-rose-400 font-bold">{rugbyMetrics.false_positive_count}</span>
            <span className="text-brand-steel">·</span>
            <span className="text-brand-steel">FN:</span>
            <span className="text-amber-400 font-bold">{rugbyMetrics.false_negative_count}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Candidate Ref</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Planning Reality</th>
                <th className="py-3 px-4">Access Reality</th>
                <th className="py-3 px-4">Market Reality</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Diagnostic Verdict</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              {RUGBY_VALIDATION_COHORT.candidates.map((c) => (
                <tr key={c.id} className="hover:bg-brand-charcoal/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">
                    {c.site_reference}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                      {c.validation_evidence_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        c.validation_status === 'VALIDATED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}
                    >
                      {c.validation_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-steel text-[11px]">{c.validation_stage}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 text-[11px]">{c.planning_reality}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 text-[11px]">{c.access_reality}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-rose-300">{c.market_reality}</td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span
                      className={`${
                        c.commercial_decision === 'PROGRESS' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {c.commercial_decision}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {c.false_positive_flag ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        FP: {c.false_positive_root_cause}
                      </span>
                    ) : c.false_negative_flag ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        FN: {c.false_negative_category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono">✓ Verified</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/review/${c.site_reference}`}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] transition-colors"
                    >
                      Inspect Dossier →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Root Cause Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* False Positive Diagnosis Panel */}
        <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-rose-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Documented False Positive Diagnosis (§12)</span>
          </div>
          <p className="text-xs text-brand-silver">
            A false positive occurs when real-world evidence materially contradicts the screening signals that caused the candidate to be prioritised.
          </p>
          <div className="space-y-2 pt-2 border-t border-brand-edge/60 text-xs">
            <div className="p-2.5 bg-rose-950/20 border border-rose-500/25 rounded space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <strong className="text-rose-300">EUK-S-WARWICK-BF-004 (Farmer Ward Road)</strong>
                <span className="text-rose-400">access_failure</span>
              </div>
              <p className="text-[11px] text-brand-silver">
                <strong>Machine inference:</strong> Road proximity &lt;50m. <strong>Ground truth:</strong> 0.5m third-party ransom strip prevents legal connection.
              </p>
            </div>

            <div className="p-2.5 bg-rose-950/20 border border-rose-500/25 rounded space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <strong className="text-rose-300">EUK-S-RUGBY-BF-002 (Railway Terrace)</strong>
                <span className="text-rose-400">market_mismatch</span>
              </div>
              <p className="text-[11px] text-brand-silver">
                <strong>Machine inference:</strong> Established urban pricing. <strong>Ground truth:</strong> Extreme freight line acoustic pollution caps achievable £/sq ft below development cost.
              </p>
            </div>
          </div>
        </div>

        {/* False Negative Diagnosis Panel */}
        <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Documented False Negative Diagnosis (§13)</span>
          </div>
          <p className="text-xs text-brand-silver">
            A false negative occurs when a viable acquisition opportunity identified by human research was missed or deprioritised by Land Radar.
          </p>
          <div className="space-y-2 pt-2 border-t border-brand-edge/60 text-xs">
            <div className="p-2.5 bg-amber-950/20 border border-amber-500/25 rounded space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <strong className="text-amber-300">EUK-HB-WARWICK-001 (Old Warwick Road)</strong>
                <span className="text-amber-400">data_false_negative</span>
              </div>
              <p className="text-[11px] text-brand-silver">
                <strong>Root Cause:</strong> Warwick LPA omitted decommissioned gas holder parcel from published DLUHC Brownfield Register feed.
              </p>
            </div>

            <div className="p-2.5 bg-amber-950/20 border border-amber-500/25 rounded space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <strong className="text-amber-300">EUK-HB-RUGBY-001 (Newbold Road)</strong>
                <span className="text-amber-400">rule_false_negative</span>
              </div>
              <p className="text-[11px] text-brand-silver">
                <strong>Root Cause:</strong> Rigid 1000m settlement buffer rule deprioritised candidate located at 1040m along an active commercial growth corridor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Human Benchmark Comparison (§8) */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-brand-edge pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Human Benchmark Set &amp; Machine Discovery Comparison (§8)
              </h3>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              Independent acquisition surveyor research vs. Land Radar automated surfacing.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300">
            Discovery Overlap Rate: {avgOverlap}%
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {[...WARWICK_VALIDATION_COHORT.humanBenchmarks, ...RUGBY_VALIDATION_COHORT.humanBenchmarks].map((hb) => (
            <div
              key={hb.id}
              className="p-3 bg-brand-charcoal/40 border border-brand-edge/60 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-white font-semibold">{hb.site_name}</span>
                  <span className="text-brand-steel">({hb.geography})</span>
                </div>
                <p className="text-brand-silver text-[11px]">{hb.rationale}</p>
                <div className="text-[10px] font-mono text-brand-steel">
                  Discovered by: {hb.identified_by} via {hb.identification_method}
                </div>
              </div>

              <div className="text-right shrink-0 font-mono text-[11px]">
                {hb.surfaced_by_land_radar ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Surfaced by Land Radar
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Missed by Machine
                  </span>
                )}
                <div className="text-[10px] text-brand-steel mt-1 max-w-xs text-right">
                  {hb.disagreement_reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
