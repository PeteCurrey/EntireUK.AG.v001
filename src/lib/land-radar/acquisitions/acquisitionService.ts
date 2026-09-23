/**
 * Land Radar — Acquisition Operations Service
 *
 * Phase 13 Primary Operational Service:
 * - Aggregates candidate queue into actionable operational groups.
 * - Manages contact records, follow-up scheduling and Truth Ledger logging.
 * - Handles contradiction resolution with mandatory analyst rationale.
 * - Produces unified chronological candidate timeline from Truth Ledger.
 *
 * STRICT GOVERNANCE RULES:
 * - Sourced, attributable, and tamper-evident.
 * - Authoritative persistence in Supabase with zero silent in-memory fallback in production.
 * - Absence of response never marks land as unavailable or available.
 */

import {
  Site,
  SiteSignal,
  AcquisitionContactRecord,
  ContactOutcomeCode,
  ContradictionResolutionRecord,
  OperationalCandidateSummary,
  OperationalQueueGroup,
  DeterministicNextAction,
  AcquisitionOutcomeState,
  TruthLedgerEvent,
} from '../types';
import { getLandRadarDb, getPersistenceMode, PersistenceError } from '../db';
import { recordTruthEvent, listTruthEventsForSite } from '../truthLedgerService';
import { buildOwnershipIntelligenceSummary } from '../ownership/ownershipService';
import { detectContradictions } from '../ownership/contradictionEngine';
import { evaluateDeterministicNextAction } from './nextActionEngine';
import { listOutcomesForSite, recordOutcome, getCurrentOutcomeState } from '../outcomeService';
import { WARWICK_PILOT, RUGBY_PILOT } from '../pilot/config';
import { generatePilotSites } from '../pilot/siteGenerator';
import { BrownfieldAdapter } from '../adapters/brownfieldAdapter';
import { HMLRInspireAdapter } from '../adapters/hmlrInspireAdapter';
import { evaluateCandidatePriority } from '../prioritisation';
import { evaluateDevelopmentCapacity } from '../development/capacityEngine';
import { MarketEvidenceSummary, CreateSignalInput } from '../types';
import {
  buildSettlementProximitySignal,
  buildFloodRiskSignal,
  buildSSSISignal,
  buildBrownfieldSignal,
  buildRoadProximitySignal,
  buildGreenBeltSignal,
  buildPlanningActivitySignal,
  buildMarketSignal,
  buildDevelopmentPatternSignal,
} from '../signals';

// ---------------------------------------------------------------------------
// In-Memory Fallback Stores (Strictly for Test & Mock Mode)
// ---------------------------------------------------------------------------

const memoryContacts: Map<string, AcquisitionContactRecord> = new Map();
const memoryResolutions: Map<string, ContradictionResolutionRecord> = new Map();

export function _resetAcquisitionStore(): void {
  memoryContacts.clear();
  memoryResolutions.clear();
}

// ---------------------------------------------------------------------------
// 1. Contact & Engagement Operations
// ---------------------------------------------------------------------------

export interface RecordContactAttemptInput {
  site_id: string;
  site_reference: string;
  contact_type: 'email' | 'phone' | 'letter' | 'in_person' | 'agent_intermediary' | 'other';
  organisation_or_role: string;
  source_of_contact_details?: string;
  contact_date: string;
  communication_method_notes?: string;
  outcome: ContactOutcomeCode;
  availability_information?: string;
  next_action?: string;
  follow_up_date?: string;
  follow_up_status?: 'pending' | 'completed' | 'deferred' | 'cancelled' | 'none';
  analyst: string;
  notes?: string;
}

