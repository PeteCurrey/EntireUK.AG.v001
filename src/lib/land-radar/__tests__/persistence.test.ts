import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  getPersistenceMode,
  PersistenceError,
  AuthorizationError,
} from '../db';
import {
  createAction,
  listActions,
  updateActionStatus,
  addNote,
  listNotes,
  progressCandidateToOpportunity,
  getOpportunityProgression,
  _resetMemoryStore,
} from '../investigationService';

describe('Land Radar Persistence & Workflow (Phase 7)', () => {
  beforeEach(() => {
    _resetMemoryStore();
  });

  it('correctly resolves explicit persistence mode in test environment', () => {
    const mode = getPersistenceMode();
    assert.strictEqual(mode, 'mock');
  });

  it('throws PersistenceError on unconfigured Supabase in production mode', () => {
    const origEnv = process.env.LAND_RADAR_PERSISTENCE_MODE;
    process.env.LAND_RADAR_PERSISTENCE_MODE = 'supabase';
    try {
      assert.throws(
        () => {
          // In 'supabase' mode with unconfigured keys, getLandRadarDb must throw PersistenceError
          const { getLandRadarDb } = require('../db');
          getLandRadarDb();
        },
        (err: any) => err instanceof PersistenceError
      );
    } finally {
      process.env.LAND_RADAR_PERSISTENCE_MODE = origEnv;
    }
  });

  it('persists structured next actions and maintains order', async () => {
    const created = await createAction({
      site_id: 'test-site-001',
      action_type: 'verify_green_belt',
      title: 'Check Local Plan Green Belt allocation',
      priority: 'high',
      assigned_to: 'Sarah Jenkins',
      status: 'open',
    });

    assert.ok(created.id);
    assert.strictEqual(created.title, 'Check Local Plan Green Belt allocation');
    assert.strictEqual(created.status, 'open');

    const actions = await listActions('test-site-001');
    assert.ok(actions.length >= 1);
    assert.strictEqual(actions[0].id, created.id);
  });

  it('updates action status with completion audit metadata', async () => {
    const created = await createAction({
      site_id: 'test-site-002',
      action_type: 'investigate_access',
      title: 'Inspect physical road frontage',
      priority: 'medium',
      assigned_to: 'David Vance',
      status: 'open',
    });

    const updated = await updateActionStatus(created.id, 'completed', {
      completed_by: 'David Vance',
      completion_notes: 'Vehicular access confirmed from A452.',
    });

    assert.ok(updated);
    assert.strictEqual(updated.status, 'completed');
    assert.strictEqual(updated.completed_by, 'David Vance');
    assert.ok(updated.completed_at);
  });

  it('persists immutable investigation notes and respects pinning', async () => {
    const note1 = await addNote({
      site_id: 'test-site-003',
      author: 'Alex Morgan',
      author_role: 'Senior Surveyor',
      content: 'Standard site note',
      is_pinned: false,
    });

    const note2 = await addNote({
      site_id: 'test-site-003',
      author: 'Sarah Jenkins',
      author_role: 'Lead Analyst',
      content: 'Critical environmental observation',
      is_pinned: true,
    });

    const notes = await listNotes('test-site-003');
    assert.strictEqual(notes.length, 2);
    // Pinned note must be first
    assert.strictEqual(notes[0].id, note2.id);
    assert.strictEqual(notes[0].is_pinned, true);
  });

  it('persists opportunity progression with frozen evidence snapshot', async () => {
    const snapshot = {
      priority: 'HIGH',
      flood_overlap_pct: 0,
      green_belt_overlap_pct: 0,
    };

    const progression = await progressCandidateToOpportunity({
      site_id: 'test-site-004',
      progressed_by: 'Marcus Sterling (Acquisitions Committee)',
      decision_reason: 'Unconstrained brownfield candidate with strong viability.',
      evidence_snapshot: snapshot,
    });

    assert.ok(progression.id);
    assert.strictEqual(progression.progressed_by, 'Marcus Sterling (Acquisitions Committee)');
    assert.deepStrictEqual(progression.evidence_snapshot, snapshot);

    const retrieved = await getOpportunityProgression('test-site-004');
    assert.ok(retrieved);
    assert.strictEqual(retrieved.id, progression.id);
  });
});
