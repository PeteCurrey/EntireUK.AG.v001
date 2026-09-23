import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPilots, WARWICK_PILOT, RUGBY_PILOT } from '@/lib/land-radar/pilot/config';
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
import { buildOwnershipIntelligenceSummary } from '@/lib/land-radar/ownership/ownershipService';
import { detectContradictions } from '@/lib/land-radar/ownership/contradictionEngine';
import { generateAcquisitionGate } from '@/lib/land-radar/ownership/acquisitionGate';
import { evaluateDeterministicNextAction } from '@/lib/land-radar/acquisitions/nextActionEngine';
import { generateEvidenceChecklist } from '@/lib/land-radar/acquisitions/checklistEngine';
import {
  listContactAttempts,
  listContradictionResolutions,
  getUnifiedCandidateTimeline,
} from '@/lib/land-radar/acquisitions/acquisitionService';
import { getCurrentOutcomeState, VALID_TRANSITIONS } from '@/lib/land-radar/outcomeService';
import { AcquisitionWorkbench } from './AcquisitionWorkbench';
import { BrownfieldAdapter } from '@/lib/land-radar/adapters/brownfieldAdapter';
import { HMLRInspireAdapter } from '@/lib/land-radar/adapters/hmlrInspireAdapter';
import { evaluateDevelopmentCapacity } from '@/lib/land-radar/development/capacityEngine';
import { MarketEvidenceSummary, Site, SiteSignal, CreateSignalInput, AcquisitionOutcomeState } from '@/lib/land-radar/types';
import { ArrowLeft, Compass } from 'lucide-react';

interface PageProps {
  params: Promise<{
    siteId: string;
  }>;
}

