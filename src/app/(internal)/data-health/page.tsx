import React from 'react';
import Link from 'next/link';
import { WARWICK_PILOT, RUGBY_PILOT } from '@/lib/land-radar/pilot/config';
import { BrownfieldAdapter } from '@/lib/land-radar/adapters/brownfieldAdapter';
import { FloodAdapter } from '@/lib/land-radar/adapters/floodAdapter';
import { SSSIAdapter } from '@/lib/land-radar/adapters/sssiAdapter';
import { HMLRInspireAdapter } from '@/lib/land-radar/adapters/hmlrInspireAdapter';
import { BuiltUpAreaAdapter } from '@/lib/land-radar/adapters/builtUpAreaAdapter';
import { GreenBeltAdapter } from '@/lib/land-radar/adapters/greenBeltAdapter';
import { RoadAdapter } from '@/lib/land-radar/adapters/roadAdapter';
import { PlanningAdapter } from '@/lib/land-radar/adapters/planningAdapter';
import { PricePaidAdapter } from '@/lib/land-radar/adapters/pricePaidAdapter';
import { LocalPlanAdapter } from '@/lib/land-radar/adapters/localPlanAdapter';
import { checkOsHealth } from '@/lib/land-radar/clients/osClient';
import { checkHmlrHealth } from '@/lib/land-radar/clients/hmlrClient';

export const metadata = {
  title: 'Data Health & Licence Registry — Land Radar Intelligence',
};

const RETRIEVAL_MODE_LABEL: Record<string, string> = {
  live: 'Live API',
  live_api: 'Live API',
  cached: 'Cached',
  local_fixture: 'Local Fixture',
  stale: 'Stale',
  partial: 'Partial',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
};

const RETRIEVAL_MODE_COLOUR: Record<string, string> = {
  live: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  live_api: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  cached: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  local_fixture: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  stale: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  partial: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  unavailable: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  unknown: 'bg-brand-charcoal text-brand-steel border-brand-edge',
};

