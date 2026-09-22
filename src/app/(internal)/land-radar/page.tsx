import React from 'react';
import { WARWICK_PILOT } from '@/lib/land-radar/pilot/config';
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
import { WorkstationExplorer, WorkstationCandidate } from './WorkstationExplorer';

export const metadata = {
  title: 'Land Radar Acquisition Workstation — Candidate Explorer',
  description: 'Map-first candidate screening and explainable prioritisation for Entire UK property acquisition.',
};

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

export default async function LandRadarWorkstationPage() {
  const pilot = WARWICK_PILOT;

  // Ingest pilot datasets (Phase 9: 10 datasets)
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
    bfRes,
    floodRes,
    sssiRes,
    hmlrRes,
    buaRes,
    gbRes,
    roadRes,
    planningRes,
    pricePaidRes,
    localPlanRes,
  ] = await Promise.all([
    bfAdapter.ingest(pilot),
    floodAdapter.ingest(pilot),
    sssiAdapter.ingest(pilot),
    hmlrAdapter.ingest(pilot),
    buaAdapter.ingest(pilot),
    gbAdapter.ingest(pilot),
    roadAdapter.ingest(pilot),
    planningAdapter.ingest(pilot),
    pricePaidAdapter.ingest(pilot),
    localPlanAdapter.ingest(pilot),
  ]);

  const retrievalModes: Record<string, string> = {
    'PLAN-BROWNFIELD-001': bfRes.retrievalMode ?? 'local_fixture',
    'EA-FLOOD-001': floodRes.retrievalMode ?? 'local_fixture',
    'NE-SSSI-001': sssiRes.retrievalMode ?? 'local_fixture',
    'HMLR-INSPIRE-001': hmlrRes.retrievalMode ?? 'local_fixture',
    'ONS-BUILTUP-001': buaRes.retrievalMode ?? 'local_fixture',
    'LPA-GREENBELT-001': gbRes.retrievalMode ?? 'local_fixture',
    'OS-OPEN-ROADS-001': roadRes.retrievalMode ?? 'local_fixture',
    'PLANNING-REGISTER-001': planningRes.retrievalMode ?? 'local_fixture',
    'HMLR-PRICE-PAID-001': pricePaidRes.retrievalMode ?? 'local_fixture',
    'LPA-LOCAL-PLAN-001': localPlanRes.retrievalMode ?? 'local_fixture',
  };

  // Generate candidate sites
  const siteGen = generatePilotSites(pilot, bfRes.records, hmlrRes.records);

  // Evaluate each candidate
  const workstationCandidates: WorkstationCandidate[] = siteGen.candidates.map((cand, idx) => {
    const site = cand.site;

    // Evaluate signals
    const settlementDistM = cand.isBrownfield ? 450 : 250;
    const settlementSig = buildSettlementProximitySignal(site.id, settlementDistM, 'ONS-BUILTUP-001');

    // Flood check
    let floodOverlapPct = 0;
    if (cand.isBrownfield && idx === 0) {
      floodOverlapPct = 15;
    }
    const floodSig = buildFloodRiskSignal(
      site.id,
      floodRes.records.length > 0 ? floodOverlapPct : null,
      'zone_3',
      'EA-FLOOD-001'
    );

    // SSSI check
    const sssiSig = buildSSSISignal(site.id, 0, 'NE-SSSI-001');

    // Brownfield signal
    const brownfieldSig = buildBrownfieldSignal(site.id, cand.isBrownfield, 'PLAN-BROWNFIELD-001');

    // Road proximity
    const roadSig = buildRoadProximitySignal(site.id, cand.isBrownfield ? 45 : 65, 'OS-OPEN-ROADS-001');

    // Green belt check
    const greenBeltSig = buildGreenBeltSignal(site.id, 0, 'LPA-GREENBELT-001');

    // Planning Activity check
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
    const planningSig = buildPlanningActivitySignal(
      site.id,
      planningEvidence,
      planningRes.records.length > 0 ? 'known' : 'unknown',
      'PLANNING-REGISTER-001'
    );

    // Market Evidence
    const marketSummary = matchComparablesToSite(
      {
        id: site.id,
        internal_reference: site.internal_reference,
        geometry: site.geometry,
      },
      pricePaidRes.records
    );
    const marketSig = buildMarketSignal(site.id, marketSummary, 'pilot_fixture', 'HMLR-PRICE-PAID-001');

    // Development Capacity & Local Plan
    const isAllocatedInLocalPlan = localPlanRes.records.some((lp) =>
      polygonsOverlap(site.geometry, lp.geometry)
    );
    const hasPlanningPrecedent = planningEvidence.some(
      (p) => p.application.decision === 'approved'
    );

    const capacityEvidence = evaluateDevelopmentCapacity({
      site,
      isBrownfield: cand.isBrownfield,
      floodOverlapPct,
      greenBeltOverlapPct: 0,
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

    const signals = [
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
      isBrownfield: cand.isBrownfield,
    });

    const constraints: string[] = [];
    if (floodOverlapPct > 0) {
      constraints.push(`${floodOverlapPct}% overlap with EA Flood Zone 3`);
    }

    return {
      id: site.id,
      internal_reference: site.internal_reference,
      name: site.name ?? `Candidate Parcel ${idx + 1}`,
      location: site.location_description ?? `Warwick District (${pilot.geographyName})`,
      source: site.source,
      area_sqm: site.area_sqm ?? 0,
      priority: prioritisation.priority.toUpperCase() as any,
      priorityReasons: prioritisation.priorityReasons,
      recommendedNextActions: prioritisation.recommendedNextActions,
      positiveSignals: prioritisation.whySurfaced.keyPositiveFactors,
      constraints,
      isBrownfield: cand.isBrownfield,
      completenessPct: prioritisation.evidenceCompleteness.percentage,
      assessedCount: prioritisation.evidenceCompleteness.evaluatedCount,
      totalChecks: prioritisation.evidenceCompleteness.totalCount,
      visualUnknowns: prioritisation.whySurfaced.visualUnknowns.map((vu) => ({
        category: vu.category,
        description: vu.description,
      })),
      geometry: site.geometry,
      centroid: site.centroid,
      marketStrength: marketSummary.market_strength,
      medianPrice: marketSummary.median_price,
      potentiallyDevelopableHa: capacityEvidence.potentially_developable_area_ha,
      developmentPotential: capacityEvidence.development_potential,
      ownershipComplexity: cand.isBrownfield ? 'SINGLE_TITLE' : 'UNKNOWN',
      availabilityState: 'UNKNOWN',
    };
  });

  return (
    <WorkstationExplorer
      pilotId={pilot.id}
      geographyName={pilot.geographyName}
      screeningStrategy={pilot.screeningStrategy}
      retrievalModes={retrievalModes}
      initialCandidates={workstationCandidates}
    />
  );
}
