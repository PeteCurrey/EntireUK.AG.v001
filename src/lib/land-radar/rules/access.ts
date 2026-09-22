/**
 * RULE-ACCESS-001: Road Access Proximity
 *
 * Candidate must be within configurable distance of an appropriate road.
 * Hard exclusion only if no road exists within a substantial distance.
 * Soft constraint if access is distant but potentially achievable.
 */

import type { RuleDefinition, RuleInput, RuleResult } from './index';
import { THRESHOLDS, CURRENT_RULE_VERSION } from '../constants';

/** Distance beyond which road access creates a hard exclusion for standard residential */
const HARD_EXCLUSION_ROAD_M = THRESHOLDS.ROAD_PROXIMITY_M * 20; // 2000m

export const accessRule: RuleDefinition = {
  id: 'RULE-ACCESS-001',
  version: CURRENT_RULE_VERSION,
  description: 'Road access proximity: hard exclusion if no road within extreme distance; soft constraint if access is distant.',
  signalType: 'road_proximity',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const signal = input.signals?.road_proximity;

    if (!signal || signal.status === 'unknown') {
      return {
        ruleId: 'RULE-ACCESS-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Road proximity data unavailable. Access adequacy cannot be determined. Recorded as unknown, not as adequate.',
        isBlocker: false,
      };
    }

    const distanceM = signal.value;

    if (distanceM === null) {
      return {
        ruleId: 'RULE-ACCESS-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Road proximity signal present but value is null.',
        isBlocker: false,
      };
    }

    if (distanceM <= THRESHOLDS.ROAD_PROXIMITY_M) {
      return {
        ruleId: 'RULE-ACCESS-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: distanceM,
        explanation: `Site is ${distanceM}m from the nearest road (threshold: ${THRESHOLDS.ROAD_PROXIMITY_M}m). Direct road access is a positive indicator. Professional highways assessment still required.`,
        isBlocker: false,
      };
    }

    if (distanceM > HARD_EXCLUSION_ROAD_M) {
      return {
        ruleId: 'RULE-ACCESS-001',
        ruleVersion: this.version,
        outcome: 'hard_exclusion',
        status: 'known',
        value: distanceM,
        explanation: `Site is ${distanceM}m from the nearest road, beyond the hard exclusion threshold of ${HARD_EXCLUSION_ROAD_M}m for standard residential screening. Access creation would be exceptional and economically challenging.`,
        isBlocker: true,
      };
    }

    return {
      ruleId: 'RULE-ACCESS-001',
      ruleVersion: this.version,
      outcome: 'soft_constraint',
      status: 'known',
      value: distanceM,
      explanation: `Site is ${distanceM}m from the nearest road. Access is achievable but will require highways design and potentially adoption agreements. This is a material cost consideration.`,
      isBlocker: false,
    };
  },
};
