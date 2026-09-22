/**
 * Land Radar — Development Capacity Engine
 *
 * Deterministically evaluates gross vs developable site area and indicative density ranges.
 *
 * MANDATORY PRINCIPLES:
 * 1. Gross site area != Developable site area.
 * 2. Never multiply site area * density into a definitive dwelling prediction.
 * 3. Where developable area cannot be reliably determined: developable_area = unknown.
 * 4. Factual spatial constraints (flood, Green Belt, SSSI) directly deduct from developable potential.
 */

import {
  Site,
  SiteConstraint,
  DevelopmentCapacityEvidence,
  DevelopableAreaStatus,
  DevelopmentPotentialClassification,
} from '../types';

export interface CapacityEngineInput {
  site: Site;
  isBrownfield?: boolean;
  constraints?: SiteConstraint[];
  floodOverlapPct?: number;
  greenBeltOverlapPct?: number;
  sssiOverlapPct?: number;
  settlementDistM?: number | null;
  hasPlanningPrecedent?: boolean;
  isAllocatedInLocalPlan?: boolean;
}

export function evaluateDevelopmentCapacity(
  input: CapacityEngineInput
): DevelopmentCapacityEvidence {
  const {
    site,
    isBrownfield = false,
    floodOverlapPct = 0,
    greenBeltOverlapPct = 0,
    sssiOverlapPct = 0,
    settlementDistM = null,
    hasPlanningPrecedent = false,
    isAllocatedInLocalPlan = false,
  } = input;

  const grossAreaSqm = site.area_sqm ?? (site.area_sqm_source ?? 0);
  const grossAreaHa = Number((grossAreaSqm / 10000).toFixed(2));

  // Calculate compound constraint impact
  // Green Belt, Flood Zone 2/3, and SSSI are primary physical/policy deductions
  const primaryOverlap = Math.max(floodOverlapPct, greenBeltOverlapPct, sssiOverlapPct);
  const cumulativeConstraintPct = Math.min(
    100,
    Math.round(floodOverlapPct + greenBeltOverlapPct + sssiOverlapPct)
  );

  const constrainedAreaSqm = Math.round((grossAreaSqm * primaryOverlap) / 100);
  const constrainedPct = primaryOverlap;

  const caveats: string[] = [
    'Gross site area != Developable site area (Gross site area does not equal net developable area).',
    'Net developable area requires boundary surveys, highway visibility splays, surface water attenuation, and ecological buffer zones.',
  ];

  // Determine developable area status
  let developableStatus: DevelopableAreaStatus;
  let potentiallyDevelopableSqm: number | null = null;
  let potentiallyDevelopableHa: number | null = null;

  if (grossAreaSqm <= 0) {
    developableStatus = 'unknown';
    caveats.push('Site boundary area is unrecorded; developable capacity cannot be determined.');
  } else if (constrainedPct >= 70) {
    developableStatus = 'unknown';
    caveats.push(
      `Severe compounding constraints (${constrainedPct}% constraint overlap). Developable footprint cannot be determined without full masterplan.`
    );
  } else if (constrainedPct > 0 && constrainedPct < 70) {
    developableStatus = 'uncertain';
    potentiallyDevelopableSqm = Math.max(0, grossAreaSqm - constrainedAreaSqm);
    potentiallyDevelopableHa = Number((potentiallyDevelopableSqm / 10000).toFixed(2));
    caveats.push(
      `Manageable constraint overlap (${constrainedPct}%). Net developable area estimated at ~${potentiallyDevelopableHa} ha subject to sequential layout and buffer design.`
    );
  } else {
    developableStatus = 'known';
    potentiallyDevelopableSqm = grossAreaSqm;
    potentiallyDevelopableHa = grossAreaHa;
    caveats.push('Zero statutory flood, SSSI, or Green Belt designation overlap identified on candidate boundary.');
  }

  // Indicative density ranges (dph = dwellings per hectare) based on UK planning benchmarks
  let minDph: number;
  let maxDph: number;
  let densityCategory: string;

  if (isBrownfield) {
    minDph = 35;
    maxDph = 50;
    densityCategory = 'Urban Brownfield / Regeneration Benchmark (35–50 dph)';
  } else if (settlementDistM != null && settlementDistM <= 450) {
    minDph = 30;
    maxDph = 40;
    densityCategory = 'Settlement Adjacency / Suburban Fringe Benchmark (30–40 dph)';
  } else {
    minDph = 25;
    maxDph = 35;
    densityCategory = 'Edge of Settlement / Strategic Growth Corridor Benchmark (25–35 dph)';
  }

  // Development potential classification
  let developmentPotential: DevelopmentPotentialClassification;
  let rationale: string;

  if (grossAreaSqm <= 0) {
    developmentPotential = 'UNKNOWN';
    rationale = 'Site geometry area is missing or unverified.';
  } else if (greenBeltOverlapPct > 40 || floodOverlapPct > 40 || sssiOverlapPct > 30 || constrainedPct >= 70) {
    developmentPotential = 'LOW_DEVELOPMENT_POTENTIAL';
    rationale = `Major physical or statutory designations dominate site area (${constrainedPct}% constraint overlap). Exceptionally high planning or engineering friction.`;
  } else if (isAllocatedInLocalPlan) {
    developmentPotential = 'HIGH_DEVELOPMENT_POTENTIAL';
    rationale = 'Site is formally allocated in the adopted Local Plan policies map. Statutory principle of residential development is established.';
  } else if (isBrownfield && constrainedPct <= 25) {
    developmentPotential = 'HIGH_DEVELOPMENT_POTENTIAL';
    rationale = 'Previously developed brownfield land with strong policy presumption under NPPF Chapter 11 and manageable physical constraints.';
  } else if (hasPlanningPrecedent && constrainedPct <= 25) {
    developmentPotential = 'HIGH_DEVELOPMENT_POTENTIAL';
    rationale = 'Historical planning permission or resolution to grant establishes clear development precedent on candidate land.';
  } else if (grossAreaHa >= 1.0 && (settlementDistM == null || settlementDistM <= 800) && constrainedPct === 0) {
    developmentPotential = 'HIGH_DEVELOPMENT_POTENTIAL';
    rationale = `Substantial land parcel (${grossAreaHa} ha) well-located relative to settlement boundary with zero constraint overlap. Strong prima facie development capacity.`;
  } else if (constrainedPct > 0 && constrainedPct < 70) {
    developmentPotential = 'MODERATE_DEVELOPMENT_POTENTIAL';
    rationale = `Potential development land constrained by partial environmental or policy designations (${constrainedPct}% overlap). Requires masterplanned mitigation.`;
  } else {
    developmentPotential = 'LOW_DEVELOPMENT_POTENTIAL';
    rationale = 'Sub-scale land parcel or distant from established settlement infrastructure.';
  }

  return {
    gross_area_sqm: grossAreaSqm,
    gross_area_ha: grossAreaHa,
    constrained_area_sqm: constrainedAreaSqm,
    constrained_percentage: constrainedPct,
    developable_area_status: developableStatus,
    potentially_developable_area_sqm: potentiallyDevelopableSqm,
    potentially_developable_area_ha: potentiallyDevelopableHa,
    indicative_density_min_dph: minDph,
    indicative_density_max_dph: maxDph,
    development_potential: developmentPotential,
    potential_classification_rationale: rationale,
    capacity_caveats: caveats,
  };
}
