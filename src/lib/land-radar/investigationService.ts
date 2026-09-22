/**
 * Land Radar — Investigation Workflow Service
 *
 * Provides operations for:
 * 1. Structured Investigation Actions (tasks, priorities, assignees, status)
 * 2. Immutable Investigation Notes (timestamped analyst commentary)
 * 3. Opportunity Progression (human-gated transition from Candidate to Opportunity with evidence snapshot)
 *
 * Supports live Supabase DB execution with automatic in-memory fallback for local development & testing.
 */

import {
  InvestigationAction,
  InvestigationNote,
  OpportunityProgression,
  ActionStatus,
  ActionPriority,
  ActionType,
} from './types';
import { getLandRadarDb, getPersistenceMode, PersistenceError, SupabaseClient } from './db';

// ---------------------------------------------------------------------------
// In-Memory Seed Store (used strictly in mock / test persistence mode)
// ---------------------------------------------------------------------------

interface SessionStore {
  actions: Map<string, InvestigationAction>;
  notes: Map<string, InvestigationNote>;
  progressions: Map<string, OpportunityProgression>;
}

const memoryStore: SessionStore = {
  actions: new Map<string, InvestigationAction>(),
  notes: new Map<string, InvestigationNote>(),
  progressions: new Map<string, OpportunityProgression>(),
};

// Seed initial realistic investigation data for Warwick Pilot candidate sites
export function seedInitialData() {
  if (memoryStore.actions.size > 0) return;

  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  // Actions for EUK-S-WARWICK-BF-001 (Leamington Spa Station Yard)
  const act1: InvestigationAction = {
    id: 'act-bf001-1',
    site_id: 'site-WAR-BF-001',
    action_type: 'verify_green_belt',
    title: 'Verify Local Plan Green Belt Status',
    description: 'Confirm that the station yard brownfield site is located inside the urban area boundary and excluded from Green Belt designation.',
    priority: 'high',
    assigned_to: 'Sarah Jenkins',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'in_progress',
    created_at: yesterday,
    updated_at: yesterday,
  };

  const act2: InvestigationAction = {
    id: 'act-bf001-2',
    site_id: 'site-WAR-BF-001',
    action_type: 'obtain_title',
    title: 'Download Official HMLR Title Register & Title Plan',
    description: 'Inspect Title Register for restrictive covenants, network rail rights of way, or railway operational easement zones.',
    priority: 'high',
    assigned_to: 'David Vance',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'open',
    created_at: yesterday,
    updated_at: yesterday,
  };

  const act3: InvestigationAction = {
    id: 'act-bf001-3',
    site_id: 'site-WAR-BF-001',
    action_type: 'commission_site_visit',
    title: 'Phase 1 Environmental & Contamination Desktop Audit',
    description: 'Appoint environmental consultant to assess historical railway siding contamination potential.',
    priority: 'medium',
    assigned_to: 'Alex Morgan',
    status: 'open',
    created_at: yesterday,
    updated_at: yesterday,
  };

  // Actions for EUK-S-WARWICK-BF-002 (Sydenham Industrial Estate)
  const act4: InvestigationAction = {
    id: 'act-bf002-1',
    site_id: 'site-WAR-BF-002',
    action_type: 'investigate_access',
    title: 'Flood Risk Assessment & Sequential Layout Review',
    description: '15% of the eastern boundary lies in Flood Zone 3. Confirm that residential footprints can be sequestered in Flood Zone 1.',
    priority: 'high',
    assigned_to: 'Mark Taylor',
    status: 'open',
    created_at: yesterday,
    updated_at: yesterday,
  };

  // Actions for EUK-S-WARWICK-P-001 (Warwick Technology Park registered parcel)
  const act5: InvestigationAction = {
    id: 'act-p001-1',
    site_id: 'site-HMLR-WK-001',
    action_type: 'review_planning_policy',
    title: 'Local Plan Allocation & Employment Land Protection Review',
    description: 'Assess Warwick District Local Plan policy regarding B1/B2 employment land protection and potential for mixed residential transition.',
    priority: 'high',
    assigned_to: 'Sarah Jenkins',
    status: 'in_progress',
    created_at: yesterday,
    updated_at: yesterday,
  };

  [act1, act2, act3, act4, act5].forEach((a) => memoryStore.actions.set(a.id, a));

  // Notes
  const note1: InvestigationNote = {
    id: 'note-bf001-1',
    site_id: 'site-WAR-BF-001',
    author: 'Sarah Jenkins',
    author_role: 'Lead Acquisitions Analyst',
    content: 'Initial screening indicates high suitability. Brownfield register lists 120 potential units with deliverability timeframe 2025-2029. Crucially, access via Old Warwick Road appears established and adopted.',
    is_pinned: true,
    created_at: yesterday,
  };

  const note2: InvestigationNote = {
    id: 'note-bf001-2',
    site_id: 'site-WAR-BF-001',
    author: 'David Vance',
    author_role: 'Senior Planning Surveyor',
    content: 'Checked Warwick District Council planning committee minutes from 2023. Site previously supported in principle for transit-oriented high-density development. No active Article 4 directions found on the yard itself.',
    is_pinned: false,
    created_at: now,
  };

  const note3: InvestigationNote = {
    id: 'note-bf002-1',
    site_id: 'site-WAR-BF-002',
    author: 'Mark Taylor',
    author_role: 'Civil Engineering Specialist',
    content: 'Fluvial flood risk from River Leam tributary affects eastern 15%. However, 85% of the 3.8 ha parcel sits safely in Flood Zone 1. SUDS pond and linear parkland can be accommodated along the flood zone buffer.',
    is_pinned: true,
    created_at: yesterday,
  };

  [note1, note2, note3].forEach((n) => memoryStore.notes.set(n.id, n));
}

