/**
 * Land Radar — Ownership Intelligence & Live Acquisition Operations Service
 *
 * Phase 11 Core Service:
 * - Ownership evidence management with explicit provenance (source, retrieval date, status).
 * - Multi-title relationship and complexity classification.
 * - Availability tracking (separate from ownership).
 * - Acquisition contact and evidence recording.
 * - Summary building for candidate review and acquisition gating.
 */

import {
  OwnershipEvidence,
  OwnershipEvidenceStatus,
  OwnershipComplexity,
  TitleCandidateRelationship,
  TitleRelationshipStrength,
  AvailabilityEvidence,
  AcquisitionAvailabilityState,
  AcquisitionContactRecord,
  ContactOutcomeCode,
  AcquisitionEvidenceRecord,
  AcquisitionEvidenceType,
  ContradictionStatus,
  OwnershipIntelligenceSummary,
  RetrievalMode,
} from '../types';
import { getLandRadarDb, getPersistenceMode, PersistenceError } from '../db';
import { recordTruthEvent } from '../truthLedgerService';
import { fetchHmlrTitleDetails, HmlrTitleResult } from '../clients/hmlrClient';

// ---------------------------------------------------------------------------
// In-Memory Storage (Mock / Test Persistence Mode)
// ---------------------------------------------------------------------------

const memoryOwnershipEvidence: Map<string, OwnershipEvidence> = new Map();
const memoryTitleRelationships: Map<string, TitleCandidateRelationship> = new Map();
const memoryAvailabilityEvidence: Map<string, AvailabilityEvidence> = new Map();
const memoryContactRecords: Map<string, AcquisitionContactRecord> = new Map();
const memoryAcquisitionEvidence: Map<string, AcquisitionEvidenceRecord> = new Map();

export function _resetOwnershipStore(): void {
  memoryOwnershipEvidence.clear();
  memoryTitleRelationships.clear();
  memoryAvailabilityEvidence.clear();
  memoryContactRecords.clear();
  memoryAcquisitionEvidence.clear();
}

// ---------------------------------------------------------------------------
// 1. Ownership Evidence
// ---------------------------------------------------------------------------

export interface RecordOwnershipEvidenceInput {
  site_id: string;
  site_reference: string;
  title_reference?: string | null;
  proprietor_notes?: string | null;
  ownership_source: string;
  source_reference?: string | null;
  retrieval_date: string;
  retrieval_mode?: RetrievalMode;
  evidence_status: OwnershipEvidenceStatus;
  ownership_interpretation?: 'freehold' | 'leasehold' | 'multiple_interests' | 'uncertain' | 'unknown';
  acquisition_relevance?: 'likely_single_owner' | 'multiple_ownership' | 'ownership_complexity' | 'unknown';
  analyst_notes?: string | null;
  recorded_by: string;
}

