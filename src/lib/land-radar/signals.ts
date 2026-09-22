/**
 * Land Radar — Signal Service
 *
 * Calculates and upserts individual signals per site.
 * Each signal is independently explainable and traces to evidence.
 *
 * status='unknown' means no data was available.
 * This is different from status='known' with value=0.
 */

import type { CreateSignalInput, SignalType, SiteSignal } from './types';
import { getLandRadarDb } from './db';
import { THRESHOLDS, CURRENT_RULE_VERSION } from './constants';

// ---------------------------------------------------------------------------
// Upsert a signal (idempotent)
// ---------------------------------------------------------------------------

/**
 * Upsert a signal for a site.
 * Idempotent: if a signal of this type and rule_version already exists,
 * it is updated. This allows recalculation without duplicates.
 */
export async function upsertSignal(input: CreateSignalInput): Promise<SiteSignal> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('site_signals')
    .upsert(
      {
        site_id: input.site_id,
        signal_type: input.signal_type,
        value: input.value ?? null,
        unit: input.unit ?? null,
        value_text: input.value_text ?? null,
        status: input.status,
        confidence: input.confidence ?? null,
        source: input.source ?? null,
        data_source_id: input.data_source_id ?? null,
        explanation: input.explanation,
        rule_version: input.rule_version ?? CURRENT_RULE_VERSION,
        ingestion_job_id: input.ingestion_job_id ?? null,
        calculated_at: new Date().toISOString(),
      },
      {
        onConflict: 'site_id,signal_type,rule_version',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert signal ${input.signal_type} for site ${input.site_id}: ${error.message}`);
  return data as SiteSignal;
}

/**
 * Get all signals for a site.
 */
export async function getSiteSignals(siteId: string): Promise<SiteSignal[]> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('site_signals')
    .select('*')
    .eq('site_id', siteId)
    .order('signal_type');

  if (error) throw new Error(`Failed to get signals for site ${siteId}: ${error.message}`);
  return (data ?? []) as SiteSignal[];
}

// ---------------------------------------------------------------------------
// Signal calculation functions
// These produce signal inputs from spatial data.
// The actual PostGIS queries run via Supabase RPC when the spatial layer is active.
// ---------------------------------------------------------------------------

/**
 * Produce a settlement proximity signal from a known distance value.
 * 'unknown' status when data source was unavailable.
 */
export function buildSettlementProximitySignal(
  siteId: string,
  distanceM: number | null,
  source: string,
  dataSourceId?: string
): CreateSignalInput {
  if (distanceM === null) {
    return {
      site_id: siteId,
      signal_type: 'settlement_proximity',
      status: 'unknown',
      unit: 'metres',
      explanation: 'Settlement proximity could not be calculated. Settlement boundary dataset may be unavailable or this site was not covered. Absence of data does not mean no proximity constraint.',
      source,
      data_source_id: dataSourceId,
    };
  }

  const inThreshold = distanceM <= THRESHOLDS.SETTLEMENT_PROXIMITY_M;
  return {
    site_id: siteId,
    signal_type: 'settlement_proximity',
    value: distanceM,
    unit: 'metres',
    status: 'known',
    confidence: 0.8,
    explanation: inThreshold
      ? `Site centroid is ${distanceM}m from nearest settlement boundary. Within the ${THRESHOLDS.SETTLEMENT_PROXIMITY_M}m threshold.`
      : `Site centroid is ${distanceM}m from nearest settlement boundary. Beyond the ${THRESHOLDS.SETTLEMENT_PROXIMITY_M}m threshold.`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Produce a road proximity signal.
 */
export function buildRoadProximitySignal(
  siteId: string,
  distanceM: number | null,
  source: string,
  dataSourceId?: string
): CreateSignalInput {
  if (distanceM === null) {
    return {
      site_id: siteId,
      signal_type: 'road_proximity',
      status: 'unknown',
      unit: 'metres',
      explanation: 'Road proximity could not be calculated. Road network dataset may be unavailable. Access adequacy cannot be determined from available data.',
      source,
      data_source_id: dataSourceId,
    };
  }

  return {
    site_id: siteId,
    signal_type: 'road_proximity',
    value: distanceM,
    unit: 'metres',
    status: 'known',
    confidence: 0.85,
    explanation: distanceM <= THRESHOLDS.ROAD_PROXIMITY_M
      ? `Site centroid is ${distanceM}m from nearest adopted road feature (threshold: ${THRESHOLDS.ROAD_PROXIMITY_M}m). Road proximity is a positive geometric indicator; professional highways survey and legal title verification are required to confirm vehicular access adequacy, visibility splays, and ransom strip absence.`
      : `Site is ${distanceM}m from nearest adopted road feature (exceeds ${THRESHOLDS.ROAD_PROXIMITY_M}m threshold). Highways connection or third-party access agreements may be required.`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Produce a brownfield signal.
 */
export function buildBrownfieldSignal(
  siteId: string,
  inBrownfieldRegister: boolean | null,
  source: string,
  dataSourceId?: string
): CreateSignalInput {
  if (inBrownfieldRegister === null) {
    return {
      site_id: siteId,
      signal_type: 'brownfield_signal',
      status: 'unknown',
      explanation: 'Brownfield register data not available for this area. Cannot determine brownfield status.',
      source,
      data_source_id: dataSourceId,
    };
  }

  return {
    site_id: siteId,
    signal_type: 'brownfield_signal',
    value: inBrownfieldRegister ? 1 : 0,
    unit: 'boolean_flag',
    status: 'known',
    confidence: 0.9,
    explanation: inBrownfieldRegister
      ? 'Site overlaps a local authority Brownfield Land Register entry. Brownfield status is a positive planning policy signal under NPPF.'
      : 'Site does not overlap any Brownfield Land Register entry within available data. This does not confirm greenfield status — register coverage may be incomplete.',
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Produce a flood risk signal from overlap percentage.
 */
export function buildFloodRiskSignal(
  siteId: string,
  overlapPct: number | null,
  floodZone: 'zone_2' | 'zone_3' | null,
  source: string,
  dataSourceId?: string
): CreateSignalInput {
  if (overlapPct === null) {
    return {
      site_id: siteId,
      signal_type: 'flood_risk',
      status: 'unknown',
      explanation: 'Flood risk data unavailable. The Environment Agency dataset was not available or did not cover this site. Absence of flood data DOES NOT mean no flood risk exists.',
      source,
      data_source_id: dataSourceId,
    };
  }

  const zoneLabel = floodZone === 'zone_3'
    ? 'Flood Zone 3 (high risk)'
    : floodZone === 'zone_2'
    ? 'Flood Zone 2 (medium risk)'
    : 'unknown flood zone';

  return {
    site_id: siteId,
    signal_type: 'flood_risk',
    value: overlapPct,
    unit: 'percent',
    status: 'known',
    confidence: 0.85,
    explanation: overlapPct === 0
      ? 'No overlap with Environment Agency flood zones detected. Flood risk appears low based on current EA data.'
      : `${overlapPct.toFixed(1)}% of site overlaps ${zoneLabel}. Professional flood risk assessment required for any planning application.`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Produce an SSSI protected site constraint signal.
 */
export function buildSSSISignal(
  siteId: string,
  overlapPct: number | null,
  source: string,
  dataSourceId?: string
): CreateSignalInput {
  if (overlapPct === null) {
    return {
      site_id: siteId,
      signal_type: 'protected_site',
      status: 'unknown',
      explanation: 'SSSI statutory designation data unavailable. Absence of data does not confirm absence of ecological designations.',
      source,
      data_source_id: dataSourceId,
    };
  }

  return {
    site_id: siteId,
    signal_type: 'protected_site',
    value: overlapPct,
    unit: 'percent',
    status: 'known',
    confidence: 0.95,
    explanation: overlapPct === 0
      ? 'No overlap with designated SSSI statutory nature conservation sites.'
      : `${overlapPct.toFixed(1)}% of site overlaps a designated Site of Special Scientific Interest (SSSI). Statutory environmental protection.`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Produce a Green Belt signal.
 */
export function buildGreenBeltSignal(
  siteId: string,
  overlapPct: number | null,
  source: string,
  dataSourceId?: string
): CreateSignalInput {
  if (overlapPct === null) {
    return {
      site_id: siteId,
      signal_type: 'green_belt',
      status: 'unknown',
      explanation: 'Green Belt boundary dataset not available for this area. Status unconfirmed.',
      source,
      data_source_id: dataSourceId,
    };
  }

  return {
    site_id: siteId,
    signal_type: 'green_belt',
    value: overlapPct,
    unit: 'percent',
    status: 'known',
    confidence: 0.9,
    explanation: overlapPct === 0
      ? 'No Green Belt designation overlap detected.'
      : `${overlapPct.toFixed(1)}% of site overlaps Green Belt designation. NPPF policy constraint.`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Produce a Planning Activity signal.
 * CRITICAL EPISTEMIC SEMANTICS:
 * - Absence of a planning record does NOT mean no planning history exists.
 * - Previous approval does NOT mean site is currently developable.
 * - Previous refusal does NOT mean site cannot be developed under revised scheme.
 */
export function buildPlanningActivitySignal(
  siteId: string,
  evidenceItems: Array<{
    application: {
      decision: string;
      decision_date: string | null;
      application_date: string | null;
      classification: string;
    };
    match_tier: string;
  }> | null,
  coverageStatus: 'known' | 'partial' | 'unknown' | 'pilot_fixture' = 'known',
  source: string = 'PLANNING-REGISTER-001',
  dataSourceId?: string
): CreateSignalInput {
  if (evidenceItems === null || coverageStatus === 'unknown') {
    return {
      site_id: siteId,
      signal_type: 'planning_activity',
      status: 'unknown',
      explanation: 'LPA planning register and historical application records unassessed for this geography. Epistemic status unknown.',
      source,
      data_source_id: dataSourceId,
    };
  }

  const count = evidenceItems.length;

  if (count === 0) {
    return {
      site_id: siteId,
      signal_type: 'planning_activity',
      value: 0,
      unit: 'count',
      status: 'known',
      confidence: 0.85,
      explanation:
        'No matching planning applications identified in authoritative LPA register within candidate envelope. ' +
        'Absence of records in the digital register does NOT confirm absence of historic unmapped planning activity.',
      source,
      data_source_id: dataSourceId,
    };
  }

  const approved = evidenceItems.filter((e) => e.application.decision === 'approved').length;
  const refused = evidenceItems.filter((e) => e.application.decision === 'refused').length;
  const pending = evidenceItems.filter((e) => e.application.decision === 'pending').length;

  const decisionSummary = [
    approved > 0 ? `${approved} approved` : '',
    refused > 0 ? `${refused} refused` : '',
    pending > 0 ? `${pending} pending` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const highestTier = evidenceItems.some((e) => e.match_tier === 'intersects_candidate')
    ? 'direct site boundary intersection'
    : 'nearby proximity / parcel match';

  return {
    site_id: siteId,
    signal_type: 'planning_activity',
    value: count,
    unit: 'count',
    status: 'known',
    confidence: 0.9,
    explanation:
      `${count} planning record(s) identified via ${highestTier} (${decisionSummary || 'undetermined'}). ` +
      'Historical planning records provide contextual intelligence on principle of use, but do not establish current planning permission or future development certainty.',
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Build a market_signal from HMLR Price Paid data
 *
 * CRITICAL EPISTEMIC SEMANTICS:
 * - Absence of recorded transactions != Absence of a market.
 * - Transactions reflect past historical sales; they do NOT constitute automated GDVs or valuations.
 * - Factual sales distribution only.
 */
export function buildMarketSignal(
  siteId: string,
  marketSummary: {
    sample_size: number;
    median_price: number | null;
    p25_price: number | null;
    p75_price: number | null;
    new_build_percentage: number | null;
    market_strength: string;
    rationale: string;
  } | null,
  coverageStatus: 'known' | 'partial' | 'unknown' | 'pilot_fixture' = 'known',
  source: string = 'HMLR-PRICE-PAID-001',
  dataSourceId?: string
): CreateSignalInput {
  if (marketSummary === null || coverageStatus === 'unknown') {
    return {
      site_id: siteId,
      signal_type: 'market_signal',
      status: 'unknown',
      explanation: 'HMLR Price Paid residential sales data unassessed for this geography. Epistemic status unknown.',
      source,
      data_source_id: dataSourceId,
    };
  }

  if (marketSummary.sample_size === 0) {
    return {
      site_id: siteId,
      signal_type: 'market_signal',
      value: 0,
      unit: 'count',
      value_text: marketSummary.market_strength,
      status: 'known',
      confidence: 0.8,
      explanation:
        'Zero residential sales recorded within local search radius. Under Land Radar principles, absence of recorded sales does NOT confirm no market exists.',
      source,
      data_source_id: dataSourceId,
    };
  }

  const medianText = marketSummary.median_price ? `£${marketSummary.median_price.toLocaleString()}` : 'unrecorded';
  const newBuildText = marketSummary.new_build_percentage !== null ? `${marketSummary.new_build_percentage}% new build` : 'established stock';

  return {
    site_id: siteId,
    signal_type: 'market_signal',
    value: marketSummary.median_price ?? undefined,
    unit: 'gbp',
    value_text: marketSummary.market_strength,
    status: 'known',
    confidence: 0.9,
    explanation:
      `${marketSummary.sample_size} residential sales in search radius (median ${medianText}, ${newBuildText}). Classification: ${marketSummary.market_strength}. ${marketSummary.rationale}`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Build a development_pattern signal from capacity evidence
 *
 * CRITICAL EPISTEMIC SEMANTICS:
 * - Gross site area != Developable site area.
 * - Never computes an automated GDV or unverified dwelling count.
 */
export function buildDevelopmentPatternSignal(
  siteId: string,
  capacityEvidence: {
    gross_area_ha: number;
    constrained_percentage: number;
    developable_area_status: string;
    potentially_developable_area_ha: number | null;
    indicative_density_min_dph: number | null;
    indicative_density_max_dph: number | null;
    development_potential: string;
    potential_classification_rationale: string;
  } | null,
  source: string = 'ENTIRE-UK-CAPACITY-001',
  dataSourceId?: string
): CreateSignalInput {
  if (capacityEvidence === null) {
    return {
      site_id: siteId,
      signal_type: 'development_pattern',
      status: 'unknown',
      explanation: 'Development capacity and net developable area unassessed for this candidate.',
      source,
      data_source_id: dataSourceId,
    };
  }

  const devHaText =
    capacityEvidence.potentially_developable_area_ha !== null
      ? `~${capacityEvidence.potentially_developable_area_ha} ha developable (${capacityEvidence.constrained_percentage}% constrained)`
      : `developable area uncertain (${capacityEvidence.constrained_percentage}% constrained)`;

  const densityText =
    capacityEvidence.indicative_density_min_dph && capacityEvidence.indicative_density_max_dph
      ? `Indicative planning benchmark: ${capacityEvidence.indicative_density_min_dph}–${capacityEvidence.indicative_density_max_dph} dph.`
      : '';

  return {
    site_id: siteId,
    signal_type: 'development_pattern',
    value: capacityEvidence.potentially_developable_area_ha ?? undefined,
    unit: 'hectares',
    value_text: capacityEvidence.development_potential,
    status: 'known',
    confidence: 0.85,
    explanation:
      `${capacityEvidence.gross_area_ha} ha gross site; ${devHaText}. ${densityText} Classification: ${capacityEvidence.development_potential}. ${capacityEvidence.potential_classification_rationale}`,
    source,
    data_source_id: dataSourceId,
  };
}

/**
 * Mark all signals as unknown for a site when source data is unavailable.
 * This ensures absence of data is properly recorded, not silently treated as clear.
 */
export async function markSignalsUnknownForSource(
  siteId: string,
  signalTypes: SignalType[],
  reason: string,
  source: string
): Promise<void> {
  for (const signalType of signalTypes) {
    await upsertSignal({
      site_id: siteId,
      signal_type: signalType,
      status: 'unknown',
      explanation: `Data source unavailable: ${reason}. Signal recorded as unknown, not as no-constraint.`,
      source,
    });
  }
}


