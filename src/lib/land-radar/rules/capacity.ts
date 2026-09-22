/**
 * Land Radar — Development Capacity Screening Rules
 *
 * RULE-CAP-001: Development Capacity & Constraint Ratio
 *
 * CRITICAL SEMANTICS:
 * - Gross site area != Net developable area.
 * - Compounding environmental constraints reduce developable efficiency.
 * - Indicative density ranges are policy benchmarks, NOT permitted unit counts.
 */

import { RuleDefinition, RuleInput, RuleResult } from './index';

export const developmentCapacityRule: RuleDefinition = {
  id: 'RULE-CAP-001',
  version: 'v3',
  description: 'Evaluates net developable area ratio and physical development capacity.',
  signalType: 'development_pattern',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const devSig = input.signals?.development_pattern;

    if (!devSig || devSig.status === 'unknown') {
      return {
        ruleId: 'RULE-CAP-001',
        ruleVersion: 'v3',
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Development capacity and net developable area unassessed for this candidate.',
        isBlocker: false,
      };
    }

    const context = input.context || {};
    const constrainedPct = (context.constrainedPercentage as number) ?? 0;
    const potentiallyDevelopableHa = (devSig.value as number) ?? ((input.areaSqm ?? 0) / 10000);

    if (constrainedPct >= 70) {
      return {
        ruleId: 'RULE-CAP-001',
        ruleVersion: 'v3',
        outcome: 'soft_constraint',
        status: 'known',
        value: potentiallyDevelopableHa,
        explanation: `Severe physical or statutory constraint overlap (${constrainedPct}%). Net developable capacity is highly compromised and requires comprehensive masterplan offsets.`,
        isBlocker: false,
      };
    }

    if (constrainedPct > 30) {
      return {
        ruleId: 'RULE-CAP-001',
        ruleVersion: 'v3',
        outcome: 'soft_constraint',
        status: 'known',
        value: potentiallyDevelopableHa,
        explanation: `Moderate constraint deductions (${constrainedPct}%). Estimated net developable footprint ~${potentiallyDevelopableHa.toFixed(2)} ha requires sequential layout.`,
        isBlocker: false,
      };
    }

    if (potentiallyDevelopableHa >= 0.5) {
      return {
        ruleId: 'RULE-CAP-001',
        ruleVersion: 'v3',
        outcome: 'positive_signal',
        status: 'known',
        value: potentiallyDevelopableHa,
        explanation: `Substantial unconstrained developable footprint (~${potentiallyDevelopableHa.toFixed(2)} ha with low constraint deductions of ${constrainedPct}%). Favourable development efficiency.`,
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-CAP-001',
      ruleVersion: 'v3',
      outcome: 'positive_signal',
      status: 'known',
      value: potentiallyDevelopableHa,
      explanation: `Compact developable parcel (~${potentiallyDevelopableHa.toFixed(2)} ha). Suitable for infill or bespoke urban redevelopment scheme.`,
      isBlocker: false,
    };
  },
};
