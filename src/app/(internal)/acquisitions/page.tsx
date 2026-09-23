import React from 'react';
import Link from 'next/link';
import { getOperationalQueue } from '@/lib/land-radar/acquisitions/acquisitionService';
import { OperationalQueueView } from './OperationalQueueView';
import { isOsConfigured } from '@/lib/land-radar/clients/osClient';
import { isHmlrConfigured } from '@/lib/land-radar/clients/hmlrClient';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'Acquisition Operations Workbench — Land Radar',
  description: 'Attributable, evidence-backed property acquisition pipeline and opportunity execution.',
};

export default async function AcquisitionsPage() {
  const candidates = await getOperationalQueue();

  const totalCandidates = candidates.length;
  const actionRequiredCount = candidates.filter((c) =>
    c.queue_groups.includes('ACTION_REQUIRED')
  ).length;
  const followUpsDueCount = candidates.filter((c) =>
    c.queue_groups.includes('FOLLOW_UPS_DUE')
  ).length;
  const contradictionsCount = candidates.filter((c) =>
    c.queue_groups.includes('CONTRADICTIONS')
  ).length;
  const readyForGateCount = candidates.filter((c) =>
    c.queue_groups.includes('READY_FOR_GATE')
  ).length;
  const waitingResponseCount = candidates.filter((c) =>
    c.queue_groups.includes('WAITING_FOR_RESPONSE')
  ).length;

  const osActive = isOsConfigured();
  const hmlrActive = isHmlrConfigured();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-edge pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACQUISITION OPERATIONS WORKBENCH</span>
            <span>·</span>
            <span>PHASE 13 RUNTIME</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Opportunity Execution & Operations Queue
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1 max-w-3xl">
            Attributable, evidence-backed candidate progression. Evaluates deterministic next actions, tracks contact engagement, resolves contradictions, and controls acquisition gate readiness.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/land-radar"
            className="px-3.5 py-1.5 bg-brand-charcoal hover:bg-brand-surface border border-brand-edge text-white font-medium text-xs rounded transition-colors flex items-center space-x-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Workstation</span>
          </Link>
          <Link
            href="/review"
            className="px-3.5 py-1.5 bg-brand-charcoal hover:bg-brand-surface border border-brand-edge text-white font-medium text-xs rounded transition-colors"
          >
            Review Queue
          </Link>
        </div>
      </div>

      {/* Operational Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-brand-surface border border-brand-edge p-3.5 rounded-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-steel block">
            Total Pipeline
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {totalCandidates}
          </span>
          <span className="text-[10px] text-brand-silver mt-0.5 block">
            Pilot cohorts active
          </span>
        </div>

        <div className="bg-brand-surface border border-emerald-500/30 p-3.5 rounded-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
            Action Required
          </span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {actionRequiredCount}
          </span>
          <span className="text-[10px] text-brand-silver mt-0.5 block">
            Deterministic next actions
          </span>
        </div>

        <div className="bg-brand-surface border border-amber-500/30 p-3.5 rounded-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
            Follow-Ups Due
          </span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {followUpsDueCount}
          </span>
          <span className="text-[10px] text-brand-silver mt-0.5 block">
            Scheduled contact dates
          </span>
        </div>

        <div className="bg-brand-surface border border-brand-edge p-3.5 rounded-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
            Waiting Response
          </span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block">
            {waitingResponseCount}
          </span>
          <span className="text-[10px] text-brand-silver mt-0.5 block">
            Enquiries issued
          </span>
        </div>

        <div className="bg-brand-surface border border-brand-edge p-3.5 rounded-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block">
            Contradictions
          </span>
          <span className="text-2xl font-bold text-rose-400 mt-1 block">
            {contradictionsCount}
          </span>
          <span className="text-[10px] text-brand-silver mt-0.5 block">
            Material discrepancies
          </span>
        </div>

        <div className="bg-brand-surface border border-indigo-500/30 p-3.5 rounded-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block">
            Ready For Gate
          </span>
          <span className="text-2xl font-bold text-indigo-400 mt-1 block">
            {readyForGateCount}
          </span>
          <span className="text-[10px] text-brand-silver mt-0.5 block">
            Evidence complete
          </span>
        </div>
      </div>

      {/* Authoritative Gateway Status & Upstream Limitation Exposure */}
      <div className="bg-brand-charcoal/60 border border-brand-edge rounded-sm p-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${osActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="font-mono text-white font-medium">Ordnance Survey VTS:</span>
              <span className="text-brand-silver">{osActive ? 'Connected (Live Proxy)' : 'Unconfigured'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hmlrActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="font-mono text-white font-medium">HMLR Title Register:</span>
              <span className="text-brand-silver">{hmlrActive ? 'Connected (Live API)' : 'Unconfigured'}</span>
            </div>
          </div>

          <div className="text-[11px] text-brand-steel flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              OS WFS collection <code className="text-white font-mono">OpenRoads_RoadLink</code> returns 403 until activated on OS Data Hub project plan.
            </span>
          </div>
        </div>
      </div>

      {/* Operational Queue Table */}
      <OperationalQueueView candidates={candidates} />
    </div>
  );
}
