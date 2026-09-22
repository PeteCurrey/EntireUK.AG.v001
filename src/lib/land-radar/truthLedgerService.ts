/**
 * Land Radar — Candidate Truth Ledger & Acquisition Validation Service
 *
 * Phase 10 Core Architecture:
 * - Append-only, immutable event ledger.
 * - Strict 4-layer separation:
 *     Layer 1: Machine Evidence (observed source facts)
 *     Layer 2: Derived Evidence (deterministic derivations & rules)
 *     Layer 3: Analyst Interpretation (human commercial hypothesis)
 *     Layer 4: Real-World Outcome (subsequently discovered external facts)
 * - Real-World Evidence Requirement:
 *     A site is UNVALIDATED until corroborated by external evidence.
 */

import {
  TruthLedgerEvent,
  TruthLedgerLayer,
  ExternalEvidenceRecord,
  ExternalEvidenceType,
  ContradictionStatus,
  CandidateValidationRecord,
  ValidationStatus,
  ValidationStage,
  CommercialDecision,
  HumanBenchmarkCandidate,
  CandidateTruthLedger,
  Site,
  SiteSignal,
  PrioritisationResult,
  MarketEvidenceSummary,
  DevelopmentCapacityEvidence,
  PlanningEvidenceItem,
  CreateSignalInput,
} from './types';
import { getLandRadarDb, getPersistenceMode, PersistenceError } from './db';



// ---------------------------------------------------------------------------
// In-Memory Storage (Test / Mock persistence mode)
// ---------------------------------------------------------------------------

const memoryEvents: Map<string, TruthLedgerEvent> = new Map();
const memoryExternalEvidence: Map<string, ExternalEvidenceRecord> = new Map();
const memoryValidationRecords: Map<string, CandidateValidationRecord> = new Map();
const memoryHumanBenchmarks: Map<string, HumanBenchmarkCandidate> = new Map();

export function _resetTruthLedgerStore(): void {
  memoryEvents.clear();
  memoryExternalEvidence.clear();
  memoryValidationRecords.clear();
  memoryHumanBenchmarks.clear();
}

// ---------------------------------------------------------------------------
// 1. Truth Ledger Events (Append-Only & Immutable)
// ---------------------------------------------------------------------------

export interface RecordTruthEventInput {
  site_id: string;
  site_reference: string;
  layer: TruthLedgerLayer;
  event_type: string;
  actor: string;
  actor_role?: string | null;
  evidence_source?: string | null;
  source_reference?: string | null;
  previous_state?: string | null;
  new_state?: string | null;
  payload: Record<string, unknown>;
  notes?: string | null;
  confidence?: number | null;
  event_timestamp?: string;
}

