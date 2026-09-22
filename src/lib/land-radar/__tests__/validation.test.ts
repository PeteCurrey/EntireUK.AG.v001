import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  WARWICK_VALIDATION_COHORT,
  RUGBY_VALIDATION_COHORT,
  getAllValidationCohorts,
} from '../validation/validationCohort';
import { calculateValidationMetrics } from '../validation/metrics';

describe('Phase 10 Real-World Acquisition Validation & Cohort Analysis', () => {
  it('loads the deliberate candidate mix for Warwick District cohort', () => {
    const warwick = WARWICK_VALIDATION_COHORT;
    assert.strictEqual(warwick.cohortId, 'COHORT-WARWICK-001');
    assert.strictEqual(warwick.geography, 'Warwick District');
    assert.ok(warwick.candidates.length >= 5);

    // Verify deliberate mixture
    const decisions = warwick.candidates.map((c) => c.commercial_decision);
    assert.ok(decisions.includes('PROGRESS'));
    assert.ok(decisions.includes('HOLD'));
    assert.ok(decisions.includes('REJECT'));

    // Verify human benchmark included
    assert.ok(warwick.humanBenchmarks.length > 0);
  });

  it('loads the Rugby Borough validation cohort with false positive and false negative', () => {
    const rugby = RUGBY_VALIDATION_COHORT;
    assert.strictEqual(rugby.cohortId, 'COHORT-RUGBY-001');
    assert.strictEqual(rugby.geography, 'Rugby Borough');

    const fp = rugby.candidates.find((c) => c.false_positive_flag);
    assert.ok(fp);
    assert.strictEqual(fp?.false_positive_root_cause, 'market_mismatch');

    const fn = rugby.candidates.find((c) => c.false_negative_flag);
    assert.ok(fn);
    assert.strictEqual(fn?.false_negative_category, 'rule_false_negative');
  });

  it('calculates diagnostic metrics rather than a vanity accuracy score', () => {
    const metrics = calculateValidationMetrics(WARWICK_VALIDATION_COHORT);
    assert.strictEqual(metrics.cohort_id, 'COHORT-WARWICK-001');
    assert.ok(metrics.total_candidates > 0);
    assert.ok(metrics.validated_count > 0);
    assert.ok(metrics.discovery_overlap_rate >= 0 && metrics.discovery_overlap_rate <= 100);
    assert.ok(metrics.investigation_yield_rate >= 0 && metrics.investigation_yield_rate <= 100);

    // Diagnostic breakdown by cause
    assert.ok('access_failure' in metrics.false_positives_by_cause);
    assert.strictEqual(metrics.false_positives_by_cause['access_failure'], 1);

    assert.ok('data_false_negative' in metrics.false_negatives_by_cause);
    assert.strictEqual(metrics.false_negatives_by_cause['data_false_negative'], 1);
  });

  it('enforces the false-positive standard: requires material real-world contradiction', () => {
    // A false positive must specify a valid root cause
    const fpCandidates = WARWICK_VALIDATION_COHORT.candidates.filter((c) => c.false_positive_flag);
    for (const fp of fpCandidates) {
      assert.ok(fp.false_positive_root_cause);
      assert.ok(
        [
          'access_failure',
          'market_mismatch',
          'planning_mismatch',
          'title_defect',
          'environmental_blocker',
          'economic_unviability',
          'owner_refusal',
          'infrastructure_failure',
          'other',
        ].includes(fp.false_positive_root_cause)
      );
      // Real-world outcome must be REJECT or FAILED reality
      assert.ok(fp.commercial_decision === 'REJECT' || fp.access_reality === 'FAILED');
    }
  });

  it('enforces the false-negative taxonomy: data vs rule vs geometry vs strategy', () => {
    const allCohorts = getAllValidationCohorts();
    const fnCandidates = allCohorts.flatMap((c) => c.candidates).filter((cand) => cand.false_negative_flag);

    for (const fn of fnCandidates) {
      assert.ok(fn.false_negative_category);
      assert.ok(
        [
          'data_false_negative',
          'rule_false_negative',
          'geometry_false_negative',
          'classification_false_negative',
          'strategy_false_negative',
        ].includes(fn.false_negative_category)
      );
    }
  });

  it('preserves the Real-World Evidence Requirement: no auto-validation without external corroboration', () => {
    const cohorts = getAllValidationCohorts();
    for (const cohort of cohorts) {
      for (const candidate of cohort.candidates) {
        if (candidate.validation_status === 'VALIDATED') {
          // Must have a validated timestamp
          assert.ok(candidate.validated_at);
        }
      }
    }
  });
});
