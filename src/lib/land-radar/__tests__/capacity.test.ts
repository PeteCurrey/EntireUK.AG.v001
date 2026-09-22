/**
 * Land Radar — Phase 9 Development Capacity & Strategy V3 Automated Tests
 *
 * Verifies:
 * 1. LocalPlanAdapter (Adopted Local Plan policy allocation ingestion, licence gate, polygon checks)
 * 2. capacityEngine (Gross vs net developable area, compound constraint deductions, indicative density benchmarks)
 * 3. Epistemic principles ("Gross site area != Developable area", uncalculated = unknown)
 * 4. Anti-Valuation Gate: Never predicts unverified dwelling counts
 * 5. RULE-MKT-001 and RULE-CAP-001
 * 6. RESIDENTIAL_DEVELOPMENT_V3 screening pipeline
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { LocalPlanAdapter } from '../adapters/localPlanAdapter';
import { evaluateDevelopmentCapacity } from '../development/capacityEngine';
import { buildDevelopmentPatternSignal } from '../signals';
import { marketEvidenceRule } from '../rules/market';
import { developmentCapacityRule } from '../rules/capacity';
import {
  runScreeningPipeline,
  RESIDENTIAL_DEVELOPMENT_V1,
  RESIDENTIAL_DEVELOPMENT_V2,
  RESIDENTIAL_DEVELOPMENT_V3,
} from '../rules';
import { WARWICK_PILOT, RUGBY_PILOT } from '../pilot/config';
import { Site } from '../types';

describe('Local Plan Allocation Adapter (Phase 9)', () => {
  const adapter = new LocalPlanAdapter();

  it('ingests Warwick adopted Local Plan allocations with verified OGL v3.0 licence', async () => {
    const res = await adapter.ingest(WARWICK_PILOT);
    assert.ok(res.records.length > 0, 'Should ingest Warwick Local Plan allocations');
    assert.strictEqual(res.retrievalMode, 'local_fixture');
    assert.strictEqual(res.geometryErrors, 0);

    const first = res.records[0];
    assert.ok(first.sourceId);
    assert.ok(first.policyReference);
    assert.ok(first.planName.includes('Warwick District Local Plan'));
    assert.strictEqual(first.geometry?.type, 'Polygon');
  });

  it('ingests Rugby adopted Local Plan allocations', async () => {
    const res = await adapter.ingest(RUGBY_PILOT);
    assert.ok(res.records.length > 0, 'Should ingest Rugby Local Plan allocations');
    assert.ok(res.records.some((r) => r.planName.includes('Rugby Borough Local Plan')));
  });

  it('enforces licence gate: rejects ingestion if licence unconfirmed', async () => {
    const unconfirmedPilot = {
      ...WARWICK_PILOT,
      datasetDecisions: WARWICK_PILOT.datasetDecisions.map((d) =>
        d.datasetId === 'LPA-LOCAL-PLAN-001' ? { ...d, licenceConfirmed: false } : d
      ),
    };
    await assert.rejects(
      async () => {
        await adapter.ingest(unconfirmedPilot);
      },
      /Licence gate failure/
    );
  });
});

describe('Development Capacity Engine', () => {
  const mockSite: Site = {
    id: 'SITE-DEV-001',
    internal_reference: 'EUK-S-DEV-001',
    name: 'Sample Development Land',
    status: 'candidate',
    source: 'hmlr',
    source_reference: 'TEST-SR-01',
    geometry: null,
    centroid: null,
    area_sqm: 20000, // 2.0 ha
    area_sqm_source: 20000,
    area_discrepancy_flag: false,
    local_authority: 'Warwick',
    country: 'england',
    postcode_sector: 'CV31 1',
    location_description: 'Warwick District',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('calculates unconstrained developable footprint when constraints are zero', () => {
    const capacity = evaluateDevelopmentCapacity({
      site: mockSite,
      floodOverlapPct: 0,
      greenBeltOverlapPct: 0,
      sssiOverlapPct: 0,
    });

    assert.strictEqual(capacity.gross_area_ha, 2);
    assert.strictEqual(capacity.constrained_percentage, 0);
    assert.strictEqual(capacity.developable_area_status, 'known');
    assert.strictEqual(capacity.potentially_developable_area_ha, 2);
    assert.strictEqual(capacity.development_potential, 'HIGH_DEVELOPMENT_POTENTIAL');
  });

  it('deducts spatial constraints from developable footprint', () => {
    const capacity = evaluateDevelopmentCapacity({
      site: mockSite,
      floodOverlapPct: 25,
      greenBeltOverlapPct: 0,
      sssiOverlapPct: 0,
    });

    assert.strictEqual(capacity.gross_area_ha, 2);
    assert.strictEqual(capacity.constrained_percentage, 25);
    assert.strictEqual(capacity.potentially_developable_area_ha, 1.5);
    assert.strictEqual(capacity.development_potential, 'MODERATE_DEVELOPMENT_POTENTIAL');
  });

  it('marks developable area as uncertain when compound constraints are heavy (>50%)', () => {
    const capacity = evaluateDevelopmentCapacity({
      site: mockSite,
      floodOverlapPct: 60,
      greenBeltOverlapPct: 0,
      sssiOverlapPct: 0,
    });

    assert.strictEqual(capacity.developable_area_status, 'uncertain');
    assert.strictEqual(capacity.development_potential, 'LOW_DEVELOPMENT_POTENTIAL');
    assert.ok(capacity.potential_classification_rationale.includes('Major physical or statutory designations'));
  });

  it('marks developable area as unknown when site area is missing', () => {
    const zeroSite: Site = {
      ...mockSite,
      area_sqm: null,
      area_sqm_source: null,
    };
    const capacity = evaluateDevelopmentCapacity({
      site: zeroSite,
    });

    assert.strictEqual(capacity.developable_area_status, 'unknown');
    assert.strictEqual(capacity.potentially_developable_area_ha, null);
    assert.strictEqual(capacity.development_potential, 'UNKNOWN');
  });

  it('never outputs an automated definitive dwelling prediction (Anti-Valuation Gate)', () => {
    const capacity = evaluateDevelopmentCapacity({
      site: mockSite,
    });

    const keys = Object.keys(capacity);
    assert.ok(!keys.includes('dwelling_units'));
    assert.ok(!keys.includes('total_dwellings'));
    assert.ok(!keys.includes('predicted_homes'));

    // Density is indicative range only
    assert.ok(capacity.indicative_density_min_dph !== undefined);
    assert.ok(capacity.indicative_density_max_dph !== undefined);
    assert.ok(capacity.capacity_caveats.some((c) => c.includes('Gross site area != Developable site area')));
  });
});

describe('Phase 9 Screening Rules: RULE-MKT-001 & RULE-CAP-001', () => {
  it('RULE-MKT-001: returns positive signal for strong market evidence', () => {
    const result = marketEvidenceRule.evaluate({
      siteId: 'SITE-001',
      areaSqm: 10000,
      signals: {
        market_signal: {
          value: 345000,
          status: 'known',
        },
      },
      context: {
        marketStrength: 'STRONG_MARKET_EVIDENCE',
        sampleSize: 8,
      },
    });

    assert.strictEqual(result.outcome, 'positive_signal');
    assert.strictEqual(result.status, 'known');
    assert.strictEqual(result.isBlocker, false);
    assert.ok(result.explanation.includes('Strong local residential market evidence'));
  });

  it('RULE-MKT-001: returns unknown when market signal status is unknown', () => {
    const result = marketEvidenceRule.evaluate({
      siteId: 'SITE-001',
      areaSqm: 10000,
      signals: {
        market_signal: {
          value: null,
          status: 'unknown',
        },
      },
    });

    assert.strictEqual(result.outcome, 'unknown');
    assert.strictEqual(result.status, 'unknown');
    assert.strictEqual(result.isBlocker, false);
  });

  it('RULE-CAP-001: returns positive signal for substantial unconstrained footprint', () => {
    const result = developmentCapacityRule.evaluate({
      siteId: 'SITE-001',
      areaSqm: 15000,
      signals: {
        development_pattern: {
          value: 1.5,
          status: 'known',
        },
      },
      context: {
        constrainedPercentage: 0,
      },
    });

    assert.strictEqual(result.outcome, 'positive_signal');
    assert.strictEqual(result.status, 'known');
    assert.strictEqual(result.isBlocker, false);
    assert.ok(result.explanation.includes('Substantial unconstrained developable footprint'));
  });

  it('RULE-CAP-001: returns soft constraint when constrained percentage is severe', () => {
    const result = developmentCapacityRule.evaluate({
      siteId: 'SITE-001',
      areaSqm: 15000,
      signals: {
        development_pattern: {
          value: 0.3,
          status: 'known',
        },
      },
      context: {
        constrainedPercentage: 80,
      },
    });

    assert.strictEqual(result.outcome, 'soft_constraint');
    assert.strictEqual(result.status, 'known');
    assert.strictEqual(result.isBlocker, false);
    assert.ok(result.explanation.includes('Severe physical or statutory constraint overlap'));
  });
});

describe('Multi-Strategy Screening Evolution (V1 vs V2 vs V3)', () => {
  const candidateInput = {
    siteId: 'SITE-MULTI-001',
    areaSqm: 12000,
    signals: {
      settlement_proximity: { value: 250, status: 'known' as const },
      road_proximity: { value: 45, status: 'known' as const },
      flood_risk: { value: 0, status: 'known' as const },
      protected_site: { value: 0, status: 'known' as const },
      brownfield_signal: { value: 1, status: 'known' as const },
      green_belt: { value: 0, status: 'known' as const },
      planning_activity: { value: 1, status: 'known' as const },
      market_signal: { value: 380000, status: 'known' as const },
      development_pattern: { value: 1.2, status: 'known' as const },
    },
    context: {
      marketStrength: 'STRONG_MARKET_EVIDENCE',
      sampleSize: 6,
      constrainedPercentage: 0,
    },
  };

  it('maintains backwards compatibility: V1 screens without planning or market rules', () => {
    const v1 = runScreeningPipeline(candidateInput, RESIDENTIAL_DEVELOPMENT_V1);
    assert.strictEqual(v1.passed, true);
    assert.ok(!v1.results.some((r) => r.ruleId === 'RULE-PLAN-001'));
    assert.ok(!v1.results.some((r) => r.ruleId === 'RULE-MKT-001'));
    assert.ok(!v1.results.some((r) => r.ruleId === 'RULE-CAP-001'));
  });

  it('maintains backwards compatibility: V2 screens with planning rules but without market rules', () => {
    const v2 = runScreeningPipeline(candidateInput, RESIDENTIAL_DEVELOPMENT_V2);
    assert.strictEqual(v2.passed, true);
    assert.ok(v2.results.some((r) => r.ruleId === 'RULE-PLAN-001'));
    assert.ok(!v2.results.some((r) => r.ruleId === 'RULE-MKT-001'));
    assert.ok(!v2.results.some((r) => r.ruleId === 'RULE-CAP-001'));
  });

  it('executes V3: incorporates RULE-MKT-001 and RULE-CAP-001 with increased positive signals', () => {
    const v2 = runScreeningPipeline(candidateInput, RESIDENTIAL_DEVELOPMENT_V2);
    const v3 = runScreeningPipeline(candidateInput, RESIDENTIAL_DEVELOPMENT_V3);

    assert.strictEqual(v3.passed, true);
    assert.ok(v3.results.some((r) => r.ruleId === 'RULE-MKT-001'));
    assert.ok(v3.results.some((r) => r.ruleId === 'RULE-CAP-001'));
    assert.ok(
      v3.positive_signals.length > v2.positive_signals.length,
      'V3 should gain additional market and capacity positive signals'
    );
  });
});