export async function recordTruthEvent(
  input: RecordTruthEventInput
): Promise<TruthLedgerEvent> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();
  const eventTimestamp = input.event_timestamp ?? now;

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_truth_ledger')
      .insert({
        site_id: input.site_id,
        site_reference: input.site_reference,
        layer: input.layer,
        event_type: input.event_type,
        actor: input.actor,
        actor_role: input.actor_role ?? null,
        evidence_source: input.evidence_source ?? null,
        source_reference: input.source_reference ?? null,
        previous_state: input.previous_state ?? null,
        new_state: input.new_state ?? null,
        payload: input.payload,
        notes: input.notes ?? null,
        confidence: input.confidence ?? null,
        event_timestamp: eventTimestamp,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record truth ledger event in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    return data as TruthLedgerEvent;
  }

  const id = `event-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const event: TruthLedgerEvent = {
    id,
    site_id: input.site_id,
    site_reference: input.site_reference,
    layer: input.layer,
    event_type: input.event_type,
    actor: input.actor,
    actor_role: input.actor_role ?? null,
    evidence_source: input.evidence_source ?? null,
    source_reference: input.source_reference ?? null,
    previous_state: input.previous_state ?? null,
    new_state: input.new_state ?? null,
    payload: input.payload,
    notes: input.notes ?? null,
    confidence: input.confidence ?? null,
    event_timestamp: eventTimestamp,
    created_at: now,
  };

  memoryEvents.set(id, event);
  return event;
}

export async function listTruthEventsForSite(siteId: string): Promise<TruthLedgerEvent[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_truth_ledger')
      .select('*')
      .eq('site_id', siteId)
      .order('event_timestamp', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve truth ledger events from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as TruthLedgerEvent[];
  }

  return Array.from(memoryEvents.values())
    .filter((e) => e.site_id === siteId || e.site_reference === siteId)
    .sort((a, b) => b.event_timestamp.localeCompare(a.event_timestamp));
}

// ---------------------------------------------------------------------------
// 2. External Evidence Records (Real-World Independent Corroboration)
// ---------------------------------------------------------------------------

export interface RecordExternalEvidenceInput {
  site_id: string;
  site_reference: string;
  evidence_type: ExternalEvidenceType;
  evidence_date: string;
  source_organisation: string;
  author: string;
  author_role?: string | null;
  summary: string;
  supporting_document_ref?: string | null;
  analyst_interpretation: string;
  contradiction_status: ContradictionStatus;
  confidence: 'high' | 'medium' | 'low' | 'provisional';
}

export async function recordExternalEvidence(
  input: RecordExternalEvidenceInput
): Promise<ExternalEvidenceRecord> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('external_evidence_records')
      .insert({
        site_id: input.site_id,
        site_reference: input.site_reference,
        evidence_type: input.evidence_type,
        evidence_date: input.evidence_date,
        source_organisation: input.source_organisation,
        author: input.author,
        author_role: input.author_role ?? null,
        summary: input.summary,
        supporting_document_ref: input.supporting_document_ref ?? null,
        analyst_interpretation: input.analyst_interpretation,
        contradiction_status: input.contradiction_status,
        confidence: input.confidence,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record external evidence in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }

    // Automatically append a Layer 4 event to the truth ledger
    await recordTruthEvent({
      site_id: input.site_id,
      site_reference: input.site_reference,
      layer: 'real_world_outcome',
      event_type: 'external_evidence_received',
      actor: input.author,
      actor_role: input.author_role,
      evidence_source: input.source_organisation,
      source_reference: input.supporting_document_ref,
      payload: {
        evidence_type: input.evidence_type,
        summary: input.summary,
        contradiction_status: input.contradiction_status,
        confidence: input.confidence,
      },
      notes: input.analyst_interpretation,
    });

    return data as ExternalEvidenceRecord;
  }

  const id = `ext-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const record: ExternalEvidenceRecord = {
    ...input,
    id,
    created_at: now,
  };

  memoryExternalEvidence.set(id, record);

  // In-memory Layer 4 truth event
  await recordTruthEvent({
    site_id: input.site_id,
    site_reference: input.site_reference,
    layer: 'real_world_outcome',
    event_type: 'external_evidence_received',
    actor: input.author,
    actor_role: input.author_role,
    evidence_source: input.source_organisation,
    source_reference: input.supporting_document_ref,
    payload: {
      evidence_type: input.evidence_type,
      summary: input.summary,
      contradiction_status: input.contradiction_status,
      confidence: input.confidence,
    },
    notes: input.analyst_interpretation,
  });

  return record;
}

export async function listExternalEvidenceForSite(
  siteId: string
): Promise<ExternalEvidenceRecord[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('external_evidence_records')
      .select('*')
      .eq('site_id', siteId)
      .order('evidence_date', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve external evidence records from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as ExternalEvidenceRecord[];
  }

  return Array.from(memoryExternalEvidence.values())
    .filter((e) => e.site_id === siteId || e.site_reference === siteId)
    .sort((a, b) => b.evidence_date.localeCompare(a.evidence_date));
}

// ---------------------------------------------------------------------------
// 3. Candidate Validation Records (Status, Realities & Diagnosis)
// ---------------------------------------------------------------------------

