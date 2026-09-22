/**
 * Land Radar — Geometry Utility Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGeoJsonGeometry,
  sqmToHectares,
  sqmToAcres,
  formatArea,
  hasAreaDiscrepancy,
  areaSqmExpression,
  distanceMetresExpression,
  intersectionPctExpression,
} from '../geometry';

describe('validateGeoJsonGeometry', () => {
  it('returns invalid for null', () => {
    const result = validateGeoJsonGeometry(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes('NULL_GEOMETRY'));
  });

  it('returns invalid for undefined', () => {
    const result = validateGeoJsonGeometry(undefined);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes('NULL_GEOMETRY'));
  });

  it('returns invalid for non-object', () => {
    const result = validateGeoJsonGeometry('not an object');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes('INVALID_TYPE'));
  });

  it('returns invalid for missing type', () => {
    const result = validateGeoJsonGeometry({ coordinates: [[[0, 0]]] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes('MISSING_TYPE'));
  });

  it('returns invalid for missing coordinates', () => {
    const result = validateGeoJsonGeometry({ type: 'Polygon' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes('MISSING_COORDINATES'));
  });

  it('returns invalid for wrong geometry type', () => {
    const result = validateGeoJsonGeometry({ type: 'Point', coordinates: [0, 0] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.startsWith('UNEXPECTED_GEOMETRY_TYPE')));
  });

  it('returns invalid for empty coordinates array', () => {
    const result = validateGeoJsonGeometry({ type: 'Polygon', coordinates: [] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes('EMPTY_GEOMETRY'));
  });

  it('returns valid for a valid UK polygon', () => {
    const ukPolygon = {
      type: 'Polygon',
      coordinates: [[
        [-1.5, 52.5],
        [-1.4, 52.5],
        [-1.4, 52.6],
        [-1.5, 52.6],
        [-1.5, 52.5],
      ]],
    };
    const result = validateGeoJsonGeometry(ukPolygon);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('returns invalid for coordinates outside UK bounds', () => {
    const outOfBounds = {
      type: 'Polygon',
      coordinates: [[
        [100.0, 52.5], // Far east, not UK
        [101.0, 52.5],
        [101.0, 52.6],
        [100.0, 52.6],
        [100.0, 52.5],
      ]],
    };
    const result = validateGeoJsonGeometry(outOfBounds);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.startsWith('COORDINATE_OUT_OF_UK_BOUNDS')));
  });

  it('returns valid for MultiPolygon', () => {
    const multi = {
      type: 'MultiPolygon',
      coordinates: [[
        [
          [-1.5, 52.5],
          [-1.4, 52.5],
          [-1.4, 52.6],
          [-1.5, 52.6],
          [-1.5, 52.5],
        ],
      ]],
    };
    const result = validateGeoJsonGeometry(multi);
    assert.strictEqual(result.valid, true);
  });
});

describe('area utilities', () => {
  it('converts sqm to hectares correctly', () => {
    assert.strictEqual(sqmToHectares(10_000), 1);
    assert.strictEqual(sqmToHectares(5_000), 0.5);
    assert.strictEqual(sqmToHectares(100_000), 10);
  });

  it('converts sqm to acres correctly', () => {
    const acres = sqmToAcres(4046.86);
    assert.ok(Math.abs(acres - 1) < 0.05);
  });

  it('formats area in m² for small sites', () => {
    assert.strictEqual(formatArea(500), '500 m²');
    assert.strictEqual(formatArea(9_999), '9999 m²');
  });

  it('formats area in hectares for large sites', () => {
    assert.strictEqual(formatArea(10_000), '1.00 ha');
    assert.strictEqual(formatArea(25_000), '2.50 ha');
  });

  it('returns Unknown for null area', () => {
    assert.strictEqual(formatArea(null), 'Unknown');
  });
});

describe('hasAreaDiscrepancy', () => {
  it('returns false when areas match', () => {
    assert.strictEqual(hasAreaDiscrepancy(10_000, 10_000), false);
  });

  it('returns false for small discrepancy (within threshold)', () => {
    assert.strictEqual(hasAreaDiscrepancy(10_000, 10_200), false); // 2% diff
  });

  it('returns true for large discrepancy (beyond threshold)', () => {
    assert.strictEqual(hasAreaDiscrepancy(10_000, 11_000), true); // 10% diff
  });

  it('uses custom threshold', () => {
    assert.strictEqual(hasAreaDiscrepancy(10_000, 10_600, 10), false); // 6% < 10%
    assert.strictEqual(hasAreaDiscrepancy(10_000, 11_500, 10), true);  // 15% > 10%
  });

  it('handles zero calculated area', () => {
    assert.strictEqual(hasAreaDiscrepancy(0, 0), false);
    assert.strictEqual(hasAreaDiscrepancy(0, 100), true);
  });
});

describe('PostGIS expression generators', () => {
  it('generates correct area expression', () => {
    const expr = areaSqmExpression('geometry');
    assert.ok(expr.includes('ST_Transform'));
    assert.ok(expr.includes('27700'));
    assert.ok(expr.includes('geometry'));
  });

  it('generates correct distance expression', () => {
    const expr = distanceMetresExpression('geom_a', 'geom_b');
    assert.ok(expr.includes('27700'));
    assert.ok(expr.includes('geom_a'));
    assert.ok(expr.includes('geom_b'));
  });

  it('generates correct intersection expression with CRS transform', () => {
    const expr = intersectionPctExpression('site.geometry', 'constraint.geometry');
    assert.ok(expr.includes('ST_Intersection'));
    assert.ok(expr.includes('27700'));
    assert.ok(expr.includes('ROUND'));
  });
});
