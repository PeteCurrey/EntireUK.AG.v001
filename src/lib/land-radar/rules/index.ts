/**
 * Land Radar — Rule Engine
 *
 * Rules are:
 * - Versioned (every rule has a version)
 * - Testable (pure functions where possible)
 * - Explainable (every result includes a human-readable explanation)
 * - Independently enabled/disabled
 * - Parameterised (thresholds from constants, not hardcoded)
 *
 * Hard exclusion vs soft constraint vs positive signal vs unknown:
 * These are distinct outcomes. Not every constraint eliminates a site.
 * The correct treatment depends on site, policy, use type and professional assessment.
 */

import type { SignalType, IntelligenceStatus, ConstraintSeverity } from '../types';
import { CURRENT_RULE_VERSION } from '../constants';

// ---------------------------------------------------------------------------
// Rule types
// ---------------------------------------------------------------------------

export type RuleOutcomeType =
  | 'hard_exclusion'  // removes candidate from THIS specific strategy
  | 'soft_constraint' // reduces attractiveness; does not eliminate
  | 'positive_signal' // increases investigation priority
  | 'unknown';        // insufficient data to determine

export interface RuleInput {
  siteId: string;
  /** Area in m² (from PostGIS calculation, not source-supplied) */
  areaSqm: number | null;
  /** Signal values keyed by signal type */
  signals?: Partial<Record<SignalType, {
    value: number | null;
    status: IntelligenceStatus;
  }>>;
  /** Additional context for specific rules */
  context?: Record<string, unknown>;
}

export interface RuleResult {
  ruleId: string;
  ruleVersion: string;
  outcome: RuleOutcomeType;
  status: IntelligenceStatus;
  value: number | null;
  explanation: string;
  /** Whether this result should stop further screening for this strategy */
  isBlocker: boolean;
}

export interface RuleDefinition {
  id: string;        // e.g. 'RULE-AREA-001'
  version: string;
  description: string;
  signalType: SignalType | null;
  enabled: boolean;
  evaluate: (input: RuleInput) => RuleResult;
}

// ---------------------------------------------------------------------------
// Rule registry
// ---------------------------------------------------------------------------

import { areaRule } from './area';
import { settlementRule } from './settlement';
import { accessRule } from './access';
import { constraintRules } from './constraints';
import { planningActivityRule, planningFrictionRule } from './planning';
import { marketEvidenceRule } from './market';
import { developmentCapacityRule } from './capacity';

export const RULE_REGISTRY: RuleDefinition[] = [
  areaRule,
  settlementRule,
  accessRule,
  ...constraintRules,
  planningActivityRule,
  planningFrictionRule,
  marketEvidenceRule,
  developmentCapacityRule,
];

// ---------------------------------------------------------------------------
// Screening Strategies
// ---------------------------------------------------------------------------

export interface ScreeningStrategy {
  id: string;
  name: string;
  version: string;
  activeRuleIds: string[];
  blockerRuleIds: string[];
  notes?: string;
}

export const RESIDENTIAL_DEVELOPMENT_V1: ScreeningStrategy = {
  id: 'RESIDENTIAL_DEVELOPMENT_V1',
  name: 'Residential Development Strategy v1',
  version: CURRENT_RULE_VERSION,
  activeRuleIds: [
    'RULE-AREA-001',
    'RULE-SETTLE-001',
    'RULE-ACCESS-001',
    'RULE-FLOOD-001',
    'RULE-GREEN-BELT-001',
    'RULE-SSSI-001',
    'RULE-BROWNFIELD-001',
  ],
  blockerRuleIds: [
    'RULE-AREA-001',
    'RULE-FLOOD-001',
    'RULE-GREEN-BELT-001',
    'RULE-SSSI-001',
  ],
  notes: 'Baseline screening strategy for standard residential development candidates in England.',
};

export const RESIDENTIAL_DEVELOPMENT_V2: ScreeningStrategy = {
  id: 'RESIDENTIAL_DEVELOPMENT_V2',
  name: 'Residential Development Strategy v2 (Planning Intelligence Aware)',
  version: 'v2',
  activeRuleIds: [
    'RULE-AREA-001',
    'RULE-SETTLE-001',
    'RULE-ACCESS-001',
    'RULE-FLOOD-001',
    'RULE-GREEN-BELT-001',
    'RULE-SSSI-001',
    'RULE-BROWNFIELD-001',
    'RULE-PLAN-001',
    'RULE-PLAN-002',
  ],
  blockerRuleIds: [
    'RULE-AREA-001',
    'RULE-FLOOD-001',
    'RULE-GREEN-BELT-001',
    'RULE-SSSI-001',
  ],
  notes: 'Phase 8 planning-aware screening strategy incorporating historical planning activity context and policy friction.',
};

