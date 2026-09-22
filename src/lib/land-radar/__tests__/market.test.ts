/**
 * Land Radar — Phase 9 Market Intelligence Automated Tests
 *
 * Verifies:
 * 1. PricePaidAdapter (HMLR Price Paid Data ingestion, licence gate, fixture validity)
 * 2. comparableEngine (Spatial distance, 3-tier relevance model, percentiles, new-build ratio)
 * 3. marketClassifier (Categorical deterministic classification, boundary conditions)
 * 4. Epistemic principles ("No transaction evidence != No market exists", unassessed != clear)
 * 5. Strict anti-valuation invariants (NO GDV, NO residual land value, NO automated valuation)
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { PricePaidAdapter } from '../adapters/pricePaidAdapter';
import { matchComparablesToSite } from '../market/comparableEngine';
import { classifyMarketStrength } from '../market/marketClassifier';
import { buildMarketSignal } from '../signals';
import { WARWICK_PILOT, RUGBY_PILOT } from '../pilot/config';
import { IngestedPricePaidRecord } from '../adapters/types';

describe('HMLR Price Paid Adapter (Phase 9)', () => {
  const adapter = new PricePaidAdapter();

  it('ingests Warwick authentic pilot sales records with verified OGL v3.0 licence', async () => {
    const res = await adapter.ingest(WARWICK_PILOT);
    assert.ok(res.records.length > 0, 'Should ingest Warwick sales records');
    assert.strictEqual(res.retrievalMode, 'local_fixture');
    assert.strictEqual(res.geometryErrors, 0);

    const first = res.records[0];
    assert.ok(first.transactionId);
    assert.ok(first.price > 0);
    assert.ok(first.dateOfTransfer);
    assert.ok(first.postcode.startsWith('CV31') || first.postcode.startsWith('CV34'));
    assert.strictEqual(first.geometry.type, 'Point');
    assert.strictEqual(first.sourceId, 'HMLR-PRICE-PAID-001');
  });

  it('ingests Rugby authentic pilot sales records', async () => {
    const res = await adapter.ingest(RUGBY_PILOT);
    assert.ok(res.records.length > 0, 'Should ingest Rugby sales records');
    assert.ok(res.records.some((r) => r.postcode.startsWith('CV21') || r.postcode.startsWith('CV22')));
  });

  it('enforces licence gate: rejects ingestion if licence unconfirmed', async () => {
    const unconfirmedPilot = {
      ...WARWICK_PILOT,
      datasetDecisions: WARWICK_PILOT.datasetDecisions.map((d) =>
        d.datasetId === 'HMLR-PRICE-PAID-001' ? { ...d, licenceConfirmed: false } : d
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

describe('Market Comparable Engine & Tiering', () => {
  const mockSite = {
    id: 'SITE-TEST-001',
    internal_reference: 'EUK-S-TEST-001',
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-1.5410, 52.2855],
          [-1.5400, 52.2855],
          [-1.5400, 52.2865],
          [-1.5410, 52.2865],
          [-1.5410, 52.2855],
        ],
      ] as any,
    },
  };

  const mockTransactions: IngestedPricePaidRecord[] = [
    // Directly relevant: within 500m (dLat ~ 0.001 -> ~111m) and within 24 months
    {
      sourceId: 'HMLR-PRICE-PAID-001',
      transactionId: 'TX-001',
      price: 320000,
      dateOfTransfer: '2025-01-01',
      postcode: 'CV31 1AA',
      propertyType: 'semi_detached',
      newBuild: false,
      tenure: 'freehold',
      paon: '12',
      street: 'High Street',
      townCity: 'Leamington Spa',
      district: 'Warwick',
      county: 'Warwickshire',
      geometry: { type: 'Point', coordinates: [-1.5410, 52.2860] },
      rawRecord: {},
    },
    {
      sourceId: 'HMLR-PRICE-PAID-001',
      transactionId: 'TX-002',
      price: 450000,
      dateOfTransfer: '2025-03-01',
      postcode: 'CV31 1AB',
      propertyType: 'detached',
      newBuild: true,
      tenure: 'freehold',
      paon: '14',
      street: 'High Street',
      townCity: 'Leamington Spa',
      district: 'Warwick',
      county: 'Warwickshire',
      geometry: { type: 'Point', coordinates: [-1.5415, 52.2858] },
      rawRecord: {},
    },
    // Contextual: 500m - 1500m (dLat ~ 0.008 -> ~888m)
    {
      sourceId: 'HMLR-PRICE-PAID-001',
      transactionId: 'TX-003',
      price: 280000,
      dateOfTransfer: '2023-11-10',
      postcode: 'CV31 2BB',
      propertyType: 'terraced',
      newBuild: false,
      tenure: 'freehold',
      paon: '45',
      street: 'Rugby Road',
      townCity: 'Leamington Spa',
      district: 'Warwick',
      county: 'Warwickshire',
      geometry: { type: 'Point', coordinates: [-1.5410, 52.2935] },
      rawRecord: {},
    },
    // Weak / Out of radius (>1500m) (dLat ~ 0.025 -> ~2775m)
    {
      sourceId: 'HMLR-PRICE-PAID-001',
      transactionId: 'TX-004',
      price: 600000,
      dateOfTransfer: '2024-02-01',
      postcode: 'CV32 9ZZ',
      propertyType: 'detached',
      newBuild: false,
      tenure: 'freehold',
      paon: '100',
      street: 'Kenilworth Road',
      townCity: 'Leamington Spa',
      district: 'Warwick',
      county: 'Warwickshire',
      geometry: { type: 'Point', coordinates: [-1.5410, 52.3105] },
      rawRecord: {},
    },
  ];

  it('assigns correct spatial relevance tiers based on physical distance', () => {
    const summary = matchComparablesToSite(mockSite, mockTransactions, { searchRadiusM: 3000 });
    assert.strictEqual(summary.sample_size, 4);

    const tx1 = summary.comparables.find((c) => c.transaction.transaction_id === 'TX-001');
    const tx2 = summary.comparables.find((c) => c.transaction.transaction_id === 'TX-002');
    const tx3 = summary.comparables.find((c) => c.transaction.transaction_id === 'TX-003');
    const tx4 = summary.comparables.find((c) => c.transaction.transaction_id === 'TX-004');

    assert.strictEqual(tx1?.relevance_tier, 'directly_relevant');
    assert.strictEqual(tx2?.relevance_tier, 'directly_relevant');
    assert.strictEqual(tx3?.relevance_tier, 'contextual');
    assert.strictEqual(tx4?.relevance_tier, 'weak');
  });

  it('filters out transactions beyond search radius when searchRadiusM is set', () => {
    const summary = matchComparablesToSite(mockSite, mockTransactions, { searchRadiusM: 1500 });
    assert.strictEqual(summary.sample_size, 3);
    assert.ok(!summary.comparables.some((c) => c.transaction.transaction_id === 'TX-004'));
  });

  it('calculates accurate median and quartile distributions', () => {
    const summary = matchComparablesToSite(mockSite, mockTransactions, { searchRadiusM: 1500 });
    // Prices: 280000, 320000, 450000 -> median 320000
    assert.strictEqual(summary.median_price, 320000);
    assert.ok(summary.p25_price !== null && summary.p25_price <= 320000);
    assert.ok(summary.p75_price !== null && summary.p75_price >= 320000);
    assert.strictEqual(summary.new_build_count, 1);
    assert.strictEqual(summary.new_build_percentage, 33);
  });
});

describe('Market Strength Classifier & Epistemic Rules', () => {
  it('classifies strong market evidence when liquidity, tiering, and median price meet thresholds', () => {
    const result = classifyMarketStrength({
      sampleSize: 8,
      directlyRelevantCount: 4,
      contextualCount: 4,
      medianPrice: 350000,
      minPrice: 200000,
      maxPrice: 500000,
      newBuildCount: 2,
      coverageStatus: 'known',
    });
    assert.strictEqual(result.classification, 'STRONG_MARKET_EVIDENCE');
    assert.ok(result.rationale.includes('Demonstrable liquidity'));
  });

  it('classifies insufficient evidence when sample size is below threshold', () => {
    const result = classifyMarketStrength({
      sampleSize: 1,
      directlyRelevantCount: 1,
      contextualCount: 0,
      medianPrice: 280000,
      minPrice: 280000,
      maxPrice: 280000,
      newBuildCount: 0,
      coverageStatus: 'known',
    });
    assert.strictEqual(result.classification, 'INSUFFICIENT_MARKET_EVIDENCE');
  });

  it('honours epistemic rule: absence of transactions != absence of market', () => {
    const emptySummary = matchComparablesToSite(
      { id: 'SITE-002', geometry: null },
      [],
      { coverageStatus: 'known' }
    );
    assert.strictEqual(emptySummary.sample_size, 0);
    assert.strictEqual(emptySummary.median_price, null);
    assert.strictEqual(emptySummary.market_strength, 'INSUFFICIENT_MARKET_EVIDENCE');
    assert.ok(
      emptySummary.rationale.includes('Absence of recorded transactions does not indicate an absence of demand')
    );
  });

  it('classifies unknown when dataset is unassessed', () => {
    const result = classifyMarketStrength({
      sampleSize: 0,
      directlyRelevantCount: 0,
      contextualCount: 0,
      medianPrice: null,
      minPrice: null,
      maxPrice: null,
      newBuildCount: 0,
      coverageStatus: 'unknown',
    });
    assert.strictEqual(result.classification, 'UNKNOWN');
  });
});

describe('Anti-Valuation Invariants (Mandatory Security Gate)', () => {
  it('never outputs gross development value (GDV) or residual land values', () => {
    const summary = matchComparablesToSite(
      { id: 'SITE-VAL-001', geometry: null },
      [
        {
          sourceId: 'HMLR-PRICE-PAID-001',
          transactionId: 'TX-VAL-1',
          price: 500000,
          dateOfTransfer: '2024-01-01',
          postcode: 'CV31 1AA',
          propertyType: 'detached',
          newBuild: false,
          tenure: 'freehold',
          paon: '1',
          street: 'Street',
          townCity: 'City',
          district: 'District',
          county: 'County',
          geometry: { type: 'Point', coordinates: [-1.54, 52.28] },
          rawRecord: {},
        },
      ]
    );

    const keys = Object.keys(summary);
    assert.ok(!keys.includes('gdv'));
    assert.ok(!keys.includes('gross_development_value'));
    assert.ok(!keys.includes('residual_value'));
    assert.ok(!keys.includes('residual_land_value'));
    assert.ok(!keys.includes('site_valuation'));

    // Check JSON serialization doesn't contain speculative keywords
    const jsonStr = JSON.stringify(summary).toLowerCase();
    assert.ok(!jsonStr.includes('residual land value'));
    assert.ok(!jsonStr.includes('gross development value'));
  });

  it('buildMarketSignal produces factual explanation without magic score', () => {
    const summary = matchComparablesToSite(
      { id: 'SITE-VAL-001', geometry: null },
      [
        {
          sourceId: 'HMLR-PRICE-PAID-001',
          transactionId: 'TX-VAL-1',
          price: 350000,
          dateOfTransfer: '2024-01-01',
          postcode: 'CV31 1AA',
          propertyType: 'detached',
          newBuild: false,
          tenure: 'freehold',
          paon: '1',
          street: 'Street',
          townCity: 'City',
          district: 'District',
          county: 'County',
          geometry: { type: 'Point', coordinates: [-1.54, 52.28] },
          rawRecord: {},
        },
      ]
    );

    const signal = buildMarketSignal('SITE-VAL-001', summary);
    assert.strictEqual(signal.signal_type, 'market_signal');
    assert.strictEqual(signal.status, 'known');
    assert.ok(signal.explanation.includes('residential sales'));
    assert.ok(!signal.explanation.includes('/100'));
    assert.ok(!signal.explanation.includes('score'));
  });
});