export async function recordValidationState(
  input: Omit<CandidateValidationRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<CandidateValidationRecord> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_validation_records')
      .upsert(
        {
          site_id: input.site_id,
          site_reference: input.site_reference,
          cohort_id: input.cohort_id,
          validation_status: input.validation_status,
          validation_stage: input.validation_stage,
          commercial_decision: input.commercial_decision,
          availability_reality: input.availability_reality,
          owner_engagement_reality: input.owner_engagement_reality,
          planning_reality: input.planning_reality,
          access_reality: input.access_reality,
          market_reality: input.market_reality,
          acquisition_outcome: input.acquisition_outcome,
          rejection_reasons: input.rejection_reasons,
          false_positive_flag: input.false_positive_flag,
          false_positive_root_cause: input.false_positive_root_cause ?? null,
          false_negative_flag: input.false_negative_flag,
          false_negative_category: input.false_negative_category ?? null,
          analyst_notes: input.analyst_notes ?? null,
          validated_at: input.validation_status === 'VALIDATED' ? now : null,
          updated_at: now,
        },
        { onConflict: 'site_id, cohort_id' }
      )
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record candidate validation in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }

    // Append validation state change event to the Truth Ledger
    await recordTruthEvent({
      site_id: input.site_id,
      site_reference: input.site_reference,
      layer: 'real_world_outcome',
      event_type: 'validation_state_updated',
      actor: 'acquisition_analyst',
      payload: {
        validation_status: input.validation_status,
        validation_stage: input.validation_stage,
        commercial_decision: input.commercial_decision,
        realities: {
          planning: input.planning_reality,
          access: input.access_reality,
          market: input.market_reality,
          availability: input.availability_reality,
          owner: input.owner_engagement_reality,
          acquisition: input.acquisition_outcome,
        },
        rejection_reasons: input.rejection_reasons,
        false_positive_flag: input.false_positive_flag,
        false_positive_root_cause: input.false_positive_root_cause,
      },
      notes: input.analyst_notes,
    });

    return data as CandidateValidationRecord;
  }

  const key = `${input.site_id}:${input.cohort_id}`;
  const existing = memoryValidationRecords.get(key);
  const id = existing?.id ?? `val-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const record: CandidateValidationRecord = {
    ...input,
    id,
    validated_at: input.validation_status === 'VALIDATED' ? now : (existing?.validated_at ?? null),
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  memoryValidationRecords.set(key, record);

  await recordTruthEvent({
    site_id: input.site_id,
    site_reference: input.site_reference,
    layer: 'real_world_outcome',
    event_type: 'validation_state_updated',
    actor: 'acquisition_analyst',
    payload: {
      validation_status: input.validation_status,
      validation_stage: input.validation_stage,
      commercial_decision: input.commercial_decision,
      realities: {
        planning: input.planning_reality,
        access: input.access_reality,
        market: input.market_reality,
        availability: input.availability_reality,
        owner: input.owner_engagement_reality,
        acquisition: input.acquisition_outcome,
      },
      rejection_reasons: input.rejection_reasons,
      false_positive_flag: input.false_positive_flag,
      false_positive_root_cause: input.false_positive_root_cause,
    },
    notes: input.analyst_notes,
  });

  return record;
}

export async function getValidationRecord(
  siteId: string,
  cohortId?: string
): Promise<CandidateValidationRecord | null> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    let query = db.from('candidate_validation_records').select('*').eq('site_id', siteId);
    if (cohortId) {
      query = query.eq('cohort_id', cohortId);
    }
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve candidate validation record from Supabase: ${error.message}`,
        error
      );
    }
    return (data || null) as CandidateValidationRecord | null;
  }

  for (const record of memoryValidationRecords.values()) {
    if (record.site_id === siteId || record.site_reference === siteId) {
      if (!cohortId || record.cohort_id === cohortId) {
        return record;
      }
    }
  }
  return null;
}

