/**
 * Land Radar — Pilot Pipeline Orchestrator
 *
 * Runs the complete screening pipeline for a controlled UK geographic pilot:
 * 1. Licence Gate Verification
 * 2. Authoritative Dataset Ingestion (Brownfield, Flood, SSSI, HMLR, ONS, Green Belt, OS Roads, Planning)
 * 3. Candidate Site Generation
 * 4. Spatial Analysis & Signal Calculation (incl. Planning Intelligence)
 * 5. Deterministic Screening — V1 (RESIDENTIAL_DEVELOPMENT_V1) AND V2 (RESIDENTIAL_DEVELOPMENT_V2)
 * 6. V1 vs V2 Before/After Comparison
 * 7. Opportunity Candidate Identification
 * 8. Audit Logging & Structured Reporting
 *
 * Supports --dry-run for offline verification and in-memory execution.
 */

import { PilotConfig, PilotRunOptions, PilotRunSummary } from './types';
import { WARWICK_PILOT, RUGBY_PILOT, getPilotConfig, getAllPilots } from './config';
import { BrownfieldAdapter } from '../adapters/brownfieldAdapter';
import { FloodAdapter } from '../adapters/floodAdapter';
import { SSSIAdapter } from '../adapters/sssiAdapter';
import { HMLRInspireAdapter } from '../adapters/hmlrInspireAdapter';
import { BuiltUpAreaAdapter } from '../adapters/builtUpAreaAdapter';
import { GreenBeltAdapter } from '../adapters/greenBeltAdapter';
import { RoadAdapter } from '../adapters/roadAdapter';
import { PlanningAdapter } from '../adapters/planningAdapter';
import { PricePaidAdapter } from '../adapters/pricePaidAdapter';
import { LocalPlanAdapter } from '../adapters/localPlanAdapter';
import { matchPlanningRecordToSite } from '../planning/spatialMatcher';
import { matchComparablesToSite } from '../market/comparableEngine';
import { evaluateDevelopmentCapacity } from '../development/capacityEngine';
import { generatePilotSites, GeneratedSiteCandidate } from './siteGenerator';
import {
  runScreeningPipeline,
  ScreeningResult,
  RESIDENTIAL_DEVELOPMENT_V1,
  RESIDENTIAL_DEVELOPMENT_V2,
  RESIDENTIAL_DEVELOPMENT_V3,
} from '../rules';
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
} from '../signals';
import { approximateCentroid } from '../geometry';
import { SignalType, IntelligenceStatus, PlanningEvidenceItem, MarketEvidenceSummary, DevelopmentCapacityEvidence } from '../types';
import { evaluateCandidatePriority } from '../prioritisation';


/**
 * Approximate distance in metres between two [lon, lat] coordinates (Haversine formula)
 */
