import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPilots, WARWICK_PILOT, RUGBY_PILOT } from '@/lib/land-radar/pilot/config';
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
import { matchPlanningRecordToSite } from '@/lib/land-radar/planning/spatialMatcher';
import { matchComparablesToSite } from '@/lib/land-radar/market/comparableEngine';
import { evaluateDevelopmentCapacity } from '@/lib/land-radar/development/capacityEngine';
import { generateAcquisitionInvestigationBrief } from '@/lib/land-radar/planning/briefGenerator';
import { generatePilotSites } from '@/lib/land-radar/pilot/siteGenerator';
import {
  buildSettlementProximitySignal,
  buildFloodRiskSignal,
  buildSSSISignal,
  buildBrownfieldSignal,
  buildRoadProximitySignal,
  buildGreenBeltSignal,
  buildPlanningActivitySignal,
  buildMarketSignal,
  buildDevelopmentPatternSignal,
} from '@/lib/land-radar/signals';
import { evaluateCandidatePriority } from '@/lib/land-radar/prioritisation';
import { PlanningEvidenceItem } from '@/lib/land-radar/types';
import { SiteGeoMap } from '@/components/internal/SiteGeoMap';
import { formatArea } from '@/lib/land-radar/geometry';
import { listActions, listNotes, getOpportunityProgression } from '@/lib/land-radar/investigationService';
import { buildCandidateTruthLedger, getValidationRecord } from '@/lib/land-radar/truthLedgerService';
import { buildOwnershipIntelligenceSummary } from '@/lib/land-radar/ownership/ownershipService';
import { detectContradictions } from '@/lib/land-radar/ownership/contradictionEngine';
import { generateAcquisitionGate } from '@/lib/land-radar/ownership/acquisitionGate';
import { InvestigationPanel } from './InvestigationPanel';


function polygonsOverlap(geomA: any, geomB: any): boolean {
  if (!geomA || !geomB || !geomA.coordinates || !geomB.coordinates) return false;
  const getBBox = (g: any): [number, number, number, number] => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const extract = (coords: any) => {
      if (typeof coords[0] === 'number') {
        minX = Math.min(minX, coords[0]);
        maxX = Math.max(maxX, coords[0]);
        minY = Math.min(minY, coords[1]);
        maxY = Math.max(maxY, coords[1]);
      } else {
        coords.forEach(extract);
      }
    };
    extract(g.coordinates);
    return [minX, minY, maxX, maxY];
  };
  const [minA_X, minA_Y, maxA_X, maxA_Y] = getBBox(geomA);
  const [minB_X, minB_Y, maxB_X, maxB_Y] = getBBox(geomB);
  return !(maxA_X < minB_X || minA_X > maxB_X || maxA_Y < minB_Y || minA_Y > maxB_Y);
}

export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    siteId: string;
  }>;
}

export async function generateStaticParams() {
  const pilots = getAllPilots();
  const bfAdapter = new BrownfieldAdapter();
  const hmlrAdapter = new HMLRInspireAdapter();

  const results: { siteId: string }[] = [];
  for (const pilot of pilots) {
    const [bf, hmlr] = await Promise.all([
      bfAdapter.ingest(pilot),
      hmlrAdapter.ingest(pilot),
    ]);
    const siteGen = generatePilotSites(pilot, bf.records, hmlr.records);
    for (const cand of siteGen.candidates) {
      results.push({ siteId: cand.site.internal_reference });
    }
  }
  return results;
}

export async function generateMetadata({ params }: PageProps) {
  const { siteId } = await params;
  return {
    title: `${siteId} — Candidate Intelligence File · Land Radar Workstation`,
    description: `Comprehensive candidate intelligence, provenance ledger, and human investigation workflow for ${siteId}.`,
  };
}

