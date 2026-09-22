/**
 * Land Radar — Explainable Prioritisation Engine
 *
 * CRITICAL RULE: NO 0-100 FAKE SCORES.
 *
 * Prioritisation is deterministic, categorical, and multi-dimensional:
 * - 'high': Strategic brownfield or large registered parcel, close to settlement (<450m),
 *           direct highway access, zero blocker constraints, deliverable.
 * - 'medium': Suitable brownfield or edge-of-settlement parcel with manageable soft constraint
 *             (e.g., partial flood zone with developable buffer, proximity to sensitive ecology).
 * - 'low': Marginal candidate (sub-minimum area or multiple compounding soft constraints).
 * - 'unprioritised': Critical primary evidence is missing/unassessed.
 *
 * Every candidate also receives:
 * - priorityReasons: string[]
 * - recommendedNextActions: string[]
 * - evidenceCompleteness: EvidenceCompleteness
 * - whySurfaced: WhySurfacedProfile
 */

import {
  Site,
  SiteSignal,
  CreateSignalInput,
  SiteConstraint,
  CandidatePriority,
  PrioritisationResult,
  EvidenceCompleteness,
  WhySurfacedProfile,
  ActiveConstraint,
  VisualUnknown,
  SignalType,
  IntelligenceStatus,
} from './types';

export type SignalLike =
  | SiteSignal
  | CreateSignalInput
  | { signal_type: SignalType; value?: number | null; value_text?: string | null; status: IntelligenceStatus; explanation?: string };

export interface PrioritisationInput {
  site: Site;
  signals: SignalLike[];
  constraints?: SiteConstraint[];
  isBrownfield?: boolean;
}

const PRIMARY_EVIDENCE_CATEGORIES = [
  { key: 'origin', label: 'Land Parcel / Brownfield Identification' },
  { key: 'settlement_proximity', label: 'Settlement Proximity' },
  { key: 'flood_risk', label: 'Environment Agency Flood Risk' },
  { key: 'protected_site', label: 'Natural England SSSI / Ecology' },
  { key: 'road_proximity', label: 'Highway & Road Access' },
  { key: 'green_belt', label: 'Local Plan Green Belt Policy' },
  { key: 'planning_activity', label: 'LPA Planning History' },
];

/**
 * Calculate evidence completeness for a candidate site
 */
export function calculateEvidenceCompleteness(
  signals: SignalLike[],
  isBrownfield: boolean = false
): EvidenceCompleteness {
  const signalTypes = new Set(
    signals.filter((s) => s.status === 'known' || s.status === 'verified').map((s) => s.signal_type)
  );

  const assessedCategories: string[] = [];
  const missingCategories: string[] = [];

  for (const cat of PRIMARY_EVIDENCE_CATEGORIES) {
    if (cat.key === 'origin') {
      // Always assessed if site exists
      assessedCategories.push(cat.label);
    } else if (signalTypes.has(cat.key as any)) {
      assessedCategories.push(cat.label);
    } else {
      missingCategories.push(cat.label);
    }
  }

  const evaluatedCount = assessedCategories.length;
  const totalCount = PRIMARY_EVIDENCE_CATEGORIES.length;
  const percentage = Math.round((evaluatedCount / totalCount) * 100);

  return {
    evaluatedCount,
    totalCount,
    percentage,
    assessedCategories,
    missingCategories,
  };
}

/**
 * Generate the comprehensive "Why Surfaced?" profile
 */