export async function recordOwnershipEvidence(
  input: RecordOwnershipEvidenceInput
): Promise<OwnershipEvidence> {
  const mode = getPersistenceMode();
  const id = `own-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: OwnershipEvidence = {
    id,
    site_id: input.site_id,
    site_reference: input.site_reference,
    title_reference: input.title_reference ?? null,
    proprietor_notes: input.proprietor_notes ?? null,
    ownership_source: input.ownership_source,
    source_reference: input.source_reference ?? null,
    retrieval_date: input.retrieval_date,
    retrieval_mode: input.retrieval_mode ?? 'manual_entry',
    evidence_status: input.evidence_status,
    ownership_interpretation: input.ownership_interpretation ?? 'unknown',
    acquisition_relevance: input.acquisition_relevance ?? 'unknown',
    analyst_notes: input.analyst_notes ?? null,
    recorded_by: input.recorded_by,
    created_at: now,
  };

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { error } = await db.from('ownership_evidence').insert({
      id: record.id,
      site_id: record.site_id,
      site_reference: record.site_reference,
      title_reference: record.title_reference,
      proprietor_notes: record.proprietor_notes,
      ownership_source: record.ownership_source,
      source_reference: record.source_reference,
      retrieval_date: record.retrieval_date,
      retrieval_mode: record.retrieval_mode,
      evidence_status: record.evidence_status,
      ownership_interpretation: record.ownership_interpretation,
      acquisition_relevance: record.acquisition_relevance,
      analyst_notes: record.analyst_notes,
      recorded_by: record.recorded_by,
      created_at: record.created_at,
    });
    if (error) {
      throw new PersistenceError(`Failed to insert ownership evidence: ${error.message}`);
    }
  } else {
    memoryOwnershipEvidence.set(record.id, record);
  }

  // Automatically record Truth Ledger event in Layer 4 (External Evidence)
  try {
    await recordTruthEvent({
      site_id: record.site_id,
      site_reference: record.site_reference,
      layer: 'external_evidence',
      event_type: 'ownership_evidence_recorded',
      actor: record.recorded_by,
      evidence_source: record.ownership_source,
      source_reference: record.source_reference,
      payload: {
        ownership_evidence_id: record.id,
        title_reference: record.title_reference,
        evidence_status: record.evidence_status,
        ownership_interpretation: record.ownership_interpretation,
      },
      notes: record.analyst_notes,
    });
  } catch (err) {
    if (mode === 'supabase') {
      throw new PersistenceError(`Failed to record truth ledger event for ownership evidence: ${err instanceof Error ? err.message : String(err)}`, err);
    }
  }

  return record;
}

export async function listOwnershipEvidenceForSite(siteId: string): Promise<OwnershipEvidence[]> {
  const mode = getPersistenceMode();
  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('ownership_evidence')
      .select('*')
      .eq('site_id', siteId)
      .order('retrieval_date', { ascending: false });
    if (error) {
      throw new PersistenceError(`Failed to fetch ownership evidence: ${error.message}`);
    }
    return data ?? [];
  }

  return Array.from(memoryOwnershipEvidence.values())
    .filter((o) => o.site_id === siteId)
    .sort((a, b) => b.retrieval_date.localeCompare(a.retrieval_date));
}

// ---------------------------------------------------------------------------
// 2. Title Candidate Relationships
// ---------------------------------------------------------------------------

export interface AssessTitleRelationshipInput {
  site_id: string;
  title_id: string;
  title_reference?: string | null;
  relationship_strength: TitleRelationshipStrength;
  overlap_pct?: number | null;
  title_geometry_available: boolean;
  analyst_notes?: string | null;
  assessed_by: string;
}

export async function assessTitleCandidateRelationship(
  input: AssessTitleRelationshipInput
): Promise<TitleCandidateRelationship> {
  const mode = getPersistenceMode();
  const id = `tcr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: TitleCandidateRelationship = {
    id,
    site_id: input.site_id,
    title_id: input.title_id,
    title_reference: input.title_reference ?? null,
    relationship_strength: input.relationship_strength,
    overlap_pct: input.overlap_pct ?? null,
    title_geometry_available: input.title_geometry_available,
    analyst_notes: input.analyst_notes ?? null,
    assessed_by: input.assessed_by,
    assessed_at: now,
    created_at: now,
  };

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { error } = await db.from('title_candidate_relationships').insert({
      id: record.id,
      site_id: record.site_id,
      title_id: record.title_id,
      title_reference: record.title_reference,
      relationship_strength: record.relationship_strength,
      overlap_pct: record.overlap_pct,
      title_geometry_available: record.title_geometry_available,
      analyst_notes: record.analyst_notes,
      assessed_by: record.assessed_by,
      assessed_at: record.assessed_at,
      created_at: record.created_at,
    });
    if (error) {
      throw new PersistenceError(`Failed to insert title candidate relationship: ${error.message}`);
    }
  } else {
    memoryTitleRelationships.set(record.id, record);
  }

  return record;
}

export async function listTitleCandidateRelationshipsForSite(
  siteId: string
): Promise<TitleCandidateRelationship[]> {
  const mode = getPersistenceMode();
  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('title_candidate_relationships')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    if (error) {
      throw new PersistenceError(`Failed to fetch title candidate relationships: ${error.message}`);
    }
    return data ?? [];
  }

  return Array.from(memoryTitleRelationships.values()).filter((t) => t.site_id === siteId);
}