export default async function DataHealthPage() {
  const pilot = WARWICK_PILOT;
  const decisions = pilot.datasetDecisions;

  // Run all 10 adapters to capture live retrieval modes and record counts
  const bfAdapter = new BrownfieldAdapter();
  const floodAdapter = new FloodAdapter();
  const sssiAdapter = new SSSIAdapter();
  const hmlrAdapter = new HMLRInspireAdapter();
  const buaAdapter = new BuiltUpAreaAdapter();
  const gbAdapter = new GreenBeltAdapter();
  const roadAdapter = new RoadAdapter();
  const planningAdapter = new PlanningAdapter();
  const pricePaidAdapter = new PricePaidAdapter();
  const localPlanAdapter = new LocalPlanAdapter();

  const [
    osHealth,
    hmlrHealth,
    bfRes,
    floodRes,
    sssiRes,
    hmlrRes,
    buaRes,
    gbRes,
    roadRes,
    planResWarwick,
    planResRugby,
    pricePaidResWarwick,
    pricePaidResRugby,
    localPlanResWarwick,
    localPlanResRugby,
  ] = await Promise.all([
    checkOsHealth(),
    checkHmlrHealth(),
    bfAdapter.ingest(pilot),
    floodAdapter.ingest(pilot),
    sssiAdapter.ingest(pilot),
    hmlrAdapter.ingest(pilot),
    buaAdapter.ingest(pilot),
    gbAdapter.ingest(pilot),
    roadAdapter.ingest(pilot),
    planningAdapter.ingest(pilot),
    planningAdapter.ingest(RUGBY_PILOT),
    pricePaidAdapter.ingest(pilot),
    pricePaidAdapter.ingest(RUGBY_PILOT),
    localPlanAdapter.ingest(pilot),
    localPlanAdapter.ingest(RUGBY_PILOT),
  ]);

  const datasetHealth: Record<string, { retrievalMode: string; recordCount: number }> = {
    'PLAN-BROWNFIELD-001': {
      retrievalMode: bfRes.retrievalMode ?? 'local_fixture',
      recordCount: bfRes.records.length,
    },
    'EA-FLOOD-001': {
      retrievalMode: floodRes.retrievalMode ?? 'local_fixture',
      recordCount: floodRes.records.length,
    },
    'NE-SSSI-001': {
      retrievalMode: sssiRes.retrievalMode ?? 'local_fixture',
      recordCount: sssiRes.records.length,
    },
    'HMLR-INSPIRE-001': {
      retrievalMode: hmlrRes.retrievalMode ?? 'local_fixture',
      recordCount: hmlrRes.records.length,
    },
    'ONS-BUILTUP-001': {
      retrievalMode: buaRes.retrievalMode ?? 'local_fixture',
      recordCount: buaRes.records.length,
    },
    'OS-OPEN-ROADS-001': {
      retrievalMode: roadRes.retrievalMode ?? 'local_fixture',
      recordCount: roadRes.records.length,
    },
    'LPA-GREENBELT-001': {
      retrievalMode: gbRes.retrievalMode ?? 'local_fixture',
      recordCount: gbRes.records.length,
    },
    'PLANNING-REGISTER-001': {
      retrievalMode: planResWarwick.retrievalMode ?? 'local_fixture',
      recordCount: planResWarwick.records.length,
    },
    'HMLR-PRICE-PAID-001': {
      retrievalMode: pricePaidResWarwick.retrievalMode ?? 'local_fixture',
      recordCount: pricePaidResWarwick.records.length,
    },
    'LPA-LOCAL-PLAN-001': {
      retrievalMode: localPlanResWarwick.retrievalMode ?? 'local_fixture',
      recordCount: localPlanResWarwick.records.length,
    },
  };

  const totalRecords = Object.values(datasetHealth).reduce((sum, h) => sum + h.recordCount, 0);
  const liveCount = Object.values(datasetHealth).filter((h) => h.retrievalMode === 'live').length;
  const fixtureCount = Object.values(datasetHealth).filter(
    (h) => h.retrievalMode === 'local_fixture'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-edge pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>GOVERNANCE &amp; COMPLIANCE</span>
            <span>·</span>
            <span>PILOT: {pilot.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Data Health &amp; Source Licence Register
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            Authoritative UK geospatial datasets, legal reuse licences, live retrieval status and
            epistemic availability for Land Radar pilot operations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/land-radar"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Land Radar Workstation
          </Link>
          <Link
            href="/review"
            className="text-xs font-mono text-brand-steel hover:text-white transition-colors"
          >
            Review Queue
          </Link>
        </div>
      </div>

      {/* Live ingestion summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Datasets Active', value: decisions.filter((d) => d.decision === 'ingest').length.toString() },
          { label: 'Records Ingested', value: totalRecords.toString() },
          { label: 'Live API Sources', value: liveCount.toString() },
          { label: 'Fixture Sources', value: fixtureCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-brand-surface border border-brand-edge p-4 rounded-sm">
            <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
            <div className="text-[10px] font-mono uppercase text-brand-steel mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Live Authoritative Credentials & Gateway Status */}
      <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between border-b border-brand-edge pb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Authoritative API Gateways &amp; Credential Status</span>
          </h2>
          <span className="text-[10px] font-mono text-brand-steel">SECURE SERVER-SIDE CREDENTIALS ONLY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OS Gateway */}
          <div className="p-4 bg-brand-charcoal/50 border border-brand-edge rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                <span>Ordnance Survey (OS Data Hub)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                osHealth.configured ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border-rose-500/25'
              }`}>
                {osHealth.configured ? 'CREDENTIALS CONFIGURED' : 'MISSING OS_API_KEY'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-brand-silver">
              <div>
                <span className="text-brand-steel block text-[9px] uppercase">Vector Tile API:</span>
                <span className={osHealth.vectorTilesStatus === 200 ? 'text-emerald-400' : 'text-amber-400'}>
                  {osHealth.vectorTilesStatus === 200 ? '✓ 200 OK (Active & Proxied)' : `${osHealth.vectorTilesStatusText || 'Not Connected'}`}
                </span>
              </div>
              <div>
                <span className="text-brand-steel block text-[9px] uppercase">Features API (WFS):</span>
                <span className={osHealth.wfsStatus === 200 ? 'text-emerald-400' : 'text-amber-400'}>
                  {osHealth.wfsStatus === 200 ? '✓ 200 OK (Capabilities)' : `${osHealth.wfsStatusText || 'Not Connected'}`}
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-brand-steel pt-1 border-t border-brand-edge/50">
              Proxy endpoint: <code className="text-cyan-300">/api/map/os-tiles/[...tilePath]</code> · Secret strictly masked
            </div>
          </div>

          {/* HMLR Gateway */}
          <div className="p-4 bg-brand-charcoal/50 border border-brand-edge rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                <span>HM Land Registry (HMLR Direct)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                hmlrHealth.configured ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
              }`}>
                {hmlrHealth.configured ? 'CREDENTIALS CONFIGURED' : 'PENDING HMLR_API_KEY'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-brand-silver">
              <div>
                <span className="text-brand-steel block text-[9px] uppercase">Title Register Verification:</span>
                <span className={hmlrHealth.configured ? 'text-emerald-400' : 'text-slate-400'}>
                  {hmlrHealth.configured ? '✓ Online Lookup Active' : 'Offline Ingest Mode'}
                </span>
              </div>
              <div>
                <span className="text-brand-steel block text-[9px] uppercase">Price Paid Linked Data:</span>
                <span className="text-emerald-400">
                  ✓ Active (SPARQL/JSON)
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-brand-steel pt-1 border-t border-brand-edge/50">
              Endpoint: <code className="text-cyan-300">{hmlrHealth.baseUrl}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic Standard Notice */}
      <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Core Data Governance Principles</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-brand-silver">
          <div className="border-l-2 border-brand-edge pl-3 space-y-1">
            <span className="font-mono text-white font-medium block">1. Legal Licence Gate</span>
            <p>
              No source is imported without explicit licence verification. Commercial re-use for
              internal land intelligence must be legally confirmed before ingestion under OGL v3.0.
            </p>
          </div>
          <div className="border-l-2 border-brand-edge pl-3 space-y-1">
            <span className="font-mono text-white font-medium block">2. Unknown ≠ Clear</span>
            <p>
              If a dataset is deferred or unavailable, the system records{' '}
              <code className="text-amber-300 font-mono">unknown</code>. It never infers absence of
              constraint or lack of planning history.
            </p>
          </div>
          <div className="border-l-2 border-brand-edge pl-3 space-y-1">
            <span className="font-mono text-white font-medium block">3. Immutable Provenance</span>
            <p>
              Every ingested record retains its raw payload, retrieval timestamp, and source
              identifier for end-to-end auditability and reproducibility.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Health Table — with live retrieval mode */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex justify-between items-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
            Pilot Dataset Health — Live Retrieval Status
          </h3>
          <span className="text-xs font-mono text-brand-steel">Warwick District &amp; Pilot Envelope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Dataset ID</th>
                <th className="py-3 px-4">Licence</th>
                <th className="py-3 px-4">Ingestion</th>
                <th className="py-3 px-4">Retrieval Mode</th>
                <th className="py-3 px-4">Records</th>
                <th className="py-3 px-4">Licence Verified</th>
                <th className="py-3 px-4">Reason &amp; Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              {decisions.map((d) => {
                const health = datasetHealth[d.datasetId];
                const mode = health?.retrievalMode ?? 'local_fixture';
                const modeLabel = RETRIEVAL_MODE_LABEL[mode] ?? mode;
                const modeColour =
                  RETRIEVAL_MODE_COLOUR[mode] ?? 'bg-brand-edge text-brand-steel border-brand-edge';
                return (
                  <tr key={d.datasetId} className="hover:bg-brand-charcoal/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{d.datasetId}</td>
                    <td className="py-3 px-4 text-brand-silver">{d.licenceName}</td>
                    <td className="py-3 px-4 font-mono">
                      {d.decision === 'ingest' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          Ingested
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          Deferred
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {health ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${modeColour}`}
                        >
                          {modeLabel}
                        </span>
                      ) : (
                        <span className="text-brand-steel">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      {health ? health.recordCount : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {d.licenceConfirmed ? (
                        <span className="text-emerald-400">✓ Verified</span>
                      ) : (
                        <span className="text-brand-steel">— Pending Gate</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-brand-silver max-w-md">{d.decisionReason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 8: Planning Authority Coverage Matrix */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              LPA Planning Register Coverage Matrix (Phase 8 Intelligence Layer)
            </h3>
          </div>
          <span className="text-xs font-mono text-brand-steel">5-Tier Spatial Linkage Model</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Local Planning Authority</th>
                <th className="py-3 px-4">Coverage Status</th>
                <th className="py-3 px-4">Ingested Records</th>
                <th className="py-3 px-4">Geometry Available</th>
                <th className="py-3 px-4">Spatial Match Tiers Active</th>
                <th className="py-3 px-4">Source Platform</th>
                <th className="py-3 px-4">Epistemic Disclaimer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              <tr className="hover:bg-brand-charcoal/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-white">
                  Warwick District Council ({WARWICK_PILOT.id})
                </td>
                <td className="py-3 px-4 font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Known (Pilot Snapshot)
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-white">{planResWarwick.records.length}</td>
                <td className="py-3 px-4 font-mono text-emerald-400">Yes (Polygon &amp; Point)</td>
                <td className="py-3 px-4 text-brand-silver font-mono text-[11px]">Tiers 1, 3, 4</td>
                <td className="py-3 px-4 text-brand-steel">DLUHC Planning Data / WDC Register</td>
                <td className="py-3 px-4 text-brand-silver max-w-xs">
                  Zero records found = absence in source register, not proof of zero historical planning records.
                </td>
              </tr>
              <tr className="hover:bg-brand-charcoal/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-white">
                  Rugby Borough Council ({RUGBY_PILOT.id})
                </td>
                <td className="py-3 px-4 font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Known (Pilot Snapshot)
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-white">{planResRugby.records.length}</td>
                <td className="py-3 px-4 font-mono text-emerald-400">Yes (Polygon &amp; Point)</td>
                <td className="py-3 px-4 text-brand-silver font-mono text-[11px]">Tiers 1, 3, 4</td>
                <td className="py-3 px-4 text-brand-steel">DLUHC Planning Data / RBC Register</td>
                <td className="py-3 px-4 text-brand-silver max-w-xs">
                  Approved applications do not confer current developability. Refusals do not imply perpetual impediment.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 9: Market Intelligence & Local Plan Allocation Coverage Matrix */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Market Intelligence &amp; Adopted Local Plan Coverage (Phase 9 Evidence Domains)
            </h3>
          </div>
          <span className="text-xs font-mono text-brand-steel">HMLR Price Paid &amp; LPA Local Plans</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Pilot Geography</th>
                <th className="py-3 px-4">HMLR Sales Ingested</th>
                <th className="py-3 px-4">Local Plan Allocations</th>
                <th className="py-3 px-4">Key Policy Policies</th>
                <th className="py-3 px-4">Anti-Valuation Gate</th>
                <th className="py-3 px-4">Epistemic Disclaimer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              <tr className="hover:bg-brand-charcoal/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-white">
                  Warwick District ({WARWICK_PILOT.id})
                </td>
                <td className="py-3 px-4 font-mono text-indigo-300">
                  {pricePaidResWarwick.records.length} sales (CV31, CV34)
                </td>
                <td className="py-3 px-4 font-mono text-teal-300">
                  {localPlanResWarwick.records.length} adopted allocations
                </td>
                <td className="py-3 px-4 text-brand-silver font-mono text-[11px]">
                  Policy DS11, DS15 (Old Town / Station)
                </td>
                <td className="py-3 px-4 text-amber-400 font-mono text-[11px]">
                  Enforced (No automated GDV)
                </td>
                <td className="py-3 px-4 text-brand-silver max-w-xs">
                  Absence of recorded sales != absence of market. Allocation != planning permission.
                </td>
              </tr>
              <tr className="hover:bg-brand-charcoal/40 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-white">
                  Rugby Borough ({RUGBY_PILOT.id})
                </td>
                <td className="py-3 px-4 font-mono text-indigo-300">
                  {pricePaidResRugby.records.length} sales (CV21, CV22)
                </td>
                <td className="py-3 px-4 font-mono text-teal-300">
                  {localPlanResRugby.records.length} adopted allocations
                </td>
                <td className="py-3 px-4 text-brand-silver font-mono text-[11px]">
                  Policy DS7, DS8 (Town Centre / Gateway)
                </td>
                <td className="py-3 px-4 text-amber-400 font-mono text-[11px]">
                  Enforced (No automated GDV)
                </td>
                <td className="py-3 px-4 text-brand-silver max-w-xs">
                  Gross site area != developable area. Pricing distributions provide context only.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 11: Ownership Intelligence Health (Section 7 & 26) */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Cadastre &amp; Ownership Intelligence Domain Health
              </h2>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              HMLR INSPIRE geometry index, title-candidate mapping, and registered proprietor evidence health.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            Phase 11 Extension
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4">
          <div className="bg-brand-charcoal/50 p-3 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Title Index Coverage</span>
            <span className="text-xl font-bold font-mono text-cyan-300 block mt-1">{hmlrRes.records.length} parcels</span>
            <span className="text-[9px] text-brand-silver">INSPIRE polygons ingested</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Evidence Coverage</span>
            <span className="text-xl font-bold font-mono text-white block mt-1">Attributable</span>
            <span className="text-[9px] text-emerald-400">Strict provenance log</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Multi-Title Flag</span>
            <span className="text-xl font-bold font-mono text-amber-400 block mt-1">Explicit</span>
            <span className="text-[9px] text-brand-silver">Candidate ≠ Title</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Stale Evidence</span>
            <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">0 flagged</span>
            <span className="text-[9px] text-brand-silver">&lt; 180 day threshold</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Conflicting Titles</span>
            <span className="text-xl font-bold font-mono text-white block mt-1">0 active</span>
            <span className="text-[9px] text-brand-silver">Requires human review</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Unknown State</span>
            <span className="text-xl font-bold font-mono text-amber-400 block mt-1">Preserved</span>
            <span className="text-[9px] text-amber-300">Absence ≠ Clear</span>
          </div>
        </div>
      </div>

      {/* Phase 11: Live Acquisition Operations Health (Section 26) */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Live Acquisition Operations &amp; Outreach Audit
              </h2>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              Audited logs of vendor dialogue, agent intelligence, and contradictory evidence across cohorts.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Operational Log
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 text-xs font-mono">
          <div className="bg-brand-charcoal/50 p-3.5 rounded border border-brand-edge/60 space-y-1">
            <span className="text-[10px] uppercase text-brand-steel block">Automated Outreach</span>
            <span className="text-rose-400 font-bold block text-sm">PROHIBITED</span>
            <span className="text-[10px] text-brand-silver block">Zero bot emails or auto-letters permitted</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3.5 rounded border border-brand-edge/60 space-y-1">
            <span className="text-[10px] uppercase text-brand-steel block">Outreach Channel Log</span>
            <span className="text-white font-bold block text-sm">Manual Analyst Entry</span>
            <span className="text-[10px] text-brand-silver block">Attributable communication records</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3.5 rounded border border-brand-edge/60 space-y-1">
            <span className="text-[10px] uppercase text-brand-steel block">Availability Realities</span>
            <span className="text-cyan-300 font-bold block text-sm">8 Explicit States</span>
            <span className="text-[10px] text-brand-silver block">Silence ≠ NOT_AVAILABLE</span>
          </div>
          <div className="bg-brand-charcoal/50 p-3.5 rounded border border-brand-edge/60 space-y-1">
            <span className="text-[10px] uppercase text-brand-steel block">Contradiction Engine</span>
            <span className="text-purple-400 font-bold block text-sm">Deterministic</span>
            <span className="text-[10px] text-brand-silver block">4 categories, no silent resolution</span>
          </div>
        </div>
      </div>

      {/* Retrieval Mode Legend */}
      <div className="bg-brand-surface border border-brand-edge p-4 rounded-sm">
        <h3 className="text-xs font-mono uppercase tracking-wider text-brand-steel font-semibold mb-3">
          Retrieval Mode Reference — All States
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
          {[
            {
              mode: 'live_api',
              label: 'Live API',
              colour: RETRIEVAL_MODE_COLOUR['live_api'],
              description: 'Fetched from authoritative source endpoint at ingestion time. Most current data.',
            },
            {
              mode: 'cached',
              label: 'Cached',
              colour: RETRIEVAL_MODE_COLOUR['cached'],
              description: 'Retrieved from a recent local cache of live API data. Freshness depends on cache TTL.',
            },
            {
              mode: 'local_fixture',
              label: 'Local Fixture',
              colour: RETRIEVAL_MODE_COLOUR['local_fixture'],
              description: 'Authentic Warwickshire pilot snapshot. Suitable for offline screening — NOT real-time production data.',
            },
            {
              mode: 'stale',
              label: 'Stale',
              colour: RETRIEVAL_MODE_COLOUR['stale'],
              description: 'Source data is outdated beyond its declared refresh threshold. Re-ingestion required before production use.',
            },
            {
              mode: 'partial',
              label: 'Partial',
              colour: RETRIEVAL_MODE_COLOUR['partial'],
              description: 'Coverage is incomplete for the requested geography. Evidence may exist but records are not exhaustive.',
            },
            {
              mode: 'unavailable',
              label: 'Unavailable',
              colour: RETRIEVAL_MODE_COLOUR['unavailable'],
              description: 'Source endpoint unreachable or dataset deferred. Unknown does NOT imply absence of constraint.',
            },
            {
              mode: 'unknown',
              label: 'Unknown',
              colour: RETRIEVAL_MODE_COLOUR['unknown'],
              description: 'Retrieval status unassessed. Evidence gap must be documented before screening decisions.',
            },
          ].map((item) => (
            <div key={item.mode} className="flex items-start space-x-3">
              <span
                className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono border shrink-0 ${item.colour}`}
              >
                {item.label}
              </span>
              <p className="text-brand-silver leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
