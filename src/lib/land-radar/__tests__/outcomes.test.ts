import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  recordOutcome,
  listOutcomesForSite,
  getCurrentOutcomeState,
  isValidTransition,
  isRejectionState,
  isTerminalState,
  _resetOutcomeStore,
} from '../outcomeService';
import {
  recordUsefulnessAssessment,
  listUsefulnessAssessments,
  getUsefulnessSummary,
  _resetUsefulnessStore,
} from '../feedbackService';

describe('Candidate Outcome Lifecycle Service (Phase 9 Section 16)', () => {
  beforeEach(() => {
    _resetOutcomeStore();
  });

  it('records SURFACED state as the initial lifecycle entry', async () => {
    const outcome = await recordOutcome({
      site_id: 'site-001',
      state: 'SURFACED',
      recorded_by: 'Land Radar Pilot Engine',
      rationale: 'Site surfaced by RESIDENTIAL_DEVELOPMENT_V3 screening run EUK-PILOT-001.',
    });
    assert.ok(outcome.id);
    assert.strictEqual(outcome.state, 'SURFACED');
    assert.strictEqual(outcome.previous_state, null);
    assert.ok(outcome.created_at);
  });

  it('records valid forward lifecycle progressions with audit trail', async () => {
    await recordOutcome({
      site_id: 'site-002',
      state: 'SURFACED',
      recorded_by: 'System',
      rationale: 'Initial surface.',
    });
    await recordOutcome({
      site_id: 'site-002',
      state: 'SCREENED',
      previous_state: 'SURFACED',
      recorded_by: 'Sarah Jenkins',
      rationale: 'Screening review confirms strategic brownfield potential.',
    });
    await recordOutcome({
      site_id: 'site-002',
      state: 'ANALYST_REVIEW',
      previous_state: 'SCREENED',
      recorded_by: 'Sarah Jenkins',
      rationale: 'Forwarded to detailed analyst investigation dossier review.',
    });

    const history = await listOutcomesForSite('site-002');
    assert.strictEqual(history.length, 3);
    assert.strictEqual(history[0].state, 'SURFACED');
    assert.strictEqual(history[1].state, 'SCREENED');
    assert.strictEqual(history[2].state, 'ANALYST_REVIEW');
  });

  it('rejects an invalid lifecycle transition with a descriptive error', async () => {
    await assert.rejects(
      () =>
        recordOutcome({
          site_id: 'site-003',
          state: 'ACQUIRED', // cannot jump directly from SURFACED
          previous_state: 'SURFACED',
          recorded_by: 'System',
          rationale: 'Attempting illegal jump.',
        }),
      (err: Error) => {
        // DEF-013-01: recordOutcome now verifies against actual DB state.
        // With no prior outcomes for site-003, ACQUIRED is not a valid first state.
        // With prior outcomes at SURFACED, ACQUIRED would be an invalid transition.
        // Both cases correctly reject the request — just with different messages.
        const isTransitionError = err.message.includes('Invalid lifecycle transition');
        const isInitError = err.message.includes('Cannot initialise lifecycle at state') &&
          err.message.includes('ACQUIRED');
        assert.ok(
          isTransitionError || isInitError,
          `Expected a lifecycle rejection error but got: ${err.message}`
        );
        return true;
      }
    );
  });

  it('correctly identifies rejection states', () => {
    assert.strictEqual(isRejectionState('REJECTED_PLANNING'), true);
    assert.strictEqual(isRejectionState('REJECTED_MARKET'), true);
    assert.strictEqual(isRejectionState('REJECTED_ACCESS'), true);
    assert.strictEqual(isRejectionState('REJECTED_TITLE'), true);
    assert.strictEqual(isRejectionState('REJECTED_ENVIRONMENTAL'), true);
    assert.strictEqual(isRejectionState('REJECTED_ECONOMICS'), true);
    assert.strictEqual(isRejectionState('INVESTIGATING'), false);
    assert.strictEqual(isRejectionState('ACQUIRED'), false);
  });

  it('correctly identifies terminal states', () => {
    assert.strictEqual(isTerminalState('REALISATION'), true);
    assert.strictEqual(isTerminalState('REJECTED_PLANNING'), true);
    assert.strictEqual(isTerminalState('REJECTED_MARKET'), true);
    assert.strictEqual(isTerminalState('SCREENED'), false);
    assert.strictEqual(isTerminalState('INVESTIGATING'), false);
  });

  it('validates that no further transitions are permitted from terminal rejection states', () => {
    const rejectionStates = [
      'REJECTED_PLANNING',
      'REJECTED_MARKET',
      'REJECTED_ACCESS',
      'REJECTED_TITLE',
      'REJECTED_ENVIRONMENTAL',
      'REJECTED_ECONOMICS',
      'REJECTED_OTHER',
    ] as const;

    for (const state of rejectionStates) {
      // Cannot transition to any other state from a rejection
      assert.strictEqual(isValidTransition(state, 'INVESTIGATING'), false);
      assert.strictEqual(isValidTransition(state, 'SCREENED'), false);
      assert.strictEqual(isValidTransition(state, 'ANALYST_REVIEW'), false);
    }
  });

  it('records a rejection branch with evidence snapshot', async () => {
    // Progress site-004 to ANALYST_REVIEW first to maintain strict lifecycle sequence
    await recordOutcome({ site_id: 'site-004', state: 'SURFACED', recorded_by: 'System', rationale: 'Surfaced' });
    await recordOutcome({ site_id: 'site-004', state: 'SCREENED', previous_state: 'SURFACED', recorded_by: 'System', rationale: 'Screened' });
    await recordOutcome({ site_id: 'site-004', state: 'ANALYST_REVIEW', previous_state: 'SCREENED', recorded_by: 'System', rationale: 'Review' });

    const snapshot = {
      market_strength: 'INSUFFICIENT_MARKET_EVIDENCE',
      planning_refusals: 2,
      reason: 'Sequential test likely to fail for flood zone 3 majority site.',
    };
    const outcome = await recordOutcome({
      site_id: 'site-004',
      state: 'REJECTED_PLANNING',
      previous_state: 'ANALYST_REVIEW',
      recorded_by: 'David Vance',
      rationale:
        'Site predominantly within Flood Zone 3. Sequential test will be required by LPA and is likely to fail.',
      evidence_snapshot: snapshot,
    });
    assert.strictEqual(outcome.state, 'REJECTED_PLANNING');
    assert.ok(outcome.evidence_snapshot);
    assert.strictEqual(
      (outcome.evidence_snapshot as Record<string, unknown>)['market_strength'],
      'INSUFFICIENT_MARKET_EVIDENCE'
    );
  });

  it('returns current outcome state as the most recent state entry', async () => {
    await recordOutcome({ site_id: 'site-005', state: 'SURFACED', recorded_by: 'System', rationale: 'Initial.' });
    await recordOutcome({ site_id: 'site-005', state: 'SCREENED', previous_state: 'SURFACED', recorded_by: 'System', rationale: 'Screened.' });
    const current = await getCurrentOutcomeState('site-005');
    assert.strictEqual(current, 'SCREENED');
  });

  it('returns null for a site with no recorded outcomes', async () => {
    const current = await getCurrentOutcomeState('site-never-seen');
    assert.strictEqual(current, null);
  });
});

