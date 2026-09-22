import React from 'react';
import Link from 'next/link';
import { WARWICK_PILOT } from '@/lib/land-radar/pilot/config';
import { runPilot } from '@/lib/land-radar/pilot/runPilot';
import { Badge } from '@/components/ui/Badge';
import { formatArea } from '@/lib/land-radar/geometry';

export const metadata = {
  title: 'Review Queue — Land Radar Intelligence',
};

export default async function ReviewQueuePage() {
  // Execute dry-run screening in-memory for the pilot
  const pilotRun = await runPilot({
    pilotId: WARWICK_PILOT.id,
    dryRun: true,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-edge pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>PILOT RUN: {pilotRun.pilotId}</span>
            <span>·</span>
            <span>STRATEGY: {pilotRun.screeningStrategy}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Warwick District Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Deterministic candidate screening across authoritative DLUHC Brownfield, EA Flood, Natural England SSSI, and HMLR INSPIRE datasets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/land-radar"
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-brand-obsidian font-semibold text-xs rounded transition-colors flex items-center space-x-1.5"
          >
            <span>Open Map Workstation →</span>
          </Link>
          <span className="text-xs font-mono text-brand-steel bg-brand-charcoal px-3 py-1.5 rounded border border-brand-edge">
            Pipeline Active
          </span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-brand-surface border border-brand-edge p-4 rounded-sm">
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-steel block">
            Candidate Sites
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {pilotRun.sitesEvaluated}
          </span>
          <span className="text-[10px] text-brand-silver mt-1 block">
            From brownfield register & HMLR
          </span>
        </div>

        <div className="bg-brand-surface border border-brand-edge p-4 rounded-sm">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block">
            Passed Screening
          </span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block">
            {pilotRun.sitesPassedScreening}
          </span>
          <span className="text-[10px] text-brand-silver mt-1 block">
            Zero blocker exclusions
          </span>
        </div>

        <div className="bg-brand-surface border border-brand-edge p-4 rounded-sm">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block">
            Constraints Detected
          </span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {Object.values(pilotRun.constraintDistribution).reduce((a, b) => a + b, 0)}
          </span>
          <span className="text-[10px] text-brand-silver mt-1 block">
            EA Flood Zones & SSSI
          </span>
        </div>

        <div className="bg-brand-surface border border-brand-edge p-4 rounded-sm">
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-steel block">
            Epistemic Unknowns
          </span>
          <span className="text-2xl font-bold text-brand-silver mt-1 block">
            {pilotRun.signalDistribution.green_belt}
          </span>
          <span className="text-[10px] text-brand-steel mt-1 block">
            Deferred Green Belt dataset
          </span>
        </div>
      </div>

      {/* Epistemic Transparency Box */}
      <div className="bg-brand-charcoal/60 border border-brand-edge/80 p-4 rounded-sm text-xs text-brand-silver space-y-1">
        <div className="font-semibold text-white flex items-center space-x-2">
          <span className="text-cyan-400 font-mono">i</span>
          <span>EPISTEMIC STATE INTEGRITY</span>
        </div>
        <p>
          Land Radar distinguishes facts from derivations. Absence of record is never reported as absence of constraint. Green Belt data is deferred in Phase 5 and recorded as <code className="text-amber-300 font-mono">unknown</code> rather than clear. No magic 0–100 scores are used.
        </p>
      </div>

      {/* Candidates Table */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex justify-between items-center">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
            Candidate Sites Surfaced for Review ({pilotRun.sitesEvaluated})
          </h2>
          <span className="text-xs font-mono text-brand-steel">
            Rule Version: {pilotRun.ruleVersion}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Internal Reference</th>
                <th className="py-3 px-4">Site Name & Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Positive Signals</th>
                <th className="py-3 px-4">Constraints</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60">
              {pilotRun.sampleCandidates.map((cand) => (
                <tr key={cand.siteReference} className="hover:bg-brand-charcoal/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                    <Link href={`/review/${cand.siteReference}`} className="hover:underline">
                      {cand.siteReference}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-white max-w-xs">
                    <div className="font-medium truncate">{cand.name}</div>
                    <div className="text-[11px] text-brand-silver truncate">Warwick District · OGL v3</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        cand.priority === 'HIGH'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : cand.priority === 'MEDIUM'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {cand.priority ?? 'ASSESSED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-silver">
                    {formatArea(cand.areaSqm ?? null)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {cand.positiveSignals.length} Positive
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {cand.constraints.length > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        {cand.constraints.length} Soft Constraint
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-brand-charcoal text-brand-steel border border-brand-edge">
                        None detected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="brand">Passed</Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <Link
                      href={`/review/${cand.siteReference}`}
                      className="text-xs text-brand-silver hover:text-cyan-400 transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Inspect Evidence →</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
