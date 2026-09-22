import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  evaluateCandidatePriority,
  calculateEvidenceCompleteness,
  generateWhySurfacedProfile,
} from '../prioritisation';
import { Site, SiteSignal, SiteConstraint } from '../types';

function createMockSite(overrides?: Partial<Site>): Site {
  return {
    id: 'site-test-001',
    internal_reference: 'EUK-S-WARWICK-BF-001',
    name: 'Test Industrial Yard',
    status: 'candidate',
    source: 'PLAN-BROWNFIELD-001',
    source_reference: 'WAR-BF-001',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [[[[ -1.5, 52.3 ], [ -1.49, 52.3 ], [ -1.49, 52.31 ], [ -1.5, 52.31 ], [ -1.5, 52.3 ]]]],
    },
    centroid: { type: 'Point', coordinates: [-1.495, 52.305] },
    area_sqm: 120000,
    area_sqm_source: 120000,
    area_discrepancy_flag: false,
    local_authority: 'Warwick District',
    country: 'england',
    postcode_sector: null,
    location_description: 'Warwickshire',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('Land Radar Prioritisation Engine (Phase 6)', () => {
  it('strictly produces explainable categorical priorities without 0-100 numerical fake scores', () => {
    const site = createMockSite();
    const signals: SiteSignal[] = [
      {
        id: 'sig-1',
        site_id: site.id,
        signal_type: 'settlement_proximity',
        value: 150,
        unit: 'metres',
        value_text: null,
        status: 'known',
        confidence: 0.9,
        source: 'ONS-BUILTUP-001',
        data_source_id: null,
        explanation: 'Within 150m of settlement',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'sig-2',
        site_id: site.id,
        signal_type: 'flood_risk',
        value: 0,
        unit: 'percent',
        value_text: null,
        status: 'known',
        confidence: 0.95,
        source: 'EA-FLOOD-001',
        data_source_id: null,
        explanation: '0% flood zone overlap',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const result = evaluateCandidatePriority({
      site,
      signals,
      isBrownfield: true,
    });

    // Priority must be strictly one of categorical buckets
    assert.ok(['high', 'medium', 'low', 'unprioritised'].includes(result.priority));
    // Must NOT have any numerical score property
    assert.strictEqual((result as any).score, undefined);
    assert.strictEqual((result as any).points, undefined);

    // Must have explainable reasons and recommended actions
    assert.ok(result.priorityReasons.length > 0);
    assert.ok(result.recommendedNextActions.length > 0);
    assert.strictEqual(result.priority, 'high');
  });

  it('assigns medium priority to brownfield sites with manageable flood constraints', () => {
    const site = createMockSite();
    const signals: SiteSignal[] = [
      {
        id: 'sig-1',
        site_id: site.id,
        signal_type: 'settlement_proximity',
        value: 200,
        unit: 'metres',
        value_text: null,
        status: 'known',
        confidence: 0.9,
        source: 'ONS-BUILTUP-001',
        data_source_id: null,
        explanation: 'Within 200m of settlement',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'sig-2',
        site_id: site.id,
        signal_type: 'flood_risk',
        value: 15, // 15% flood zone 3 overlap
        unit: 'percent',
        value_text: null,
        status: 'known',
        confidence: 0.95,
        source: 'EA-FLOOD-001',
        data_source_id: null,
        explanation: '15% flood zone 3 overlap',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const result = evaluateCandidatePriority({
      site,
      signals,
      isBrownfield: true,
    });

    assert.strictEqual(result.priority, 'medium');
    assert.ok(result.priorityReasons.some((r) => r.includes('flood constraint')));
    assert.ok(result.recommendedNextActions.some((a) => a.includes('Flood Risk Assessment')));
  });

  it('assigns low priority to sites with severe physical constraints (>40% flood)', () => {
    const site = createMockSite();
    const signals: SiteSignal[] = [
      {
        id: 'sig-1',
        site_id: site.id,
        signal_type: 'flood_risk',
        value: 55, // 55% flood zone 3 overlap
        unit: 'percent',
        value_text: null,
        status: 'known',
        confidence: 0.95,
        source: 'EA-FLOOD-001',
        data_source_id: null,
        explanation: '55% flood zone 3 overlap',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const result = evaluateCandidatePriority({
      site,
      signals,
      isBrownfield: false,
    });

    assert.strictEqual(result.priority, 'low');
    assert.ok(result.priorityReasons.some((r) => r.toLowerCase().includes('severe flood risk')));
  });

  it('accurately calculates evidence completeness and exposes unassessed visual unknowns', () => {
    const signals: SiteSignal[] = [
      {
        id: 'sig-1',
        site_id: 'site-1',
        signal_type: 'settlement_proximity',
        value: 100,
        unit: 'metres',
        value_text: null,
        status: 'known',
        confidence: 0.9,
        source: 'ONS',
        data_source_id: null,
        explanation: 'Assessed',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'sig-2',
        site_id: 'site-1',
        signal_type: 'flood_risk',
        value: 0,
        unit: 'percent',
        value_text: null,
        status: 'known',
        confidence: 0.9,
        source: 'EA',
        data_source_id: null,
        explanation: 'Assessed',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'sig-3',
        site_id: 'site-1',
        signal_type: 'green_belt',
        value: null,
        unit: null,
        value_text: null,
        status: 'unknown', // Explicit epistemic unknown
        confidence: null,
        source: 'LPA-GREENBELT-001',
        data_source_id: null,
        explanation: 'Dataset deferred',
        calculated_at: new Date().toISOString(),
        rule_version: 'v1',
        ingestion_job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const completeness = calculateEvidenceCompleteness(signals, false);
    // Origin is always counted + settlement + flood = 3 assessed out of 7
    assert.strictEqual(completeness.evaluatedCount, 3);
    assert.strictEqual(completeness.totalCount, 7);
    assert.strictEqual(completeness.percentage, 43);
    assert.ok(completeness.missingCategories.includes('Local Plan Green Belt Policy'));
    assert.ok(completeness.missingCategories.includes('LPA Planning History'));

    const whySurfaced = generateWhySurfacedProfile(createMockSite(), signals, [], true);
    assert.ok(whySurfaced.visualUnknowns.some((vu) => vu.category === 'Green Belt Policy'));
    assert.ok(whySurfaced.visualUnknowns.some((vu) => vu.category === 'Detailed Planning History'));
  });
});