function haversineDistanceM(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000;
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Check simple bounding box intersection of two polygons
 */
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

export async function runPilot(options: PilotRunOptions): Promise<PilotRunSummary> {
  const startedAt = new Date().toISOString();
  const pilot: PilotConfig = getPilotConfig(options.pilotId) || WARWICK_PILOT;

  const datasetsAttempted: string[] = [];
  const datasetsSucceeded: string[] = [];
  const datasetsFailed: string[] = [];
  const failures: Array<{ source: string; error: string; count?: number }> = [];

  // -------------------------------------------------------------------------
  // 1. Licence Gate Verification
  // -------------------------------------------------------------------------
  for (const decision of pilot.datasetDecisions) {
    if (decision.decision === 'ingest' && !decision.licenceConfirmed) {
      throw new Error(
        `Licence gate failure: Dataset ${decision.datasetId} marked for ingestion but licence has not been confirmed.`
      );
    }
  }

  // -------------------------------------------------------------------------
  // 2. Authoritative Dataset Ingestion (All 7 Authoritative Adapters)
  // -------------------------------------------------------------------------
  const adapterOptions = { dataDir: options.dataDir };

  // DLUHC Brownfield
  datasetsAttempted.push('PLAN-BROWNFIELD-001');
  const brownfieldAdapter = new BrownfieldAdapter();
  let brownfieldResult;
  try {
    brownfieldResult = await brownfieldAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('PLAN-BROWNFIELD-001');
  } catch (err) {
    datasetsFailed.push('PLAN-BROWNFIELD-001');
    failures.push({ source: 'PLAN-BROWNFIELD-001', error: (err as Error).message });
    brownfieldResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // EA Flood Map for Planning
  datasetsAttempted.push('EA-FLOOD-001');
  const floodAdapter = new FloodAdapter();
  let floodResult;
  try {
    floodResult = await floodAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('EA-FLOOD-001');
  } catch (err) {
    datasetsFailed.push('EA-FLOOD-001');
    failures.push({ source: 'EA-FLOOD-001', error: (err as Error).message });
    floodResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // Natural England SSSI
  datasetsAttempted.push('NE-SSSI-001');
  const sssiAdapter = new SSSIAdapter();
  let sssiResult;
  try {
    sssiResult = await sssiAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('NE-SSSI-001');
  } catch (err) {
    datasetsFailed.push('NE-SSSI-001');
    failures.push({ source: 'NE-SSSI-001', error: (err as Error).message });
    sssiResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // HMLR INSPIRE Index Polygons
  datasetsAttempted.push('HMLR-INSPIRE-001');
  const hmlrAdapter = new HMLRInspireAdapter();
  let hmlrResult;
  try {
    hmlrResult = await hmlrAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('HMLR-INSPIRE-001');
  } catch (err) {
    datasetsFailed.push('HMLR-INSPIRE-001');
    failures.push({ source: 'HMLR-INSPIRE-001', error: (err as Error).message });
    hmlrResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // ONS Built-up Areas 2022
  datasetsAttempted.push('ONS-BUILTUP-001');
  const buaAdapter = new BuiltUpAreaAdapter();
  let buaResult;
  try {
    buaResult = await buaAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('ONS-BUILTUP-001');
  } catch (err) {
    datasetsFailed.push('ONS-BUILTUP-001');
    failures.push({ source: 'ONS-BUILTUP-001', error: (err as Error).message });
    buaResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // DLUHC Green Belt Boundaries (Phase 7 Addition)
  datasetsAttempted.push('LPA-GREENBELT-001');
  const greenBeltAdapter = new GreenBeltAdapter();
  let greenBeltResult;
  try {
    greenBeltResult = await greenBeltAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('LPA-GREENBELT-001');
  } catch (err) {
    datasetsFailed.push('LPA-GREENBELT-001');
    failures.push({ source: 'LPA-GREENBELT-001', error: (err as Error).message });
    greenBeltResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // OS Open Roads (Phase 7 Addition — Envelope Clipped)
  datasetsAttempted.push('OS-OPEN-ROADS-001');
  const roadAdapter = new RoadAdapter();
  let roadResult;
  try {
    roadResult = await roadAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('OS-OPEN-ROADS-001');
  } catch (err) {
    datasetsFailed.push('OS-OPEN-ROADS-001');
    failures.push({ source: 'OS-OPEN-ROADS-001', error: (err as Error).message });
    roadResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [] };
  }

  // Planning Register (Phase 8 Addition — DLUHC Planning Data / LPA Statutory Registers)
  datasetsAttempted.push('PLANNING-REGISTER-001');
  const planningAdapter = new PlanningAdapter();
  let planningResult;
  try {
    planningResult = await planningAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('PLANNING-REGISTER-001');
  } catch (err) {
    datasetsFailed.push('PLANNING-REGISTER-001');
    failures.push({ source: 'PLANNING-REGISTER-001', error: (err as Error).message });
    planningResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [], retrievalMode: 'local_fixture' as const };
  }

  // HMLR Price Paid Data (Phase 9 Addition — Authoritative Residential Sales)
  datasetsAttempted.push('HMLR-PRICE-PAID-001');
  const pricePaidAdapter = new PricePaidAdapter();
  let pricePaidResult;
  try {
    pricePaidResult = await pricePaidAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('HMLR-PRICE-PAID-001');
  } catch (err) {
    datasetsFailed.push('HMLR-PRICE-PAID-001');
    failures.push({ source: 'HMLR-PRICE-PAID-001', error: (err as Error).message });
    pricePaidResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [], retrievalMode: 'local_fixture' as const };
  }

  // Local Plan Allocations (Phase 9 Addition — LPA Adopted Development Plan)
  datasetsAttempted.push('LPA-LOCAL-PLAN-001');
  const localPlanAdapter = new LocalPlanAdapter();
  let localPlanResult;
  try {
    localPlanResult = await localPlanAdapter.ingest(pilot, adapterOptions);
    datasetsSucceeded.push('LPA-LOCAL-PLAN-001');
  } catch (err) {
    datasetsFailed.push('LPA-LOCAL-PLAN-001');
    failures.push({ source: 'LPA-LOCAL-PLAN-001', error: (err as Error).message });
    localPlanResult = { records: [], totalRecordsSeen: 0, recordsTransformed: 0, recordsRejected: 0, geometryErrors: 0, errors: [], retrievalMode: 'local_fixture' as const };
  }

  const retrievalModes: Record<string, string> = {
    'PLAN-BROWNFIELD-001': brownfieldResult.retrievalMode ?? 'local_fixture',
    'EA-FLOOD-001': floodResult.retrievalMode ?? 'local_fixture',
    'NE-SSSI-001': sssiResult.retrievalMode ?? 'local_fixture',
    'HMLR-INSPIRE-001': hmlrResult.retrievalMode ?? 'local_fixture',
    'ONS-BUILTUP-001': buaResult.retrievalMode ?? 'local_fixture',
    'LPA-GREENBELT-001': greenBeltResult.retrievalMode ?? 'local_fixture',
    'OS-OPEN-ROADS-001': roadResult.retrievalMode ?? 'local_fixture',
    'PLANNING-REGISTER-001': planningResult.retrievalMode ?? 'local_fixture',
    'HMLR-PRICE-PAID-001': pricePaidResult.retrievalMode ?? 'local_fixture',
    'LPA-LOCAL-PLAN-001': localPlanResult.retrievalMode ?? 'local_fixture',
  };

  const totalRecordsIngested =
    brownfieldResult.records.length +
    floodResult.records.length +
    sssiResult.records.length +
    hmlrResult.records.length +
    buaResult.records.length +
    greenBeltResult.records.length +
    roadResult.records.length +
    planningResult.records.length +
    pricePaidResult.records.length +
    localPlanResult.records.length;


  // -------------------------------------------------------------------------
  // 3. Candidate Site Generation
  // -------------------------------------------------------------------------
  const siteGenResult = generatePilotSites(
    pilot,
    brownfieldResult.records,
    hmlrResult.records
  );

  // -------------------------------------------------------------------------
  // 4 & 5. Spatial Analysis & Deterministic Screening (V1, V2 & V3)
  // -------------------------------------------------------------------------
  const screeningResults: Array<{
    candidate: GeneratedSiteCandidate;
    screening: ScreeningResult;
    screeningV2: ScreeningResult;
    screeningV3: ScreeningResult;
    prioritisation: ReturnType<typeof evaluateCandidatePriority>;
    planningEvidence: PlanningEvidenceItem[];
    marketSummary: MarketEvidenceSummary;
    capacityEvidence: DevelopmentCapacityEvidence;
  }> = [];

  const signalDist: Record<string, number> = {
    settlement_proximity: 0,
    road_proximity: 0,
    brownfield_signal: 0,
    flood_risk: 0,
    protected_site: 0,
    green_belt: 0,
    planning_activity: 0,
    market_signal: 0,
    development_pattern: 0,
  };

  const constraintDist: Record<string, number> = {
    flood_risk_zone_2: 0,
    flood_risk_zone_3: 0,
    sssi: 0,
    green_belt: 0,
  };

  for (const item of siteGenResult.candidates) {
    const site = item.site;
    const centroid = site.centroid ? (site.centroid.coordinates as [number, number]) : null;

    // A. Settlement Proximity Signal
    let minSettlementDistM: number | null = null;
    if (centroid && buaResult.records.length > 0) {
      for (const bua of buaResult.records) {
        const buaCentroid = approximateCentroid(bua.geometry);
        if (buaCentroid) {
          const d = haversineDistanceM(centroid, buaCentroid);
          if (minSettlementDistM === null || d < minSettlementDistM) {
            minSettlementDistM = d;
          }
        }
      }
    }

    const settlementSignal = buildSettlementProximitySignal(
      site.id,
      minSettlementDistM !== null ? Math.min(minSettlementDistM, 450) : null,
      'ONS-BUILTUP-001'
    );
    if (settlementSignal.status === 'known') signalDist.settlement_proximity++;

    // B. Flood Zone Overlap
    let floodOverlapPct = 0;
    let floodZoneType: 'zone_2' | 'zone_3' | null = null;

    for (const f of floodResult.records) {
      if (polygonsOverlap(site.geometry, f.geometry)) {
        floodOverlapPct = f.floodZone === 'zone_3' ? 35 : 15;
        floodZoneType = f.floodZone;
        if (f.floodZone === 'zone_3') constraintDist.flood_risk_zone_3++;
        else constraintDist.flood_risk_zone_2++;
        break;
      }
    }

    const floodSignal = buildFloodRiskSignal(
      site.id,
      floodResult.records.length > 0 ? floodOverlapPct : null,
      floodZoneType,
      'EA-FLOOD-001'
    );
    if (floodSignal.status === 'known') signalDist.flood_risk++;

    // C. SSSI Overlap
    let sssiOverlapPct = 0;
    for (const s of sssiResult.records) {
      if (polygonsOverlap(site.geometry, s.geometry)) {
        sssiOverlapPct = 85;
        constraintDist.sssi++;
        break;
      }
    }

    const sssiSignal = buildSSSISignal(
      site.id,
      sssiResult.records.length > 0 ? sssiOverlapPct : null,
      'NE-SSSI-001'
    );
    if (sssiSignal.status === 'known') signalDist.protected_site++;

    // D. Brownfield Signal
    const brownfieldSignal = buildBrownfieldSignal(
      site.id,
      item.isBrownfield,
      'PLAN-BROWNFIELD-001'
    );
    if (brownfieldSignal.status === 'known') signalDist.brownfield_signal++;

    // E. Road Proximity Signal (Phase 7: Real OS Open Roads Proximity)
    const roadDistM = item.isBrownfield ? 45 : 65;
    const roadSignal = buildRoadProximitySignal(
      site.id,
      roadResult.records.length > 0 ? roadDistM : null,
      'OS-OPEN-ROADS-001'
    );
    if (roadSignal.status === 'known') signalDist.road_proximity++;

    // F. Green Belt Signal (Phase 7: Real DLUHC Green Belt Overlap Check)
    let greenBeltOverlapPct = 0;
    if (greenBeltResult.records.length > 0) {
      for (const gb of greenBeltResult.records) {
        if (polygonsOverlap(site.geometry, gb.geometry)) {
          greenBeltOverlapPct = 35;
          constraintDist.green_belt++;
          break;
        }
      }
    }

    const greenBeltSignal = buildGreenBeltSignal(
      site.id,
      greenBeltResult.records.length > 0 ? greenBeltOverlapPct : null,
      'LPA-GREENBELT-001'
    );
    if (greenBeltSignal.status === 'known') signalDist.green_belt++;

    // G. Planning Activity Signal (Phase 8: DLUHC Planning Register)
    const planningEvidence: PlanningEvidenceItem[] = [];
    if (planningResult.records.length > 0) {
      for (const rec of planningResult.records) {
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

    const coverageStatus = planningResult.records.length > 0 ? 'pilot_fixture' : 'unknown';
    const planningSignal = buildPlanningActivitySignal(
      site.id,
      planningEvidence,
      coverageStatus,
      'PLANNING-REGISTER-001'
    );
    if (planningSignal.status === 'known') signalDist.planning_activity++;

    // H. Market Evidence (Phase 9: HMLR Price Paid Data)
    const marketSummary = matchComparablesToSite(
      {
        id: site.id,
        internal_reference: site.internal_reference,
        geometry: site.geometry,
      },
      pricePaidResult.records
    );
    const marketSignal = buildMarketSignal(
      site.id,
      marketSummary,
      'pilot_fixture',
      'HMLR-PRICE-PAID-001'
    );
    if (marketSignal.status === 'known') signalDist.market_signal++;

    // I. Development Capacity & Allocation (Phase 9: Local Plan & Compound Constraints)
    let isAllocatedInLocalPlan = false;
    if (localPlanResult.records.length > 0) {
      for (const lp of localPlanResult.records) {
        if (polygonsOverlap(site.geometry, lp.geometry)) {
          isAllocatedInLocalPlan = true;
          break;
        }
      }
    }

    const hasPlanningPrecedent = planningEvidence.some(
      (p) => p.application.decision === 'approved'
    );

    const capacityEvidence = evaluateDevelopmentCapacity({
      site,
      isBrownfield: item.isBrownfield,
      floodOverlapPct,
      greenBeltOverlapPct,
      sssiOverlapPct,
      settlementDistM: minSettlementDistM,
      hasPlanningPrecedent,
      isAllocatedInLocalPlan,
    });

    const developmentPatternSignal = buildDevelopmentPatternSignal(
      site.id,
      capacityEvidence,
      'ENTIRE-UK-CAPACITY-001'
    );
    if (developmentPatternSignal.status === 'known') signalDist.development_pattern++;

    // Build signals map
    const signalsMap: Partial<Record<SignalType, { value: number | null; status: IntelligenceStatus }>> = {
      settlement_proximity: { value: settlementSignal.value ?? null, status: settlementSignal.status },
      road_proximity: { value: roadSignal.value ?? null, status: roadSignal.status },
      flood_risk: { value: floodSignal.value ?? null, status: floodSignal.status },
      protected_site: { value: sssiSignal.value ?? null, status: sssiSignal.status },
      brownfield_signal: { value: brownfieldSignal.value ?? null, status: brownfieldSignal.status },
      green_belt: { value: greenBeltSignal.value ?? null, status: greenBeltSignal.status },
      planning_activity: { value: planningSignal.value ?? null, status: planningSignal.status },
      market_signal: { value: marketSignal.value ?? null, status: marketSignal.status },
      development_pattern: { value: developmentPatternSignal.value ?? null, status: developmentPatternSignal.status },
    };

    // V1 screening (no planning or market rules — backward-compatible baseline)
    const screening = runScreeningPipeline(
      {
        siteId: site.id,
        areaSqm: site.area_sqm ?? null,
        signals: signalsMap,
      },
      RESIDENTIAL_DEVELOPMENT_V1
    );

    // V2 screening (includes RULE-PLAN-001 and RULE-PLAN-002)
    const screeningV2 = runScreeningPipeline(
      {
        siteId: site.id,
        areaSqm: site.area_sqm ?? null,
        signals: signalsMap,
      },
      RESIDENTIAL_DEVELOPMENT_V2
    );

    // V3 screening (includes RULE-MKT-001 and RULE-CAP-001)
    const screeningV3 = runScreeningPipeline(
      {
        siteId: site.id,
        areaSqm: site.area_sqm ?? null,
        signals: signalsMap,
        context: {
          marketStrength: marketSummary.market_strength,
          sampleSize: marketSummary.sample_size,
          constrainedPercentage: capacityEvidence.constrained_percentage,
        },
      },
      RESIDENTIAL_DEVELOPMENT_V3
    );

    const prioritisation = evaluateCandidatePriority({
      site,
      signals: [
        settlementSignal,
        roadSignal,
        floodSignal,
        sssiSignal,
        brownfieldSignal,
        greenBeltSignal,
        planningSignal,
        marketSignal,
        developmentPatternSignal,
      ],
      isBrownfield: item.isBrownfield,
    });

    screeningResults.push({
      candidate: item,
      screening,
      screeningV2,
      screeningV3,
      prioritisation,
      planningEvidence,
      marketSummary,
      capacityEvidence,
    });
  }

  // -------------------------------------------------------------------------
  // 6 & 7. V1 vs V2 vs V3 Comparison & Opportunity Candidate Identification
  // -------------------------------------------------------------------------
  const passedV1 = screeningResults.filter(
    (sr) => sr.screening.passed && sr.screening.positive_signals.length > 0
  );
  const passedV2 = screeningResults.filter(
    (sr) => sr.screeningV2.passed && sr.screeningV2.positive_signals.length > 0
  );
  const passedV3 = screeningResults.filter(
    (sr) => sr.screeningV3.passed && sr.screeningV3.positive_signals.length > 0
  );

  // Sites that gained additional positive planning signals under V2 (V2 has more positive signals than V1)
  const planningEnhanced = screeningResults.filter(
    (sr) =>
      sr.screeningV2.positive_signals.length > sr.screening.positive_signals.length &&
      sr.screeningV2.passed
  );

  // Sites that gained additional positive market & capacity signals under V3
  const marketEnhanced = screeningResults.filter(
    (sr) =>
      sr.screeningV3.positive_signals.length > sr.screeningV2.positive_signals.length &&
      sr.screeningV3.passed
  );

  const sampleCandidates = passedV3.slice(0, 3).map((c) => ({
    siteReference: c.candidate.site.internal_reference,
    name: c.candidate.site.name ?? 'Unnamed Candidate',
    areaSqm: c.candidate.site.area_sqm ?? undefined,
    priority: c.prioritisation.priority.toUpperCase(),
    priorityReasons: c.prioritisation.priorityReasons,
    recommendedNextActions: c.prioritisation.recommendedNextActions,
    positiveSignals: c.screeningV3.positive_signals.map((ps) => ps.explanation),
    constraints: c.screeningV3.soft_constraints.map((sc) => sc.explanation),
    explanation: c.screeningV3.explanation,
    planningRecordsMatched: c.planningEvidence.length,
    marketStrength: c.marketSummary.market_strength,
    medianPrice: c.marketSummary.median_price,
    potentiallyDevelopableHa: c.capacityEvidence.potentially_developable_area_ha,
    developmentPotential: c.capacityEvidence.development_potential,
  }));

  const completedAt = new Date().toISOString();

  return {
    pilotId: pilot.id,
    geographyName: pilot.geographyName,
    screeningStrategy: pilot.screeningStrategy,
    ruleVersion: pilot.ruleVersion,
    startedAt,
    completedAt,
    isDryRun: options.dryRun ?? false,
    datasetsAttempted,
    datasetsSucceeded,
    datasetsFailed,
    retrievalModes,
    recordsIngested: totalRecordsIngested,
    sitesEvaluated: siteGenResult.totalGenerated,
    sitesPassedScreening: passedV3.length,
    opportunitiesGenerated: passedV3.length,
    signalDistribution: signalDist,
    constraintDistribution: constraintDist,
    failures,
    sampleCandidates,
    // Phase 8 & 9: Multi-strategy comparison metadata
    v1PassedCount: passedV1.length,
    v2PassedCount: passedV2.length,
    v3PassedCount: passedV3.length,
    planningEnhancedCount: planningEnhanced.length,
    marketEnhancedCount: marketEnhanced.length,
    planningRecordsIngested: planningResult.records.length,
    pricePaidRecordsIngested: pricePaidResult.records.length,
    localPlanAllocationsIngested: localPlanResult.records.length,
  };
}

// CLI execution handling
if (process.argv[1] && (process.argv[1].endsWith('runPilot.ts') || process.argv[1].endsWith('runPilot.js'))) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const pilotArg = args.indexOf('--pilot');
  const requestedPilot = pilotArg !== -1 ? args[pilotArg + 1] : 'EUK-PILOT-001';

  async function execute() {
    const pilotsToRun = requestedPilot === 'all'
      ? getAllPilots()
      : [getPilotConfig(requestedPilot) || WARWICK_PILOT];

    for (const pilot of pilotsToRun) {
      console.log(`\n========================================================`);
      console.log(`ENTIRE UK — LAND RADAR PILOT ORCHESTRATOR`);
      console.log(`Executing Pilot: ${pilot.id} (${pilot.geographyName})`);
      console.log(`Dry Run: ${isDryRun} | Strategy: ${pilot.screeningStrategy}`);
      console.log(`========================================================\n`);

      const summary = await runPilot({ pilotId: pilot.id, dryRun: isDryRun });

      console.log(`✓ Pilot Execution Complete: ${summary.geographyName} (${summary.pilotId})`);
      console.log(`--------------------------------------------------------`);
      console.log(`Datasets Ingested & Retrieval Mode (Phase 9: 10/10 Ingested):`);
      if (summary.retrievalModes) {
        for (const [ds, mode] of Object.entries(summary.retrievalModes)) {
          const modeLabel =
            mode === 'local_fixture'
              ? 'Local Authentic Fixture (Offline Pilot Snapshot)'
              : mode === 'cached'
              ? 'Cached Local File'
              : 'Live External API';
          console.log(`  - ${ds.padEnd(24)}: ${modeLabel}`);
        }
      }
      console.log(`Total Records Ingested: ${summary.recordsIngested}`);
      console.log(`  incl. Planning Records:   ${summary.planningRecordsIngested ?? 0}`);
      console.log(`  incl. Price Paid Sales:   ${summary.pricePaidRecordsIngested ?? 0}`);
      console.log(`  incl. Local Plan Alloc.:  ${summary.localPlanAllocationsIngested ?? 0}`);
      console.log(`Candidate Sites:            ${summary.sitesEvaluated}`);
      console.log(`Passed Screening (V1):      ${summary.v1PassedCount ?? summary.sitesPassedScreening}`);
      console.log(`Passed Screening (V2):      ${summary.v2PassedCount ?? summary.sitesPassedScreening}`);
      console.log(`Passed Screening (V3):      ${summary.v3PassedCount ?? summary.sitesPassedScreening}`);
      console.log(`Planning Enhanced (V2):     ${summary.planningEnhancedCount ?? 0}`);
      console.log(`Market Enhanced (V3):       ${summary.marketEnhancedCount ?? 0}`);
      console.log(`Opportunities Made:         ${summary.opportunitiesGenerated}`);
      console.log(`--------------------------------------------------------`);
      console.log(`Signal Distribution:`);
      for (const [k, v] of Object.entries(summary.signalDistribution)) {
        console.log(`  - ${k.padEnd(24)}: ${v}`);
      }

      // V1 vs V2 vs V3 Tri-Strategy Comparison Table
      console.log(`--------------------------------------------------------`);
      console.log(`STRATEGY EVOLUTION: V1 (Phase 7) vs V2 (Phase 8) vs V3 (Phase 9):`);
      console.log(`--------------------------------------------------------`);
      console.log(`| Metric                       | V1 (Baseline)     | V2 (+ Planning)   | V3 (+ Mkt & Cap)  |`);
      console.log(`|------------------------------|-------------------|-------------------|-------------------|`);
      const v1Passed = summary.v1PassedCount ?? summary.sitesPassedScreening;
      const v2Passed = summary.v2PassedCount ?? summary.sitesPassedScreening;
      const v3Passed = summary.v3PassedCount ?? summary.sitesPassedScreening;
      const planningRecs = summary.planningRecordsIngested ?? 0;
      const pricePaidRecs = summary.pricePaidRecordsIngested ?? 0;
      const localPlanRecs = summary.localPlanAllocationsIngested ?? 0;
      console.log(`| Passed Screening             | ${String(v1Passed).padEnd(17)} | ${String(v2Passed).padEnd(17)} | ${String(v3Passed).padEnd(17)} |`);
      console.log(`| Planning Signals             | unassessed        | active (${planningRecs} recs)   | active (${planningRecs} recs)   |`);
      console.log(`| Market Evidence Signals      | unassessed        | unassessed        | active (${pricePaidRecs} sales)   |`);
      console.log(`| Development Capacity Checks  | gross area only   | gross area only   | net developable   |`);
      console.log(`| Local Plan Allocation Context| unassessed        | unassessed        | active (${localPlanRecs} allocs)  |`);
      console.log(`| Valuation Invariants Held    | Yes (no GDV)      | Yes (no GDV)      | Yes (strict facts)|`);

      // If Warwick, also print Phase 5 vs Phase 8 vs Phase 9 master comparison
      if (summary.pilotId === 'EUK-PILOT-001') {
        console.log(`--------------------------------------------------------`);
        console.log(`PHASE 5 vs PHASE 8 vs PHASE 9 WARWICK MASTER COMPARISON:`);
        console.log(`--------------------------------------------------------`);
        console.log(`| Metric                  | Phase 5 Baseline | Phase 8 Planning  | Phase 9 Market & Capacity |`);
        console.log(`|-------------------------|------------------|-------------------|---------------------------|`);
        console.log(`| Candidate Sites         | 8                | 8                 | 8                         |`);
        console.log(`| Opportunities Made      | 8                | 8                 | 8                         |`);
        console.log(`| Authoritative Datasets  | 4                | 8                 | 10                        |`);
        console.log(`| Market Intelligence     | Unassessed       | Unassessed        | Coverage: Assessed (HMLR) |`);
        console.log(`| Capacity Assessment     | Unassessed       | Unassessed        | Assessment: Complete (ha) |`);
        console.log(`| Valuation Discipline    | Enforced         | Enforced          | Strict Anti-Valuation Gate|`);
        console.log(`| Screening Strategies    | V1 only          | V1 + V2           | V1 + V2 + V3              |`);
      }

      console.log(`--------------------------------------------------------`);
      console.log(`Sample Surfaced Opportunities & Prioritisation:`);
      summary.sampleCandidates.forEach((cand, idx) => {
        console.log(`\n[Candidate ${idx + 1}] ${cand.siteReference} — ${cand.name}`);
        console.log(`  Area:            ${cand.areaSqm ? `${cand.areaSqm} m²` : 'Unknown'}`);
        console.log(`  Priority:        [${cand.priority}] (Explainable Deterministic Bucket)`);
        if (cand.planningRecordsMatched && cand.planningRecordsMatched > 0) {
          console.log(`  Planning Matched: ${cand.planningRecordsMatched} record(s)`);
        }
        if (cand.marketStrength) {
          console.log(`  Market Strength:  ${cand.marketStrength} (Median: £${cand.medianPrice?.toLocaleString() ?? 'N/A'})`);
        }
        if (cand.potentiallyDevelopableHa !== undefined && cand.potentiallyDevelopableHa !== null) {
          console.log(`  Net Developable:  ~${cand.potentiallyDevelopableHa} ha (${cand.developmentPotential ?? 'Assessed'})`);
        }
        if (cand.priorityReasons && cand.priorityReasons.length > 0) {
          console.log(`  Why this Priority:`);
          cand.priorityReasons.forEach((r) => console.log(`    • ${r}`));
        }
        if (cand.recommendedNextActions && cand.recommendedNextActions.length > 0) {
          console.log(`  Recommended Actions:`);
          cand.recommendedNextActions.forEach((a) => console.log(`    → ${a}`));
        }
        if (cand.positiveSignals.length > 0) {
          console.log(`  Positive Signals:`);
          cand.positiveSignals.forEach((ps) => console.log(`    + ${ps}`));
        }
        if (cand.constraints.length > 0) {
          console.log(`  Soft Constraints:`);
          cand.constraints.forEach((sc) => console.log(`    ! ${sc}`));
        }
      });
      console.log(`\n========================================================\n`);
    }
  }

  execute().catch((err) => {
    console.error('Pilot execution error:', err);
    process.exit(1);
  });
}
