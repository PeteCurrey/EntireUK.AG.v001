/**
 * Land Radar — Acquisition Analyst Feedback & Learning Service
 *
 * Implements Objective 19:
 * Structured logging of False Positives, Potential False Positives,
 * Useful Candidates, Strong Candidates, and False Negatives.
 *
 * This provides the acquisition learning dataset to inform rule versioning
 * without conflating subjective opinion with authoritative planning facts.
 */

import { getLandRadarDb, getPersistenceMode, PersistenceError } from './db';

export type FeedbackClassification =
  | 'false_positive'
  | 'potential_false_positive'
  | 'useful_candidate'
  | 'strong_candidate'
  | 'false_negative'
  | 'market_evidence_useful'
  | 'market_evidence_misleading'
  | 'development_potential_overstated'
  | 'development_potential_understated'
  | 'planning_evidence_useful'
  | 'planning_evidence_misleading'
  | 'strong_acquisition_candidate'
  | 'weak_acquisition_candidate'
  | 'rejected_planning'
  | 'rejected_market'
  | 'rejected_access'
  | 'rejected_title'
  | 'rejected_environmental'
  | 'rejected_economics'
  | 'rejected_other';


export interface CandidateFeedback {
  id: string;
  site_id: string;
  site_reference: string;
  classification: FeedbackClassification;
  analyst_name: string;
  analyst_role: string;
  rationale: string;
  trigger_rules?: string[];
  created_at: string;
}

const memoryFeedback: Map<string, CandidateFeedback> = new Map();

// Seed initial realistic feedback entries for Warwick Pilot learning log
function seedInitialFeedback() {
  if (memoryFeedback.size > 0) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  const fb1: CandidateFeedback = {
    id: 'fb-warwick-001',
    site_id: 'site-WAR-BF-001',
    site_reference: 'EUK-S-WARWICK-BF-001',
    classification: 'strong_candidate',
    analyst_name: 'Sarah Jenkins',
    analyst_role: 'Lead Acquisitions Analyst',
    rationale:
      'Excellent strategic location in Leamington Spa urban core. Brownfield register confirms 120-unit capacity. Minor 15% Flood Zone 3 can be safely buffered with public open space.',
    trigger_rules: ['RULE-BROWNFIELD-001', 'RULE-SETTLEMENT-001', 'RULE-FLOOD-001'],
    created_at: yesterday,
  };

  const fb2: CandidateFeedback = {
    id: 'fb-warwick-002',
    site_id: 'site-WAR-BF-004',
    site_reference: 'EUK-S-WARWICK-BF-004',
    classification: 'potential_false_positive',
    analyst_name: 'David Vance',
    analyst_role: 'Senior Planning Surveyor',
    rationale:
      'Farmer Ward Road site is tightly bounded by existing residential cul-de-sacs. Deliverability timeframe is post-2030 and access may require third-party ransom strip clearance.',
    trigger_rules: ['RULE-ACCESS-001', 'RULE-BROWNFIELD-001'],
    created_at: yesterday,
  };

  [fb1, fb2].forEach((f) => memoryFeedback.set(f.id, f));
}

seedInitialFeedback();

export function _resetFeedbackStore(): void {
  memoryFeedback.clear();
  seedInitialFeedback();
}

export async function recordFeedback(
  input: Omit<CandidateFeedback, 'id' | 'created_at'>
): Promise<CandidateFeedback> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_feedback')
      .insert({
        site_id: input.site_id,
        site_reference: input.site_reference,
        classification: input.classification,
        analyst_name: input.analyst_name,
        analyst_role: input.analyst_role,
        rationale: input.rationale,
        trigger_rules: input.trigger_rules ?? [],
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to persist candidate feedback in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    return data as CandidateFeedback;
  }

  const id = `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const feedback: CandidateFeedback = {
    id,
    site_id: input.site_id,
    site_reference: input.site_reference,
    classification: input.classification,
    analyst_name: input.analyst_name,
    analyst_role: input.analyst_role,
    rationale: input.rationale,
    trigger_rules: input.trigger_rules,
    created_at: now,
  };

  memoryFeedback.set(id, feedback);
  return feedback;
}

export async function listFeedbackForSite(siteId: string): Promise<CandidateFeedback[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_feedback')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve candidate feedback from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as CandidateFeedback[];
  }

  const results: CandidateFeedback[] = [];
  for (const fb of memoryFeedback.values()) {
    if (fb.site_id === siteId || fb.site_reference === siteId) {
      results.push(fb);
    }
  }
  return results.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listAllFeedback(): Promise<CandidateFeedback[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve feedback records from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as CandidateFeedback[];
  }

  return Array.from(memoryFeedback.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

// ---------------------------------------------------------------------------
// Phase 9 Section 19 — Analyst Usefulness Assessment
// ---------------------------------------------------------------------------
// Structured record of whether Phase 9 market/capacity evidence changed
// an analyst's acquisition decision vs the Phase 8 baseline.
// This is the first meaningful measure of Land Radar's acquisition usefulness.
// ---------------------------------------------------------------------------

import { AnalystUsefulnessAssessment, AnalystUsefulnessVerdict } from './types';

const memoryUsefulnessAssessments: Map<string, AnalystUsefulnessAssessment> = new Map();

export function _resetUsefulnessStore(): void {
  memoryUsefulnessAssessments.clear();
}

export async function recordUsefulnessAssessment(
  input: Omit<AnalystUsefulnessAssessment, 'id' | 'created_at'>
): Promise<AnalystUsefulnessAssessment> {
  const now = new Date().toISOString();
  const id = `assess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const assessment: AnalystUsefulnessAssessment = {
    ...input,
    id,
    created_at: now,
  };
  memoryUsefulnessAssessments.set(id, assessment);
  return assessment;
}

export async function listUsefulnessAssessments(): Promise<AnalystUsefulnessAssessment[]> {
  return Array.from(memoryUsefulnessAssessments.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export async function getUsefulnessSummary(): Promise<{
  total: number;
  improved: number;
  confirmed: number;
  neutral: number;
  misleading: number;
  insufficient: number;
  market_useful_count: number;
  capacity_useful_count: number;
}> {
  const all = await listUsefulnessAssessments();
  return {
    total: all.length,
    improved: all.filter((a) => a.verdict === 'EVIDENCE_IMPROVED_DECISION').length,
    confirmed: all.filter((a) => a.verdict === 'EVIDENCE_CONFIRMED_DECISION').length,
    neutral: all.filter((a) => a.verdict === 'EVIDENCE_NEUTRAL').length,
    misleading: all.filter((a) => a.verdict === 'EVIDENCE_MISLEADING').length,
    insufficient: all.filter((a) => a.verdict === 'INSUFFICIENT_TO_ASSESS').length,
    market_useful_count: all.filter((a) => a.market_evidence_useful).length,
    capacity_useful_count: all.filter((a) => a.capacity_evidence_useful).length,
  };
}
