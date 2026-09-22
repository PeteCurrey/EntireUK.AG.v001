import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  recordFeedback,
  listFeedbackForSite,
  listAllFeedback,
  _resetFeedbackStore,
} from '../feedbackService';

describe('Land Radar Analyst Feedback & Acquisition Learning (Phase 7)', () => {
  beforeEach(() => {
    _resetFeedbackStore();
  });

  it('records structured analyst feedback for false positive classification', async () => {
    const fb = await recordFeedback({
      site_id: 'test-site-fp',
      site_reference: 'EUK-S-WARWICK-BF-099',
      classification: 'false_positive',
      analyst_name: 'David Vance',
      analyst_role: 'Senior Planning Surveyor',
      rationale: 'Site access requires acquiring third-party ransom strip not commercially viable.',
      trigger_rules: ['RULE-ACCESS-001'],
    });

    assert.ok(fb.id);
    assert.strictEqual(fb.classification, 'false_positive');
    assert.strictEqual(fb.site_reference, 'EUK-S-WARWICK-BF-099');

    const siteFeedback = await listFeedbackForSite('test-site-fp');
    assert.strictEqual(siteFeedback.length, 1);
    assert.strictEqual(siteFeedback[0].id, fb.id);
  });

  it('supports all 5 acquisition learning classifications', async () => {
    const classifications = [
      'false_positive',
      'potential_false_positive',
      'useful_candidate',
      'strong_candidate',
      'false_negative',
    ] as const;

    for (const c of classifications) {
      const fb = await recordFeedback({
        site_id: `site-${c}`,
        site_reference: `EUK-S-TEST-${c}`,
        classification: c,
        analyst_name: 'Sarah Jenkins',
        analyst_role: 'Lead Acquisitions Analyst',
        rationale: `Testing classification ${c}`,
      });
      assert.strictEqual(fb.classification, c);
    }

    const all = await listAllFeedback();
    assert.ok(all.length >= 5);
  });
});