export const RESIDENTIAL_DEVELOPMENT_V3: ScreeningStrategy = {
  id: 'RESIDENTIAL_DEVELOPMENT_V3',
  name: 'Residential Development Strategy v3 (Market Intelligence & Development Capacity Aware)',
  version: 'v3',
  activeRuleIds: [
    'RULE-AREA-001',
    'RULE-SETTLE-001',
    'RULE-ACCESS-001',
    'RULE-FLOOD-001',
    'RULE-GREEN-BELT-001',
    'RULE-SSSI-001',
    'RULE-BROWNFIELD-001',
    'RULE-PLAN-001',
    'RULE-PLAN-002',
    'RULE-MKT-001',
    'RULE-CAP-001',
  ],
  blockerRuleIds: [
    'RULE-AREA-001',
    'RULE-FLOOD-001',
    'RULE-GREEN-BELT-001',
    'RULE-SSSI-001',
  ],
  notes: 'Phase 9 market- and capacity-aware screening strategy incorporating HMLR Price Paid evidence, net developable footprint calculations, and indicative density benchmarks.',
};


// ---------------------------------------------------------------------------
// Rule runner
// ---------------------------------------------------------------------------

export interface ScreeningResult {
  siteId: string;
  passed: boolean;  // false = at least one hard exclusion for this strategy
  strategyId?: string;
  results: RuleResult[];
  hard_exclusions: RuleResult[];
  soft_constraints: RuleResult[];
  positive_signals: RuleResult[];
  unknowns: RuleResult[];
  explanation: string;
  rule_version: string;
}


/**
 * Run rules against a site according to a version-controlled screening strategy.
 * Defaults to RESIDENTIAL_DEVELOPMENT_V1 for backward compatibility.
 * Returns structured results with full explanations.
 */
export function runScreeningPipeline(
  input: RuleInput,
  strategy: ScreeningStrategy = RESIDENTIAL_DEVELOPMENT_V1
): ScreeningResult {
  const results: RuleResult[] = [];
  const activeIds = new Set(strategy.activeRuleIds);

  for (const rule of RULE_REGISTRY) {
    if (!rule.enabled) continue;
    if (!activeIds.has(rule.id)) continue;
    try {
      const result = rule.evaluate(input);
      results.push(result);
    } catch (err) {
      // Rule failure is recorded as unknown, not as pass
      results.push({
        ruleId: rule.id,
        ruleVersion: rule.version,
        outcome: 'unknown',
        status: 'unknown',
        value: null,
        explanation: `Rule ${rule.id} failed to evaluate: ${err instanceof Error ? err.message : 'Unknown error'}`,
        isBlocker: false,
      });
    }
  }

  const hard_exclusions = results.filter(r => r.outcome === 'hard_exclusion');
  const soft_constraints = results.filter(r => r.outcome === 'soft_constraint');
  const positive_signals = results.filter(r => r.outcome === 'positive_signal');
  const unknowns = results.filter(r => r.outcome === 'unknown');

  const blockerIds = new Set(strategy.blockerRuleIds);
  const passed = hard_exclusions.filter(r => r.isBlocker || blockerIds.has(r.ruleId)).length === 0;

  const summary = [
    passed ? 'Candidate passed initial screening.' : `Candidate did not pass initial screening (${hard_exclusions.length} hard exclusion(s)).`,
    positive_signals.length > 0 ? `${positive_signals.length} positive signal(s) detected.` : '',
    soft_constraints.length > 0 ? `${soft_constraints.length} soft constraint(s) noted.` : '',
    unknowns.length > 0 ? `${unknowns.length} signal(s) could not be determined due to missing data.` : '',
  ].filter(Boolean).join(' ');

  return {
    siteId: input.siteId,
    passed,
    strategyId: strategy.id,
    results,
    hard_exclusions,
    soft_constraints,
    positive_signals,
    unknowns,
    explanation: summary,
    rule_version: strategy.version,
  };
}

/**
 * Apply a single rule by ID.
 */
export function applyRule(ruleId: string, input: RuleInput): RuleResult | null {
  const rule = RULE_REGISTRY.find(r => r.id === ruleId);
  if (!rule) return null;
  return rule.evaluate(input);
}
