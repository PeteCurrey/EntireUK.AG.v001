import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createAction,
  listActions,
  updateActionStatus,
  addNote,
  listNotes,
  progressCandidateToOpportunity,
  getOpportunityProgression,
} from '../investigationService';

describe('Land Radar Investigation Workflow (Phase 6)', () => {
  const testSiteId = 'site-test-workflow-001';

  it('creates and lists structured next actions with priority and assignee', async () => {
    const action = await createAction({
      site_id: testSiteId,
      action_type: 'verify_green_belt',
      title: 'Verify Green Belt boundary',
      description: 'Check against Warwick Local Plan Policies Map',
      priority: 'high',
      assigned_to: 'Alex Morgan',
      due_date: '2026-09-15',
      status: 'open',
    });

    assert.ok(action.id);
    assert.strictEqual(action.site_id, testSiteId);
    assert.strictEqual(action.priority, 'high');
    assert.strictEqual(action.status, 'open');

    const actions = await listActions(testSiteId);
    assert.ok(actions.some((a) => a.id === action.id));
  });

  it('updates action status and records completion metadata', async () => {
    const action = await createAction({
      site_id: testSiteId,
      action_type: 'obtain_title',
      title: 'Download HMLR title',
      priority: 'medium',
      assigned_to: 'David Vance',
      status: 'open',
    });

    const updated = await updateActionStatus(action.id, 'completed', {
      completed_by: 'David Vance',
      completion_notes: 'Obtained Freehold Title WK123456. No restrictive covenants found.',
    });

    assert.ok(updated);
    assert.strictEqual(updated.status, 'completed');
    assert.strictEqual(updated.completed_by, 'David Vance');
    assert.ok(updated.completed_at);
    assert.strictEqual(
      updated.completion_notes,
      'Obtained Freehold Title WK123456. No restrictive covenants found.'
    );
  });

  it('records immutable timestamped investigation notes with pinning', async () => {
    const note = await addNote({
      site_id: testSiteId,
      author: 'Sarah Jenkins',
      author_role: 'Lead Acquisitions Analyst',
      content: 'Spoke with planning officer; pre-application advice is encouraged for residential conversion.',
      is_pinned: true,
    });

    assert.ok(note.id);
    assert.strictEqual(note.site_id, testSiteId);
    assert.strictEqual(note.is_pinned, true);
    assert.ok(note.created_at);

    const notes = await listNotes(testSiteId);
    assert.ok(notes.some((n) => n.id === note.id));
    // Pinned notes appear first
    assert.strictEqual(notes[0].is_pinned, true);
  });

  it('controls opportunity progression with a human decision gate and frozen evidence snapshot', async () => {
    const evidenceSnapshot = {
      site_id: testSiteId,
      internal_reference: 'EUK-S-WARWICK-TEST',
      area_sqm: 45000,
      priority: 'HIGH',
      flood_overlap_pct: 0,
      sssi_overlap_pct: 0,
      retrieval_mode: 'local_fixture',
      frozen_at: new Date().toISOString(),
    };

    const progression = await progressCandidateToOpportunity({
      site_id: testSiteId,
      progressed_by: 'Investment Committee (Lead: Marcus Sterling)',
      decision_reason: 'Candidate meets all strategic screening thresholds and initial title check is clean.',
      evidence_snapshot: evidenceSnapshot,
      notes: 'Authorised to instruct RICS red-book valuation and Phase 1 geo-environmental survey.',
    });

    assert.ok(progression.id);
    assert.strictEqual(progression.site_id, testSiteId);
    assert.strictEqual(progression.progressed_by, 'Investment Committee (Lead: Marcus Sterling)');
    assert.deepStrictEqual(progression.evidence_snapshot, evidenceSnapshot);

    const retrieved = await getOpportunityProgression(testSiteId);
    assert.ok(retrieved);
    assert.strictEqual(retrieved.id, progression.id);
  });
});
