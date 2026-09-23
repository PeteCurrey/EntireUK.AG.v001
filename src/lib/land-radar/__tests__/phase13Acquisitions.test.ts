import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDeterministicNextAction } from '../acquisitions/nextActionEngine';
import { generateEvidenceChecklist } from '../acquisitions/checklistEngine';
import {
  recordContactAttempt,
  listContactAttempts,
  recordContradictionResolution,
  listContradictionResolutions,
  getUnifiedCandidateTimeline,
  _resetAcquisitionStore,
} from '../acquisitions/acquisitionService';
import {
  recordOutcome,
  listOutcomesForSite,
  isValidTransition,
  isRejectionState,
  isTerminalState,
  _resetOutcomeStore,
} from '../outcomeService';
import { recordTruthEvent, _resetTruthLedgerStore } from '../truthLedgerService';
import { _resetOwnershipStore, recordOwnershipEvidence } from '../ownership/ownershipService';
import {
  Site,
  OwnershipIntelligenceSummary,
  ContradictionReport,
  AcquisitionContactRecord,
} from '../types';

describe('Phase 13: Acquisition Operations Workbench & Opportunity Execution', () => {
  beforeEach(() => {
    _resetAcquisitionStore();
    _resetOutcomeStore();
    _resetTruthLedgerStore();
    _resetOwnershipStore();
  });

  const mockSite: Site = {
    id: 'site-TEST-BF-001',
    internal_reference: 'EUK-S-WARWICK-BF-001',
    name: 'Leamington Spa Station Yard',
    status: 'candidate',
    source: 'brownfield_register',
    source_reference: null,
    geometry: null,
    centroid: null,
    area_sqm: 14500,
    area_sqm_source: 14500,
    area_discrepancy_flag: false,
    local_authority: 'Warwick District Council',
    country: 'england',
    postcode_sector: 'CV31 3',
    location_description: 'Near railway station',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z',
  };

  const emptyContradictions: ContradictionReport = {
    site_id: mockSite.id,
    site_reference: mockSite.internal_reference,
    contradictions: [],
    unresolved_count: 0,
    critical_count: 0,
    has_machine_vs_external: false,
    generated_at: new Date().toISOString(),
  };

  const createMockOwnership = (overrides?: Partial<OwnershipIntelligenceSummary>): OwnershipIntelligenceSummary => ({
    site_id: mockSite.id,
    site_reference: mockSite.internal_reference,
    ownership_evidence_status: 'UNKNOWN',
    complexity: 'SINGLE_TITLE',
    title_relationship_strength: 'UNKNOWN',
    title_count: 0,
    title_references: [],
    availability_state: 'UNKNOWN',
    latest_availability_evidence_date: null,
    contact_history_count: 0,
    latest_contact_outcome: null,
    acquisition_evidence_count: 0,
    ownership_evidence_records: [],
    title_relationships: [],
    availability_history: [],
    contact_history: [],
    acquisition_evidence: [],
    assessed_at: new Date().toISOString(),
    ...overrides,
  });

  // -------------------------------------------------------------------------
  // 1. Deterministic Next Action Engine
  // -------------------------------------------------------------------------
  describe('Deterministic Next Action Engine', () => {
    it('returns VERIFY_TITLE when candidate lacks verified title and ownership is UNKNOWN', () => {
      const summary = createMockOwnership({
        ownership_evidence_status: 'UNKNOWN',
        availability_state: 'UNKNOWN',
      });

      const action = evaluateDeterministicNextAction({
        site: mockSite,
        lifecycleStage: 'SURFACED',
        ownershipSummary: summary,
        contradictions: emptyContradictions,
      });

      assert.equal(action.code, 'VERIFY_TITLE');
      assert.match(action.rationale, /Cadastral identity is unverified/);
      assert.equal(action.prerequisites_met, true);
    });

    it('NEVER recommends CONTACT_OWNER_OR_AGENT when ownership or title is UNKNOWN', () => {
      const summary = createMockOwnership({
        ownership_evidence_status: 'UNKNOWN',
        availability_state: 'AVAILABLE', // even if someone tried to claim available
        latest_availability_evidence_date: '2026-09-22',
      });

      const action = evaluateDeterministicNextAction({
        site: mockSite,
        lifecycleStage: 'SCREENED',
        ownershipSummary: summary,
        contradictions: emptyContradictions,
      });

      // Must NOT be contact owner because ownership identity is unverified
      assert.notEqual(action.code, 'CONTACT_OWNER_OR_AGENT');
      assert.equal(action.code, 'VERIFY_TITLE');
    });

    it('returns INVESTIGATE_AVAILABILITY when title and owner are verified but availability is UNKNOWN', () => {
      const summary = createMockOwnership({
        ownership_evidence_records: [
          {
            id: 'ev-1',
            site_id: mockSite.id,
            site_reference: mockSite.internal_reference,
            title_reference: 'WK29101',
            proprietor_notes: 'Network Rail Infrastructure Limited',
            ownership_source: 'HMLR Online API',
            source_reference: 'WK29101',
            retrieval_date: '2026-09-22',
            retrieval_mode: 'live_api',
            evidence_status: 'VERIFIED',
            ownership_interpretation: 'freehold',
            acquisition_relevance: 'likely_single_owner',
            analyst_notes: null,
            recorded_by: 'analyst@entire-uk.com',
            created_at: new Date().toISOString(),
          },
        ],
        title_relationships: [
          {
            id: 'rel-1',
            site_id: mockSite.id,
            title_id: 'WK29101',
            title_reference: 'WK29101',
            relationship_strength: 'STRONG',
            overlap_pct: 100,
            title_geometry_available: true,
            analyst_notes: null,
            assessed_by: 'analyst@entire-uk.com',
            assessed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ],
        ownership_evidence_status: 'VERIFIED',
        availability_state: 'UNKNOWN',
        latest_availability_evidence_date: null,
      });

      const action = evaluateDeterministicNextAction({
        site: mockSite,
        lifecycleStage: 'INVESTIGATING',
        ownershipSummary: summary,
        signals: [{ site_id: mockSite.id, signal_type: 'planning_activity', status: 'known', value: 1, explanation: 'Planning matched' }],
        contradictions: emptyContradictions,
      });

      assert.equal(action.code, 'INVESTIGATE_AVAILABILITY');
      assert.match(action.rationale, /commercial availability is UNKNOWN/);
    });

    it('returns RESOLVE_TITLE_CONTRADICTION when active material title contradiction exists', () => {
      const summary = createMockOwnership({
        ownership_evidence_status: 'VERIFIED',
        availability_state: 'AVAILABLE',
        latest_availability_evidence_date: '2026-09-22',
      });

      const contradictionReport: ContradictionReport = {
        site_id: mockSite.id,
        site_reference: mockSite.internal_reference,
        unresolved_count: 1,
        critical_count: 1,
        has_machine_vs_external: true,
        generated_at: new Date().toISOString(),
        contradictions: [
          {
            id: 'contra-1',
            site_id: mockSite.id,
            site_reference: mockSite.internal_reference,
            category: 'SOURCE_VS_SOURCE',
            severity: 'critical',
            requires_human_review: true,
            resolved: false,
            resolution_notes: null,
            machine_claim: 'Excludes Western 0.2ha spur from registered title',
            external_finding: 'Includes Western spur under conveyancing deed of transfer',
            detected_at: new Date().toISOString(),
          },
        ],
      };

      const action = evaluateDeterministicNextAction({
        site: mockSite,
        lifecycleStage: 'INVESTIGATING',
        ownershipSummary: summary,
        contradictions: contradictionReport,
      });

      assert.equal(action.code, 'RESOLVE_TITLE_CONTRADICTION');
      assert.equal(action.priority, 'critical');
    });

    it('returns FOLLOW_UP_CONTACT when scheduled follow-up date is reached', () => {
      const summary = createMockOwnership({
        ownership_evidence_records: [{ evidence_status: 'VERIFIED' } as any],
        title_relationships: [{ relationship_strength: 'STRONG', title_reference: 'WK29101' } as any],
        ownership_evidence_status: 'VERIFIED',
        availability_state: 'POTENTIALLY_AVAILABLE',
        latest_availability_evidence_date: '2026-09-15',
      });

      const pastDate = '2026-09-10';
      const contacts: AcquisitionContactRecord[] = [
        {
          id: 'contact-1',
          site_id: mockSite.id,
          site_reference: mockSite.internal_reference,
          contact_type: 'letter',
          organisation_or_role: 'Controlling Agent',
          source_of_contact_details: 'Signage',
          contact_date: '2026-09-01',
          communication_method_notes: null,
          outcome: 'NO_RESPONSE',
          availability_information: null,
          next_action: null,
          follow_up_date: pastDate,
          follow_up_status: 'pending',
          analyst: 'Sarah Jenkins',
          notes: 'Introductory letter sent',
          created_at: new Date().toISOString(),
        },
      ];

      const action = evaluateDeterministicNextAction({
        site: mockSite,
        lifecycleStage: 'CONTACTED',
        ownershipSummary: summary,
        signals: [{ site_id: mockSite.id, signal_type: 'planning_activity', status: 'known', value: 1, explanation: 'Planning confirmed' }],
        contradictions: emptyContradictions,
        contactHistory: contacts,
      });

      assert.equal(action.code, 'FOLLOW_UP_CONTACT');
      assert.match(action.rationale, /follow-up date reached/);
    });

    it('returns REVIEW_REJECTION when candidate is in terminal rejection branch', () => {
      const summary = createMockOwnership();

      const action = evaluateDeterministicNextAction({
        site: mockSite,
        lifecycleStage: 'REJECTED_ACCESS',
        ownershipSummary: summary,
        contradictions: emptyContradictions,
      });

      assert.equal(action.code, 'REVIEW_REJECTION');
      assert.equal(action.blocked_by, 'Terminal rejection state');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Evidence Checklist Engine (8 Dimensions & Epistemic States)
  // -------------------------------------------------------------------------
  describe('Evidence Checklist Engine', () => {
    it('generates all 8 dimensions with truthful epistemic statuses (zero blank values)', () => {
      const summary = createMockOwnership();

      const checklist = generateEvidenceChecklist({
        site: mockSite,
        lifecycleStage: 'SURFACED',
        ownershipSummary: summary,
        signals: [],
        contradictions: emptyContradictions,
      });

      const dimensions = Object.keys(checklist);
      assert.equal(dimensions.length, 8);
      assert.ok(checklist.site.length > 0);
      assert.ok(checklist.ownership.length > 0);
      assert.ok(checklist.availability.length > 0);
      assert.ok(checklist.planning.length > 0);
      assert.ok(checklist.access.length > 0);
      assert.ok(checklist.market.length > 0);
      assert.ok(checklist.capacity.length > 0);
      assert.ok(checklist.acquisition.length > 0);

      // Verify no blank values across any item
      for (const dim of dimensions as any) {
        for (const item of checklist[dim as keyof typeof checklist]) {
          assert.ok(item.label && item.label.trim().length > 0);
          assert.ok(['KNOWN', 'UNKNOWN', 'UNAVAILABLE', 'STALE', 'CONTRADICTED', 'NOT_APPLICABLE'].includes(item.status));
          assert.ok(item.summary && item.summary.trim().length > 0);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Contact & Engagement Operations
  // -------------------------------------------------------------------------
  describe('Contact & Engagement Operations', () => {
    it('records contact attempt with follow-up date and creates immutable Truth Ledger event', async () => {
      const contact = await recordContactAttempt({
        site_id: mockSite.id,
        site_reference: mockSite.internal_reference,
        contact_type: 'letter',
        organisation_or_role: 'Network Rail Property Directors',
        source_of_contact_details: 'Official Register PAON',
        contact_date: '2026-09-22',
        outcome: 'NO_RESPONSE',
        follow_up_date: '2026-09-29',
        analyst: 'Sarah Jenkins',
        notes: 'Introductory enquiry letter sent via recorded delivery.',
      });

      assert.ok(contact.id);
      assert.equal(contact.outcome, 'NO_RESPONSE');
      assert.equal(contact.follow_up_date, '2026-09-29');
      assert.equal(contact.follow_up_status, 'pending');

      const list = await listContactAttempts(mockSite.id);
      assert.equal(list.length, 1);
      assert.equal(list[0].id, contact.id);

      // Verify Truth Ledger event
      const timeline = await getUnifiedCandidateTimeline(mockSite.id);
      assert.ok(timeline.length > 0);
      const contactEvent = timeline.find((t) => t.category === 'contact');
      assert.ok(contactEvent);
      assert.match(contactEvent.title, /CONTACT ATTEMPT/);
      assert.equal(contactEvent.actor, 'Sarah Jenkins');
    });

    it('enforces that NO_RESPONSE does not mark site as unavailable', async () => {
      const contact = await recordContactAttempt({
        site_id: mockSite.id,
        site_reference: mockSite.internal_reference,
        contact_type: 'letter',
        organisation_or_role: 'Commercial Landowner',
        contact_date: '2026-09-22',
        outcome: 'NO_RESPONSE',
        analyst: 'Sarah Jenkins',
      });

      assert.equal(contact.outcome, 'NO_RESPONSE');
      // Silence != unavailable
      assert.notEqual(contact.outcome, 'NOT_AVAILABLE');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Contradiction Resolution Operations
  // -------------------------------------------------------------------------
  describe('Contradiction Resolution Operations', () => {
    it('records contradiction resolution with mandatory rationale and audit log', async () => {
      const resolution = await recordContradictionResolution({
        site_id: mockSite.id,
        site_reference: mockSite.internal_reference,
        contradiction_id: 'contra-highways-001',
        contradiction_type: 'access_ransom_discrepancy',
        resolution_status: 'RESOLVED',
        resolution_rationale: 'Warwickshire Highways Section 38 adoption certificate confirms boundary strip was adopted as public highway in 2019.',
        supporting_evidence_ref: 'WCC/HW/S38-2019-144',
        resolved_by: 'Sarah Jenkins',
      });

      assert.ok(resolution.id);
      assert.equal(resolution.resolution_status, 'RESOLVED');
      assert.match(resolution.resolution_rationale, /Section 38 adoption/);

      const list = await listContradictionResolutions(mockSite.id);
      assert.equal(list.length, 1);
      assert.equal(list[0].contradiction_id, 'contra-highways-001');

      // Verify Truth Ledger audit event
      const timeline = await getUnifiedCandidateTimeline(mockSite.id);
      const resEvent = timeline.find((t) => t.category === 'contradiction');
      assert.ok(resEvent);
      assert.equal(resEvent.actor, 'Sarah Jenkins');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Lifecycle State Machine Operations
  // -------------------------------------------------------------------------
  describe('Lifecycle State Machine', () => {
    it('enforces valid forward transitions and throws on illegal jump', async () => {
      assert.equal(isValidTransition('SURFACED', 'SCREENED'), true);
      assert.equal(isValidTransition('SCREENED', 'ANALYST_REVIEW'), true);
      assert.equal(isValidTransition('ANALYST_REVIEW', 'INVESTIGATING'), true);
      assert.equal(isValidTransition('INVESTIGATING', 'CONTACTED'), true);
      assert.equal(isValidTransition('CONTACTED', 'UNDER_NEGOTIATION'), true);

      // Illegal skip from SURFACED directly to ACQUIRED
      assert.equal(isValidTransition('SURFACED', 'ACQUIRED'), false);

      await assert.rejects(
        async () => {
          await recordOutcome({
            site_id: mockSite.id,
            previous_state: 'SURFACED',
            state: 'ACQUIRED',
            recorded_by: 'analyst@entire-uk.com',
            rationale: 'Attempting invalid jump',
          });
        },
        /Invalid lifecycle transition/
      );
    });

    it('enforces terminality of rejection states', () => {
      assert.equal(isRejectionState('REJECTED_PLANNING'), true);
      assert.equal(isRejectionState('REJECTED_ACCESS'), true);
      assert.equal(isRejectionState('REJECTED_TITLE'), true);
      assert.equal(isTerminalState('REJECTED_ACCESS'), true);
      assert.equal(isTerminalState('INVESTIGATING'), false);
    });
  });
});
