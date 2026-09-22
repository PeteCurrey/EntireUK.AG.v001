/**
 * Land Radar — Rule Engine Tests
 *
 * Tests cover:
 * - Positive candidate (passes all rules)
 * - Excluded candidate (hard exclusion triggered)
 * - Unknown data (signals missing)
 * - Conflicting data
 * - Correct explanation text
 * - No magic scores (all results are typed outcomes, not numbers)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runScreeningPipeline, applyRule } from '../rules/index';
import type { RuleInput } from '../rules/index';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const PASSING_CANDIDATE: RuleInput = {
  siteId: 'TEST-SITE-001',
  areaSqm: 5_000, // 0.5 ha — above minimum, below strategic
  signals: {
    settlement_proximity: { value: 400, status: 'known' },
    road_proximity: { value: 50, status: 'known' },
    flood_risk: { value: 0, status: 'known' },
    green_belt: { value: 0, status: 'known' },
  },
};

const EXCLUDED_BY_AREA: RuleInput = {
  siteId: 'TEST-SITE-002',
  areaSqm: 100, // below minimum 1000 m²
  signals: {
    settlement_proximity: { value: 200, status: 'known' },
    road_proximity: { value: 20, status: 'known' },
    flood_risk: { value: 0, status: 'known' },
    green_belt: { value: 0, status: 'known' },
  },
};

const EXCLUDED_BY_FLOOD: RuleInput = {
  siteId: 'TEST-SITE-003',
  areaSqm: 15_000,
  signals: {
    settlement_proximity: { value: 300, status: 'known' },
    road_proximity: { value: 40, status: 'known' },
    flood_risk: { value: 75, status: 'known' }, // 75% in Flood Zone 3 — hard exclusion
    green_belt: { value: 0, status: 'known' },
  },
};

const EXCLUDED_BY_GREEN_BELT: RuleInput = {
  siteId: 'TEST-SITE-004',
  areaSqm: 20_000,
  signals: {
    settlement_proximity: { value: 150, status: 'known' },
    road_proximity: { value: 30, status: 'known' },
    flood_risk: { value: 0, status: 'known' },
    green_belt: { value: 85, status: 'known' }, // in Green Belt — hard exclusion
  },
};

const ALL_UNKNOWN: RuleInput = {
  siteId: 'TEST-SITE-005',
  areaSqm: null, // geometry unknown
  signals: {
    settlement_proximity: { value: null, status: 'unknown' },
    road_proximity: { value: null, status: 'unknown' },
    flood_risk: { value: null, status: 'unknown' },
    green_belt: { value: null, status: 'unknown' },
  },
};

const CONFLICTING_SETTLEMENT: RuleInput = {
  siteId: 'TEST-SITE-006',
  areaSqm: 8_000,
  signals: {
    settlement_proximity: { value: 600, status: 'conflicting' },
    road_proximity: { value: 45, status: 'known' },
    flood_risk: { value: 0, status: 'known' },
    green_belt: { value: 0, status: 'known' },
  },
};

// ---------------------------------------------------------------------------
// Pipeline tests
// ---------------------------------------------------------------------------

describe('runScreeningPipeline — positive candidate', () => {
  const result = runScreeningPipeline(PASSING_CANDIDATE);

  it('passes screening', () => {
    assert.strictEqual(result.passed, true);
  });

  it('has no hard exclusions', () => {
    assert.strictEqual(result.hard_exclusions.length, 0);
  });

  it('produces an explanation string', () => {
    assert.ok(result.explanation);
    assert.strictEqual(typeof result.explanation, 'string');
  });

  it('records rule version', () => {
    assert.strictEqual(result.rule_version, 'v1');
  });

  it('has no magic score in results', () => {
    for (const r of result.results) {
      assert.strictEqual(typeof r.outcome, 'string');
      assert.ok(['hard_exclusion', 'soft_constraint', 'positive_signal', 'unknown'].includes(r.outcome));
    }
  });
});

describe('runScreeningPipeline — excluded by area', () => {
  const result = runScreeningPipeline(EXCLUDED_BY_AREA);

  it('fails screening', () => {
    assert.strictEqual(result.passed, false);
  });

  it('has area hard exclusion', () => {
    const areaExclusion = result.hard_exclusions.find(r => r.ruleId === 'RULE-AREA-001');
    assert.ok(areaExclusion);
    assert.strictEqual(areaExclusion?.isBlocker, true);
  });

  it('explanation mentions the rule', () => {
    const areaResult = result.results.find(r => r.ruleId === 'RULE-AREA-001');
    assert.ok(areaResult?.explanation.includes('below'));
  });
});

describe('runScreeningPipeline — excluded by flood zone 3', () => {
  const result = runScreeningPipeline(EXCLUDED_BY_FLOOD);

  it('fails screening', () => {
    assert.strictEqual(result.passed, false);
  });

  it('has flood hard exclusion', () => {
    const floodExclusion = result.hard_exclusions.find(r => r.ruleId === 'RULE-FLOOD-001');
    assert.ok(floodExclusion);
    assert.strictEqual(floodExclusion?.isBlocker, true);
  });

  it('explanation mentions severity is derived', () => {
    const floodResult = result.results.find(r => r.ruleId === 'RULE-FLOOD-001');
    assert.ok(floodResult?.explanation.includes('derived'));
  });
});

describe('runScreeningPipeline — excluded by Green Belt', () => {
  const result = runScreeningPipeline(EXCLUDED_BY_GREEN_BELT);

  it('fails screening', () => {
    assert.strictEqual(result.passed, false);
  });

  it('has Green Belt hard exclusion', () => {
    const gbExclusion = result.hard_exclusions.find(r => r.ruleId === 'RULE-GREEN-BELT-001');
    assert.ok(gbExclusion);
    assert.strictEqual(gbExclusion?.isBlocker, true);
  });

  it('explanation notes severity is derived not source-established', () => {
    const gbResult = result.results.find(r => r.ruleId === 'RULE-GREEN-BELT-001');
    assert.ok(gbResult?.explanation.includes('derived'));
  });
});

describe('runScreeningPipeline — all data unknown', () => {
  const result = runScreeningPipeline(ALL_UNKNOWN);

  it('does not fail screening on unknown data alone', () => {
    const blockers = result.hard_exclusions.filter(r => r.isBlocker);
    assert.strictEqual(blockers.length, 0);
  });

  it('records all signals as unknown', () => {
    const unknowns = result.unknowns;
    assert.ok(unknowns.length > 0);
  });

  it('unknown explanation indicates data unavailability rather than clearance', () => {
    for (const u of result.unknowns) {
      assert.ok(
        u.explanation.toLowerCase().includes('unavailable') ||
        u.explanation.toLowerCase().includes('not available') ||
        u.explanation.toLowerCase().includes('could not be calculated')
      );
      assert.ok(!u.explanation.toLowerCase().includes('no constraint detected'));
    }
  });
});

describe('runScreeningPipeline — conflicting settlement data', () => {
  const result = runScreeningPipeline(CONFLICTING_SETTLEMENT);

  it('records settlement as unknown/conflicting', () => {
    const settlementResult = result.results.find(r => r.ruleId === 'RULE-SETTLE-001');
    assert.strictEqual(settlementResult?.status, 'conflicting');
    assert.strictEqual(settlementResult?.outcome, 'unknown');
  });

  it('does not block screening on conflicting data alone', () => {
    const settlementResult = result.results.find(r => r.ruleId === 'RULE-SETTLE-001');
    assert.strictEqual(settlementResult?.isBlocker, false);
  });
});

// ---------------------------------------------------------------------------
// Individual rule tests
// ---------------------------------------------------------------------------

describe('RULE-AREA-001', () => {
  it('positive signal for strategic land', () => {
    const result = applyRule('RULE-AREA-001', { siteId: 'x', areaSqm: 150_000 });
    assert.strictEqual(result?.outcome, 'positive_signal');
  });

  it('hard exclusion for sub-minimum area', () => {
    const result = applyRule('RULE-AREA-001', { siteId: 'x', areaSqm: 50 });
    assert.strictEqual(result?.outcome, 'hard_exclusion');
    assert.strictEqual(result?.isBlocker, true);
  });

  it('unknown for null area', () => {
    const result = applyRule('RULE-AREA-001', { siteId: 'x', areaSqm: null });
    assert.strictEqual(result?.outcome, 'unknown');
    assert.strictEqual(result?.isBlocker, false);
  });

  it('soft constraint for normal-sized site', () => {
    const result = applyRule('RULE-AREA-001', { siteId: 'x', areaSqm: 8_000 });
    assert.strictEqual(result?.outcome, 'soft_constraint');
  });
});

describe('RULE-ACCESS-001', () => {
  it('positive signal for road-adjacent site', () => {
    const result = applyRule('RULE-ACCESS-001', {
      siteId: 'x', areaSqm: 5000,
      signals: { road_proximity: { value: 30, status: 'known' } },
    });
    assert.strictEqual(result?.outcome, 'positive_signal');
  });

  it('unknown when no data', () => {
    const result = applyRule('RULE-ACCESS-001', {
      siteId: 'x', areaSqm: 5000,
      signals: { road_proximity: { value: null, status: 'unknown' } },
    });
    assert.strictEqual(result?.outcome, 'unknown');
    assert.strictEqual(result?.isBlocker, false);
  });
});

describe('RULE-FLOOD-001 — absence of data is not clearance', () => {
  it('unknown when flood data unavailable', () => {
    const result = applyRule('RULE-FLOOD-001', {
      siteId: 'x', areaSqm: 5000,
      signals: { flood_risk: { value: null, status: 'unknown' } },
    });
    assert.strictEqual(result?.outcome, 'unknown');
    assert.ok(result?.explanation.includes('DOES NOT mean'));
  });

  it('positive signal when no overlap', () => {
    const result = applyRule('RULE-FLOOD-001', {
      siteId: 'x', areaSqm: 5000,
      signals: { flood_risk: { value: 0, status: 'known' } },
    });
    assert.strictEqual(result?.outcome, 'positive_signal');
  });
});
