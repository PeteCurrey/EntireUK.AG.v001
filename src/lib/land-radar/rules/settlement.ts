/**
 * RULE-SETTLE-001: Settlement Proximity
 *
 * Candidate within configurable distance of settlement boundary.
 * Positive signal: within threshold.
 * Soft constraint: beyond threshold.
 * Unknown: no proximity data available.
 */

import type { RuleDefinition, RuleInput, RuleResult } from './index';
import { THRESHOLDS, CURRENT_RULE_VERSION } from '../constants';

export const settlementRule: RuleDefinition = {
  id: 'RULE-SETTLE-001',
  version: CURRENT_RULE_VERSION,
  description: 'Settlement proximity: positive signal if within settlement threshold.',
  signalType: 'settlement_proximity',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const signal = input.signals?.settlement_proximity;

    if (!signal || signal.status === 'unknown') {
      return {
        ruleId: 'RULE-SETTLE-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Settlement proximity data not available. This is recorded as unknown, not as no-constraint.',
        isBlocker: false,
      };
    }

    if (signal.status === 'conflicting') {
      return {
        ruleId: 'RULE-SETTLE-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'conflicting',
        value: signal.value,
        explanation: `Conflicting settlement proximity data. Multiple sources disagree on distance (${signal.value !== null ? `${signal.value}m` : 'unknown'}). Human review required.`,
        isBlocker: false,
      };
    }

    const distanceM = signal.value;

    if (distanceM === null) {
      return {
        ruleId: 'RULE-SETTLE-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Settlement proximity signal present but value is null.',
        isBlocker: false,
      };
    }

    if (distanceM <= THRESHOLDS.SETTLEMENT_PROXIMITY_M) {
      return {
        ruleId: 'RULE-SETTLE-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: distanceM,
        explanation: `Site lies within ${distanceM}m of settlement boundary (threshold: ${THRESHOLDS.SETTLEMENT_PROXIMITY_M}m). Settlement adjacency is a positive indicator for residential development viability.`,
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-SETTLE-001',
      ruleVersion: this.version,
      outcome: 'soft_constraint',
      status: 'known',
      value: distanceM,
      explanation: `Site is ${distanceM}m from nearest settlement boundary, beyond the ${THRESHOLDS.SETTLEMENT_PROXIMITY_M}m threshold. Remote sites face higher policy resistance for residential development.`,
      isBlocker: false,
    };
  },
};
