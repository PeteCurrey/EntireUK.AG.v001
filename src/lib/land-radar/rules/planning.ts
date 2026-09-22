/**
 * Land Radar — Planning Screening Rules
 *
 * RULE-PLAN-001: Planning Activity & Prior Development Context
 * RULE-PLAN-002: Historical Planning Policy Friction
 *
 * CRITICAL SEMANTICS:
 * - A previous approval is a positive contextual signal, NOT a guarantee of developability.
 * - A previous refusal is a soft constraint / friction indicator, NOT an absolute exclusion.
 * - Unknown is preserved when planning records are unassessed.
 */

import { RuleDefinition, RuleInput, RuleResult } from './index';

export const planningActivityRule: RuleDefinition = {
  id: 'RULE-PLAN-001',
  version: 'v2',
  description: 'Evaluates planning application history and prior development principle.',
  signalType: 'planning_activity',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const planSig = input.signals?.planning_activity;

    if (!planSig || planSig.status === 'unknown') {
      return {
        ruleId: 'RULE-PLAN-001',
        ruleVersion: 'v2',
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Planning history not available for this site. Epistemic status unknown.',
        isBlocker: false,
      };
    }

    const appCount = planSig.value ?? 0;
    const context = input.context || {};
    const hasApproval = Boolean(context.hasApprovedPlanning);

    if (appCount > 0 && hasApproval) {
      return {
        ruleId: 'RULE-PLAN-001',
        ruleVersion: 'v2',
        outcome: 'positive_signal',
        status: 'known',
        value: appCount,
        explanation: `Historical planning approval identified on site (${appCount} total record(s)). Establishes prior principle of development in planning policy context.`,
        isBlocker: false,
      };
    }

    if (appCount > 0) {
      return {
        ruleId: 'RULE-PLAN-001',
        ruleVersion: 'v2',
        outcome: 'positive_signal',
        status: 'known',
        value: appCount,
        explanation: `${appCount} planning application(s) identified in candidate vicinity. Active planning context.`,
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-PLAN-001',
      ruleVersion: 'v2',
      outcome: 'positive_signal',
      status: 'known',
      value: 0,
      explanation: 'No historical planning applications identified in digital LPA register. Absence of records does not confirm clearance.',
      isBlocker: false,
    };
  },
};

export const planningFrictionRule: RuleDefinition = {
  id: 'RULE-PLAN-002',
  version: 'v2',
  description: 'Identifies historical planning refusals or policy objections warranting investigation.',
  signalType: 'planning_activity',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const planSig = input.signals?.planning_activity;

    if (!planSig || planSig.status === 'unknown') {
      return {
        ruleId: 'RULE-PLAN-002',
        ruleVersion: 'v2',
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Planning history not available to assess refusal friction.',
        isBlocker: false,
      };
    }

    const context = input.context || {};
    const hasRefusal = Boolean(context.hasRefusedPlanning);
    const refusalCount = Number(context.refusalCount || (hasRefusal ? 1 : 0));

    if (hasRefusal) {
      return {
        ruleId: 'RULE-PLAN-002',
        ruleVersion: 'v2',
        outcome: 'soft_constraint',
        status: 'known',
        value: refusalCount,
        explanation: `Historical planning refusal identified (${refusalCount} application(s)). Indicates previous policy, highways, or layout friction. Soft constraint for investigation, not an automatic blocker.`,
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-PLAN-002',
      ruleVersion: 'v2',
      outcome: 'positive_signal',
      status: 'known',
      value: 0,
      explanation: 'No historical planning refusals identified in available records.',
      isBlocker: false,
    };
  },
};