export async function generateStaticParams() {
  const bfAdapter = new BrownfieldAdapter();
  const hmlrAdapter = new HMLRInspireAdapter();

  const [warwickBf, warwickHmlr, rugbyBf, rugbyHmlr] = await Promise.all([
    bfAdapter.ingest(WARWICK_PILOT),
    hmlrAdapter.ingest(WARWICK_PILOT),
    bfAdapter.ingest(RUGBY_PILOT),
    hmlrAdapter.ingest(RUGBY_PILOT),
  ]);

  const warwickGen = generatePilotSites(WARWICK_PILOT, warwickBf.records, warwickHmlr.records);
  const rugbyGen = generatePilotSites(RUGBY_PILOT, rugbyBf.records, rugbyHmlr.records);
  const all = [...warwickGen.candidates, ...rugbyGen.candidates];

  return all.map((c) => ({
    siteId: c.site.internal_reference,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { siteId } = await params;
  return {
    title: `${siteId} — Acquisition Operations Workbench · Entire UK`,
    description: `Attributable acquisition due diligence and opportunity execution for ${siteId}.`,
  };
}

export default async function AcquisitionCandidatePage({ params }: PageProps) {
  const { siteId } = await params;

  // Search across pilot candidates
  const bfAdapter = new BrownfieldAdapter();
  const hmlrAdapter = new HMLRInspireAdapter();

  const [warwickBf, warwickHmlr, rugbyBf, rugbyHmlr] = await Promise.all([
    bfAdapter.ingest(WARWICK_PILOT),
    hmlrAdapter.ingest(WARWICK_PILOT),
    bfAdapter.ingest(RUGBY_PILOT),
    hmlrAdapter.ingest(RUGBY_PILOT),
  ]);

  const warwickGen = generatePilotSites(WARWICK_PILOT, warwickBf.records, warwickHmlr.records);
  const rugbyGen = generatePilotSites(RUGBY_PILOT, rugbyBf.records, rugbyHmlr.records);
  const allCandidates = [...warwickGen.candidates, ...rugbyGen.candidates];

  const cand = allCandidates.find(
    (c) => c.site.id === siteId || c.site.internal_reference.toLowerCase() === siteId.toLowerCase()
  );

  if (!cand) {
    notFound();
  }

  const site = cand.site;
  const isBrownfield = cand.isBrownfield;

  // Retrieve async operational foundations
  const [
    ownershipSummary,
    contacts,
    resolutions,
    currentLifecycle,
    timeline,
  ] = await Promise.all([
    buildOwnershipIntelligenceSummary(site.id, site.internal_reference),
    listContactAttempts(site.id),
    listContradictionResolutions(site.id),
    getCurrentOutcomeState(site.id),
    getUnifiedCandidateTimeline(site.id),
  ]);

  const lifecycleStage: AcquisitionOutcomeState = currentLifecycle || 'SURFACED';
  const validTransitions = VALID_TRANSITIONS[lifecycleStage] || [];

  // Generate standard spatial signals
  const settlementDistM = isBrownfield ? 450 : 250;
  const settlementSig = buildSettlementProximitySignal(site.id, settlementDistM, 'ONS-BUILTUP-001');
  const floodSig = buildFloodRiskSignal(site.id, 0, 'zone_3', 'EA-FLOOD-001');
  const sssiSig = buildSSSISignal(site.id, 0, 'NE-SSSI-001');
  const brownfieldSig = buildBrownfieldSignal(site.id, isBrownfield, 'PLAN-BROWNFIELD-001');
  const roadSig = buildRoadProximitySignal(site.id, isBrownfield ? 45 : 65, 'OS-OPEN-ROADS-001');
  const greenBeltSig = buildGreenBeltSignal(site.id, 0, 'LPA-GREENBELT-001');
  const planningSig = buildPlanningActivitySignal(site.id, [], 'unknown', 'PLANNING-REGISTER-001');

  const marketSummary: MarketEvidenceSummary = {
    sample_size: 0,
    directly_relevant_count: 0,
    contextual_count: 0,
    median_price: null,
    p25_price: null,
    p75_price: null,
    min_price: null,
    max_price: null,
    new_build_count: 0,
    new_build_percentage: null,
    property_type_distribution: { detached: 0, semi_detached: 0, terraced: 0, flat: 0, other: 0 },
    search_radius_m: 1000,
    observation_period_months: 24,
    earliest_transaction_date: null,
    latest_transaction_date: null,
    market_strength: 'INSUFFICIENT_MARKET_EVIDENCE',
    rationale: 'Baseline sector assumption without comps',
    comparables: [],
  };
  const marketSig = buildMarketSignal(site.id, marketSummary, 'pilot_fixture', 'HMLR-PRICE-PAID-001');

  const capacityEvidence = evaluateDevelopmentCapacity({
    site,
    isBrownfield,
    floodOverlapPct: 0,
    greenBeltOverlapPct: 0,
    sssiOverlapPct: 0,
    settlementDistM,
    hasPlanningPrecedent: false,
    isAllocatedInLocalPlan: false,
  });
  const developmentPatternSig = buildDevelopmentPatternSignal(site.id, capacityEvidence, 'ENTIRE-UK-CAPACITY-001');

  const signals: Array<SiteSignal | CreateSignalInput> = [
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

  const prioritisation = evaluateCandidatePriority({
    site,
    signals,
    isBrownfield,
  });

  const contradictionReport = detectContradictions({
    siteId: site.id,
    siteReference: site.internal_reference,
    signals,
    prioritisation,
    ownershipEvidence: ownershipSummary.ownership_evidence_records,
  });

  // Mark resolved contradictions
  for (const contra of contradictionReport.contradictions) {
    const match = resolutions.find((r) => r.contradiction_id === contra.id);
    if (match && match.resolution_status === 'RESOLVED') {
      contra.resolved = true;
      contra.resolution_notes = match.resolution_rationale;
    }
  }

  // Evaluate Deterministic Next Action
  const nextAction = evaluateDeterministicNextAction({
    site,
    lifecycleStage,
    ownershipSummary,
    signals,
    contradictions: contradictionReport,
    contactHistory: contacts,
  });

  // Generate Evidence Checklist
  const checklist = generateEvidenceChecklist({
    site,
    lifecycleStage,
    ownershipSummary,
    signals,
    contradictions: contradictionReport,
    contactHistory: contacts,
    marketEvidence: marketSummary,
    capacityEvidence,
  });

  // Evaluate Acquisition Gate
  const gateReport = generateAcquisitionGate({
    site,
    signals,
    prioritisation,
    ownershipSummary,
    contradictions: contradictionReport,
    analystView: nextAction.code === 'COMPLETE_ACQUISITION_GATE' ? 'Ready for Acquisition Gate' : 'Operational Diligence Pending',
    nextAction: nextAction.label,
    generatedBy: 'analyst@entire-uk.com',
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/acquisitions"
          className="inline-flex items-center gap-1.5 text-xs text-brand-silver hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Operations Queue</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/review/${site.internal_reference}`}
            className="text-xs text-brand-silver hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>Screening File</span>
            <span>↗</span>
          </Link>
          <span className="text-brand-steel">·</span>
          <Link
            href="/land-radar"
            className="text-xs text-brand-silver hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Map Workstation</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Workbench */}
      <AcquisitionWorkbench
        site={site}
        lifecycleStage={lifecycleStage}
        nextAction={nextAction}
        gateReport={gateReport}
        checklist={checklist}
        ownershipSummary={ownershipSummary}
        contradictions={contradictionReport.contradictions}
        contacts={contacts}
        timeline={timeline}
        validTransitions={validTransitions}
      />
    </div>
  );
}
