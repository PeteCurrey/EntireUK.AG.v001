/**
 * Land Radar — Candidate Outcome Lifecycle Service (Phase 9 Section 16)
 *
 * Records the progression of a candidate site through the acquisition lifecycle.
 *
 * CRITICAL EPISTEMIC RULE:
 * - Outcomes are NEVER fabricated.
 * - Every state transition must be triggered by an authenticated human action.
 * - The lifecycle ledger is an append-only audit trail.
 * - Rejection branches are permanent — do NOT silently re-surface rejected sites.
 *
 * Lifecycle:
 *   SURFACED → SCREENED → ANALYST_REVIEW → INVESTIGATING → CONTACTED →
 *   UNDER_NEGOTIATION → CONTROLLED → DUE_DILIGENCE → ACQUISITION_AGREED →
 *   ACQUIRED → PLANNING → DEVELOPMENT → REALISATION
 *
 * Rejection branches:
 *   REJECTED_PLANNING | REJECTED_MARKET | REJECTED_ACCESS |
 *   REJECTED_TITLE | REJECTED_ENVIRONMENTAL | REJECTED_ECONOMICS | REJECTED_OTHER
 */

import { CandidateOutcome, AcquisitionOutcomeState } from './types';
import { getLandRadarDb, getPersistenceMode, PersistenceError } from './db';

// ---------------------------------------------------------------------------
// Valid lifecycle transitions
// ---------------------------------------------------------------------------

export const VALID_TRANSITIONS: Record<AcquisitionOutcomeState, AcquisitionOutcomeState[]> = {
  SURFACED: ['SCREENED', 'REJECTED_OTHER'],
  SCREENED: ['ANALYST_REVIEW', 'REJECTED_PLANNING', 'REJECTED_MARKET', 'REJECTED_OTHER'],
  ANALYST_REVIEW: [
    'INVESTIGATING',
    'REJECTED_PLANNING',
    'REJECTED_MARKET',
    'REJECTED_ACCESS',
    'REJECTED_TITLE',
    'REJECTED_ENVIRONMENTAL',
    'REJECTED_ECONOMICS',
    'REJECTED_OTHER',
  ],
  INVESTIGATING: [
    'CONTACTED',
    'REJECTED_PLANNING',
    'REJECTED_MARKET',
    'REJECTED_ACCESS',
    'REJECTED_TITLE',
    'REJECTED_ENVIRONMENTAL',
    'REJECTED_ECONOMICS',
    'REJECTED_OTHER',
  ],
  CONTACTED: ['UNDER_NEGOTIATION', 'REJECTED_ACCESS', 'REJECTED_TITLE', 'REJECTED_OTHER'],
  UNDER_NEGOTIATION: ['CONTROLLED', 'REJECTED_ECONOMICS', 'REJECTED_TITLE', 'REJECTED_OTHER'],
  CONTROLLED: ['DUE_DILIGENCE', 'REJECTED_ENVIRONMENTAL', 'REJECTED_TITLE', 'REJECTED_OTHER'],
  DUE_DILIGENCE: ['ACQUISITION_AGREED', 'REJECTED_ECONOMICS', 'REJECTED_TITLE', 'REJECTED_ENVIRONMENTAL', 'REJECTED_OTHER'],
  ACQUISITION_AGREED: ['ACQUIRED', 'REJECTED_OTHER'],
  ACQUIRED: ['PLANNING'],
  PLANNING: ['DEVELOPMENT', 'REJECTED_PLANNING', 'REJECTED_OTHER'],
  DEVELOPMENT: ['REALISATION'],
  REALISATION: [],
  REJECTED_PLANNING: [],
  REJECTED_MARKET: [],
  REJECTED_ACCESS: [],
  REJECTED_TITLE: [],
  REJECTED_ENVIRONMENTAL: [],
  REJECTED_ECONOMICS: [],
  REJECTED_OTHER: [],
};

export function isRejectionState(state: AcquisitionOutcomeState): boolean {
  return state.startsWith('REJECTED_');
}

export function isTerminalState(state: AcquisitionOutcomeState): boolean {
  return state === 'REALISATION' || isRejectionState(state);
}

export function isValidTransition(
  from: AcquisitionOutcomeState,
  to: AcquisitionOutcomeState
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ---------------------------------------------------------------------------
// In-Memory Store (mock / test mode only)
// ---------------------------------------------------------------------------

const memoryOutcomes: Map<string, CandidateOutcome> = new Map();

export function _resetOutcomeStore(): void {
  memoryOutcomes.clear();
}

// ---------------------------------------------------------------------------
// Record a new outcome state (append-only)
// ---------------------------------------------------------------------------

export interface RecordOutcomeInput {
  site_id: string;
  state: AcquisitionOutcomeState;
  previous_state?: AcquisitionOutcomeState;
  recorded_by: string;
  rationale: string;
  evidence_snapshot?: Record<string, unknown>;
}

export async function recordOutcome(input: RecordOutcomeInput): Promise<CandidateOutcome> {
  if (input.previous_state && !isValidTransition(input.previous_state, input.state)) {
    throw new Error(
      `Invalid lifecycle transition: ${input.previous_state} → ${input.state}. ` +
        `Valid from ${input.previous_state}: [${VALID_TRANSITIONS[input.previous_state].join(', ')}]`
    );
  }

  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_outcomes')
      .insert({
        site_id: input.site_id,
        state: input.state,
        previous_state: input.previous_state ?? null,
        recorded_by: input.recorded_by,
        rationale: input.rationale,
        evidence_snapshot: input.evidence_snapshot ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record candidate outcome in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    return data as CandidateOutcome;
  }

  const id = `outcome-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const outcome: CandidateOutcome = {
    id,
    site_id: input.site_id,
    state: input.state,
    previous_state: input.previous_state ?? null,
    recorded_by: input.recorded_by,
    rationale: input.rationale,
    evidence_snapshot: input.evidence_snapshot ?? null,
    created_at: now,
  };

  memoryOutcomes.set(id, outcome);
  return outcome;
}

// ---------------------------------------------------------------------------
// List outcome history for a site (chronological)
// ---------------------------------------------------------------------------

export async function listOutcomesForSite(siteId: string): Promise<CandidateOutcome[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_outcomes')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve candidate outcomes from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as CandidateOutcome[];
  }

  return Array.from(memoryOutcomes.values())
    .filter((o) => o.site_id === siteId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

// ---------------------------------------------------------------------------
// Get the current (latest) state for a site
// ---------------------------------------------------------------------------

export async function getCurrentOutcomeState(
  siteId: string
): Promise<AcquisitionOutcomeState | null> {
  const history = await listOutcomesForSite(siteId);
  if (history.length === 0) return null;
  return history[history.length - 1].state;
}