export async function recordContactAttempt(
  input: RecordContactAttemptInput
): Promise<AcquisitionContactRecord> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  let createdRecord: AcquisitionContactRecord;

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('acquisition_contact_records')
      .insert({
        site_id: input.site_id,
        site_reference: input.site_reference,
        contact_type: input.contact_type,
        organisation_or_role: input.organisation_or_role,
        source_of_contact_details: input.source_of_contact_details ?? null,
        contact_date: input.contact_date,
        communication_method_notes: input.communication_method_notes ?? null,
        outcome: input.outcome,
        availability_information: input.availability_information ?? null,
        next_action: input.next_action ?? null,
        follow_up_date: input.follow_up_date ?? null,
        follow_up_status: input.follow_up_status || (input.follow_up_date ? 'pending' : 'none'),
        analyst: input.analyst,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to persist acquisition contact record in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    createdRecord = data as AcquisitionContactRecord;
  } else {
    const id = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    createdRecord = {
      id,
      site_id: input.site_id,
      site_reference: input.site_reference,
      contact_type: input.contact_type,
      organisation_or_role: input.organisation_or_role,
      source_of_contact_details: input.source_of_contact_details ?? null,
      contact_date: input.contact_date,
      communication_method_notes: input.communication_method_notes ?? null,
      outcome: input.outcome,
      availability_information: input.availability_information ?? null,
      next_action: input.next_action ?? null,
      follow_up_date: input.follow_up_date ?? null,
      follow_up_status: input.follow_up_status || (input.follow_up_date ? 'pending' : 'none'),
      analyst: input.analyst,
      notes: input.notes ?? null,
      created_at: now,
    };
    memoryContacts.set(id, createdRecord);
  }

  // Immutable audit log to Truth Ledger (Layer 4: Real-World Outcome)
  await recordTruthEvent({
    site_id: input.site_id,
    site_reference: input.site_reference,
    layer: 'real_world_outcome',
    event_type: 'acquisition_contact_attempt',
    actor: input.analyst,
    evidence_source: `Analyst Engagement: ${input.analyst}`,
    payload: {
      contact_id: createdRecord.id,
      contact_type: input.contact_type,
      organisation_or_role: input.organisation_or_role,
      outcome: input.outcome,
      follow_up_date: input.follow_up_date,
    },
    notes: `Contact event recorded via ${input.contact_type}. Outcome: ${input.outcome}. Scheduled follow-up: ${input.follow_up_date || 'None'}.`,
  });

  return createdRecord;
}

export async function listContactAttempts(siteId: string): Promise<AcquisitionContactRecord[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('acquisition_contact_records')
      .select('*')
      .eq('site_id', siteId)
      .order('contact_date', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve acquisition contact records from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as AcquisitionContactRecord[];
  }

  return Array.from(memoryContacts.values())
    .filter((c) => c.site_id === siteId)
    .sort((a, b) => b.contact_date.localeCompare(a.contact_date));
}

// ---------------------------------------------------------------------------
// 2. Contradiction Resolution Operations
// ---------------------------------------------------------------------------

export interface ResolveContradictionInput {
  site_id: string;
  site_reference: string;
  contradiction_id: string;
  contradiction_type: string;
  resolution_status: 'RESOLVED' | 'UNRESOLVED' | 'DEFERRED_TO_LEGAL' | 'ACKNOWLEDGED_MATERIAL';
  resolution_rationale: string;
  supporting_evidence_ref?: string;
  resolved_by: string;
}

export async function recordContradictionResolution(
  input: ResolveContradictionInput
): Promise<ContradictionResolutionRecord> {
  const mode = getPersistenceMode();
  const now = new Date().toISOString();

  let createdRecord: ContradictionResolutionRecord;

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_contradiction_resolutions')
      .insert({
        site_id: input.site_id,
        site_reference: input.site_reference,
        contradiction_id: input.contradiction_id,
        contradiction_type: input.contradiction_type,
        resolution_status: input.resolution_status,
        resolution_rationale: input.resolution_rationale,
        supporting_evidence_ref: input.supporting_evidence_ref ?? null,
        resolved_by: input.resolved_by,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to record contradiction resolution in Supabase: ${error?.message || 'No data returned'}`,
        error
      );
    }
    createdRecord = data as ContradictionResolutionRecord;
  } else {
    const id = `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    createdRecord = {
      id,
      site_id: input.site_id,
      site_reference: input.site_reference,
      contradiction_id: input.contradiction_id,
      contradiction_type: input.contradiction_type,
      resolution_status: input.resolution_status,
      resolution_rationale: input.resolution_rationale,
      supporting_evidence_ref: input.supporting_evidence_ref ?? null,
      resolved_by: input.resolved_by,
      resolved_at: now,
      created_at: now,
    };
    memoryResolutions.set(id, createdRecord);
  }

  // Immutable audit log to Truth Ledger (Layer 3: Analyst Interpretation)
  await recordTruthEvent({
    site_id: input.site_id,
    site_reference: input.site_reference,
    layer: 'analyst_interpretation',
    event_type: 'contradiction_resolution',
    actor: input.resolved_by,
    evidence_source: `Analyst Review: ${input.resolved_by}`,
    payload: {
      contradiction_id: input.contradiction_id,
      status: input.resolution_status,
      rationale: input.resolution_rationale,
      evidence_ref: input.supporting_evidence_ref,
    },
    notes: `Contradiction ${input.contradiction_id} marked as ${input.resolution_status}. Rationale: ${input.resolution_rationale}`,
  });

  return createdRecord;
}

export async function listContradictionResolutions(
  siteId: string
): Promise<ContradictionResolutionRecord[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('candidate_contradiction_resolutions')
      .select('*')
      .eq('site_id', siteId)
      .order('resolved_at', { ascending: false });

    if (error) {
      throw new PersistenceError(
        `Failed to retrieve contradiction resolutions from Supabase: ${error.message}`,
        error
      );
    }
    return (data || []) as ContradictionResolutionRecord[];
  }

  return Array.from(memoryResolutions.values())
    .filter((r) => r.site_id === siteId)
    .sort((a, b) => b.resolved_at.localeCompare(a.resolved_at));
}