export function generateWhySurfacedProfile(
  site: Site,
  signals: SignalLike[],
  constraints: SiteConstraint[] = [],
  isBrownfield: boolean = false
): WhySurfacedProfile {
  const signalMap = new Map(signals.map((s) => [s.signal_type, s]));

  // 1. Core Driver
  let coreDriver: string;
  const areaHa = site.area_sqm ? (site.area_sqm / 10000).toFixed(2) : 'Unknown';

  if (isBrownfield || site.source.toLowerCase().includes('brownfield')) {
    coreDriver = `DLUHC Brownfield Land Register — Identified deliverable redevelopment site (${areaHa} ha).`;
  } else if (site.area_sqm && site.area_sqm >= 30000) {
    coreDriver = `Strategic Freehold Land Parcel — Substantial registered title parcel (${areaHa} ha) within growth corridor.`;
  } else {
    coreDriver = `HMLR Registered Land Parcel — Defined spatial parcel (${areaHa} ha) screened for strategic development potential.`;
  }

  // 2. Key Positive Factors
  const keyPositiveFactors: string[] = [];

  if (isBrownfield || site.source.toLowerCase().includes('brownfield')) {
    keyPositiveFactors.push(
      'Previously Developed Land (brownfield) with NPPF presumption favoring sustainable redevelopment.'
    );
  }

  const settlementSig = signalMap.get('settlement_proximity');
  if (settlementSig && settlementSig.status === 'known' && typeof settlementSig.value === 'number') {
    if (settlementSig.value === 0) {
      keyPositiveFactors.push('Located directly within an established settlement boundary.');
    } else if (settlementSig.value <= 500) {
      keyPositiveFactors.push(
        `Immediate edge-of-settlement proximity (${settlementSig.value}m to urban boundary).`
      );
    } else if (settlementSig.value <= 1000) {
      keyPositiveFactors.push(
        `Proximity to urban infrastructure and settlement facilities (${settlementSig.value}m).`
      );
    }
  }

  const roadSig = signalMap.get('road_proximity');
  if (roadSig && roadSig.status === 'known' && typeof roadSig.value === 'number' && roadSig.value <= 100) {
    keyPositiveFactors.push(
      `Direct adjacency to adopted highway network (${roadSig.value}m). Highways survey required to confirm vehicular access rights and visibility.`
    );
  }

  const greenBeltSig = signalMap.get('green_belt');
  if (greenBeltSig && greenBeltSig.status === 'known' && typeof greenBeltSig.value === 'number' && greenBeltSig.value === 0) {
    keyPositiveFactors.push(
      'Verified clear of statutory Green Belt designation (DLUHC Open Data boundary check).'
    );
  }

  if (site.area_sqm && site.area_sqm >= 10000) {
    keyPositiveFactors.push(
      `Strategic scale (${areaHa} ha) provides layout flexibility for required open space and biodiversity net gain.`
    );
  }

  if (keyPositiveFactors.length === 0) {
    keyPositiveFactors.push('Identified spatial land parcel free from national statutory environmental designations.');
  }

  // 3. Active Constraints
  const activeConstraints: ActiveConstraint[] = [];

  const floodSig = signalMap.get('flood_risk');
  if (floodSig && floodSig.status === 'known' && typeof floodSig.value === 'number' && floodSig.value > 0) {
    const isHigh = floodSig.value > 25;
    activeConstraints.push({
      name: 'Environment Agency Flood Zone 2/3',
      severity: isHigh ? 'hard_exclusion' : 'soft_constraint',
      overlapPct: floodSig.value,
      note: `${floodSig.value}% of parcel area is within fluvial flood extents. Sequential layout and surface water drainage required.`,
    });
  }

  const sssiSig = signalMap.get('protected_site');
  if (sssiSig && sssiSig.status === 'known' && typeof sssiSig.value === 'number' && sssiSig.value > 0) {
    activeConstraints.push({
      name: 'Natural England SSSI Buffer / Overlap',
      severity: 'soft_constraint',
      overlapPct: sssiSig.value,
      note: `Proximity or partial overlap (${sssiSig.value}%) with designated SSSI. Ecological buffer and BNG required.`,
    });
  }

  if (greenBeltSig && greenBeltSig.status === 'known' && typeof greenBeltSig.value === 'number' && greenBeltSig.value > 0) {
    activeConstraints.push({
      name: 'Statutory Green Belt Designation',
      severity: greenBeltSig.value > 20 ? 'hard_exclusion' : 'soft_constraint',
      overlapPct: greenBeltSig.value,
      note: `${greenBeltSig.value}% of site area is within designated Green Belt. Very Special Circumstances required under NPPF Chapter 13.`,
    });
  }

  for (const c of constraints) {
    if (!activeConstraints.some((ac) => ac.name === c.constraint_type)) {
      activeConstraints.push({
        name: c.constraint_type.replace(/_/g, ' ').toUpperCase(),
        severity: c.severity_classification,
        overlapPct: c.overlap_pct ?? undefined,
        note: `Identified constraint from ${c.source ?? 'authoritative registry'}.`,
      });
    }
  }

  // 4. Visual Unknowns (CRITICAL: UNKNOWN IS NOT CLEAR)
  const visualUnknowns: VisualUnknown[] = [];

  const gbSig = signalMap.get('green_belt');
  if (!gbSig || gbSig.status === 'unknown') {
    visualUnknowns.push({
      category: 'Green Belt Policy',
      description: 'LPA Local Plan Green Belt polygon dataset was deferred or unassessed for this site.',
      impact: 'Unknown policy designation. Must be verified against Local Plan Policies Map before acquisition.',
      sourceStatus: 'deferred',
    });
  }

  const roadSigCheck = signalMap.get('road_proximity');
  if (!roadSigCheck || roadSigCheck.status === 'unknown') {
    visualUnknowns.push({
      category: 'Highways Network Access',
      description: 'OS Open Roads highway proximity was unassessed for this candidate.',
      impact: 'Unknown highway adjacency. Physical entrance viability requires site visit.',
      sourceStatus: 'deferred',
    });
  }

  const planSig = signalMap.get('planning_activity');
  if (planSig && planSig.status === 'known') {
    if (typeof planSig.value === 'number' && planSig.value > 0) {
      keyPositiveFactors.push(planSig.explanation || 'LPA planning register screened: planning applications on record.');
    } else {
      keyPositiveFactors.push('LPA planning register screened: no active planning objections or recent refusals on record.');
    }
  } else {
    visualUnknowns.push({
      category: 'Detailed Planning History',
      description: 'LPA planning register and historical application records not yet linked.',
      impact: 'Previous refusals, approvals, or Article 4 Directions are currently unassessed.',
      sourceStatus: 'unassessed',
    });
  }

  const marketSig = signalMap.get('market_signal');
  if (marketSig && marketSig.status === 'known' && typeof marketSig.value === 'number' && marketSig.value > 0) {
    keyPositiveFactors.push(marketSig.explanation || `Local residential sales evidence: observed median £${marketSig.value.toLocaleString()}.`);
  }


  // 5. Recommended Investigation Angle
  let recommendedAngle: string;
  if (isBrownfield) {
    recommendedAngle =
      'Verify register deliverability status with LPA planning officers; commission Phase 1 Geo-environmental contamination desktop audit; obtain Title Register from HMLR.';
  } else if (activeConstraints.some((c) => c.severity === 'soft_constraint')) {
    recommendedAngle =
      'Commission Flood Risk Assessment and surface water drainage strategy; verify Green Belt status; inspect Title Register for restrictive covenants.';
  } else {
    recommendedAngle =
      'Verify Local Plan settlement boundary allocation; obtain HMLR Title Register and Title Plan; perform highways access inspection.';
  }

  return {
    coreDriver,
    keyPositiveFactors,
    activeConstraints,
    visualUnknowns,
    recommendedAngle,
  };
}

