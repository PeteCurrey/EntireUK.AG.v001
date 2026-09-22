/**
 * Land Radar — Market Strength Classifier
 *
 * Deterministically classifies local residential market evidence.
 *
 * CRITICAL PRINCIPLES:
 * 1. NO 0-100 FAKE SCORES.
 * 2. NO AUTOMATED VALUATIONS, GDVs, OR RESIDUAL LAND VALUES.
 * 3. Absence of transaction evidence in search radius != No market exists.
 * 4. Factual transaction distribution evidence only.
 */

import { MarketStrengthClassification } from '../types';

export interface MarketClassifierInput {
  sampleSize: number;
  directlyRelevantCount: number;
  contextualCount: number;
  medianPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  newBuildCount: number;
  coverageStatus?: 'known' | 'partial' | 'unknown';
}

export interface MarketClassificationResult {
  classification: MarketStrengthClassification;
  rationale: string;
  supportingFactors: string[];
  caveats: string[];
}

export function classifyMarketStrength(
  input: MarketClassifierInput
): MarketClassificationResult {
  const {
    sampleSize,
    directlyRelevantCount,
    medianPrice,
    minPrice,
    maxPrice,
    newBuildCount,
    coverageStatus = 'known',
  } = input;

  if (coverageStatus === 'unknown') {
    return {
      classification: 'UNKNOWN',
      rationale:
        'HMLR Price Paid residential sales data was unassessed or unavailable for this local planning authority.',
      supportingFactors: [],
      caveats: [
        'Absence of data does not confirm absence of market transactions.',
        'Market research required via local estate agents and Land Registry enquiries.',
      ],
    };
  }

  if (sampleSize === 0) {
    return {
      classification: 'INSUFFICIENT_MARKET_EVIDENCE',
      rationale:
        'Absence of recorded transactions does not indicate an absence of demand. Zero residential sales recorded within the spatial search radius over the observation window. Under Land Radar principles, this does not confirm no market exists.',
      supportingFactors: [],
      caveats: [
        'Sparse or non-residential rural/industrial location with low transactional turnover.',
        'Expand search radius or consult local property agents before drawing commercial conclusions.',
      ],
    };
  }

  const supportingFactors: string[] = [];
  const caveats: string[] = [];

  // Check for extreme conflicting / bimodal distribution
  if (minPrice && maxPrice && minPrice > 0 && maxPrice / minPrice > 5 && sampleSize >= 4) {
    return {
      classification: 'CONFLICTING_EVIDENCE',
      rationale:
        `Extreme price divergence observed (min £${minPrice.toLocaleString()} to max £${maxPrice.toLocaleString()}). Transactions span radically divergent sub-markets or property classes.`,
      supportingFactors: [
        `${sampleSize} total transactions identified`,
        `Median transaction price: £${(medianPrice ?? 0).toLocaleString()}`,
      ],
      caveats: [
        'Disparate property types or non-standard asset sales present in sample.',
        'Requires manual comparable curation by acquisition surveyor.',
      ],
    };
  }

  // Strong market evidence: ample volume, strong directly relevant count, established pricing
  if (directlyRelevantCount >= 3 || (sampleSize >= 5 && (medianPrice ?? 0) >= 250000)) {
    supportingFactors.push(
      `${sampleSize} nearby residential transactions identified (${directlyRelevantCount} directly relevant within 500m)`
    );
    if (medianPrice) {
      supportingFactors.push(`Observed median transaction price: £${medianPrice.toLocaleString()}`);
    }
    if (newBuildCount > 0) {
      supportingFactors.push(
        `${newBuildCount} newly built home transaction(s) demonstrate active development delivery in the immediate corridor.`
      );
    }

    caveats.push(
      'Historical sales data reflects past transaction points and does not substitute for scheme-specific development appraisal.'
    );

    return {
      classification: 'STRONG_MARKET_EVIDENCE',
      rationale:
        'Demonstrable liquidity: strong local housing market evidence with high transaction density, active comparable sales in close proximity, and demonstrable residential demand.',
      supportingFactors,
      caveats,
    };
  }

  // Moderate market evidence: reasonable density or cluster of sales
  if (directlyRelevantCount >= 2 || sampleSize >= 3) {
    supportingFactors.push(
      `${sampleSize} residential transaction(s) identified in local search radius`
    );
    if (medianPrice) {
      supportingFactors.push(`Observed median transaction price: £${medianPrice.toLocaleString()}`);
    }

    caveats.push(
      'Moderate sample size. Pricing should be corroborated with local agent sentiment and recent completions.'
    );

    return {
      classification: 'MODERATE_MARKET_EVIDENCE',
      rationale:
        'Moderate local market evidence: established residential sales recorded in the surrounding area providing defensible price benchmarks.',
      supportingFactors,
      caveats,
    };
  }

  // Insufficient evidence: 1 or fewer transactions, or single directly relevant sale only
  if (sampleSize > 0) {
    supportingFactors.push(`Only ${sampleSize} transaction(s) recorded within search radius`);
    caveats.push(
      'Low transaction density. Individual sales may reflect idiosyncratic circumstances rather than broad market demand.'
    );

    return {
      classification: 'INSUFFICIENT_MARKET_EVIDENCE',
      rationale:
        'Absence of recorded transactions does not indicate an absence of demand. Insufficient transaction volume to establish reliable pricing benchmarks.',
      supportingFactors,
      caveats,
    };
  }

  // Weak market evidence: reached only if sampleSize > 0 but no other branch matched
  supportingFactors.push(`Only ${sampleSize} transaction(s) recorded within search radius`);
  caveats.push(
    'Low transaction density. Individual sales may reflect idiosyncratic circumstances rather than broad market demand.'
  );

  return {
    classification: 'WEAK_MARKET_EVIDENCE',
    rationale:
      'Weak transaction evidence: sparse recorded residential sales in the immediate search area. Additional market evidence required.',
    supportingFactors,
    caveats,
  };
}
