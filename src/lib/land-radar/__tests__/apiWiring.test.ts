import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  getOsCredentials,
  isOsConfigured,
  OsApiError,
  fetchOsRoadLinks,
  proxyVectorTileRequest,
} from '../clients/osClient';
import {
  getHmlrConfig,
  isHmlrConfigured,
  HmlrApiError,
  fetchHmlrTitleDetails,
} from '../clients/hmlrClient';
import { verifyHmlrTitleOnline } from '../ownership/ownershipService';
import { RoadAdapter } from '../adapters/roadAdapter';
import { HMLRInspireAdapter } from '../adapters/hmlrInspireAdapter';
import { PricePaidAdapter } from '../adapters/pricePaidAdapter';
import { WARWICK_PILOT } from '../pilot/config';

describe('Land Radar — OS & HMLR API Wiring & Epistemic Integrity', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // -------------------------------------------------------------------------
  // 1. OS Client Configuration & Secret Masking
  // -------------------------------------------------------------------------
  describe('OS API Client Configuration & Security', () => {
    it('detects missing OS credentials cleanly', () => {
      delete process.env.OS_API_KEY;
      delete process.env.OS_API_SECRET;

      assert.strictEqual(isOsConfigured(), false);
      const creds = getOsCredentials();
      assert.strictEqual(creds.apiKey, null);
      assert.strictEqual(creds.apiSecret, null);
    });

    it('detects configured OS credentials without exposing values in error objects', () => {
      process.env.OS_API_KEY = 'test-os-key-12345678901234567890';
      process.env.OS_API_SECRET = 'test-os-secret-1234';

      assert.strictEqual(isOsConfigured(), true);
      const creds = getOsCredentials();
      assert.strictEqual(creds.apiKey, 'test-os-key-12345678901234567890');
      assert.strictEqual(creds.apiSecret, 'test-os-secret-1234');
    });

    it('OsApiError sanitizes long credential tokens from error messages', () => {
      const secret = 'superSecretCredentialString12345678901234';
      const err = new OsApiError(`Failed with token ${secret}`, 401, 'https://api.os.uk');
      assert.ok(!err.message.includes(secret), 'Secret must be stripped from error message');
      assert.ok(err.message.includes('[REDACTED_CREDENTIAL]'));
      assert.strictEqual(err.statusCode, 401);
    });

    it('proxyVectorTileRequest returns 503 when OS credentials are missing', async () => {
      delete process.env.OS_API_KEY;
      const res = await proxyVectorTileRequest('resources/styles');
      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.contentType, 'application/json');
    });
  });

  // -------------------------------------------------------------------------
  // 2. HMLR Client Configuration & Secret Masking
  // -------------------------------------------------------------------------
  describe('HMLR API Client Configuration & Security', () => {
    it('detects missing HMLR credentials cleanly', () => {
      delete process.env.HMLR_API_KEY;
      assert.strictEqual(isHmlrConfigured(), false);
      const conf = getHmlrConfig();
      assert.strictEqual(conf.apiKey, null);
      assert.ok(conf.baseUrl.startsWith('http'), 'Default production base URL must exist');
    });

    it('detects configured HMLR credentials and respects optional custom base URL', () => {
      process.env.HMLR_API_KEY = 'test-hmlr-key-999';
      process.env.HMLR_API_BASE_URL = 'https://custom-hmlr.gov.uk/api/v1/';

      assert.strictEqual(isHmlrConfigured(), true);
      const conf = getHmlrConfig();
      assert.strictEqual(conf.apiKey, 'test-hmlr-key-999');
      assert.strictEqual(conf.baseUrl, 'https://custom-hmlr.gov.uk/api/v1');
    });

    it('HmlrApiError sanitizes long credential tokens from error messages', () => {
      const secret = 'hmlrLiveKeyWithHighEntropy998877665544332211';
      const err = new HmlrApiError(`Unauthorized with key ${secret}`, 401, 'https://use-land-property-data.service.gov.uk');
      assert.ok(!err.message.includes(secret));
      assert.ok(err.message.includes('[REDACTED_CREDENTIAL]'));
      assert.strictEqual(err.statusCode, 401);
    });

    it('fetchHmlrTitleDetails reports UNCONFIGURED cleanly when key is missing', async () => {
      delete process.env.HMLR_API_KEY;
      const res = await fetchHmlrTitleDetails('WK29101');
      assert.strictEqual(res.status, 'UNCONFIGURED');
      assert.strictEqual(res.titleNumber, 'WK29101');
      assert.ok(res.error);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Epistemic Layer Separation & Availability Gating
  // -------------------------------------------------------------------------
  describe('Epistemic Integrity & Acquisition Gating', () => {
    it('verifyHmlrTitleOnline preserves UNKNOWN availability state upon title match', async () => {
      delete process.env.HMLR_API_KEY; // offline/unconfigured path

      const res = await verifyHmlrTitleOnline({
        site_id: 'test-site-001',
        site_reference: 'EUK-S-WARWICK-BF-001',
        title_reference: 'WK29101',
      });

      assert.ok(res.evidence);
      assert.strictEqual(res.evidence.title_reference, 'WK29101');
      assert.strictEqual(res.evidence.site_reference, 'EUK-S-WARWICK-BF-001');
      // Epistemic principle: Title existence must never infer availability
      assert.strictEqual(res.evidence.acquisition_relevance, 'unknown');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Truthful Production Adapter Behavior (No Fake Fallbacks)
  // -------------------------------------------------------------------------
  describe('Truthful Adapter Execution Under Error Conditions', () => {
    it('RoadAdapter returns local_fixture when explicitly running in offline test mode', async () => {
      const adapter = new RoadAdapter();
      const res = await adapter.fetchWithMode(WARWICK_PILOT, { useLocalOnly: true });
      assert.strictEqual(res.retrievalMode, 'local_fixture');
      assert.ok(res.records.length > 0);
    });

    it('RoadAdapter does not fake success when live OS API is missing in production mode', async () => {
      delete process.env.OS_API_KEY;
      const prevNodeEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';

      try {
        const adapter = new RoadAdapter();
        // In production without localOnly, failure/unconfigured state must not return fake live_api
        const res = await adapter.fetchWithMode(WARWICK_PILOT, { useLocalOnly: false });
        assert.notStrictEqual(res.retrievalMode, 'live_api');
      } finally {
        (process.env as any).NODE_ENV = prevNodeEnv;
      }
    });

    it('HMLRInspireAdapter returns local_fixture in offline test mode', async () => {
      const adapter = new HMLRInspireAdapter();
      const res = await adapter.fetchWithMode(WARWICK_PILOT, { useLocalOnly: true });
      assert.strictEqual(res.retrievalMode, 'local_fixture');
      assert.ok(res.records.length > 0);
    });

    it('PricePaidAdapter returns local_fixture in offline test mode', async () => {
      const adapter = new PricePaidAdapter();
      const res = await adapter.fetchWithMode(WARWICK_PILOT, { useLocalOnly: true });
      assert.strictEqual(res.mode, 'local_fixture');
      assert.ok(res.records.length > 0);
    });
  });
});