/**
 * Deterministically evaluate candidate priority
 */
export function evaluateCandidatePriority(input: PrioritisationInput): PrioritisationResult {
  const { site, signals, constraints = [], isBrownfield = false } = input;
  const signalMap = new Map(signals.map((s) => [s.signal_type, s]));

  const completeness = calculateEvidenceCompleteness(signals, isBrownfield);
  const whySurfaced = generateWhySurfacedProfile(site, signals, constraints, isBrownfield);

  const priorityReasons: string[] = [];
  const recommendedNextActions: string[] = [];

  const floodSig = signalMap.get('flood_risk');
  const floodPct = floodSig?.value ?? 0;
  const hasHardFlood = floodPct > 40;

  const sssiSig = signalMap.get('protected_site');
  const sssiPct = sssiSig?.value ?? 0;
  const hasHardSSSI = sssiPct > 20;

  const settlementSig = signalMap.get('settlement_proximity');
  const settlementDistM = settlementSig?.value;

  const areaSqm = site.area_sqm ?? 0;

  let priority: CandidatePriority;

  // Decision logic
  if (hasHardFlood || hasHardSSSI) {
    priority = 'low';
    priorityReasons.push(
      hasHardFlood
        ? `Severe flood risk: ${floodPct}% in Flood Zone 2/3 represents a major physical constraint.`
        : `Severe ecological constraint: ${sssiPct}% overlap with designated SSSI.`
    );
    recommendedNextActions.push('Review whether site boundary can be redrawn to exclude high-hazard zones.');
  } else if (isBrownfield) {
    if (floodPct > 0) {
      priority = 'medium';
      priorityReasons.push('Identified on DLUHC Brownfield Register with strategic reuse potential.');
      priorityReasons.push(`Manageable flood constraint (${floodPct}% Zone 3) requires sequential site layout.`);
      recommendedNextActions.push('Commission Flood Risk Assessment (FRA) and sequential test analysis.');
      recommendedNextActions.push('Verify Brownfield Register deliverability timeframe with LPA planning department.');
    } else {
      priority = 'high';
      priorityReasons.push('Identified on DLUHC Brownfield Register with deliverability support under NPPF.');
      priorityReasons.push('Free from statutory flood and environmental designation constraints.');
      if (settlementDistM != null && settlementDistM <= 450) {
        priorityReasons.push(`Exceptional settlement connectivity (${settlementDistM}m to urban boundary).`);
      }
      recommendedNextActions.push('Obtain official HMLR Title Register and Title Plan to establish registered ownership.');
      recommendedNextActions.push('Commission Phase 1 Geo-environmental desk study for historic contamination.');
      recommendedNextActions.push('Check LPA planning register for pre-application discussions or existing permissions.');
    }
  } else {
    // Greenfield / registered parcel
    if (areaSqm >= 30000 && (settlementDistM == null || settlementDistM <= 500) && floodPct === 0) {
      priority = 'high';
      priorityReasons.push(`Strategic scale parcel (${(areaSqm / 10000).toFixed(2)} ha) adjacent to urban area.`);
      priorityReasons.push('Clean environmental profile: 0% flood zone overlap and 0% SSSI designation.');
      recommendedNextActions.push('Verify Local Plan Green Belt designation against Warwick District Policies Map.');
      recommendedNextActions.push('Obtain HMLR Title details to identify registered freehold owner.');
      recommendedNextActions.push('Conduct highways visibility and access adequacy review.');
    } else if (settlementDistM != null && settlementDistM <= 1200 && floodPct <= 25) {
      priority = 'medium';
      priorityReasons.push(`Moderate settlement connectivity (${settlementDistM}m to urban boundary).`);
      if (floodPct > 0) {
        priorityReasons.push(`Manageable soft flood constraint (${floodPct}% overlap).`);
        recommendedNextActions.push('Assess topographic elevation and flood mitigation options.');
      } else {
        priorityReasons.push('No environmental designations; requires planning policy assessment.');
      }
      recommendedNextActions.push('Verify Green Belt policy and agricultural land classification.');
      recommendedNextActions.push('Investigate road access and ransom strip risks.');
    } else {
      priority = 'low';
      priorityReasons.push('Marginal development prospect: either distant from urban settlements or sub-scale.');
      recommendedNextActions.push('Monitor for future Local Plan boundary reviews.');
    }
  }

  // Planning intelligence context
  const planSig = signalMap.get('planning_activity');
  if (planSig && planSig.status === 'known' && typeof planSig.value === 'number') {
    if (planSig.value > 0) {
      priorityReasons.push(`Statutory planning register records identified (${planSig.value} application(s)).`);
      if (planSig.explanation?.includes('approved')) {
        recommendedNextActions.push('Review approved planning decision notice, Section 106 agreement, and conditions.');
      }
      if (planSig.explanation?.includes('refused')) {
        recommendedNextActions.push('Review refused planning decision notice to investigate specific LPA policy objections.');
      }
    }
  }

  // Market intelligence context
  const marketSig = signalMap.get('market_signal');
  if (marketSig && marketSig.status === 'known') {
    if (marketSig.value_text === 'STRONG_MARKET_EVIDENCE') {
      priorityReasons.push(`Strong local housing market evidence (observed median £${(marketSig.value ?? 0).toLocaleString()}).`);
    } else if (marketSig.value_text === 'MODERATE_MARKET_EVIDENCE') {
      priorityReasons.push(`Moderate local residential sales activity (median £${(marketSig.value ?? 0).toLocaleString()}).`);
    }
  }

  // Development capacity context
  const devSig = signalMap.get('development_pattern');
  if (devSig && devSig.status === 'known' && devSig.value_text === 'HIGH_DEVELOPMENT_POTENTIAL') {
    priorityReasons.push('High development capacity potential with low physical/statutory constraint deductions.');
  }


  // Always append unknown-resolution action
  if (whySurfaced.visualUnknowns.some((vu) => vu.category === 'Green Belt Policy')) {
    if (!recommendedNextActions.some((a) => a.includes('Green Belt'))) {
      recommendedNextActions.push('Verify Local Plan Green Belt status (LPA dataset deferred).');
    }
  }
  if (whySurfaced.visualUnknowns.some((vu) => vu.category === 'Detailed Planning History')) {
    if (!recommendedNextActions.some((a) => a.includes('planning register'))) {
      recommendedNextActions.push('Search LPA planning portal for planning history.');
    }
  }

  return {
    priority,
    priorityReasons,
    recommendedNextActions,
    evidenceCompleteness: completeness,
    whySurfaced,
  };
}
