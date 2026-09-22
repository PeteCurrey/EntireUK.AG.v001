/**
 * RULE-AREA-001: Minimum Site Area
 *
 * Candidate must meet minimum area threshold.
 * Below minimum area: hard exclusion for residential screening strategy.
 * Above strategic threshold: positive signal.
 *
 * Threshold is parameterised, not hardcoded.
 */

import type { RuleDefinition, RuleInput, RuleResult } from './index';
import { THRESHOLDS, CURRENT_RULE_VERSION } from '../constants';
import { formatArea } from '../geometry';

export const areaRule: RuleDefinition = {
  id: 'RULE-AREA-001',
  version: CURRENT_RULE_VERSION,
  description: 'Minimum site area threshold for residential screening strategy.',
  signalType: null,
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const { siteId, areaSqm } = input;

    if (areaSqm === null) {
      return {
        ruleId: 'RULE-AREA-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Site area could not be calculated. Geometry may be absent or invalid.',
        isBlocker: false,
      };
    }

    if (areaSqm < THRESHOLDS.MIN_SITE_AREA_SQM) {
      return {
        ruleId: 'RULE-AREA-001',
        ruleVersion: this.version,
        outcome: 'hard_exclusion',
        status: 'known',
        value: areaSqm,
        explanation: `Site area ${formatArea(areaSqm)} is below the minimum screening threshold of ${formatArea(THRESHOLDS.MIN_SITE_AREA_SQM)} for residential development.`,
        isBlocker: true,
      };
    }

    if (areaSqm >= THRESHOLDS.STRATEGIC_AREA_SQM) {
      return {
        ruleId: 'RULE-AREA-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: areaSqm,
        explanation: `Site area ${formatArea(areaSqm)} exceeds the strategic land threshold (${formatArea(THRESHOLDS.STRATEGIC_AREA_SQM)}). May be suitable for long-term Local Plan promotion.`,
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-AREA-001',
      ruleVersion: this.version,
      outcome: 'soft_constraint',
      status: 'known',
      value: areaSqm,
      explanation: `Site area ${formatArea(areaSqm)} meets minimum threshold. Area alone does not confirm development viability.`,
      isBlocker: false,
    };
  },
};