describe('Phase 9 Section 19 — Analyst Usefulness Assessment', () => {
  beforeEach(() => {
    _resetUsefulnessStore();
  });

  it('records a structured analyst usefulness assessment with all required fields', async () => {
    const assessment = await recordUsefulnessAssessment({
      site_id: 'site-WAR-BF-001',
      site_reference: 'EUK-S-WARWICK-BF-001',
      analyst_name: 'Sarah Jenkins',
      analyst_role: 'Lead Acquisitions Analyst',
      decision_without_phase9:
        'Site is brownfield, good settlement connectivity, flood concern manageable — worth investigating.',
      decision_with_phase9:
        'Phase 9 confirms MODERATE market evidence (median £402,500, 4 local sales). Supports commercial investigation. No change to decision, but market context strengthens conviction.',
      verdict: 'EVIDENCE_CONFIRMED_DECISION',
      market_evidence_useful: true,
      capacity_evidence_useful: true,
      evidence_domain_notes:
        'Median £402,500 is consistent with scheme viability expectations. Net developable ~13ha removes gross area ambiguity.',
      false_positive_risk: 'lowered',
      false_negative_risk: 'unchanged',
    });

    assert.ok(assessment.id);
    assert.strictEqual(assessment.verdict, 'EVIDENCE_CONFIRMED_DECISION');
    assert.strictEqual(assessment.market_evidence_useful, true);
    assert.strictEqual(assessment.false_positive_risk, 'lowered');
    assert.ok(assessment.created_at);
  });

  it('records a usefulness assessment where evidence improved the decision', async () => {
    const assessment = await recordUsefulnessAssessment({
      site_id: 'site-WAR-BF-004',
      site_reference: 'EUK-S-WARWICK-BF-004',
      analyst_name: 'David Vance',
      analyst_role: 'Senior Planning Surveyor',
      decision_without_phase9:
        'Site passes all constraint screening. Would normally recommend investigation.',
      decision_with_phase9:
        'Phase 9 reveals INSUFFICIENT_MARKET_EVIDENCE — only 1 weak transaction. Too sparse to support commercial conviction. Recommend defer until market evidence strengthens.',
      verdict: 'EVIDENCE_IMPROVED_DECISION',
      market_evidence_useful: true,
      capacity_evidence_useful: false,
      evidence_domain_notes:
        'Sparse local transaction data (1 weak comparable beyond 1500m) is a genuine red flag that was invisible in Phase 8.',
      false_positive_risk: 'lowered',
      false_negative_risk: 'raised',
    });

    assert.strictEqual(assessment.verdict, 'EVIDENCE_IMPROVED_DECISION');
  });

  it('produces a usefulness summary with correct counts', async () => {
    await recordUsefulnessAssessment({
      site_id: 's1', site_reference: 'EUK-001', analyst_name: 'A', analyst_role: 'Analyst',
      decision_without_phase9: 'Investigate', decision_with_phase9: 'Confirmed — still investigate.',
      verdict: 'EVIDENCE_CONFIRMED_DECISION', market_evidence_useful: true, capacity_evidence_useful: true,
      evidence_domain_notes: 'Median confirms viability.', false_positive_risk: 'lowered', false_negative_risk: 'unchanged',
    });
    await recordUsefulnessAssessment({
      site_id: 's2', site_reference: 'EUK-002', analyst_name: 'B', analyst_role: 'Analyst',
      decision_without_phase9: 'Investigate', decision_with_phase9: 'Defer — market insufficient.',
      verdict: 'EVIDENCE_IMPROVED_DECISION', market_evidence_useful: true, capacity_evidence_useful: false,
      evidence_domain_notes: 'Sparse comparables.', false_positive_risk: 'lowered', false_negative_risk: 'unchanged',
    });
    await recordUsefulnessAssessment({
      site_id: 's3', site_reference: 'EUK-003', analyst_name: 'C', analyst_role: 'Analyst',
      decision_without_phase9: 'Decline', decision_with_phase9: 'Still declining.',
      verdict: 'EVIDENCE_NEUTRAL', market_evidence_useful: false, capacity_evidence_useful: false,
      evidence_domain_notes: 'Site too constrained regardless.', false_positive_risk: 'unchanged', false_negative_risk: 'unchanged',
    });

    const summary = await getUsefulnessSummary();
    assert.strictEqual(summary.total, 3);
    assert.strictEqual(summary.improved, 1);
    assert.strictEqual(summary.confirmed, 1);
    assert.strictEqual(summary.neutral, 1);
    assert.strictEqual(summary.misleading, 0);
    assert.strictEqual(summary.market_useful_count, 2);
    assert.strictEqual(summary.capacity_useful_count, 1);
  });

  it('correctly classifies the false positive / false negative risk impact', async () => {
    const a = await recordUsefulnessAssessment({
      site_id: 's-fp', site_reference: 'EUK-FP-001', analyst_name: 'X', analyst_role: 'Analyst',
      decision_without_phase9: 'Investigate', decision_with_phase9: 'Do not proceed — market unviable.',
      verdict: 'EVIDENCE_IMPROVED_DECISION', market_evidence_useful: true, capacity_evidence_useful: false,
      evidence_domain_notes: 'INSUFFICIENT_MARKET_EVIDENCE revealed false positive risk.', false_positive_risk: 'lowered', false_negative_risk: 'unchanged',
    });

    assert.strictEqual(a.false_positive_risk, 'lowered');
    assert.strictEqual(a.false_negative_risk, 'unchanged');
  });
});