// ---------------------------------------------------------------------------
// 3. Operational Queue Aggregation
// ---------------------------------------------------------------------------

export async function getOperationalQueue(): Promise<OperationalCandidateSummary[]> {
  const bfAdapter = new BrownfieldAdapter();
  const hmlrAdapter = new HMLRInspireAdapter();

  const [warwickBf, warwickHmlr, rugbyBf, rugbyHmlr] = await Promise.all([
    bfAdapter.ingest(WARWICK_PILOT),
    hmlrAdapter.ingest(WARWICK_PILOT),
    bfAdapter.ingest(RUGBY_PILOT),
    hmlrAdapter.ingest(RUGBY_PILOT),
  ]);

  const warwickGen = generatePilotSites(WARWICK_PILOT, warwickBf.records, warwickHmlr.records);
  const rugbyGen = generatePilotSites(RUGBY_PILOT, rugbyBf.records, rugbyHmlr.records);
  const allCandidates = [...warwickGen.candidates, ...rugbyGen.candidates];

  const now = new Date();
  const summaries: OperationalCandidateSummary[] = [];

  for (const cand of allCandidates) {
    const site = cand.site;
    const isBrownfield = cand.isBrownfield;

    const [ownershipSummary, contactHistory, resolutions, currentLifecycle] =
      await Promise.all([
        buildOwnershipIntelligenceSummary(site.id, site.internal_reference),
        listContactAttempts(site.id),
        listContradictionResolutions(site.id),
        getCurrentOutcomeState(site.id),
      ]);

    // Build standard signals
    const settlementDistM = isBrownfield ? 450 : 250;
    const settlementSig = buildSettlementProximitySignal(site.id, settlementDistM, 'ONS-BUILTUP-001');
    const floodSig = buildFloodRiskSignal(site.id, 0, 'zone_3', 'EA-FLOOD-001');
    const sssiSig = buildSSSISignal(site.id, 0, 'NE-SSSI-001');
    const brownfieldSig = buildBrownfieldSignal(site.id, isBrownfield, 'PLAN-BROWNFIELD-001');
    const roadSig = buildRoadProximitySignal(site.id, isBrownfield ? 45 : 65, 'OS-OPEN-ROADS-001');
    const greenBeltSig = buildGreenBeltSignal(site.id, 0, 'LPA-GREENBELT-001');
    const planningSig = buildPlanningActivitySignal(site.id, [], 'unknown', 'PLANNING-REGISTER-001');

    const marketSummary: MarketEvidenceSummary = {
      sample_size: 0,
      directly_relevant_count: 0,
      contextual_count: 0,
      median_price: null,
      p25_price: null,
      p75_price: null,
      min_price: null,
      max_price: null,
      new_build_count: 0,
      new_build_percentage: null,
      property_type_distribution: { detached: 0, semi_detached: 0, terraced: 0, flat: 0, other: 0 },
      search_radius_m: 1000,
      observation_period_months: 24,
      earliest_transaction_date: null,
      latest_transaction_date: null,
      market_strength: 'INSUFFICIENT_MARKET_EVIDENCE',
      rationale: 'Baseline sector assumption without comps',
      comparables: [],
    };
    const marketSig = buildMarketSignal(site.id, marketSummary, 'pilot_fixture', 'HMLR-PRICE-PAID-001');

    const capacityEvidence = evaluateDevelopmentCapacity({
      site,
      isBrownfield,
      floodOverlapPct: 0,
      greenBeltOverlapPct: 0,
      sssiOverlapPct: 0,
      settlementDistM,
      hasPlanningPrecedent: false,
      isAllocatedInLocalPlan: false,
    });
    const developmentPatternSig = buildDevelopmentPatternSignal(site.id, capacityEvidence, 'ENTIRE-UK-CAPACITY-001');

    const signals: Array<SiteSignal | CreateSignalInput> = [
      settlementSig,
      floodSig,
      sssiSig,
      brownfieldSig,
      roadSig,
      greenBeltSig,
      planningSig,
      marketSig,
      developmentPatternSig,
    ];

    const prioritisation = evaluateCandidatePriority({
      site,
      signals,
      isBrownfield,
    });

    const contradictionReport = detectContradictions({
      siteId: site.id,
      siteReference: site.internal_reference,
      signals,
      prioritisation,
      ownershipEvidence: ownershipSummary.ownership_evidence_records,
    });

    // Mark contradictions as resolved if resolution record exists
    for (const contra of contradictionReport.contradictions) {
      const match = resolutions.find((r) => r.contradiction_id === contra.id);
      if (match && match.resolution_status === 'RESOLVED') {
        contra.resolved = true;
        contra.resolution_notes = match.resolution_rationale;
      }
    }

    const unresolvedContradictions = contradictionReport.contradictions.filter(
      (c) => !c.resolved
    ).length;

    const lifecycleStage: AcquisitionOutcomeState = currentLifecycle || 'SURFACED';

    const nextAction = evaluateDeterministicNextAction({
      site,
      lifecycleStage,
      ownershipSummary,
      signals,
      contradictions: contradictionReport,
      contactHistory,
    });

    // Determine operational queue groups
    const queueGroups: OperationalQueueGroup[] = ['ACTION_REQUIRED'];

    const latestContact = contactHistory.length > 0 ? contactHistory[0] : null;
    let followUpDueDate: string | null = null;

    if (latestContact) {
      if (latestContact.follow_up_date) {
        followUpDueDate = latestContact.follow_up_date;
        const fDate = new Date(latestContact.follow_up_date);
        if (fDate <= now && latestContact.follow_up_status !== 'completed') {
          queueGroups.push('FOLLOW_UPS_DUE');
        }
      }
      if (latestContact.outcome === 'NO_RESPONSE' || latestContact.outcome === 'DEFERRED') {
        queueGroups.push('WAITING_FOR_RESPONSE');
      }
    }

    if (
      ownershipSummary.ownership_evidence_status === 'UNKNOWN' ||
      ownershipSummary.availability_state === 'UNKNOWN' ||
      signals.some((s) => s.status === 'unknown')
    ) {
      queueGroups.push('EVIDENCE_MISSING');
    }

    if (unresolvedContradictions > 0) {
      queueGroups.push('CONTRADICTIONS');
    }

    if (nextAction.code === 'COMPLETE_ACQUISITION_GATE') {
      queueGroups.push('READY_FOR_GATE');
    }

    if (lifecycleStage.startsWith('REJECTED_') || nextAction.code === 'PLACE_ON_HOLD') {
      queueGroups.push('ON_HOLD');
    }

    summaries.push({
      site_id: site.id,
      site_reference: site.internal_reference,
      location: site.local_authority || 'Warwickshire',
      site_type: site.source_reference ? 'Brownfield Register' : 'Strategic Land',
      area_sqm: site.area_sqm,
      lifecycle_stage: lifecycleStage,
      surfaced_date: site.created_at ? site.created_at.split('T')[0] : '2026-09-01',
      last_activity_date: latestContact?.contact_date || site.created_at?.split('T')[0] || '2026-09-22',
      evidence_completeness_pct: prioritisation.evidenceCompleteness.percentage,
      priority_band: prioritisation.priority === 'high' ? 'HIGH' : prioritisation.priority === 'medium' ? 'MEDIUM' : prioritisation.priority === 'low' ? 'LOW' : 'LOW',
      next_action: nextAction,
      ownership_status: ownershipSummary.ownership_evidence_status,
      title_reference: ownershipSummary.title_relationships[0]?.title_reference || null,
      availability_state: ownershipSummary.availability_state,
      planning_status: signals.find((s) => s.signal_type === 'planning_activity')?.status || 'unknown',
      access_status: signals.find((s) => s.signal_type === 'road_proximity')?.status || 'unknown',
      contradiction_count: contradictionReport.contradictions.length,
      unresolved_contradictions: unresolvedContradictions,
      latest_contact: latestContact,
      follow_up_due_date: followUpDueDate,
      assigned_analyst: 'Sarah Jenkins',
      queue_groups: queueGroups,
    });
  }

  return summaries;
}