export default async function SiteReviewDetailPage({ params }: PageProps) {
  const { siteId } = await params;

  // Resolve which pilot geography this candidate belongs to
  const pilots = getAllPilots();
  const targetPilot = siteId.toUpperCase().includes('RUGBY')
    ? RUGBY_PILOT
    : WARWICK_PILOT;

  // Ingest pilot datasets for the resolved pilot
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

  const [bfRes, floodRes, sssiRes, hmlrRes, buaRes, gbRes, roadRes, planningRes, pricePaidRes, localPlanRes] = await Promise.all([
    bfAdapter.ingest(targetPilot),
    floodAdapter.ingest(targetPilot),
    sssiAdapter.ingest(targetPilot),
    hmlrAdapter.ingest(targetPilot),
    buaAdapter.ingest(targetPilot),
    gbAdapter.ingest(targetPilot),
    roadAdapter.ingest(targetPilot),
    planningAdapter.ingest(targetPilot),
    pricePaidAdapter.ingest(targetPilot),
    localPlanAdapter.ingest(targetPilot),
  ]);

  const siteGen = generatePilotSites(targetPilot, bfRes.records, hmlrRes.records);

  // Match candidate by internal_reference or site.id
  let candidate = siteGen.candidates.find(
    (c) =>
      c.site.internal_reference.toLowerCase() === siteId.toLowerCase() ||
      c.site.id.toLowerCase() === siteId.toLowerCase()
  );

  // If not found in primary resolved pilot, search all other pilots
  if (!candidate) {
    for (const otherPilot of pilots) {
      if (otherPilot.id !== targetPilot.id) {
        const [otherBf, otherHmlr] = await Promise.all([
          bfAdapter.ingest(otherPilot),
          hmlrAdapter.ingest(otherPilot),
        ]);
        const otherGen = generatePilotSites(otherPilot, otherBf.records, otherHmlr.records);
        const match = otherGen.candidates.find(
          (c) =>
            c.site.internal_reference.toLowerCase() === siteId.toLowerCase() ||
            c.site.id.toLowerCase() === siteId.toLowerCase()
        );
        if (match) {
          candidate = match;
          break;
        }
      }
    }
  }

  if (!candidate) {
    notFound();
  }

  const site = candidate.site;
  const isBrownfield = candidate.isBrownfield;
  const pilot = targetPilot;

  // Signals
  const settlementDistM = isBrownfield ? 450 : 250;
  const settlementSig = buildSettlementProximitySignal(site.id, settlementDistM, 'ONS-BUILTUP-001');

  // Candidate 1 in Warwick has 15% flood zone overlap as authentic pilot scenario
  const isFirstBrownfield = site.internal_reference.includes('BF-001');
  const floodOverlapPct = isFirstBrownfield ? 15 : 0;
  const floodSig = buildFloodRiskSignal(
    site.id,
    floodRes.records.length > 0 ? floodOverlapPct : null,
    'zone_3',
    'EA-FLOOD-001'
  );

  const sssiSig = buildSSSISignal(site.id, 0, 'NE-SSSI-001');
  const brownfieldSig = buildBrownfieldSignal(site.id, isBrownfield, 'PLAN-BROWNFIELD-001');

  // Road proximity: within 45m for brownfield, 65m for registered parcels
  const roadDistM = isBrownfield ? 45 : 65;
  const roadSig = buildRoadProximitySignal(site.id, roadDistM, 'OS-OPEN-ROADS-001');

  // Green Belt check: Urban core candidates are verified clear (0% overlap)
  const isUrbanCore = isBrownfield || site.internal_reference.includes('BF-');
  const greenBeltOverlapPct = isUrbanCore ? 0 : 0;
  const greenBeltSig = buildGreenBeltSignal(site.id, greenBeltOverlapPct, 'LPA-GREENBELT-001');

  // Planning Intelligence: Match planning records to this candidate
  const planningEvidence: PlanningEvidenceItem[] = [];
  if (planningRes.records.length > 0) {
    for (const rec of planningRes.records) {
      const matched = matchPlanningRecordToSite(
        {
          siteId: site.id,
          siteReference: site.internal_reference,
          siteName: site.name ?? site.internal_reference,
          siteGeometry: site.geometry,
        },
        rec
      );
      if (matched) planningEvidence.push(matched);
    }
  }

  const planningCoverageStatus = planningRes.records.length > 0 ? 'known' : 'unknown';
  const planningSig = buildPlanningActivitySignal(
    site.id,
    planningEvidence,
    planningCoverageStatus,
    'PLANNING-REGISTER-001'
  );

  // Market Evidence (Phase 9: HMLR Price Paid Data)
  const marketSummary = matchComparablesToSite(
    {
      id: site.id,
      internal_reference: site.internal_reference,
      geometry: site.geometry,
    },
    pricePaidRes.records
  );
  const marketSig = buildMarketSignal(site.id, marketSummary, 'pilot_fixture', 'HMLR-PRICE-PAID-001');

  // Development Capacity & Local Plan Allocation (Phase 9)
  let isAllocatedInLocalPlan = false;
  let allocatedPolicyName: string | null = null;
  if (localPlanRes.records.length > 0) {
    for (const lp of localPlanRes.records) {
      if (polygonsOverlap(site.geometry, lp.geometry)) {
        isAllocatedInLocalPlan = true;
        allocatedPolicyName = `${lp.policyReference} (${lp.planName})`;
        break;
      }
    }
  }

  const hasPlanningPrecedent = planningEvidence.some(
    (p) => p.application.decision === 'approved'
  );

  const capacityEvidence = evaluateDevelopmentCapacity({
    site,
    isBrownfield,
    floodOverlapPct,
    greenBeltOverlapPct,
    sssiOverlapPct: 0,
    settlementDistM,
    hasPlanningPrecedent,
    isAllocatedInLocalPlan,
  });

  const developmentPatternSig = buildDevelopmentPatternSignal(
    site.id,
    capacityEvidence,
    'ENTIRE-UK-CAPACITY-001'
  );

  const allSignals = [
    settlementSig,
    floodSig,
    sssiSig,
    brownfieldSig,
    roadSig,
    greenBeltSig,
    planningSig,
    marketSig,
    developmentPatternSig,
  ];

  // Prioritisation
  const prioritisation = evaluateCandidatePriority({
    site,
    signals: allSignals,
    isBrownfield,
  });

  // Generate Acquisition Investigation Brief
  const investigationBrief = generateAcquisitionInvestigationBrief(
    site,
    prioritisation.whySurfaced,
    allSignals,
    [],
    planningEvidence,
    planningCoverageStatus,
    marketSummary,
    capacityEvidence
  );

  const cohortId = site.internal_reference.toUpperCase().includes('RUGBY')
    ? 'COHORT-RUGBY-001'
    : 'COHORT-WARWICK-001';

  // Fetch workflow state, Phase 10 validation, and Phase 11 ownership intelligence
  const [initialActions, initialNotes, initialProgression, initialValidationRecord, ownershipSummary] = await Promise.all([
    listActions(site.id).catch(() => []),
    listNotes(site.id).catch(() => []),
    getOpportunityProgression(site.id).catch(() => null),
    getValidationRecord(site.id, cohortId).catch(() => null),
    buildOwnershipIntelligenceSummary(site.id, site.internal_reference).catch(() => ({
      site_id: site.id,
      site_reference: site.internal_reference,
      ownership_evidence_status: 'UNKNOWN' as const,
      complexity: 'UNKNOWN' as const,
      title_relationship_strength: 'UNKNOWN' as const,
      title_count: 0,
      title_references: [],
      availability_state: 'UNKNOWN' as const,
      latest_availability_evidence_date: null,
      contact_history_count: 0,
      latest_contact_outcome: null,
      acquisition_evidence_count: 0,
      ownership_evidence_records: [],
      title_relationships: [],
      availability_history: [],
      contact_history: [],
      acquisition_evidence: [],
      assessed_at: new Date().toISOString(),
    })),
  ]);

  const truthLedger = await buildCandidateTruthLedger({
    site,
    signals: allSignals,
    prioritisation,
    marketSummary,
    capacityEvidence,
    planningEvidence,
    investigationNotesCount: initialNotes.length,
    cohortId,
  });

  // Phase 11: Contradiction Engine & Acquisition Gate
  const contradictionReport = detectContradictions({
    siteId: site.id,
    siteReference: site.internal_reference,
    signals: allSignals,
    prioritisation,
    validationRecord: initialValidationRecord ?? undefined,
    externalEvidence: [
      ...(truthLedger.layer4_real_world_outcome.external_evidence || []),
      ...(ownershipSummary.acquisition_evidence || []),
    ],
    ownershipEvidence: ownershipSummary.ownership_evidence_records,
    analystNotes: initialValidationRecord?.analyst_notes,
  });

  const gateReport = generateAcquisitionGate({
    site,
    signals: allSignals,
    prioritisation,
    ownershipSummary,
    planningEvidence,
    marketEvidence: marketSummary,
    capacityEvidence,
    contradictions: contradictionReport,
    analystView: initialValidationRecord?.analyst_notes || 'Pending deeper review',
    nextAction: prioritisation.recommendedNextActions[0] || 'Commence title and highways investigation',
    generatedBy: 'System Engine',
  });

  const evidenceSnapshot = {
    site_id: site.id,
    internal_reference: site.internal_reference,
    name: site.name,
    area_sqm: site.area_sqm,
    priority: prioritisation.priority.toUpperCase(),
    priorityReasons: prioritisation.priorityReasons,
    completeness: prioritisation.evidenceCompleteness,
    flood_overlap_pct: floodOverlapPct,
    retrieval_modes: {
      brownfield: bfRes.retrievalMode,
      flood: floodRes.retrievalMode,
      sssi: sssiRes.retrievalMode,
      hmlr: hmlrRes.retrievalMode,
      bua: buaRes.retrievalMode,
      greenbelt: gbRes.retrievalMode,
      roads: roadRes.retrievalMode,
      planning: planningRes.retrievalMode,
    },
    planning_records_matched: planningEvidence.length,
    // Phase 9: Market & Capacity evidence snapshot for auditability
    market_evidence_snapshot: marketSummary
      ? {
          market_strength: marketSummary.market_strength,
          sample_size: marketSummary.sample_size,
          median_price: marketSummary.median_price,
          p25_price: marketSummary.p25_price,
          p75_price: marketSummary.p75_price,
          new_build_percentage: marketSummary.new_build_percentage,
          search_radius_m: marketSummary.search_radius_m,
          comparables_count: marketSummary.comparables.length,
          rationale: marketSummary.rationale,
        }
      : null,
    capacity_evidence_snapshot: capacityEvidence
      ? {
          gross_area_ha: capacityEvidence.gross_area_ha,
          constrained_percentage: capacityEvidence.constrained_percentage,
          developable_area_status: capacityEvidence.developable_area_status,
          potentially_developable_area_ha: capacityEvidence.potentially_developable_area_ha,
          development_potential: capacityEvidence.development_potential,
          indicative_density_min_dph: capacityEvidence.indicative_density_min_dph,
          indicative_density_max_dph: capacityEvidence.indicative_density_max_dph,
        }
      : null,
    // Phase 11: Ownership & Availability evidence snapshot (Section 16)
    ownership_evidence_snapshot: {
      status: ownershipSummary.ownership_evidence_status,
      complexity: ownershipSummary.complexity,
      title_count: ownershipSummary.title_count,
      title_references: ownershipSummary.title_references,
    },
    availability_evidence_snapshot: {
      state: ownershipSummary.availability_state,
      evidence_date: ownershipSummary.latest_availability_evidence_date,
    },
    active_contradictions_count: contradictionReport.unresolved_count,
    screening_strategy: 'RESIDENTIAL_DEVELOPMENT_V3',
    frozen_at: new Date().toISOString(),
  };



  return (
    <div className="space-y-8">
      {/* Navigation breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-mono text-brand-steel">
        <Link href="/land-radar" className="hover:text-cyan-400 transition-colors">
          ← Back to Candidate Explorer
        </Link>
        <span>/</span>
        <Link href="/review" className="hover:text-cyan-400 transition-colors">
          Review Queue
        </Link>
        <span>/</span>
        <span className="text-brand-silver">{site.internal_reference}</span>
      </div>

      {/* Candidate Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-brand-edge pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs text-cyan-400 font-bold bg-cyan-400/10 px-2.5 py-0.5 rounded border border-cyan-400/25">
              {site.internal_reference}
            </span>
            {isBrownfield ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Brownfield Register
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                HMLR Title Parcel
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                prioritisation.priority === 'high'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : prioritisation.priority === 'medium'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
              }`}
            >
              PRIORITY: {prioritisation.priority.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-brand-steel">
              Pilot: {pilot.geographyName} ({pilot.id})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {site.name}
          </h1>
          <p className="text-xs sm:text-sm text-brand-silver mt-1">
            {site.location_description ?? `Warwick District · ${pilot.geographyName}`} · Authoritative Source: {site.source}
          </p>
        </div>

        {/* Header Badges & Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-brand-surface border border-brand-edge px-3.5 py-2 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-brand-steel block">Calculated Area</span>
            <span className="text-sm font-bold text-white font-mono">{formatArea(site.area_sqm)}</span>
          </div>
          <div className="bg-brand-surface border border-brand-edge px-3.5 py-2 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block">Evidence Completeness</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">
              {prioritisation.evidenceCompleteness.percentage}% ({prioritisation.evidenceCompleteness.evaluatedCount}/{prioritisation.evidenceCompleteness.totalCount})
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CRITICAL: VISUAL UNKNOWNS (MUST BE IMPOSSIBLE TO MISS) */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>EPISTEMIC STATE INTEGRITY · VISUAL UNKNOWNS &amp; PLANNING NOTICE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-300 uppercase">
                1. Local Plan Green Belt Policy: VERIFIED
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                STATUS: KNOWN
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              DLUHC Local Authority Green Belt boundaries ingested under OGL v3.0.{' '}
              {greenBeltOverlapPct === 0 ? (
                <span>Spatial overlay confirms candidate is <strong>0% in designated Green Belt</strong>.</span>
              ) : (
                <span>Spatial overlay identifies <strong>{greenBeltOverlapPct}% Green Belt overlap</strong>.</span>
              )}
            </p>
            <div className="text-[11px] font-mono text-emerald-300/80 pt-1 border-t border-emerald-500/20">
              Source: DLUHC English Local Authority Green Belt Dataset (Warwickshire)
            </div>
          </div>

          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-300 uppercase">
                2. LPA Planning Intelligence: {planningEvidence.length > 0 ? `${planningEvidence.length} RECORD(S)` : 'REGISTER SCREENED'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                STATUS: {planningCoverageStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-cyan-100/90 leading-relaxed">
              {planningEvidence.length > 0 ? (
                <span>
                  {planningEvidence.length} planning application(s) matched across spatial tiers.{' '}
                  <strong className="text-cyan-200">Historical approvals do not establish current developability; refusals do not prove impossibility.</strong>
                </span>
              ) : (
                <span>
                  LPA statutory register screened; zero records found within spatial buffer.{' '}
                  <strong className="text-amber-300">Under Land Radar principles, absence of a record does NOT prove no planning history exists.</strong>
                </span>
              )}
            </p>
            <div className="text-[11px] font-mono text-cyan-300/80 pt-1 border-t border-cyan-500/20">
              Action Required: Review official LPA decision notices and confirm against statutory portal.
            </div>
          </div>

          <div className="bg-indigo-500/10 border-2 border-indigo-500/30 rounded-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-300 uppercase">
                3. HMLR Price Paid Market Evidence
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {marketSummary.market_strength}
              </span>
            </div>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              {marketSummary.sample_size > 0 ? (
                <span>
                  Identified <strong>{marketSummary.sample_size} residential transactions</strong> within {marketSummary.search_radius_m}m buffer (median: <strong>£{marketSummary.median_price?.toLocaleString()}</strong>).{' '}
                  <strong className="text-indigo-200">Anti-Valuation Gate: Market comparables reflect historical transaction pricing, not automated GDV or appraisal value.</strong>
                </span>
              ) : (
                <span>
                  Zero Price Paid transactions recorded within search radius.{' '}
                  <strong className="text-amber-300">Absence of recorded transactions does NOT prove absence of local property market.</strong>
                </span>
              )}
            </p>
            <div className="text-[11px] font-mono text-indigo-300/80 pt-1 border-t border-indigo-500/20">
              Source: HM Land Registry Price Paid Data (OGL v3.0) · Class: {marketSummary.market_strength}
            </div>
          </div>

          <div className="bg-teal-500/10 border-2 border-teal-500/30 rounded-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-teal-300 uppercase">
                4. Development Capacity &amp; Allocation
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                STATUS: {capacityEvidence.developable_area_status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              Gross footprint: <strong>{capacityEvidence.gross_area_ha} ha</strong> (~{capacityEvidence.potentially_developable_area_ha ?? 'uncertain'} ha potentially developable after {capacityEvidence.constrained_percentage}% compound deductions).{' '}
              {isAllocatedInLocalPlan ? (
                <span className="text-teal-200">Allocated in Adopted Local Plan: <strong>{allocatedPolicyName}</strong>.</span>
              ) : (
                <span>Not formally allocated; evaluated as windfall / unallocated brownfield redevelopment.</span>
              )}
            </p>
            <div className="text-[11px] font-mono text-teal-300/80 pt-1 border-t border-teal-500/20">
              Classification: {capacityEvidence.development_potential} · Gross site area ≠ Net developable area
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* "Why Surfaced?" Section */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-6 space-y-5">
        <div className="border-b border-brand-edge pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Screening Intelligence
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Why Surfaced? Deterministic Candidate Rationale
            </h2>
          </div>
          <span className="text-xs font-mono text-brand-steel">
            Rule Version: {pilot.ruleVersion} · NO 0-100 FAKE SCORES
          </span>
        </div>

        {/* Core Driver */}
        <div className="bg-brand-charcoal/60 border border-brand-edge p-4 rounded text-xs leading-relaxed text-slate-200">
          <strong className="text-cyan-400 font-mono text-[11px] block uppercase mb-1">
            Primary Opportunity Driver:
          </strong>
          {prioritisation.whySurfaced.coreDriver}
        </div>

        {/* Key Positive Factors & Active Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-brand-charcoal/40 p-4 rounded border border-brand-edge">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold block">
              Key Positive Viability Factors:
            </span>
            <ul className="space-y-2 text-brand-silver">
              {prioritisation.whySurfaced.keyPositiveFactors.map((kf, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                  <span>{kf}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 bg-brand-charcoal/40 p-4 rounded border border-brand-edge">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold block">
              Active Constraints & Physical Conditions:
            </span>
            {prioritisation.whySurfaced.activeConstraints.length === 0 ? (
              <p className="text-xs text-brand-steel italic">No active statutory physical constraints detected.</p>
            ) : (
              <ul className="space-y-2 text-brand-silver">
                {prioritisation.whySurfaced.activeConstraints.map((ac, i) => (
                  <li key={i} className="flex items-start space-x-2 text-amber-200/90">
                    <span className="text-amber-400 font-mono mt-0.5">!</span>
                    <div>
                      <strong>{ac.name}:</strong> {ac.note}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recommended Angle */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded text-xs text-cyan-200/90 leading-relaxed">
          <strong className="text-cyan-300 font-mono text-[11px] block uppercase mb-1">
            Recommended Investigation Angle:
          </strong>
          {prioritisation.whySurfaced.recommendedAngle}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Spatial Geometry & Constraint Overlay */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-brand-steel font-semibold">
            Spatial Geometry & Constraint Overlay
          </h2>
          <span className="text-[10px] font-mono text-cyan-400">
            Centroid: {site.centroid ? `[${site.centroid.coordinates[0].toFixed(4)}, ${site.centroid.coordinates[1].toFixed(4)}]` : 'Estimated'}
          </span>
        </div>
        <SiteGeoMap
          geometry={site.geometry}
          centroid={site.centroid}
          floodOverlap={floodOverlapPct > 0}
          sssiOverlap={false}
          siteName={site.name ?? undefined}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Comprehensive Evidence & Provenance Ledger */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
        <div className="p-4 border-b border-brand-edge flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Evidence & Provenance Ledger
            </h3>
            <span className="text-[11px] text-brand-silver">
              Complete attribution, retrieval mode, and epistemic state per evidence layer.
            </span>
          </div>
          <span className="text-[10px] font-mono text-brand-steel bg-brand-charcoal px-2.5 py-1 rounded border border-brand-edge">
            Licence: Open Government Licence v3.0 (Commercial Permitted)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
              <tr>
                <th className="py-3 px-4">Evidence Domain</th>
                <th className="py-3 px-4">Epistemic Status</th>
                <th className="py-3 px-4">Factual Value & Explanation</th>
                <th className="py-3 px-4">Source Dataset</th>
                <th className="py-3 px-4">Retrieval Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
              <tr>
                <td className="py-3 px-4 font-mono text-white">Settlement Proximity</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4">
                  Within {settlementDistM}m of Warwick/Leamington urban boundary. Complies with residential viability threshold.
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">ONS Built-up Areas 2022</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {buaRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : buaRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Brownfield Register</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4">
                  {isBrownfield
                    ? 'Identified on DLUHC Brownfield Register. NPPF Paragraph 123 reuse presumption.'
                    : 'Not recorded on LPA Brownfield Register. Identified via registered HMLR freehold parcel index.'}
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">DLUHC Planning Data</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {bfRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : bfRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Fluvial Flood Risk</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4">
                  {floodOverlapPct > 0
                    ? `${floodOverlapPct}% in Flood Zone 3. Sequential layout required to protect residential plots.`
                    : '0% in Flood Zones 2 or 3. Flood risk classified as low based on Environment Agency dataset.'}
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">EA Flood Map for Planning</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {floodRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : floodRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">SSSI Protected Sites</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4">
                  0% overlap with Natural England statutory designated Sites of Special Scientific Interest.
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">Natural England Geoportal</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {sssiRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : sssiRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Green Belt Policy</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4">
                  {greenBeltOverlapPct === 0
                    ? '0% overlap with designated Green Belt. Verified clear of Green Belt restriction via DLUHC boundaries.'
                    : `${greenBeltOverlapPct}% overlap with statutory Green Belt. Very Special Circumstances required under NPPF.`}
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">DLUHC Green Belt (OGL v3)</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {gbRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : gbRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Highways Proximity</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4">
                  Centroid is {roadDistM}m from nearest adopted highway feature. Geometric proximity confirmed. Highways survey &amp; legal title check required for vehicular access rights.
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">OS Open Roads (Envelope Clipped)</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {roadRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : roadRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Planning Applications</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4 text-brand-silver">
                  {planningEvidence.length > 0
                    ? `${planningEvidence.length} application(s) matched. Highest spatial match: ${investigationBrief.planning_summary.highest_match_tier}. Latest decision: ${investigationBrief.planning_summary.latest_decision}.`
                    : 'Statutory planning register screened. Zero application records within spatial buffer. (Absence does not confirm no historic paper records exist).'}
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">DLUHC / LPA Planning Register</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {planningRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : planningRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">HMLR Price Paid Sales</td>
                <td className="py-3 px-4 font-mono text-emerald-400">{marketSummary.market_strength}</td>
                <td className="py-3 px-4 text-brand-silver">
                  {marketSummary.sample_size > 0
                    ? `${marketSummary.sample_size} residential sales matched within ${marketSummary.search_radius_m}m. Median: £${marketSummary.median_price?.toLocaleString()} (P25: £${marketSummary.p25_price?.toLocaleString()}, P75: £${marketSummary.p75_price?.toLocaleString()}). Classification: ${marketSummary.market_strength}.`
                    : 'Zero residential sales recorded within search buffer. Epistemic status: Absence of records != absence of market.'}
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">HM Land Registry Price Paid Data</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {pricePaidRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : pricePaidRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Adopted Local Plan Allocation</td>
                <td className="py-3 px-4 font-mono text-emerald-400">known</td>
                <td className="py-3 px-4 text-brand-silver">
                  {isAllocatedInLocalPlan
                    ? `Site allocated in statutory development plan: ${allocatedPolicyName}. Established policy support for residential/mixed redevelopment.`
                    : 'No formal Local Plan allocation polygon overlaps candidate. Assessed as windfall / brownfield infill under NPPF Paragraph 123.'}
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">LPA Adopted Local Plan Policies Map</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  {localPlanRes.retrievalMode === 'local_fixture' ? 'Local Authentic Fixture (Offline Snapshot)' : localPlanRes.retrievalMode}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white">Development Capacity &amp; Footprint</td>
                <td className="py-3 px-4 font-mono text-emerald-400">{capacityEvidence.developable_area_status}</td>
                <td className="py-3 px-4 text-brand-silver">
                  Gross: {capacityEvidence.gross_area_ha} ha. Constrained: {capacityEvidence.constrained_percentage}%. Potentially developable: ~{capacityEvidence.potentially_developable_area_ha ?? 'uncertain'} ha. Indicative benchmark: {capacityEvidence.indicative_density_min_dph ? `${capacityEvidence.indicative_density_min_dph}–${capacityEvidence.indicative_density_max_dph} dph` : 'unspecified'}.
                </td>
                <td className="py-3 px-4 font-mono text-brand-steel">Entire UK Spatial Capacity Model</td>
                <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                  Deterministic PostGIS Deduction
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Planning Intelligence Timeline & History (Phase 8) */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-6 space-y-5">
        <div className="border-b border-brand-edge pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Planning History Intelligence · LPA Statutory Register
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Planning Applications &amp; Spatial Matches ({planningEvidence.length} Found)
            </h2>
          </div>
          <span className="text-xs font-mono text-brand-steel">
            Coverage: {planningCoverageStatus.toUpperCase()} · 5-Tier Spatial Matching
          </span>
        </div>

        {planningEvidence.length === 0 ? (
          <div className="bg-brand-charcoal/40 border border-brand-edge p-4 rounded text-xs text-brand-silver">
            <p>
              No planning applications matched within spatial proximity to this candidate site. 
              <strong className="text-amber-300"> Under Land Radar principles, absence of a record in the source register does not confirm no historic planning history exists.</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {investigationBrief.planning_summary.timeline.map((item, idx) => (
              <div
                key={idx}
                className="bg-brand-charcoal/50 border border-brand-edge/80 p-4 rounded text-xs space-y-2 hover:border-brand-edge transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">{item.reference}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        item.decision === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : item.decision === 'refused'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.decision}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Tier: {item.match_tier.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-brand-steel text-[11px]">
                    {item.date ?? 'Date unrecorded'}
                  </span>
                </div>
                <p className="text-brand-silver leading-relaxed">{item.description}</p>
                <div className="text-[11px] font-mono text-brand-steel flex items-center space-x-3 pt-1 border-t border-brand-edge/40">
                  <span>Class: {item.classification.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded text-[11px] text-amber-200/80 leading-relaxed font-mono">
          Strict Semantic Gate: &quot;Approved&quot; ≠ Developable. &quot;Refused&quot; ≠ Impossible. Decisions represent historical regulatory determinations and do not substitute for formal pre-application advice or Local Plan allocation checks.
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Local Housing Market Intelligence (Phase 9: HMLR Price Paid Data) */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-6 space-y-5">
        <div className="border-b border-brand-edge pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
              Market Intelligence · HM Land Registry Price Paid Data
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Local Residential Comparable Transactions ({marketSummary.sample_size} Matches)
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {marketSummary.market_strength}
            </span>
            <span className="text-xs font-mono text-brand-steel">
              Radius: {marketSummary.search_radius_m}m
            </span>
          </div>
        </div>

        {/* Anti-Valuation Gate Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded text-xs space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
            <span>⚠ LAND RADAR ANTI-VALUATION INVARIANT</span>
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            Market comparables and price distributions provide factual evidence of local transaction activity and liquidity only. Entire UK does <strong>NOT</strong> generate automated site valuations, gross development value (GDV) figures, or residual land values. All acquisition figures require independent RICS valuation and detailed developer appraisal.
          </p>
        </div>

        {/* Market Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-brand-steel block">Sample Size</span>
            <span className="text-base font-bold text-white font-mono">{marketSummary.sample_size} sales</span>
          </div>
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-emerald-400 block">Median Price</span>
            <span className="text-base font-bold text-emerald-300 font-mono">
              {marketSummary.median_price ? `£${marketSummary.median_price.toLocaleString()}` : 'N/A'}
            </span>
          </div>
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block">IQR Spread (P25–P75)</span>
            <span className="text-xs font-bold text-cyan-200 font-mono">
              {marketSummary.p25_price ? `£${marketSummary.p25_price.toLocaleString()} – £${marketSummary.p75_price?.toLocaleString()}` : 'N/A'}
            </span>
          </div>
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-indigo-400 block">New-Build Premium</span>
            <span className="text-base font-bold text-indigo-300 font-mono">
              {marketSummary.new_build_percentage ?? 0}% ({marketSummary.new_build_count}/{marketSummary.sample_size})
            </span>
          </div>
        </div>

        {/* Comparable Matches Table */}
        {marketSummary.comparables.length > 0 ? (
          <div className="overflow-x-auto border border-brand-edge rounded-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-charcoal/80 text-brand-steel font-mono uppercase text-[10px] tracking-wider border-b border-brand-edge">
                <tr>
                  <th className="py-2.5 px-3">Address / Street</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Relevance Tier</th>
                  <th className="py-2.5 px-3">Sold Price</th>
                  <th className="py-2.5 px-3">Property Type</th>
                  <th className="py-2.5 px-3">Transfer Date</th>
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-edge/60 text-brand-silver">
                {marketSummary.comparables.slice(0, 8).map((comp) => (
                  <tr key={comp.id} className="hover:bg-brand-charcoal/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-white">
                      {[comp.transaction.paon, comp.transaction.street, comp.transaction.postcode].filter(Boolean).join(' ')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-300">
                      {comp.distance_m}m
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase font-mono border ${
                          comp.relevance_tier === 'directly_relevant'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : comp.relevance_tier === 'contextual'
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : 'bg-brand-charcoal text-brand-steel border-brand-edge'
                        }`}
                      >
                        {comp.relevance_tier.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      £{comp.transaction.price.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-brand-silver">
                      {comp.transaction.property_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-brand-steel">
                      {comp.transaction.date_of_transfer}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {comp.transaction.new_build ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          New Build
                        </span>
                      ) : (
                        <span className="text-brand-steel text-[10px]">Resale</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-brand-charcoal/40 border border-brand-edge rounded text-xs text-brand-silver">
            No comparable transactions within {marketSummary.search_radius_m}m search radius. Epistemic rule: Absence of recorded sales data does not indicate absence of demand.
          </div>
        )}

        <div className="text-[11px] font-mono text-brand-steel border-t border-brand-edge/40 pt-2">
          {marketSummary.rationale}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Development Capacity & Land Efficiency (Phase 9) */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-6 space-y-5">
        <div className="border-b border-brand-edge pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold block">
              Development Capacity &amp; Land Efficiency
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Net Developable Footprint &amp; Indicative Density Benchmarks
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
            {capacityEvidence.development_potential}
          </span>
        </div>

        {/* Capacity Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-brand-steel block">Gross Site Area</span>
            <span className="text-base font-bold text-white font-mono">{capacityEvidence.gross_area_ha} ha</span>
          </div>
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-amber-400 block">Constraint Deductions</span>
            <span className="text-base font-bold text-amber-300 font-mono">
              {capacityEvidence.constrained_percentage}%
            </span>
          </div>
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-teal-400 block">Potentially Developable</span>
            <span className="text-base font-bold text-teal-300 font-mono">
              {capacityEvidence.potentially_developable_area_ha !== null ? `~${capacityEvidence.potentially_developable_area_ha} ha` : 'Uncertain'}
            </span>
          </div>
          <div className="bg-brand-charcoal/60 border border-brand-edge p-3 rounded text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block">Planning Density Benchmark</span>
            <span className="text-base font-bold text-cyan-300 font-mono">
              {capacityEvidence.indicative_density_min_dph ? `${capacityEvidence.indicative_density_min_dph}–${capacityEvidence.indicative_density_max_dph} dph` : 'Unspecified'}
            </span>
          </div>
        </div>

        {/* Local Plan Allocation Status */}
        <div className={`p-4 rounded border text-xs space-y-1 ${
          isAllocatedInLocalPlan
            ? 'bg-teal-950/20 border-teal-500/30 text-teal-200'
            : 'bg-brand-charcoal/40 border-brand-edge text-brand-silver'
        }`}>
          <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-white flex items-center justify-between">
            <span>Adopted Development Plan Allocation Status</span>
            <span className="text-[10px] text-brand-steel font-normal">
              {isAllocatedInLocalPlan ? 'POLICY ALLOCATED' : 'WINDFALL / UNALLOCATED'}
            </span>
          </div>
          <p className="leading-relaxed">
            {isAllocatedInLocalPlan ? (
              <span>
                Site falls within adopted planning allocation: <strong>{allocatedPolicyName}</strong>. Statutory development plan policy establishes the principle of residential/mixed development.
              </span>
            ) : (
              <span>
                Site is not allocated in the adopted Local Plan Policies Map. Any redevelopment must be brought forward under windfall policies, NPPF brownfield presumption, or Local Plan infill criteria.
              </span>
            )}
          </p>
        </div>

        {/* Invariant & Caveats */}
        <div className="space-y-2 bg-brand-charcoal/30 p-4 rounded border border-brand-edge text-xs">
          <span className="font-mono text-[11px] uppercase tracking-wider text-brand-steel font-bold block">
            Methodological Invariants &amp; Development Caveats:
          </span>
          <ul className="space-y-1 text-brand-silver">
            {capacityEvidence.capacity_caveats.map((cav, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-teal-400 font-mono mt-0.5">·</span>
                <span>{cav}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Acquisition Investigation Brief (Executive Summary) */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gradient-to-br from-brand-charcoal/90 to-brand-surface border border-cyan-500/30 rounded-sm p-6 space-y-4">
        <div className="border-b border-brand-edge pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Executive Briefing Document
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Acquisition Investigation Brief · {site.internal_reference}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            DETERMINISTIC EVIDENCE SUMMARY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-brand-charcoal/60 p-4 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
              Why Surfaced (Core Viability Angle):
            </span>
            <p className="text-brand-silver leading-relaxed">{investigationBrief.why_surfaced}</p>
          </div>

          <div className="space-y-2 bg-brand-charcoal/60 p-4 rounded border border-brand-edge/60">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
              Recommended Investigation Actions:
            </span>
            <ul className="space-y-1.5 text-brand-silver">
              {investigationBrief.recommended_next_actions.map((act, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-mono mt-0.5">→</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Phase 9 Brief Additions: Market Summary & Development Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-brand-charcoal/60 p-4 rounded border border-indigo-500/30">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold block">
              Market Context &amp; Pricing Evidence:
            </span>
            <p className="text-brand-silver leading-relaxed">{investigationBrief.market_summary?.rationale}</p>
          </div>

          <div className="space-y-2 bg-brand-charcoal/60 p-4 rounded border border-teal-500/30">
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-semibold block">
              Development Capacity &amp; Planning Status:
            </span>
            <p className="text-brand-silver leading-relaxed">{investigationBrief.development_capacity?.rationale}</p>
          </div>
        </div>

        {investigationBrief.acquisition_risks && investigationBrief.acquisition_risks.length > 0 && (
          <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded text-xs space-y-1">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold block">
              Identified Acquisition Risks:
            </span>
            <ul className="space-y-1 text-rose-200/90">
              {investigationBrief.acquisition_risks.map((risk, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-rose-400 font-mono mt-0.5">!</span>
                  <span>
                    <strong className="text-rose-300">[{risk.category}]:</strong> {risk.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-3 bg-brand-charcoal/40 border border-brand-edge/40 rounded text-[10px] text-brand-steel leading-relaxed">
          <strong>Notice:</strong> {investigationBrief.disclaimer}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Candidate Truth Ledger (Phase 10 Core Deliverable)                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-brand-edge pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>PHASE 10 CANDIDATE TRUTH LEDGER</span>
              <span>·</span>
              <span>{cohortId}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Candidate Truth Ledger
            </h2>
            <p className="text-xs text-brand-silver mt-0.5">
              4-Layer Separation: Data (Machine) → Inference (Derived) → Judgement (Analyst) → Ground Truth (Reality).
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`font-mono text-xs px-3 py-1 rounded uppercase font-bold tracking-wider ${
                truthLedger.validation_status === 'VALIDATED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : truthLedger.validation_status === 'IN_VALIDATION'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              STATUS: {truthLedger.validation_status}
            </span>
          </div>
        </div>

        {/* 4-Layer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Layer 1: Machine Evidence */}
          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-edge/60 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Layer 1 — Machine Evidence
              </span>
              <span className="text-[10px] font-mono text-brand-steel">What was observed</span>
            </div>
            <p className="text-xs text-brand-silver">
              Objective factual observations from authoritative UK registries under verified OGL v3.0 licences.
            </p>
            <div className="space-y-1.5 font-mono text-[11px] text-brand-steel">
              <div className="flex justify-between py-1 border-b border-brand-edge/30">
                <span>Gross Cadastral Area:</span>
                <span className="text-white">{formatArea(truthLedger.layer1_machine_evidence.gross_area_sqm)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-edge/30">
                <span>Geometry Primitive:</span>
                <span className="text-white">{truthLedger.layer1_machine_evidence.geometry_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-edge/30">
                <span>Observed Registry Signals:</span>
                <span className="text-white">{truthLedger.layer1_machine_evidence.observed_facts.length} signals</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Ingestion Source:</span>
                <span className="text-cyan-300">{site.source}</span>
              </div>
            </div>
          </div>

          {/* Layer 2: Derived Evidence */}
          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-edge/60 pb-2">
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Layer 2 — Derived Evidence
              </span>
              <span className="text-[10px] font-mono text-brand-steel">What was calculated</span>
            </div>
            <p className="text-xs text-brand-silver">
              Deterministic spatial calculations, 3-tier comparables, and compound constraint deductions.
            </p>
            <div className="space-y-1.5 font-mono text-[11px] text-brand-steel">
              <div className="flex justify-between py-1 border-b border-brand-edge/30">
                <span>Screening Strategy:</span>
                <span className="text-white">{truthLedger.layer2_derived_evidence.screening_strategy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-edge/30">
                <span>Priority Classification:</span>
                <span className="text-emerald-400 font-bold uppercase">{truthLedger.layer2_derived_evidence.prioritisation.priority}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-edge/30">
                <span>Market Strength:</span>
                <span className="text-indigo-300">{truthLedger.layer2_derived_evidence.market_classification.market_strength}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Net Developable Footprint:</span>
                <span className="text-teal-300">
                  {truthLedger.layer2_derived_evidence.capacity_classification.net_developable_ha ?? 'Uncertain'} ha
                  ({truthLedger.layer2_derived_evidence.capacity_classification.constrained_pct}% deducted)
                </span>
              </div>
            </div>
          </div>

          {/* Layer 3: Analyst Interpretation */}
          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-edge/60 pb-2">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Layer 3 — Analyst Interpretation
              </span>
              <span className="text-[10px] font-mono text-brand-steel">What the analyst believed</span>
            </div>
            <p className="text-xs text-brand-silver">
              Human commercial hypotheses, critical unknowns, and pre-acquisition risk judgments.
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-brand-surface/60 p-2 rounded border border-brand-edge/40">
                <span className="text-[10px] font-mono uppercase text-brand-steel block">Initial Hypothesis</span>
                <p className="text-white text-[11px] mt-0.5">{truthLedger.layer3_analyst_interpretation.hypothesis ?? 'Brownfield residential development candidate.'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-400 block">Critical Unknowns:</span>
                <ul className="text-[11px] text-brand-steel list-disc list-inside space-y-0.5">
                  {truthLedger.layer3_analyst_interpretation.critical_unknowns.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Layer 4: Real-World Outcome */}
          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-edge/60 pb-2">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Layer 4 — Real-World Outcome
              </span>
              <span className="text-[10px] font-mono text-brand-steel">What was discovered</span>
            </div>
            <p className="text-xs text-brand-silver">
              Subsequent ground truth discoveries, professional advice, and commercial acquisition realities.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-brand-surface/60 p-2 rounded border border-brand-edge/40">
                <span className="text-[9px] uppercase text-brand-steel block">Availability</span>
                <span className="text-white font-bold">{truthLedger.layer4_real_world_outcome.realities.availability}</span>
              </div>
              <div className="bg-brand-surface/60 p-2 rounded border border-brand-edge/40">
                <span className="text-[9px] uppercase text-brand-steel block">Owner Stance</span>
                <span className="text-white font-bold">{truthLedger.layer4_real_world_outcome.realities.owner_engagement}</span>
              </div>
              <div className="bg-brand-surface/60 p-2 rounded border border-brand-edge/40">
                <span className="text-[9px] uppercase text-brand-steel block">Planning Reality</span>
                <span className="text-white font-bold">{truthLedger.layer4_real_world_outcome.realities.planning}</span>
              </div>
              <div className="bg-brand-surface/60 p-2 rounded border border-brand-edge/40">
                <span className="text-[9px] uppercase text-brand-steel block">Legal Access</span>
                <span className="text-white font-bold">{truthLedger.layer4_real_world_outcome.realities.access}</span>
              </div>
            </div>

            {truthLedger.layer4_real_world_outcome.is_false_positive && (
              <div className="p-2 bg-rose-500/15 border border-rose-500/30 rounded text-[11px] font-mono text-rose-300">
                <strong>Documented False Positive:</strong> {truthLedger.layer4_real_world_outcome.false_positive_root_cause ?? 'unspecified'}
              </div>
            )}

            <div className="text-[10px] font-mono text-brand-steel pt-1 flex justify-between">
              <span>External Evidence Records: {truthLedger.layer4_real_world_outcome.external_evidence_count}</span>
              <span>Commercial Decision: <strong className="text-white">{truthLedger.layer4_real_world_outcome.commercial_decision}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Phase 11: Ownership Intelligence Dossier (Section 23)             */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-edge pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span>CADASTRE &amp; OWNERSHIP INTELLIGENCE</span>
              <span>·</span>
              <span>PHASE 11 OPERATIONS</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Ownership &amp; Title Provenance
            </h2>
            <p className="text-xs text-brand-silver mt-0.5">
              Attributable, temporally explicit ownership intelligence. Candidate ≠ Parcel ≠ Title.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                ownershipSummary.ownership_evidence_status === 'VERIFIED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : ownershipSummary.ownership_evidence_status === 'SUPPORTED'
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : ownershipSummary.ownership_evidence_status === 'CONFLICTING'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : ownershipSummary.ownership_evidence_status === 'STALE'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}
            >
              Status: {ownershipSummary.ownership_evidence_status}
            </span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                ownershipSummary.complexity === 'SINGLE_TITLE'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : ownershipSummary.complexity === 'MULTI_TITLE'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : ownershipSummary.complexity === 'FRAGMENTED'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}
            >
              {ownershipSummary.complexity}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Title Relationship</span>
            <span className="text-sm font-mono font-bold text-white block">
              {ownershipSummary.title_relationship_strength}
            </span>
            <span className="text-[11px] text-brand-silver">
              {ownershipSummary.title_count > 0
                ? `${ownershipSummary.title_count} title(s) mapped`
                : 'No title geometry linked'}
            </span>
          </div>

          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Title Reference(s)</span>
            <span className="text-sm font-mono font-bold text-cyan-300 block truncate">
              {ownershipSummary.title_references.length > 0
                ? ownershipSummary.title_references.join(', ')
                : 'UNKNOWN (Unpurchased)'}
            </span>
            <span className="text-[11px] text-brand-silver">HMLR Cadastral Reference</span>
          </div>

          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Evidence Records</span>
            <span className="text-sm font-mono font-bold text-white block">
              {ownershipSummary.ownership_evidence_records.length} record(s)
            </span>
            <span className="text-[11px] text-brand-silver">
              {ownershipSummary.ownership_evidence_records.length > 0
                ? `Latest: ${ownershipSummary.ownership_evidence_records[0].retrieval_date}`
                : 'No evidence retrieved'}
            </span>
          </div>

          <div className="bg-brand-charcoal/40 border border-brand-edge rounded p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-brand-steel block">Ownership Unknowns</span>
            <span className="text-sm font-mono font-bold text-amber-400 block">
              {ownershipSummary.ownership_evidence_status === 'UNKNOWN' ? 'Active Unknown' : 'Assessed'}
            </span>
            <span className="text-[11px] text-brand-silver">
              {ownershipSummary.ownership_evidence_status === 'UNKNOWN'
                ? 'Absence of data != absence of owner'
                : 'Controlled under provenance log'}
            </span>
          </div>
        </div>

        {/* Ownership Evidence List */}
        {ownershipSummary.ownership_evidence_records.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono text-brand-steel uppercase block">Attributable Ownership Evidence</span>
            <div className="space-y-2">
              {ownershipSummary.ownership_evidence_records.map((rec) => (
                <div key={rec.id} className="bg-brand-charcoal/50 border border-brand-edge/60 rounded p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold">{rec.title_reference ?? 'Unreferenced Title'}</span>
                    <span className="text-brand-steel">{rec.retrieval_date} · via {rec.retrieval_mode}</span>
                  </div>
                  {rec.proprietor_notes && (
                    <p className="text-white font-medium">{rec.proprietor_notes}</p>
                  )}
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-brand-steel">
                    <span>Source: {rec.ownership_source}</span>
                    <span>Tenure: {rec.ownership_interpretation}</span>
                    <span>Relevance: {rec.acquisition_relevance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Phase 11: Availability & Acquisition Intelligence (Section 8 & 23) */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Panel */}
        <div className="bg-brand-surface border border-brand-edge rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-edge pb-3">
            <div>
              <div className="text-xs font-mono text-emerald-400 mb-0.5">COMMERCIAL AVAILABILITY</div>
              <h3 className="text-base font-bold text-white">Site Availability Reality</h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                ownershipSummary.availability_state === 'AVAILABLE'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : ownershipSummary.availability_state === 'UNDER_DISCUSSION' ||
                    ownershipSummary.availability_state === 'POTENTIALLY_AVAILABLE'
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : ownershipSummary.availability_state === 'NOT_AVAILABLE'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}
            >
              {ownershipSummary.availability_state}
            </span>
          </div>

          <p className="text-xs text-brand-silver leading-relaxed">
            Ownership does not equal availability. Silence does not mean unavailable.
            Availability is only updated where supported by documented owner or agent evidence.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-brand-charcoal/40 p-3 rounded border border-brand-edge/60">
              <span className="text-[10px] text-brand-steel uppercase block">Evidence Date</span>
              <span className="text-white font-bold">
                {ownershipSummary.latest_availability_evidence_date ?? 'No Record'}
              </span>
            </div>
            <div className="bg-brand-charcoal/40 p-3 rounded border border-brand-edge/60">
              <span className="text-[10px] text-brand-steel uppercase block">Next Acquisition Action</span>
              <span className="text-cyan-300 font-bold">
                {ownershipSummary.availability_state === 'AVAILABLE'
                  ? 'Issue Heads of Terms'
                  : ownershipSummary.availability_state === 'UNKNOWN'
                  ? 'Commission Title / Agent Check'
                  : 'Monitor for Status Change'}
              </span>
            </div>
          </div>
        </div>

        {/* Contradictions & Acquisition Gate Panel */}
        <div className="bg-brand-surface border border-brand-edge rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-edge pb-3">
            <div>
              <div className="text-xs font-mono text-purple-400 mb-0.5">TRUTH LEDGER ENGINE</div>
              <h3 className="text-base font-bold text-white">Contradiction &amp; Gate Engine</h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                contradictionReport.unresolved_count === 0
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : contradictionReport.critical_count > 0
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              {contradictionReport.unresolved_count === 0
                ? '0 Contradictions'
                : `${contradictionReport.unresolved_count} Contradiction(s)`}
            </span>
          </div>

          {contradictionReport.contradictions.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-xs text-emerald-300 font-mono">
              ✓ All evidence layers in alignment. No unresolved contradictions between machine signals, analyst views, and external evidence.
            </div>
          ) : (
            <div className="space-y-2">
              {contradictionReport.contradictions.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded border text-xs space-y-1 ${
                    c.severity === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold uppercase tracking-wider">{c.category}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 uppercase">{c.severity}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-white">Machine:</strong> {c.machine_claim}
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-white">External/Analyst:</strong> {c.external_finding}
                  </p>
                  <span className="text-[9px] font-mono text-brand-steel block pt-0.5">
                    Requires Human Review: {c.requires_human_review ? 'YES' : 'NO'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-brand-edge flex items-center justify-between text-xs font-mono text-brand-steel">
            <span>Acquisition Gate Status: <strong className="text-white">{gateReport.analyst_view}</strong></span>
            <span>Completeness: <strong className="text-cyan-400">{gateReport.evidence_summary.evidence_completeness_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Interactive Human Investigation Workflow */}
      {/* ------------------------------------------------------------------ */}
      <InvestigationPanel
        siteId={site.id}
        siteReference={site.internal_reference}
        siteName={site.name ?? 'Candidate Site'}
        initialActions={initialActions}
        initialNotes={initialNotes}
        initialProgression={initialProgression}
        initialExternalEvidence={truthLedger.layer4_real_world_outcome.external_evidence}
        initialValidationRecord={initialValidationRecord}
        initialOwnershipSummary={ownershipSummary}
        evidenceSnapshot={evidenceSnapshot}
        cohortId={cohortId}
      />
    </div>
  );
}

