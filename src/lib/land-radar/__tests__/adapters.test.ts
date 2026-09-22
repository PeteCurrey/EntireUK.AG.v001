/**
 * Ingestion Adapters — Automated Tests
 *
 * Tests isolation of adapters: transform(), validate(), licence verification,
 * and error handling on malformed source records.
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { BrownfieldAdapter } from '../adapters/brownfieldAdapter';
import { FloodAdapter } from '../adapters/floodAdapter';
import { SSSIAdapter } from '../adapters/sssiAdapter';
import { HMLRInspireAdapter } from '../adapters/hmlrInspireAdapter';
import { WARWICK_PILOT } from '../pilot/config';

describe('BrownfieldAdapter', () => {
  const adapter = new BrownfieldAdapter();

  it('verifies OGL v3 licence with commercial use permitted', () => {
    const licence = adapter.verifyLicence();
    assert.strictEqual(licence.permitted, true);
    assert.strictEqual(licence.commercialUsePermitted, true);
    assert.ok(licence.attributionText.includes('Open Government Licence'));
  });

  it('transforms valid brownfield record into IngestedBrownfieldRecord', () => {
    const raw = {
      reference: 'WDC/TEST/01',
      name: 'Test Industrial Yard',
      hectares: 1.5,
      deliverable: 'yes',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-1.55, 52.28],
            [-1.54, 52.28],
            [-1.54, 52.29],
            [-1.55, 52.29],
            [-1.55, 52.28],
          ],
        ],
      },
    };

    const transformed = adapter.transform(raw, 0);
    assert.ok(!('isError' in transformed && transformed.isError));
    const rec = transformed as any;
    assert.strictEqual(rec.siteReference, 'WDC/TEST/01');
    assert.strictEqual(rec.hectares, 1.5);
    assert.strictEqual(rec.deliverable, true);
  });

  it('rejects record with missing geometry', () => {
    const raw = {
      reference: 'WDC/TEST/BAD',
      name: 'No Geometry Site',
    };

    const transformed = adapter.transform(raw, 0);
    assert.ok('isError' in transformed && transformed.isError);
    assert.ok((transformed as any).reason.includes('Missing or null geometry'));
  });

  it('validates polygon exterior ring closure', () => {
    const openPolygon = {
      sourceId: 'PLAN-BROWNFIELD-001',
      siteReference: 'WDC/UNCLOSED',
      name: 'Unclosed Ring',
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-1.55, 52.28],
            [-1.54, 52.28],
            [-1.54, 52.29],
            [-1.55, 52.29], // missing closing coordinate
          ],
        ] as any,
      },
      rawRecord: {},
    };

    const val = adapter.validate(openPolygon);
    assert.strictEqual(val.isValid, false);
    assert.ok(val.issues.some(i => i.includes('exterior ring is not closed')));
  });
});

describe('FloodAdapter', () => {
  const adapter = new FloodAdapter();

  it('verifies EA licence with commercial use permitted', () => {
    const licence = adapter.verifyLicence();
    assert.strictEqual(licence.permitted, true);
    assert.strictEqual(licence.commercialUsePermitted, true);
  });

  it('correctly maps Flood Zone 3 from feature properties', () => {
    const raw = {
      properties: { zone: 'zone_3' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-1.55, 52.28],
            [-1.54, 52.28],
            [-1.54, 52.29],
            [-1.55, 52.29],
            [-1.55, 52.28],
          ],
        ],
      },
    };

    const transformed = adapter.transform(raw, 0);
    assert.ok(!('isError' in transformed && transformed.isError));
    assert.strictEqual((transformed as any).floodZone, 'zone_3');
  });

  it('correctly maps Flood Zone 2 from feature properties', () => {
    const raw = {
      properties: { zone: 'zone_2' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-1.55, 52.28],
            [-1.54, 52.28],
            [-1.54, 52.29],
            [-1.55, 52.29],
            [-1.55, 52.28],
          ],
        ],
      },
    };

    const transformed = adapter.transform(raw, 0);
    assert.ok(!('isError' in transformed && transformed.isError));
    assert.strictEqual((transformed as any).floodZone, 'zone_2');
  });
});

describe('SSSIAdapter & HMLRInspireAdapter', () => {
  it('verifies SSSI licence', () => {
    const adapter = new SSSIAdapter();
    const licence = adapter.verifyLicence();
    assert.strictEqual(licence.permitted, true);
    assert.ok(licence.attributionText.includes('Natural England'));
  });

  it('verifies HMLR INSPIRE licence and records derived data conditions', () => {
    const adapter = new HMLRInspireAdapter();
    const licence = adapter.verifyLicence();
    assert.strictEqual(licence.permitted, true);
    assert.ok(licence.notes?.includes('July 2020'));
  });
});
