/**
 * Land Radar — Market Evidence Screening Rules
 *
 * RULE-MKT-001: Local Residential Market Evidence
 *
 * CRITICAL SEMANTICS:
 * - Strong market evidence is a positive commercial signal, NOT planning permission.
 * - Weak transaction density is a soft constraint / commercial risk, NOT an exclusion.
 * - Unknown is preserved when HMLR sales data is unassessed.
 * - No GDVs, no residual land value calculations.
 */

import { RuleDefinition, RuleInput, RuleResult } from './index';

export const marketEvidenceRule: RuleDefinition = {
  id: 'RULE-MKT-001',
  version: 'v3',
  description: 'Evaluates local residential transaction evidence from HM Land Registry Price Paid Data.',
  signalType: 'market_signal',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const marketSig = input.signals?.market_signal;

    if (!marketSig || marketSig.status === 'unknown') {
      return {
        ruleId: 'RULE-MKT-001',
        ruleVersion: 'v3',
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Local residential property sales data not available for this site. Epistemic status unknown.',
        isBlocker: false,
      };
    }

    const marketStrength = (input.context?.marketStrength as string) || 'UNKNOWN';
    const sampleSize = (input.context?.sampleSize as number) ?? (marketSig.value ? 1 : 0);
    const medianPrice = marketSig.value;

    if (marketStrength === 'STRONG_MARKET_EVIDENCE' || (sampleSize >= 5 && (medianPrice ?? 0) >= 250000)) {
      return {
        ruleId: 'RULE-MKT-001',
        ruleVersion: 'v3',
        outcome: 'positive_signal',
        status: 'known',
        value: medianPrice,
        explanation: `Strong local residential market evidence (${sampleSize} sales, median £${(medianPrice ?? 0).toLocaleString()}). Demonstrable liquidity and active local demand.`,
        isBlocker: false,
      };
    }

    if (marketStrength === 'MODERATE_MARKET_EVIDENCE' || sampleSize >= 2) {
      return {
        ruleId: 'RULE-MKT-001',
        ruleVersion: 'v3',
        outcome: 'positive_signal',
        status: 'known',
        value: medianPrice,
        explanation: `Moderate local residential transaction evidence (${sampleSize} sales, median £${(medianPrice ?? 0).toLocaleString()}). Established local pricing benchmarks exist.`,
        isBlocker: false,
      };
    }

    if (marketStrength === 'CONFLICTING_EVIDENCE') {
      return {
        ruleId: 'RULE-MKT-001',
        ruleVersion: 'v3',
        outcome: 'soft_constraint',
        status: 'known',
        value: medianPrice,
        explanation: 'Conflicting or divergent pricing recorded in surrounding transactions. Requires manual comparable curation by acquisition team.',
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-MKT-001',
      ruleVersion: 'v3',
      outcome: 'soft_constraint',
      status: 'known',
      value: medianPrice ?? 0,
      explanation: 'Sparse transaction evidence in local search corridor. Low observed liquidity requires dedicated local market enquiries.',
      isBlocker: false,
    };
  },
};
