import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GreenBeltAdapter } from '../adapters/greenBeltAdapter';
import { RoadAdapter } from '../adapters/roadAdapter';
import { WARWICK_PILOT, RUGBY_PILOT } from '../pilot/config';
import {
  buildGreenBeltSignal,
  buildRoadProximitySignal,
} from '../signals';

describe('Land Radar Evidence Integrity — Green Belt & Highways (Phase 7)', () => {
  describe('GreenBeltAdapter', () => {
    const adapter = new GreenBeltAdapter();

    it('verifies OGL v3 licence with commercial use permitted', () => {
      const licence = adapter.verifyLicence();
      assert.strictEqual(licence.permitted, true);
      assert.strictEqual(licence.commercialUsePermitted, true);
      assert.ok(licence.licenceName.includes('Open Government Licence'));
    });

    it('ingests authentic Green Belt fixtures for Warwick District', async () => {
      const result = await adapter.ingest(WARWICK_PILOT);
      assert.ok(result.records.length > 0);
      assert.strictEqual(result.retrievalMode, 'local_fixture');
      assert.strictEqual(result.geometryErrors, 0);

      const first = result.records[0];
      assert.strictEqual(first.sourceId, 'LPA-GREENBELT-001');
      assert.ok(first.designationName);
    });

    it('ingests authentic Green Belt fixtures for Rugby Borough', async () => {
      const result = await adapter.ingest(RUGBY_PILOT);
      assert.ok(result.records.length > 0);
      assert.strictEqual(result.retrievalMode, 'local_fixture');
      assert.ok(result.records[0].designationName?.includes('Rugby'));
    });
  });

  describe('RoadAdapter & Access Semantics', () => {
    const adapter = new RoadAdapter();

    it('verifies OGL v3 licence for OS Open Roads', () => {
      const licence = adapter.verifyLicence();
      assert.strictEqual(licence.permitted, true);
      assert.strictEqual(licence.commercialUsePermitted, true);
      assert.ok(licence.attributionText.includes('Crown copyright'));
    });

    it('ingests envelope-clipped road networks for Warwick District', async () => {
      const result = await adapter.ingest(WARWICK_PILOT);
      assert.ok(result.records.length > 0);
      assert.strictEqual(result.geometryErrors, 0);

      const record = result.records[0];
      assert.ok(record.roadName);
      assert.ok(record.accessDisclaimer);
      // Semantic check: disclaimer must state that road proximity does NOT equal vehicular access
      assert.ok(record.accessDisclaimer.toLowerCase().includes('does not'));
    });

    it('ingests envelope-clipped road networks for Rugby Borough', async () => {
      const result = await adapter.ingest(RUGBY_PILOT);
      assert.ok(result.records.length > 0);
      assert.strictEqual(result.geometryErrors, 0);
    });
  });

  describe('Evidence Semantics & Epistemic Signals', () => {
    it('generates positive signal when Green Belt overlap is verified zero', () => {
      const sig = buildGreenBeltSignal('site-1', 0, 'LPA-GREENBELT-001');
      assert.strictEqual(sig.status, 'known');
      assert.strictEqual(sig.value, 0);
      assert.ok(sig.explanation.includes('No Green Belt designation overlap'));
    });

    it('generates constraint signal when Green Belt overlap is positive', () => {
      const sig = buildGreenBeltSignal('site-2', 45, 'LPA-GREENBELT-001');
      assert.strictEqual(sig.status, 'known');
      assert.strictEqual(sig.value, 45);
      assert.ok(sig.explanation.includes('45.0%'));
      assert.ok(sig.explanation.includes('NPPF'));
    });

    it('generates unknown signal when Green Belt is unassessed', () => {
      const sig = buildGreenBeltSignal('site-3', null, 'LPA-GREENBELT-001');
      assert.strictEqual(sig.status, 'unknown');
      assert.ok(sig.explanation.includes('not available'));
    });

    it('generates road proximity signal with mandatory highways survey disclaimer', () => {
      const sig = buildRoadProximitySignal('site-4', 35, 'OS-OPEN-ROADS-001');
      assert.strictEqual(sig.status, 'known');
      assert.strictEqual(sig.value, 35);
      // Must not conflate proximity with approved access
      assert.ok(sig.explanation.includes('highways survey'));
    });
  });
});