export function classifyOwnershipComplexity(
  titles: TitleCandidateRelationship[],
  evidence: OwnershipEvidence[]
): OwnershipComplexity {
  if (titles.length === 0 && evidence.length === 0) {
    return 'UNKNOWN';
  }

  // Check if any evidence explicitly noted fragmented or multiple interests
  const hasFragmentedEvidence = evidence.some(
    (e) => e.acquisition_relevance === 'ownership_complexity' || e.ownership_interpretation === 'multiple_interests'
  );
  if (hasFragmentedEvidence) {
    return 'FRAGMENTED';
  }

  if (titles.length > 1) {
    return 'MULTI_TITLE';
  }

  if (titles.length === 1) {
    return 'SINGLE_TITLE';
  }

  // Fallback to evidence count
  if (evidence.length > 1) {
    return 'MULTI_TITLE';
  }
  if (evidence.length === 1) {
    return 'SINGLE_TITLE';
  }

  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// 3. Availability Evidence
// ---------------------------------------------------------------------------

export interface RecordAvailabilityInput {
  site_id: string;
  site_reference: string;
  availability_state: AcquisitionAvailabilityState;
  evidence_source: string;
  evidence_date: string;
  confidence?: number;
  evidence_notes?: string | null;
  recorded_by: string;
}

export async function recordAvailabilityEvidence(
  input: RecordAvailabilityInput
): Promise<AvailabilityEvidence> {
  const mode = getPersistenceMode();
  const id = `avail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: AvailabilityEvidence = {
    id,
    site_id: input.site_id,
    site_reference: input.site_reference,
    availability_state: input.availability_state,
    evidence_source: input.evidence_source,
    evidence_date: input.evidence_date,
    confidence: input.confidence ?? 1.0,
    evidence_notes: input.evidence_notes ?? null,
    recorded_by: input.recorded_by,
    created_at: now,
  };

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { error } = await db.from('availability_evidence').insert({
      id: record.id,
      site_id: record.site_id,
      site_reference: record.site_reference,
      availability_state: record.availability_state,
      evidence_source: record.evidence_source,
      evidence_date: record.evidence_date,
      confidence: record.confidence,
      evidence_notes: record.evidence_notes,
      recorded_by: record.recorded_by,
      created_at: record.created_at,
    });
    if (error) {
      throw new PersistenceError(`Failed to insert availability evidence: ${error.message}`);
    }
  } else {
    memoryAvailabilityEvidence.set(record.id, record);
  }

  try {
    await recordTruthEvent({
      site_id: record.site_id,
      site_reference: record.site_reference,
      layer: 'external_evidence',
      event_type: 'availability_evidence_recorded',
      actor: record.recorded_by,
      evidence_source: record.evidence_source,
      payload: {
        availability_id: record.id,
        availability_state: record.availability_state,
        confidence: record.confidence,
      },
      notes: record.evidence_notes,
    });
  } catch (err) {
    if (mode === 'supabase') {
      throw new PersistenceError(`Failed to record truth ledger event for availability evidence: ${err instanceof Error ? err.message : String(err)}`, err);
    }
  }

  return record;
}

export async function listAvailabilityEvidenceForSite(
  siteId: string
): Promise<AvailabilityEvidence[]> {
  const mode = getPersistenceMode();
  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('availability_evidence')
      .select('*')
      .eq('site_id', siteId)
      .order('evidence_date', { ascending: false });
    if (error) {
      throw new PersistenceError(`Failed to fetch availability evidence: ${error.message}`);
    }
    return data ?? [];
  }

  return Array.from(memoryAvailabilityEvidence.values())
    .filter((a) => a.site_id === siteId)
    .sort((a, b) => b.evidence_date.localeCompare(a.evidence_date));
}

export async function getLatestAvailabilityState(
  siteId: string
): Promise<AcquisitionAvailabilityState> {
  const history = await listAvailabilityEvidenceForSite(siteId);
  if (history.length === 0) {
    return 'UNKNOWN';
  }
  return history[0].availability_state;
}

// ---------------------------------------------------------------------------
// 4. Acquisition Contact Records
// ---------------------------------------------------------------------------

export interface RecordContactOutcomeInput {
  site_id: string;
  site_reference: string;
  contact_type: 'email' | 'phone' | 'letter' | 'in_person' | 'agent_intermediary' | 'other';
  organisation_or_role?: string | null;
  source_of_contact_details?: string | null;
  contact_date: string;
  communication_method_notes?: string | null;
  outcome: ContactOutcomeCode;
  availability_information?: string | null;
  next_action?: string | null;
  analyst: string;
  notes?: string | null;
}

export async function recordContactOutcome(
  input: RecordContactOutcomeInput
): Promise<AcquisitionContactRecord> {
  const mode = getPersistenceMode();
  const id = `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: AcquisitionContactRecord = {
    id,
    site_id: input.site_id,
    site_reference: input.site_reference,
    contact_type: input.contact_type,
    organisation_or_role: input.organisation_or_role ?? null,
    source_of_contact_details: input.source_of_contact_details ?? null,
    contact_date: input.contact_date,
    communication_method_notes: input.communication_method_notes ?? null,
    outcome: input.outcome,
    availability_information: input.availability_information ?? null,
    next_action: input.next_action ?? null,
    analyst: input.analyst,
    notes: input.notes ?? null,
    created_at: now,
  };

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { error } = await db.from('acquisition_contact_records').insert({
      id: record.id,
      site_id: record.site_id,
      site_reference: record.site_reference,
      contact_type: record.contact_type,
      organisation_or_role: record.organisation_or_role,
      source_of_contact_details: record.source_of_contact_details,
      contact_date: record.contact_date,
      communication_method_notes: record.communication_method_notes,
      outcome: record.outcome,
      availability_information: record.availability_information,
      next_action: record.next_action,
      analyst: record.analyst,
      notes: record.notes,
      created_at: record.created_at,
    });
    if (error) {
      throw new PersistenceError(`Failed to insert contact record: ${error.message}`);
    }
  } else {
    memoryContactRecords.set(record.id, record);
  }

  // Also log Truth Ledger event (real_world_outcome or external_evidence depending on outcome)
  try {
    await recordTruthEvent({
      site_id: record.site_id,
      site_reference: record.site_reference,
      layer: 'external_evidence',
      event_type: 'acquisition_contact_recorded',
      actor: record.analyst,
      evidence_source: record.contact_type,
      payload: {
        contact_id: record.id,
        outcome: record.outcome,
        next_action: record.next_action,
      },
      notes: record.notes,
    });
  } catch (err) {
    if (mode === 'supabase') {
      throw new PersistenceError(`Failed to record truth ledger event for contact outcome: ${err instanceof Error ? err.message : String(err)}`, err);
    }
  }

  return record;
}