seedInitialData();

export function _resetMemoryStore(): void {
  memoryStore.actions.clear();
  memoryStore.notes.clear();
  memoryStore.progressions.clear();
  seedInitialData();
}

// ---------------------------------------------------------------------------
// Action Methods
// ---------------------------------------------------------------------------

export async function createAction(
  input: Omit<InvestigationAction, 'id' | 'created_at' | 'updated_at'>
): Promise<InvestigationAction> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('investigation_actions')
      .insert({
        site_id: input.site_id,
        action_type: input.action_type,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        assigned_to: input.assigned_to,
        due_date: input.due_date ?? null,
        status: input.status || 'open',
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to persist investigation action in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    return data as InvestigationAction;
  }

  const id = `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const action: InvestigationAction = {
    id,
    site_id: input.site_id,
    action_type: input.action_type,
    title: input.title,
    description: input.description,
    priority: input.priority,
    assigned_to: input.assigned_to,
    due_date: input.due_date,
    status: input.status || 'open',
    created_at: now,
    updated_at: now,
  };

  memoryStore.actions.set(id, action);
  return action;
}

export async function listActions(siteId: string): Promise<InvestigationAction[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('investigation_actions')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve investigation actions from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as InvestigationAction[];
  }

  const results: InvestigationAction[] = [];
  for (const action of memoryStore.actions.values()) {
    if (action.site_id === siteId) {
      results.push(action);
    }
  }

  return results.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function updateActionStatus(
  actionId: string,
  status: ActionStatus,
  options?: { completed_by?: string; completion_notes?: string }
): Promise<InvestigationAction | null> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: now,
    };
    if (status === 'completed') {
      updatePayload.completed_at = now;
      if (options?.completed_by) updatePayload.completed_by = options.completed_by;
      if (options?.completion_notes) updatePayload.completion_notes = options.completion_notes;
    }

    const { data, error } = await db
      .from('investigation_actions')
      .update(updatePayload)
      .eq('id', actionId)
      .select()
      .single();

    if (error) {
      throw new PersistenceError(
        `Failed to update investigation action in Supabase: ${error.message}`,
        error
      );
    }
    return data as InvestigationAction;
  }

  const existing = memoryStore.actions.get(actionId);
  if (!existing) return null;

  const updated: InvestigationAction = {
    ...existing,
    status,
    updated_at: now,
    ...(status === 'completed'
      ? {
          completed_at: now,
          completed_by: options?.completed_by ?? 'Analyst',
          completion_notes: options?.completion_notes,
        }
      : {}),
  };

  memoryStore.actions.set(actionId, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Note Methods
// ---------------------------------------------------------------------------

export async function addNote(
  input: Omit<InvestigationNote, 'id' | 'created_at'>
): Promise<InvestigationNote> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('investigation_notes')
      .insert({
        site_id: input.site_id,
        author: input.author,
        author_role: input.author_role,
        content: input.content,
        is_pinned: input.is_pinned ?? false,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record investigation note in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    return data as InvestigationNote;
  }

  const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const note: InvestigationNote = {
    id,
    site_id: input.site_id,
    author: input.author,
    author_role: input.author_role,
    content: input.content,
    is_pinned: input.is_pinned ?? false,
    created_at: now,
  };

  memoryStore.notes.set(id, note);
  return note;
}

export async function listNotes(siteId: string): Promise<InvestigationNote[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('investigation_notes')
      .select('*')
      .eq('site_id', siteId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve investigation notes from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as InvestigationNote[];
  }

  const results: InvestigationNote[] = [];
  for (const note of memoryStore.notes.values()) {
    if (note.site_id === siteId) {
      results.push(note);
    }
  }

  return results.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
}

// ---------------------------------------------------------------------------
// Opportunity Progression (Controlled Gate)
// ---------------------------------------------------------------------------

export interface ProgressCandidateInput {
  site_id: string;
  progressed_by: string;
  decision_reason: string;
  evidence_snapshot: Record<string, unknown>;
  notes?: string;
  review_id?: string;
}

export async function progressCandidateToOpportunity(
  input: ProgressCandidateInput
): Promise<OpportunityProgression> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();
  const oppId = `opp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  if (mode === 'supabase') {
    const db = getLandRadarDb();

    // 1. Create opportunity record
    const { data: oppData, error: oppError } = await db
      .from('opportunities')
      .insert({
        site_id: input.site_id,
        status: 'identified',
        assessed_at: now,
        assessed_by: input.progressed_by,
        assessment_notes: input.decision_reason,
      })
      .select()
      .single();

    if (oppError) {
      throw new PersistenceError(
        `Failed to create opportunity record in Supabase: ${oppError.message}`,
        oppError
      );
    }

    const resolvedOppId = oppData?.id ?? oppId;

    // 2. Record progression audit
    const { data, error } = await db
      .from('opportunity_progressions')
      .insert({
        site_id: input.site_id,
        opportunity_id: resolvedOppId,
        progressed_by: input.progressed_by,
        decision_reason: input.decision_reason,
        review_id: input.review_id ?? null,
        evidence_snapshot: input.evidence_snapshot,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record opportunity progression in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }

    // 3. Update site status
    await db
      .from('sites')
      .update({ status: 'investigating', updated_at: now })
      .eq('id', input.site_id);

    return data as OpportunityProgression;
  }

  const id = `prog-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const progression: OpportunityProgression = {
    id,
    site_id: input.site_id,
    opportunity_id: oppId,
    progressed_by: input.progressed_by,
    progressed_at: now,
    decision_reason: input.decision_reason,
    review_id: input.review_id,
    evidence_snapshot: input.evidence_snapshot,
    notes: input.notes,
    created_at: now,
  };

  memoryStore.progressions.set(input.site_id, progression);
  return progression;
}

export async function getOpportunityProgression(
  siteId: string
): Promise<OpportunityProgression | null> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('opportunity_progressions')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve opportunity progression from Supabase: ${error.message}`,
        error
      );
    }
    return (data || null) as OpportunityProgression | null;
  }

  return memoryStore.progressions.get(siteId) ?? null;
}
