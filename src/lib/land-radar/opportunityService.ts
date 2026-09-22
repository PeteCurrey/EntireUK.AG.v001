/**
 * Land Radar — Opportunity Service
 *
 * Domain service for managing Land Radar opportunities.
 * An opportunity sits above evidence and signals, not above opinions.
 *
 * Core rule:
 * An opportunity being identified means:
 * "This site warrants investigation."
 * It does NOT mean planning permission exists or acquisition is recommended.
 */

import type {
  Opportunity,
  OpportunityStatus,
  OpportunityTypeId,
  OpportunityExplanation,
} from './types';
import { getLandRadarDb } from './db';
import { getSiteExplanation } from './siteService';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createOpportunity(
  siteId: string,
  opportunityTypeId?: OpportunityTypeId,
  notes?: string
): Promise<Opportunity> {
  const db = getLandRadarDb();

  // Aggregate signals summary for denormalized counters
  const { data: signals } = await db
    .from('site_signals')
    .select('status, signal_type')
    .eq('site_id', siteId);

  const { data: constraints } = await db
    .from('site_constraints')
    .select('severity_classification')
    .eq('site_id', siteId);

  const signalList = signals ?? [];
  const constraintList = constraints ?? [];

  const hardExclusions = constraintList.filter(
    (c: { severity_classification: string }) => c.severity_classification === 'hard_exclusion'
  ).length;

  const softConstraints = constraintList.filter(
    (c: { severity_classification: string }) => c.severity_classification === 'soft_constraint'
  ).length;

  const positiveSignals = signalList.filter(
    (s: { status: string }) => s.status === 'known'
  ).length;

  const unknownSignals = signalList.filter(
    (s: { status: string }) => s.status === 'unknown'
  ).length;

  const { data, error } = await db
    .from('opportunities')
    .insert({
      site_id: siteId,
      opportunity_type_id: opportunityTypeId ?? null,
      status: 'identified',
      assessment_notes: notes ?? null,
      signal_count: signalList.length,
      positive_signals: positiveSignals,
      soft_constraints: softConstraints,
      hard_exclusions: hardExclusions,
      unknown_signals: unknownSignals,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create opportunity for site ${siteId}: ${error.message}`);
  }

  return data as Opportunity;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get opportunity ${id}: ${error.message}`);
  }

  return data as Opportunity;
}

export async function getOpportunityBySiteId(siteId: string): Promise<Opportunity | null> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('opportunities')
    .select('*')
    .eq('site_id', siteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get opportunity for site ${siteId}: ${error.message}`);
  }

  return data as Opportunity;
}

export async function listOpportunities(filters?: {
  status?: OpportunityStatus;
  opportunity_type_id?: OpportunityTypeId;
  limit?: number;
}): Promise<Opportunity[]> {
  const db = getLandRadarDb();
  let query = db
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.opportunity_type_id) {
    query = query.eq('opportunity_type_id', filters.opportunity_type_id);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list opportunities: ${error.message}`);
  return (data ?? []) as Opportunity[];
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<void> {
  const db = getLandRadarDb();
  const { error } = await db
    .from('opportunities')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update opportunity ${id} status: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Explanation
// ---------------------------------------------------------------------------

/**
 * Returns structured evidence for an opportunity:
 * "Why did Land Radar surface this?"
 */
export async function getOpportunityExplanation(
  opportunityId: string
): Promise<OpportunityExplanation | null> {
  const opportunity = await getOpportunity(opportunityId);
  if (!opportunity) return null;

  return getSiteExplanation(opportunity.site_id);
}