export async function listContactHistoryForSite(
  siteId: string
): Promise<AcquisitionContactRecord[]> {
  const mode = getPersistenceMode();
  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('acquisition_contact_records')
      .select('*')
      .eq('site_id', siteId)
      .order('contact_date', { ascending: false });
    if (error) {
      throw new PersistenceError(`Failed to fetch contact history: ${error.message}`);
    }
    return data ?? [];
  }

  return Array.from(memoryContactRecords.values())
    .filter((c) => c.site_id === siteId)
    .sort((a, b) => b.contact_date.localeCompare(a.contact_date));
}

// ---------------------------------------------------------------------------
// 5. Acquisition Evidence Records
// ---------------------------------------------------------------------------

export interface RecordAcquisitionEvidenceInput {
  site_id: string;
  site_reference: string;
  evidence_type: AcquisitionEvidenceType;
  evidence_date: string;
  source: string;
  source_reference?: string | null;
  summary: string;
  actor: string;
  actor_role?: string | null;
  supporting_document_ref?: string | null;
  contradiction_status?: ContradictionStatus;
  interpretation: string;
  confidence?: 'high' | 'medium' | 'low' | 'provisional';
  recorded_by: string;
}

export async function recordAcquisitionEvidence(
  input: RecordAcquisitionEvidenceInput
): Promise<AcquisitionEvidenceRecord> {
  const mode = getPersistenceMode();
  const id = `acq-ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: AcquisitionEvidenceRecord = {
    id,
    site_id: input.site_id,
    site_reference: input.site_reference,
    evidence_type: input.evidence_type,
    evidence_date: input.evidence_date,
    source: input.source,
    source_reference: input.source_reference ?? null,
    summary: input.summary,
    actor: input.actor,
    actor_role: input.actor_role ?? null,
    supporting_document_ref: input.supporting_document_ref ?? null,
    contradiction_status: input.contradiction_status ?? 'neutral',
    interpretation: input.interpretation,
    confidence: input.confidence ?? 'medium',
    recorded_by: input.recorded_by,
    created_at: now,
  };

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { error } = await db.from('acquisition_evidence_records').insert({
      id: record.id,
      site_id: record.site_id,
      site_reference: record.site_reference,
      evidence_type: record.evidence_type,
      evidence_date: record.evidence_date,
      source: record.source,
      source_reference: record.source_reference,
      summary: record.summary,
      actor: record.actor,
      actor_role: record.actor_role,
      supporting_document_ref: record.supporting_document_ref,
      contradiction_status: record.contradiction_status,
      interpretation: record.interpretation,
      confidence: record.confidence,
      recorded_by: record.recorded_by,
      created_at: record.created_at,
    });
    if (error) {
      throw new PersistenceError(`Failed to insert acquisition evidence: ${error.message}`);
    }
  } else {
    memoryAcquisitionEvidence.set(record.id, record);
  }

  try {
    await recordTruthEvent({
      site_id: record.site_id,
      site_reference: record.site_reference,
      layer: 'external_evidence',
      event_type: 'acquisition_evidence_recorded',
      actor: record.recorded_by,
      evidence_source: record.source,
      source_reference: record.source_reference,
      payload: {
        evidence_type: record.evidence_type,
        contradiction_status: record.contradiction_status,
        confidence: record.confidence,
      },
      notes: record.summary,
    });
  } catch (err) {
    if (mode === 'supabase') {
      throw new PersistenceError(`Failed to record truth ledger event for acquisition evidence: ${err instanceof Error ? err.message : String(err)}`, err);
    }
  }

  return record;
}

export async function listAcquisitionEvidenceForSite(
  siteId: string
): Promise<AcquisitionEvidenceRecord[]> {
  const mode = getPersistenceMode();
  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('acquisition_evidence_records')
      .select('*')
      .eq('site_id', siteId)
      .order('evidence_date', { ascending: false });
    if (error) {
      throw new PersistenceError(`Failed to fetch acquisition evidence: ${error.message}`);
    }
    return data ?? [];
  }

  return Array.from(memoryAcquisitionEvidence.values())
    .filter((e) => e.site_id === siteId)
    .sort((a, b) => b.evidence_date.localeCompare(a.evidence_date));
}

// ---------------------------------------------------------------------------
// 6. Build Ownership Intelligence Summary
// ---------------------------------------------------------------------------

export async function buildOwnershipIntelligenceSummary(
  siteId: string,
  siteReference: string
): Promise<OwnershipIntelligenceSummary> {
  const [ownershipEvidence, titleRelationships, availabilityHistory, contactHistory, acqEvidence] =
    await Promise.all([
      listOwnershipEvidenceForSite(siteId),
      listTitleCandidateRelationshipsForSite(siteId),
      listAvailabilityEvidenceForSite(siteId),
      listContactHistoryForSite(siteId),
      listAcquisitionEvidenceForSite(siteId),
    ]);

  // Determine overall status
  let evidenceStatus: OwnershipEvidenceStatus = 'UNKNOWN';
  if (ownershipEvidence.length > 0) {
    if (ownershipEvidence.some((e) => e.evidence_status === 'VERIFIED')) {
      evidenceStatus = 'VERIFIED';
    } else if (ownershipEvidence.some((e) => e.evidence_status === 'CONFLICTING')) {
      evidenceStatus = 'CONFLICTING';
    } else if (ownershipEvidence.some((e) => e.evidence_status === 'SUPPORTED')) {
      evidenceStatus = 'SUPPORTED';
    } else if (ownershipEvidence.some((e) => e.evidence_status === 'STALE')) {
      evidenceStatus = 'STALE';
    } else if (ownershipEvidence.some((e) => e.evidence_status === 'INDICATIVE')) {
      evidenceStatus = 'INDICATIVE';
    }
  }

  const complexity = classifyOwnershipComplexity(titleRelationships, ownershipEvidence);

  // Best relationship strength
  let relStrength: TitleRelationshipStrength = 'UNKNOWN';
  if (titleRelationships.length > 0) {
    if (titleRelationships.some((r) => r.relationship_strength === 'STRONG')) {
      relStrength = 'STRONG';
    } else if (titleRelationships.some((r) => r.relationship_strength === 'PARTIAL')) {
      relStrength = 'PARTIAL';
    } else if (titleRelationships.some((r) => r.relationship_strength === 'WEAK')) {
      relStrength = 'WEAK';
    }
  }

  const titleRefs = Array.from(
    new Set([
      ...ownershipEvidence.map((e) => e.title_reference).filter((t): t is string => Boolean(t)),
      ...titleRelationships.map((r) => r.title_reference).filter((t): t is string => Boolean(t)),
    ])
  );

  const availabilityState =
    availabilityHistory.length > 0 ? availabilityHistory[0].availability_state : 'UNKNOWN';

  const latestContactOutcome =
    contactHistory.length > 0 ? contactHistory[0].outcome : null;

  return {
    site_id: siteId,
    site_reference: siteReference,
    ownership_evidence_status: evidenceStatus,
    complexity,
    title_relationship_strength: relStrength,
    title_count: titleRefs.length,
    title_references: titleRefs,
    availability_state: availabilityState,
    latest_availability_evidence_date:
      availabilityHistory.length > 0 ? availabilityHistory[0].evidence_date : null,
    contact_history_count: contactHistory.length,
    latest_contact_outcome: latestContactOutcome,
    acquisition_evidence_count: acqEvidence.length,
    ownership_evidence_records: ownershipEvidence,
    title_relationships: titleRelationships,
    availability_history: availabilityHistory,
    contact_history: contactHistory,
    acquisition_evidence: acqEvidence,
    assessed_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 6. Live HMLR Online Title Verification
// ---------------------------------------------------------------------------

export interface VerifyHmlrTitleOnlineInput {
  site_id: string;
  site_reference: string;
  title_reference: string;
  recorded_by?: string;
}

/**
 * Queries the live HM Land Registry API for official title register details.
 * Epistemic Rules:
 * - A registered title match DOES NOT mean the land is for sale or available (availability remains UNKNOWN).
 * - A missing title DOES NOT mean absence of ownership.
 * - Records full provenance into the Candidate Truth Ledger (Layer 4).
 */
export async function verifyHmlrTitleOnline(
  input: VerifyHmlrTitleOnlineInput
): Promise<{
  evidence: OwnershipEvidence;
  hmlrResult: HmlrTitleResult;
}> {
  const cleanTitle = input.title_reference.trim().toUpperCase();
  const recordedBy = input.recorded_by || 'analyst@entire-uk.com';

  const hmlrResult = await fetchHmlrTitleDetails(cleanTitle);

  let evidenceStatus: OwnershipEvidenceStatus = 'UNKNOWN';
  let ownershipInterpretation: 'freehold' | 'leasehold' | 'uncertain' | 'unknown' = 'unknown';
  let retrievalMode: RetrievalMode = 'live_api';
  let proprietorNotes = '';

  if (hmlrResult.status === 'FOUND') {
    evidenceStatus = 'VERIFIED';
    ownershipInterpretation = (hmlrResult.tenure as any) || 'freehold';
    retrievalMode = 'live_api';
    proprietorNotes = `Official HMLR Register: ${hmlrResult.classOfTitle || 'Absolute'} title, ${hmlrResult.district || 'Warwickshire'}. Proprietor category: ${hmlrResult.registeredProprietorType || 'corporate'}. Restrictions/Easements: ${hmlrResult.hasRestrictionsOrEasements ? 'Present' : 'None registered'}.`;
  } else if (hmlrResult.status === 'NOT_FOUND') {
    evidenceStatus = 'INDICATIVE';
    ownershipInterpretation = 'uncertain';
    retrievalMode = 'live_api';
    proprietorNotes = `HMLR Online Query: Title ${cleanTitle} not found in official registered title index. May represent unregistered land or pending registration.`;
  } else if (hmlrResult.status === 'UNCONFIGURED') {
    evidenceStatus = 'UNKNOWN';
    ownershipInterpretation = 'unknown';
    retrievalMode = 'unavailable';
    proprietorNotes = `HMLR API not configured: ${hmlrResult.error}`;
  } else {
    evidenceStatus = 'CONFLICTING';
    ownershipInterpretation = 'unknown';
    retrievalMode = 'unavailable';
    proprietorNotes = `HMLR API Error: ${hmlrResult.error}`;
  }

  const evidence = await recordOwnershipEvidence({
    site_id: input.site_id,
    site_reference: input.site_reference,
    title_reference: cleanTitle,
    proprietor_notes: proprietorNotes,
    ownership_source: 'HM Land Registry Official Title Register (Live API)',
    source_reference: cleanTitle,
    retrieval_date: new Date().toISOString().split('T')[0],
    retrieval_mode: retrievalMode,
    evidence_status: evidenceStatus,
    ownership_interpretation: ownershipInterpretation,
    acquisition_relevance: 'unknown',
    analyst_notes: `Live online title verification executed against HMLR API for ${cleanTitle}. Epistemic rule: title match does not establish commercial availability.`,
    recorded_by: recordedBy,
  });

  return { evidence, hmlrResult };
}

