/**
 * Pilot Pipeline — Automated Tests
 *
 * Tests the complete execution of EUK-PILOT-001 (Warwick District):
 * site generation, deduplication, screening strategy, and report generation.
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { WARWICK_PILOT } from '../pilot/config';
import { generatePilotSites } from '../pilot/siteGenerator';
import { runPilot } from '../pilot/runPilot';

describe('Pilot Site Generator', () => {
  it('generates candidate sites with canonical EUK-S-WARWICK references', () => {
    const brownfieldSample = [
      {
        sourceId: 'PLAN-BROWNFIELD-001',
        siteReference: 'TEST-001',
        name: 'Test Site 1',
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [-1.55, 52.28],
              [-1.54, 52.28],
              [-1.54, 52.29],
              [-1.55, 52.29],
              [-1.55, 52.28],
            ],
          ] as any,
        },
        rawRecord: {},
      },
    ];

    const res = generatePilotSites(WARWICK_PILOT, brownfieldSample);
    assert.strictEqual(res.totalGenerated, 1);
    assert.strictEqual(res.brownfieldSites, 1);
    assert.ok(res.candidates[0].site.internal_reference.startsWith('EUK-S-WARWICK-BF-'));
  });

  it('deduplicates overlapping parcels from candidate site generation', () => {
    const brownfieldSample = [
      {
        sourceId: 'PLAN-BROWNFIELD-001',
        siteReference: 'BF-CENTRAL',
        name: 'Central Site',
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [-1.55, 52.28],
              [-1.54, 52.28],
              [-1.54, 52.29],
              [-1.55, 52.29],
              [-1.55, 52.28],
            ],
          ] as any,
        },
        rawRecord: {},
      },
    ];

    const duplicateParcel = [
      {
        sourceId: 'HMLR-INSPIRE-001',
        inspireId: 'PARCEL-COINCIDENT',
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [-1.549, 52.281],
              [-1.541, 52.281],
              [-1.541, 52.289],
              [-1.549, 52.289],
              [-1.549, 52.281],
            ],
          ] as any,
        },
        rawRecord: {},
      },
    ];

    const res = generatePilotSites(WARWICK_PILOT, brownfieldSample, duplicateParcel);
    assert.strictEqual(res.totalGenerated, 1);
    assert.strictEqual(res.deduplicatedCount, 1);
  });
});

describe('Pilot Execution (Dry Run)', async () => {
  const result = await runPilot({
    pilotId: WARWICK_PILOT.id,
    dryRun: true,
  });

  it('successfully ingests all 10 authoritative pilot datasets (Phase 9 expanded)', () => {
    assert.strictEqual(result.datasetsSucceeded.length, 10);
    assert.ok(result.datasetsSucceeded.includes('PLAN-BROWNFIELD-001'));
    assert.ok(result.datasetsSucceeded.includes('EA-FLOOD-001'));
    assert.ok(result.datasetsSucceeded.includes('NE-SSSI-001'));
    assert.ok(result.datasetsSucceeded.includes('HMLR-INSPIRE-001'));
    assert.ok(result.datasetsSucceeded.includes('ONS-BUILTUP-001'));
    assert.ok(result.datasetsSucceeded.includes('LPA-GREENBELT-001'));
    assert.ok(result.datasetsSucceeded.includes('OS-OPEN-ROADS-001'));
    assert.ok(result.datasetsSucceeded.includes('PLANNING-REGISTER-001'));
    assert.ok(result.datasetsSucceeded.includes('HMLR-PRICE-PAID-001'));
    assert.ok(result.datasetsSucceeded.includes('LPA-LOCAL-PLAN-001'));
  });

  it('evaluates candidate sites and surfaces passed opportunities across V1, V2, and V3', () => {
    assert.ok(result.sitesEvaluated > 0);
    assert.ok(result.opportunitiesGenerated > 0);
    assert.ok(result.sampleCandidates.length > 0);
    assert.ok(result.v1PassedCount !== undefined && result.v1PassedCount > 0);
    assert.ok(result.v2PassedCount !== undefined && result.v2PassedCount > 0);
    assert.ok(result.v3PassedCount !== undefined && result.v3PassedCount > 0);
    assert.ok((result.pricePaidRecordsIngested ?? 0) > 0);
    assert.ok((result.localPlanAllocationsIngested ?? 0) > 0);
  });

  it('records epistemic signals for all active domains including market and development pattern', () => {
    assert.ok(result.signalDistribution.green_belt > 0);
    assert.ok(result.signalDistribution.market_signal > 0);
    assert.ok(result.signalDistribution.development_pattern > 0);
  });

  it('produces structured explanation rather than numerical score', () => {
    const candidate = result.sampleCandidates[0];
    assert.ok(candidate.explanation);
    assert.ok(!candidate.explanation.includes('/100'));
    assert.ok(!candidate.explanation.includes('score'));
    assert.ok(candidate.positiveSignals.length > 0);
  });
});