export async function listValidationRecords(
  cohortId?: string
): Promise<CandidateValidationRecord[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    let query = db.from('candidate_validation_records').select('*');
    if (cohortId) {
      query = query.eq('cohort_id', cohortId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to list validation records from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as CandidateValidationRecord[];
  }

  return Array.from(memoryValidationRecords.values())
    .filter((r) => !cohortId || r.cohort_id === cohortId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ---------------------------------------------------------------------------
// 4. Human Benchmark Candidates (Independent Acquisition Research)
// ---------------------------------------------------------------------------

export async function recordHumanBenchmark(
  input: Omit<HumanBenchmarkCandidate, 'id' | 'created_at'>
): Promise<HumanBenchmarkCandidate> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('human_benchmark_candidates')
      .insert({
        benchmark_set_id: input.benchmark_set_id,
        geography: input.geography,
        site_reference: input.site_reference,
        site_name: input.site_name,
        identified_by: input.identified_by,
        identification_date: input.identification_date,
        identification_method: input.identification_method,
        rationale: input.rationale,
        geometry: input.geometry ?? null,
        surfaced_by_land_radar: input.surfaced_by_land_radar,
        land_radar_site_reference: input.land_radar_site_reference ?? null,
        screening_outcome: input.screening_outcome ?? null,
        exclusion_rule_id: input.exclusion_rule_id ?? null,
        disagreement_reason: input.disagreement_reason ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record human benchmark candidate in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    return data as HumanBenchmarkCandidate;
  }

  const id = `hb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const record: HumanBenchmarkCandidate = {
    ...input,
    id,
    created_at: now,
  };

  memoryHumanBenchmarks.set(id, record);
  return record;
}

export async function listHumanBenchmarks(
  benchmarkSetId?: string
): Promise<HumanBenchmarkCandidate[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    let query = db.from('human_benchmark_candidates').select('*');
    if (benchmarkSetId) {
      query = query.eq('benchmark_set_id', benchmarkSetId);
    }
    const { data, error } = await query.order('identification_date', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to list human benchmark candidates from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as HumanBenchmarkCandidate[];
  }

  return Array.from(memoryHumanBenchmarks.values())
    .filter((b) => !benchmarkSetId || b.benchmark_set_id === benchmarkSetId)
    .sort((a, b) => b.identification_date.localeCompare(a.identification_date));
}

// ---------------------------------------------------------------------------
// 5. Build the 4-Layer Candidate Truth Ledger
// ---------------------------------------------------------------------------

export interface BuildCandidateTruthLedgerParams {
  site: Site;
  signals: (SiteSignal | CreateSignalInput)[];
  prioritisation: PrioritisationResult;
  marketSummary?: MarketEvidenceSummary | null;
  capacityEvidence?: DevelopmentCapacityEvidence | null;
  planningEvidence?: PlanningEvidenceItem[];
  investigationNotesCount?: number;
  cohortId?: string;
}

export async function buildCandidateTruthLedger(
  params: BuildCandidateTruthLedgerParams
): Promise<CandidateTruthLedger> {
  const {
    site,
    signals,
    prioritisation,
    marketSummary,
    capacityEvidence,
    planningEvidence = [],
    investigationNotesCount = 0,
    cohortId,
  } = params;

  // Retrieve Layer 4 data: external evidence and validation record
  const [externalEvidence, validationRecord, events] = await Promise.all([
    listExternalEvidenceForSite(site.id),
    getValidationRecord(site.id, cohortId),
    listTruthEventsForSite(site.id),
  ]);

  // Real-world validation status (mandates external evidence)
  const validationStatus: ValidationStatus =
    validationRecord?.validation_status ??
    (externalEvidence.length > 0 ? 'IN_VALIDATION' : 'UNVALIDATED');

  // Layer 1: Machine Evidence (observed source facts)
  const observedFacts = signals.map((s) => ({
    attribute: s.signal_type,
    value: s.value !== undefined ? s.value : s.value_text ?? null,
    source: s.source ?? 'ENTIRE-UK-PILOT',
    source_id: s.data_source_id ?? s.source ?? 'UNKNOWN',
    licence: 'OGL-v3.0',
    retrieval_mode: 'local_fixture',
    observed_at: ('created_at' in s && s.created_at) ? (s.created_at as string) : new Date().toISOString(),
  }));

  // Layer 2: Derived Evidence (deterministic evaluations)
  const rulesEvaluated = [
    {
      rule_id: 'PRIORITISATION_BUCKET',
      result: prioritisation.priority.toUpperCase(),
      rationale: prioritisation.priorityReasons.join(' · '),
    },
    {
      rule_id: 'MARKET_EVALUATION',
      result: marketSummary?.market_strength ?? 'UNKNOWN',
      rationale: marketSummary?.rationale ?? 'No market transaction evidence matched.',
    },
    {
      rule_id: 'CAPACITY_EVALUATION',
      result: capacityEvidence?.development_potential ?? 'UNKNOWN',
      rationale: capacityEvidence?.potential_classification_rationale ?? 'Developable capacity unassessed.',
    },
  ];

  // Layer 3: Analyst Interpretation (commercial hypothesis and uncertainties)
  const riskAssessment = [
    {
      category: 'Planning',
      description: planningEvidence.length > 0
        ? `${planningEvidence.length} applications matched; precedent review required.`
        : 'Zero planning history found in pilot register.',
      severity: planningEvidence.some((p) => p.application?.decision === 'refused') ? 'high' : 'low',
    },
    {
      category: 'Market Liquidity',
      description: marketSummary
        ? `${marketSummary.sample_size} sales recorded; median £${marketSummary.median_price?.toLocaleString() ?? 'unrecorded'}.`
        : 'Sparse or zero sales in immediate radius.',
      severity: marketSummary?.market_strength === 'INSUFFICIENT_MARKET_EVIDENCE' ? 'medium' : 'low',
    },
    {
      category: 'Legal Access',
      description: 'Road proximity calculated geometrically; legal right of way and ransom strips unverified.',
      severity: 'medium',
    },
    {
      category: 'Title & Ownership',
      description: 'HMLR Title Register unpurchased; registered proprietor and covenants unverified.',
      severity: 'medium',
    },
  ];

  // Layer 4: Real-World Outcome (ground truth realities)
  const layer4Outcome = {
    validation_status: validationStatus,
    validation_stage: validationRecord?.validation_stage ?? ('SURFACED' as ValidationStage),
    commercial_decision: validationRecord?.commercial_decision ?? ('UNDECIDED' as CommercialDecision),
    external_evidence_count: externalEvidence.length,
    realities: {
      availability: validationRecord?.availability_reality ?? 'UNKNOWN',
      owner_engagement: validationRecord?.owner_engagement_reality ?? 'UNKNOWN',
      planning: validationRecord?.planning_reality ?? 'UNKNOWN',
      access: validationRecord?.access_reality ?? 'UNKNOWN',
      market: validationRecord?.market_reality ?? 'UNKNOWN',
      acquisition: validationRecord?.acquisition_outcome ?? 'UNKNOWN',
    },
    rejection_reasons: validationRecord?.rejection_reasons ?? [],
    is_false_positive: validationRecord?.false_positive_flag ?? false,
    false_positive_root_cause: validationRecord?.false_positive_root_cause ?? null,
    is_false_negative: validationRecord?.false_negative_flag ?? false,
    false_negative_category: validationRecord?.false_negative_category ?? null,
    external_evidence: externalEvidence,
  };

  return {
    site_id: site.id,
    site_reference: site.internal_reference,
    site_name: site.name ?? 'Candidate Site',
    validation_status: validationStatus,
    layer1_machine_evidence: {
      observed_facts: observedFacts,
      geometry_type: site.geometry?.type ?? 'None',
      gross_area_sqm: site.area_sqm,
      raw_record_summary: {
        source: site.source,
        source_reference: site.source_reference,
        discrepancy_flag: site.area_discrepancy_flag,
      },
    },
    layer2_derived_evidence: {
      screening_strategy: 'RESIDENTIAL_DEVELOPMENT_V3',
      rules_evaluated: rulesEvaluated,
      prioritisation: {
        priority: prioritisation.priority,
        priority_reasons: prioritisation.priorityReasons,
        evidence_completeness_pct: prioritisation.evidenceCompleteness.percentage,
      },
      market_classification: {
        market_strength: marketSummary?.market_strength ?? 'UNKNOWN',
        median_price: marketSummary?.median_price ?? null,
        sample_size: marketSummary?.sample_size ?? 0,
        rationale: marketSummary?.rationale ?? 'No transaction data.',
      },
      capacity_classification: {
        developable_status: capacityEvidence?.developable_area_status ?? 'unknown',
        net_developable_ha: capacityEvidence?.potentially_developable_area_ha ?? null,
        development_potential: capacityEvidence?.development_potential ?? 'UNKNOWN',
        constrained_pct: capacityEvidence?.constrained_percentage ?? 0,
      },
    },
    layer3_analyst_interpretation: {
      hypothesis: prioritisation.whySurfaced.coreDriver,
      critical_unknowns: [
        'Adopted highway visibility splays & legal vehicular access rights',
        'Registered freehold proprietor & restrictive covenant encumbrances',
        'Utility connection capacity (Severn Trent / National Grid DNO)',
      ],
      risk_assessment: riskAssessment,
      analyst_verdict: null,
      investigation_notes_count: investigationNotesCount,
    },
    layer4_real_world_outcome: layer4Outcome,
    events: events,
  };
}
