/**
 * Land Radar — Acquisition Investigation Brief Generator
 *
 * Generates an executive, deterministic summary for acquisition analysts:
 * - Site identifiers & geography
 * - Why surfaced (core driver)
 * - Key positive evidence
 * - Active constraints
 * - Planning intelligence timeline & match tiers
 * - Critical unknowns remaining
 * - Derived recommended investigation actions
 *
 * CRITICAL PRINCIPLE:
 * This brief never claims a site is developable or that planning will be granted.
 * It is a structured evidence briefing for qualified human analysts.
 */

import {
  Site,
  SiteSignal,
  CreateSignalInput,
  SiteConstraint,
  PlanningEvidenceItem,
  AcquisitionInvestigationBrief,
  PlanningDecision,
  PlanningMatchTier,
  WhySurfacedProfile,
  MarketEvidenceSummary,
  DevelopmentCapacityEvidence,
} from '../types';

export function generateAcquisitionInvestigationBrief(
  site: Site,
  whySurfaced: WhySurfacedProfile,
  signals: (SiteSignal | CreateSignalInput)[],
  constraints: SiteConstraint[],
  planningEvidence: PlanningEvidenceItem[],
  coverageStatus: 'known' | 'partial' | 'unknown' = 'known',
  marketSummary?: MarketEvidenceSummary | null,
  capacityEvidence?: DevelopmentCapacityEvidence | null
): AcquisitionInvestigationBrief {
  const areaHa = site.area_sqm ? Number((site.area_sqm / 10000).toFixed(2)) : null;

  // Key positive signals
  const keyPositiveSignals: string[] = [...whySurfaced.keyPositiveFactors];

  // Active constraints
  const activeConstraints: string[] = whySurfaced.activeConstraints.map(
    (c) => `${c.name}: ${c.severity.toUpperCase()} (${c.overlapPct !== undefined ? c.overlapPct + '% overlap' : 'active'})`
  );

  // Critical unknowns
  const criticalUnknowns: string[] = whySurfaced.visualUnknowns.map(
    (u) => `${u.category}: ${u.description}`
  );

  // Planning summary
  const sortedEvidence = [...planningEvidence].sort((a, b) => {
    const d1 = a.application.decision_date || a.application.application_date || '';
    const d2 = b.application.decision_date || b.application.application_date || '';
    return d2.localeCompare(d1);
  });

  const latest = sortedEvidence[0];
  const latestDecision: PlanningDecision | 'none' = latest ? latest.application.decision : 'none';
  const latestDate = latest ? (latest.application.decision_date || latest.application.application_date || null) : null;

  let highestTier: PlanningMatchTier | 'none' = 'none';
  if (planningEvidence.some((p) => p.match_tier === 'intersects_candidate')) {
    highestTier = 'intersects_candidate';
  } else if (planningEvidence.some((p) => p.match_tier === 'intersects_source_parcel')) {
    highestTier = 'intersects_source_parcel';
  } else if (planningEvidence.some((p) => p.match_tier === 'nearby_buffer')) {
    highestTier = 'nearby_buffer';
  } else if (planningEvidence.some((p) => p.match_tier === 'address_match')) {
    highestTier = 'address_match';
  } else if (planningEvidence.length > 0) {
    highestTier = 'textual';
  }

  const timeline = sortedEvidence.map((e) => ({
    reference: e.application.application_reference,
    date: e.application.decision_date || e.application.application_date || null,
    decision: e.application.decision,
    classification: e.application.classification,
    description: e.application.description,
    match_tier: e.match_tier,
  }));

  // Recommended next actions
  const recommendedActions: string[] = [];
  if (planningEvidence.length === 0 && coverageStatus !== 'unknown') {
    recommendedActions.push('Confirm with LPA planning portal that no historic unmapped applications exist prior to digital records.');
  } else if (planningEvidence.some((e) => e.application.decision === 'refused')) {
    recommendedActions.push('Review decision notices for historical refused applications to identify policy, transport, or contamination objections.');
  } else if (planningEvidence.some((e) => e.application.decision === 'approved')) {
    recommendedActions.push('Review approved planning decision notice, Section 106 obligations, and pre-commencement conditions to verify whether permission was implemented.');
  }

  recommendedActions.push('Obtain official HMLR Title Register & Title Plan to verify registered proprietor and covenants.');
  if (constraints.some((c) => c.constraint_type.includes('flood'))) {
    recommendedActions.push('Commission Flood Risk Assessment (FRA) and sequential layout test.');
  }

  if (marketSummary) {
    if (marketSummary.market_strength === 'STRONG_MARKET_EVIDENCE') {
      keyPositiveSignals.push(
        `Strong local residential market (${marketSummary.sample_size} sales, median £${(marketSummary.median_price ?? 0).toLocaleString()}).`
      );
    } else if (marketSummary.sample_size === 0) {
      recommendedActions.push('Commission local estate agent desktop comparable report due to low transaction density.');
    }
  }

  if (capacityEvidence) {
    if (capacityEvidence.developable_area_status === 'uncertain') {
      recommendedActions.push('Commission topographic and boundary survey to verify net developable area footprint.');
    }
  }

  // Acquisition Risks Breakdown
  const acquisitionRisks: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'unknown';
  }> = [];

  // Planning Risk
  if (planningEvidence.some((e) => e.application.decision === 'refused')) {
    acquisitionRisks.push({
      category: 'Planning & Policy Friction',
      description: 'Historical planning refusal on record. Scheme must address documented policy objections.',
      severity: 'medium',
    });
  } else if (planningEvidence.some((e) => e.application.decision === 'approved')) {
    acquisitionRisks.push({
      category: 'Planning Precedent',
      description: 'Established residential principle on record; deliverability conditions must be reviewed.',
      severity: 'low',
    });
  } else {
    acquisitionRisks.push({
      category: 'Planning Status',
      description: 'Zero planning records identified. Unassessed windfall / promotion prospect.',
      severity: 'medium',
    });
  }

  // Market Risk
  if (marketSummary) {
    if (marketSummary.market_strength === 'STRONG_MARKET_EVIDENCE') {
      acquisitionRisks.push({
        category: 'Market Liquidity',
        description: `Robust market demand verified (${marketSummary.sample_size} transactions, median £${(marketSummary.median_price ?? 0).toLocaleString()}).`,
        severity: 'low',
      });
    } else if (marketSummary.market_strength === 'WEAK_MARKET_EVIDENCE' || marketSummary.market_strength === 'INSUFFICIENT_MARKET_EVIDENCE') {
      acquisitionRisks.push({
        category: 'Market Absorption',
        description: 'Sparse transaction evidence in immediate search area. Local price sensitivity unverified.',
        severity: 'medium',
      });
    }
  }

  // Title / Ownership Risk
  acquisitionRisks.push({
    category: 'Title & Registered Ownership',
    description: 'Current registered proprietor, restrictive covenants, and ransom strips require formal HMLR Title review.',
    severity: 'medium',
  });

  // Access Risk
  acquisitionRisks.push({
    category: 'Highway Access',
    description: 'Geometric road proximity confirmed. Highway adoption and legal vehicular entrance rights unverified.',
    severity: 'medium',
  });

  // Environmental Risk
  if (constraints.some((c) => c.constraint_type.includes('flood') && (c.overlap_pct ?? 0) > 20)) {
    acquisitionRisks.push({
      category: 'Flood Risk',
      description: 'Substantial fluvial flood zone overlap. Sequential layout and surface water drainage required.',
      severity: 'high',
    });
  }

  const disclaimer =
    'This Acquisition Investigation Brief is deterministically generated from authoritative spatial, statutory, environmental, and Land Registry datasets. ' +
    'It provides contextual intelligence to focus human due diligence. It does NOT constitute legal advice, planning permission, formal valuation, GDV calculation, or commercial warranty. ' +
    'Historical planning approvals do not establish current developability, and historical sales data reflects past transaction points rather than scheme-specific underwriting.';

  return {
    site_reference: site.internal_reference,
    site_name: site.name || 'Candidate Site',
    area_ha: areaHa,
    local_authority: site.local_authority || 'Warwickshire',
    why_surfaced: whySurfaced.coreDriver,
    key_positive_signals: keyPositiveSignals,
    active_constraints: activeConstraints,
    planning_summary: {
      coverage: coverageStatus,
      total_found: planningEvidence.length,
      relevant_count: planningEvidence.filter((p) => p.is_relevant_to_strategy).length,
      latest_decision: latestDecision,
      latest_decision_date: latestDate,
      highest_match_tier: highestTier,
      timeline,
    },
    market_summary: marketSummary
      ? {
          coverage: marketSummary.sample_size > 0 ? 'known' : 'unknown',
          sample_size: marketSummary.sample_size,
          median_price: marketSummary.median_price,
          p25_price: marketSummary.p25_price,
          p75_price: marketSummary.p75_price,
          new_build_percentage: marketSummary.new_build_percentage,
          market_strength: marketSummary.market_strength,
          rationale: marketSummary.rationale,
          comparables_count: marketSummary.comparables.length,
        }
      : null,
    development_capacity: capacityEvidence
      ? {
          gross_area_ha: capacityEvidence.gross_area_ha,
          constrained_percentage: capacityEvidence.constrained_percentage,
          developable_area_status: capacityEvidence.developable_area_status,
          potentially_developable_area_ha: capacityEvidence.potentially_developable_area_ha,
          indicative_density_range: `${capacityEvidence.indicative_density_min_dph}–${capacityEvidence.indicative_density_max_dph} dph`,
          development_potential: capacityEvidence.development_potential,
          rationale: capacityEvidence.potential_classification_rationale,
          caveats: capacityEvidence.capacity_caveats,
        }
      : null,
    acquisition_risks: acquisitionRisks,
    critical_unknowns: criticalUnknowns,
    recommended_next_actions: recommendedActions,
    disclaimer,
  };
}