// ---------------------------------------------------------------------------
// 4. Unified Chronological Candidate Timeline
// ---------------------------------------------------------------------------

export interface TimelineItem {
  id: string;
  timestamp: string;
  layer: string;
  category: 'surfaced' | 'screening' | 'evidence' | 'ownership' | 'contact' | 'contradiction' | 'lifecycle' | 'gate';
  title: string;
  description: string;
  actor: string;
  source_attribution: string;
  metadata?: Record<string, unknown>;
}

export async function getUnifiedCandidateTimeline(siteId: string): Promise<TimelineItem[]> {
  const events = await listTruthEventsForSite(siteId);
  const contacts = await listContactAttempts(siteId);
  const outcomes = await listOutcomesForSite(siteId);
  const resolutions = await listContradictionResolutions(siteId);

  const items: TimelineItem[] = [];

  // Add Truth Ledger events
  for (const event of events) {
    let cat: TimelineItem['category'] = 'evidence';
    if (event.event_type.includes('contact')) cat = 'contact';
    else if (event.event_type.includes('contradiction')) cat = 'contradiction';
    else if (event.event_type.includes('ownership') || event.event_type.includes('title')) cat = 'ownership';
    else if (event.event_type.includes('outcome') || event.event_type.includes('lifecycle')) cat = 'lifecycle';
    else if (event.event_type.includes('gate')) cat = 'gate';

    items.push({
      id: event.id,
      timestamp: event.event_timestamp,
      layer: event.layer,
      category: cat,
      title: event.event_type.replace(/_/g, ' ').toUpperCase(),
      description: event.notes || 'Truth ledger event recorded.',
      actor: event.actor,
      source_attribution: event.evidence_source || 'System Truth Ledger',
      metadata: event.payload,
    });
  }

  // Add outcomes
  for (const o of outcomes) {
    if (!items.some((i) => i.id === o.id)) {
      items.push({
        id: o.id,
        timestamp: o.created_at,
        layer: 'analyst_interpretation',
        category: 'lifecycle',
        title: `LIFECYCLE TRANSITION: ${o.state}`,
        description: o.rationale || `Progressed to ${o.state}.`,
        actor: o.recorded_by,
        source_attribution: 'Acquisition Outcome State Machine',
        metadata: o.evidence_snapshot ?? undefined,
      });
    }
  }

  // Add contacts
  for (const c of contacts) {
    if (!items.some((i) => i.metadata?.contact_id === c.id)) {
      items.push({
        id: c.id,
        timestamp: `${c.contact_date}T10:00:00.000Z`,
        layer: 'real_world_outcome',
        category: 'contact',
        title: `CONTACT ATTEMPT: ${c.contact_type.toUpperCase()}`,
        description: `Contacted ${c.organisation_or_role || 'entity'}. Outcome: ${c.outcome}. ${c.notes || ''}`,
        actor: c.analyst,
        source_attribution: `Direct Communication (${c.contact_type})`,
        metadata: { outcome: c.outcome, follow_up: c.follow_up_date },
      });
    }
  }

  // Add resolutions
  for (const r of resolutions) {
    if (!items.some((i) => i.metadata?.contradiction_id === r.contradiction_id)) {
      items.push({
        id: r.id,
        timestamp: r.resolved_at,
        layer: 'analyst_interpretation',
        category: 'contradiction',
        title: `CONTRADICTION ${r.resolution_status}`,
        description: `Resolution for ${r.contradiction_id}: ${r.resolution_rationale}`,
        actor: r.resolved_by,
        source_attribution: 'Analyst Contradiction Engine',
        metadata: { status: r.resolution_status },
      });
    }
  }

  // Sort descending (latest first)
  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
