/**
 * RULE-FLOOD-001: Flood Zone Constraint
 * RULE-GREEN-BELT-001: Green Belt Constraint
 *
 * CRITICAL: These are constraints, not automatic disqualifiers.
 * Flood risk may be a serious constraint, but it does not automatically mean
 * "no development possible". The correct treatment depends on:
 * - The specific flood zone (1, 2, 3, 3b)
 * - The percentage of the site affected
 * - The policy context (local plan, sequential test)
 * - The proposed use type
 * - Professional engineering and planning assessment
 *
 * severity_is_derived = true: Entire UK is applying a label, not the source.
 */

import type { RuleDefinition, RuleInput, RuleResult } from './index';
import { THRESHOLDS, CURRENT_RULE_VERSION } from '../constants';

// ---------------------------------------------------------------------------
// Flood Zone
// ---------------------------------------------------------------------------

export const floodZoneRule: RuleDefinition = {
  id: 'RULE-FLOOD-001',
  version: CURRENT_RULE_VERSION,
  description: 'Flood zone constraint detection. Severity depends on zone and overlap percentage.',
  signalType: 'flood_risk',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const signal = input.signals?.flood_risk;

    if (!signal || signal.status === 'unknown') {
      return {
        ruleId: 'RULE-FLOOD-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Flood risk data unavailable. The Environment Agency dataset was not available or this site was not covered. Absence of flood data DOES NOT mean no flood risk.',
        isBlocker: false,
      };
    }

    const overlapPct = signal.value;

    if (overlapPct === null || overlapPct === 0) {
      return {
        ruleId: 'RULE-FLOOD-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: 0,
        explanation: 'No flood zone overlap detected with available Environment Agency data. Flood risk appears low for this site based on current data.',
        isBlocker: false,
      };
    }

    if (overlapPct >= THRESHOLDS.FLOOD_ZONE_3_MATERIAL_PCT) {
      return {
        ruleId: 'RULE-FLOOD-001',
        ruleVersion: this.version,
        outcome: 'hard_exclusion',
        status: 'known',
        value: overlapPct,
        explanation: `${overlapPct.toFixed(1)}% of site overlaps Environment Agency Flood Zone 3 (high risk). This is a material constraint requiring sequential and exception test assessment. Residential development may face significant policy resistance. Professional flood risk assessment required. [Severity: Entire UK derived]`,
        isBlocker: true,
      };
    }

    if (overlapPct >= THRESHOLDS.FLOOD_ZONE_2_SOFT_PCT) {
      return {
        ruleId: 'RULE-FLOOD-001',
        ruleVersion: this.version,
        outcome: 'soft_constraint',
        status: 'known',
        value: overlapPct,
        explanation: `${overlapPct.toFixed(1)}% of site overlaps a flood zone. This is a soft constraint that requires professional flood risk assessment but does not automatically preclude development. [Severity: Entire UK derived]`,
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-FLOOD-001',
      ruleVersion: this.version,
      outcome: 'soft_constraint',
      status: 'known',
      value: overlapPct,
      explanation: `${overlapPct.toFixed(1)}% of site overlaps a flood zone. Minor overlap. Professional assessment required for any planning application.`,
      isBlocker: false,
    };
  },
};

// ---------------------------------------------------------------------------
// Green Belt
// ---------------------------------------------------------------------------

export const greenBeltRule: RuleDefinition = {
  id: 'RULE-GREEN-BELT-001',
  version: CURRENT_RULE_VERSION,
  description: 'Green Belt constraint detection. Green Belt is a policy designation, not a planning refusal in all cases.',
  signalType: 'green_belt',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const signal = input.signals?.green_belt;

    if (!signal || signal.status === 'unknown') {
      return {
        ruleId: 'RULE-GREEN-BELT-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Green Belt data unavailable. Cannot determine whether this site is within a Green Belt designation.',
        isBlocker: false,
      };
    }

    const overlapPct = signal.value;

    if (overlapPct === null || overlapPct === 0) {
      return {
        ruleId: 'RULE-GREEN-BELT-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: 0,
        explanation: 'No Green Belt overlap detected. Site does not appear to be within a Green Belt designation.',
        isBlocker: false,
      };
    }

    // Green Belt is a hard exclusion for standard residential screening
    // but NOT for all opportunity types (e.g. brownfield within Green Belt,
    // affordable housing, infrastructure, or sites subject to Green Belt review)
    return {
      ruleId: 'RULE-GREEN-BELT-001',
      ruleVersion: this.version,
      outcome: 'hard_exclusion',
      status: 'known',
      value: overlapPct,
      explanation: `${overlapPct.toFixed(1)}% of site overlaps a Green Belt designation. Green Belt is a strong policy constraint under NPPF. Residential development faces high policy resistance. Green Belt review, exceptional circumstances, or alternative use types may be relevant. [Severity: Entire UK derived, not source-established]`,
      isBlocker: true,
    };
  },
};

// ---------------------------------------------------------------------------
// SSSI (Sites of Special Scientific Interest)
// ---------------------------------------------------------------------------

export const sssiRule: RuleDefinition = {
  id: 'RULE-SSSI-001',
  version: CURRENT_RULE_VERSION,
  description: 'SSSI statutory nature conservation constraint detection.',
  signalType: 'protected_site',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const signal = input.signals?.protected_site;

    if (!signal || signal.status === 'unknown') {
      return {
        ruleId: 'RULE-SSSI-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'SSSI designation data unavailable for this area.',
        isBlocker: false,
      };
    }

    const overlapPct = signal.value;

    if (overlapPct === null || overlapPct === 0) {
      return {
        ruleId: 'RULE-SSSI-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: 0,
        explanation: 'No SSSI statutory designation overlap detected on site.',
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-SSSI-001',
      ruleVersion: this.version,
      outcome: 'hard_exclusion',
      status: 'known',
      value: overlapPct,
      explanation: `${overlapPct.toFixed(1)}% of site overlaps a Site of Special Scientific Interest (SSSI). Strong statutory protection under Wildlife & Countryside Act 1981 / NPPF. Significant barrier to standard residential allocation.`,
      isBlocker: true,
    };
  },
};

// ---------------------------------------------------------------------------
// Brownfield Register Signal
// ---------------------------------------------------------------------------

export const brownfieldRule: RuleDefinition = {
  id: 'RULE-BROWNFIELD-001',
  version: CURRENT_RULE_VERSION,
  description: 'Brownfield register presence. Policy presumption in favour of previously developed land.',
  signalType: 'brownfield_signal',
  enabled: true,
  evaluate(input: RuleInput): RuleResult {
    const signal = input.signals?.brownfield_signal;

    if (!signal || signal.status === 'unknown') {
      return {
        ruleId: 'RULE-BROWNFIELD-001',
        ruleVersion: this.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: 'Brownfield register data unavailable or unrecorded for this site.',
        isBlocker: false,
      };
    }

    if (signal.value === 1) {
      return {
        ruleId: 'RULE-BROWNFIELD-001',
        ruleVersion: this.version,
        outcome: 'positive_signal',
        status: 'known',
        value: 1,
        explanation: 'Site is recorded on the Local Planning Authority Brownfield Land Register. Strong policy support under NPPF Paragraph 123 for previously developed land reuse.',
        isBlocker: false,
      };
    }

    return {
      ruleId: 'RULE-BROWNFIELD-001',
      ruleVersion: this.version,
      outcome: 'soft_constraint',
      status: 'known',
      value: 0,
      explanation: 'Site is not identified as previously developed brownfield land.',
      isBlocker: false,
    };
  },
};

export const constraintRules: RuleDefinition[] = [
  floodZoneRule,
  greenBeltRule,
  sssiRule,
  brownfieldRule,
];

