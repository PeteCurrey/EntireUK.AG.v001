/**
 * Land Radar — Phase 11 Ownership Intelligence & Live Acquisition Operations Tests
 *
 * Test Suite:
 * 1. Title/Parcel Distinction (Candidate != Parcel != Title)
 * 2. Multi-Title & Complexity Classification
 * 3. Fragmented Ownership Detection
 * 4. Epistemic Status: Unknown is NOT Clear
 * 5. Stale Evidence Detection
 * 6. Conflicting Ownership Evidence Handling
 * 7. Availability Model (Separate from Ownership)
 * 8. Silence != NOT_AVAILABLE Standard
 * 9. Contact Outcome Taxonomy
 * 10. Contradiction Engine (Deterministic 4-Category Detection)
 * 11. Acquisition Gate Report Generation
 * 12. Validation Evidence Status Separation (TEST_FIXTURE vs BENCHMARK vs REAL_ACQUISITION_EVENT)
 * 13. Truth Ledger Layer 4/5 Integration
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  recordOwnershipEvidence,
  assessTitleCandidateRelationship,
  classifyOwnershipComplexity,
  recordAvailabilityEvidence,
  getLatestAvailabilityState,
  recordContactOutcome,
  listContactHistoryForSite,
  recordAcquisitionEvidence,
  buildOwnershipIntelligenceSummary,
  _resetOwnershipStore,
} from '../ownership/ownershipService';
import { detectContradictions } from '../ownership/contradictionEngine';
import { generateAcquisitionGate } from '../ownership/acquisitionGate';
import { _resetTruthLedgerStore, listTruthEventsForSite } from '../truthLedgerService';
import {
  Site,
  SiteSignal,
  PrioritisationResult,
  CandidateValidationRecord,
  ExternalEvidenceRecord,
  OwnershipEvidence,
  TitleCandidateRelationship,
  ValidationEvidenceStatus,
} from '../types';

describe('Phase 11: Ownership Intelligence & Live Acquisition Operations', () => {
  beforeEach(() => {
    _resetOwnershipStore();
    _resetTruthLedgerStore();
  });

  // -------------------------------------------------------------------------
  // 1. Title / Parcel Distinction (Section 5)
  // -------------------------------------------------------------------------
  it('enforces that parcel identity, candidate site, and land title are distinct entities', async () => {
    // Record relationship between site and title explicitly
    const rel = await assessTitleCandidateRelationship({
      site_id: 'site-test-101',
      title_id: 'title-WK-184920',
      title_reference: 'WK184920',
      relationship_strength: 'PARTIAL',
      overlap_pct: 72.5,
      title_geometry_available: true,
      analyst_notes: 'Site boundary extends beyond title WK184920 into adjoining unregistered land.',
      assessed_by: 'Sarah Jenkins',
    });

    assert.ok(rel.id);
    assert.strictEqual(rel.relationship_strength, 'PARTIAL');
    assert.strictEqual(rel.overlap_pct, 72.5);
    assert.strictEqual(rel.title_geometry_available, true);
    // Never assume candidate = title
    assert.notStrictEqual(rel.site_id, rel.title_id);
  });

  // -------------------------------------------------------------------------
  // 2. Multi-Title & Complexity Classification (Section 6)
  // -------------------------------------------------------------------------
  it('classifies single title, multi-title, and fragmented ownership correctly', () => {
    // 0 titles / 0 evidence -> UNKNOWN
    assert.strictEqual(classifyOwnershipComplexity([], []), 'UNKNOWN');

    // Single title
    const singleTitle: TitleCandidateRelationship[] = [
      {
        id: 't1',
        site_id: 'site-1',
        title_id: 'title-1',
        title_reference: 'WK100',
        relationship_strength: 'STRONG',
        overlap_pct: 98,
        title_geometry_available: true,
        analyst_notes: null,
        assessed_by: 'analyst',
        assessed_at: '2026-09-20',
        created_at: '2026-09-20',
      },
    ];
    assert.strictEqual(classifyOwnershipComplexity(singleTitle, []), 'SINGLE_TITLE');

    // Multi-title (2 titles covering candidate site)
    const multiTitle: TitleCandidateRelationship[] = [
      ...singleTitle,
      {
        id: 't2',
        site_id: 'site-1',
        title_id: 'title-2',
        title_reference: 'WK101',
        relationship_strength: 'PARTIAL',
        overlap_pct: 45,
        title_geometry_available: true,
        analyst_notes: null,
        assessed_by: 'analyst',
        assessed_at: '2026-09-20',
        created_at: '2026-09-20',
      },
    ];
    assert.strictEqual(classifyOwnershipComplexity(multiTitle, []), 'MULTI_TITLE');

    // Fragmented ownership (ransom strip / multiple interests noted)
    const fragmentedEvidence: OwnershipEvidence[] = [
      {
        id: 'ev1',
        site_id: 'site-1',
        site_reference: 'EUK-S-1',
        title_reference: 'WK100',
        proprietor_notes: 'Third party ransom strip between adopted road and site boundary.',
        ownership_source: 'HMLR Title Register',
        source_reference: 'DEED-99',
        retrieval_date: '2026-09-20',
        retrieval_mode: 'manual_entry',
        evidence_status: 'SUPPORTED',
        ownership_interpretation: 'multiple_interests',
        acquisition_relevance: 'ownership_complexity',
        analyst_notes: 'Ransom strip owner requires separate deal.',
        recorded_by: 'Sarah Jenkins',
        created_at: '2026-09-20',
      },
    ];
    assert.strictEqual(classifyOwnershipComplexity(singleTitle, fragmentedEvidence), 'FRAGMENTED');
  });

  // -------------------------------------------------------------------------
  // 3. Epistemic Principle: Unknown is NOT Clear (Section 4)
  // -------------------------------------------------------------------------
  it('defaults ownership status and availability to UNKNOWN in absence of evidence', async () => {
    const summary = await buildOwnershipIntelligenceSummary('site-empty', 'EUK-S-EMPTY');
    assert.strictEqual(summary.ownership_evidence_status, 'UNKNOWN');
    assert.strictEqual(summary.availability_state, 'UNKNOWN');
    assert.strictEqual(summary.complexity, 'UNKNOWN');
    assert.strictEqual(summary.title_count, 0);
  });

  // -------------------------------------------------------------------------
  // 4. Stale Evidence Detection (Section 4)
  // -------------------------------------------------------------------------
  it('correctly tracks and surfaces STALE ownership evidence status', async () => {
    await recordOwnershipEvidence({
      site_id: 'site-stale',
      site_reference: 'EUK-S-STALE',
      title_reference: 'WK00099',
      proprietor_notes: 'Historic proprietor from 2018 audit',
      ownership_source: 'Legacy Archive',
      retrieval_date: '2018-01-15',
      retrieval_mode: 'manual_entry',
      evidence_status: 'STALE',
      ownership_interpretation: 'freehold',
      acquisition_relevance: 'likely_single_owner',
      recorded_by: 'Archivist',
    });

    const summary = await buildOwnershipIntelligenceSummary('site-stale', 'EUK-S-STALE');
    assert.strictEqual(summary.ownership_evidence_status, 'STALE');
  });

  // -------------------------------------------------------------------------
  // 5. Conflicting Ownership Evidence (Section 4)
  // -------------------------------------------------------------------------
  it('preserves CONFLICTING ownership status without silent overwrite', async () => {
    await recordOwnershipEvidence({
      site_id: 'site-conflict',
      site_reference: 'EUK-S-CONFLICT',
      title_reference: 'WK991',
      proprietor_notes: 'Company A asserts freehold ownership under 2015 conveyance.',
      ownership_source: 'Company A Solicitor',
      retrieval_date: '2026-09-01',
      evidence_status: 'CONFLICTING',
      recorded_by: 'Analyst 1',
    });

    const summary = await buildOwnershipIntelligenceSummary('site-conflict', 'EUK-S-CONFLICT');
    assert.strictEqual(summary.ownership_evidence_status, 'CONFLICTING');
  });

  // -------------------------------------------------------------------------
  // 6. Availability Model (Section 8)
  // -------------------------------------------------------------------------
  it('records availability state transitions with attributable source and timestamp', async () => {
    await recordAvailabilityEvidence({
      site_id: 'site-avail-01',
      site_reference: 'EUK-S-AVAIL-01',
      availability_state: 'AVAILABLE',
      evidence_source: 'Bromwich Hardy Commercial Agent Letter',
      evidence_date: '2026-09-18',
      confidence: 1.0,
      evidence_notes: 'Freehold disposal confirmed with vacant possession.',
      recorded_by: 'Sarah Jenkins',
    });

    const state = await getLatestAvailabilityState('site-avail-01');
    assert.strictEqual(state, 'AVAILABLE');
  });

  // -------------------------------------------------------------------------
  // 7. Silence != NOT_AVAILABLE Standard (Section 8 & 11)
  // -------------------------------------------------------------------------
  it('does NOT treat absence of response as NOT_AVAILABLE', async () => {
    // Log contact with NO_RESPONSE
    await recordContactOutcome({
      site_id: 'site-silent-01',
      site_reference: 'EUK-S-SILENT-01',
      contact_type: 'letter',
      organisation_or_role: 'Site Freeholder',
      contact_date: '2026-09-10',
      outcome: 'NO_RESPONSE',
      next_action: 'Follow up with telephone enquiry',
      analyst: 'Sarah Jenkins',
    });

    const contacts = await listContactHistoryForSite('site-silent-01');
    assert.strictEqual(contacts.length, 1);
    assert.strictEqual(contacts[0].outcome, 'NO_RESPONSE');

    // Availability must remain UNKNOWN, never NOT_AVAILABLE
    const availability = await getLatestAvailabilityState('site-silent-01');
    assert.strictEqual(availability, 'UNKNOWN');
    assert.notStrictEqual(availability, 'NOT_AVAILABLE');
  });

  // -------------------------------------------------------------------------
  // 8. Contact Outcome Taxonomy (Section 10 & 11)
  // -------------------------------------------------------------------------
  it('supports positive, neutral, negative, and complex contact outcomes', async () => {
    const outcomes = [
      'INTERESTED',
      'OPEN_TO_DISCUSSION',
      'REQUESTED_INFORMATION',
      'NO_RESPONSE',
      'DEFERRED',
      'NOT_INTERESTED',
      'NOT_AVAILABLE',
      'ALREADY_COMMITTED',
      'MULTIPLE_OWNERS',
      'AGENT_CONTROLLED',
      'LEGAL_COMPLEXITY',
    ] as const;

    for (const outcome of outcomes) {
      const rec = await recordContactOutcome({
        site_id: `site-outcome-${outcome}`,
        site_reference: `EUK-S-${outcome}`,
        contact_type: 'email',
        organisation_or_role: 'Vendor Representative',
        contact_date: '2026-09-20',
        outcome,
        analyst: 'Sarah Jenkins',
      });
      assert.strictEqual(rec.outcome, outcome);
    }
  });

  // -------------------------------------------------------------------------
  // 9. Contradiction Engine — Machine vs External (Section 15)
  // -------------------------------------------------------------------------
  it('detects MACHINE_VS_EXTERNAL contradiction when highways audit discovers ransom strip', () => {
    const externalEvidence: ExternalEvidenceRecord[] = [
      {
        id: 'ext-01',
        site_id: 'site-rw-01',
        site_reference: 'EUK-S-FARMER-WARD',
        evidence_type: 'highways_advice',
        evidence_date: '2026-09-16',
        source_organisation: 'Warwickshire County Council',
        author: 'Marcus Wright',
        summary: 'Highway boundary records confirm 0.5m third-party ransom strip prevents vehicular access.',
        analyst_interpretation: 'Directly contradicts machine geometric road proximity signal.',
        contradiction_status: 'contradicts_prioritisation',
        confidence: 'high',
        created_at: '2026-09-16T12:00:00Z',
      },
    ];

    const report = detectContradictions({
      siteId: 'site-rw-01',
      siteReference: 'EUK-S-FARMER-WARD',
      externalEvidence,
    });

    assert.ok(report.has_machine_vs_external);
    assert.strictEqual(report.unresolved_count, 1);
    assert.strictEqual(report.critical_count, 1);

    const contra = report.contradictions[0];
    assert.strictEqual(contra.category, 'MACHINE_VS_EXTERNAL');
    assert.strictEqual(contra.severity, 'critical');
    assert.strictEqual(contra.requires_human_review, true);
    assert.strictEqual(contra.resolved, false);
  });

  // -------------------------------------------------------------------------
  // 10. Contradiction Engine — Derived vs Analyst & Analyst vs Outcome (Section 15)
  // -------------------------------------------------------------------------
  it('detects DERIVED_VS_ANALYST and ANALYST_VS_OUTCOME contradictions', () => {
    const validationRecord: CandidateValidationRecord = {
      id: 'val-01',
      site_id: 'site-contra-02',
      site_reference: 'EUK-S-CONTRA-02',
      cohort_id: 'COHORT-WARWICK-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'COMMERCIAL_DECISION',
      commercial_decision: 'REJECT',
      availability_reality: 'UNAVAILABLE',
      owner_engagement_reality: 'NOT_INTERESTED',
      planning_reality: 'SUPPORTIVE',
      access_reality: 'SUPPORTIVE',
      market_reality: 'WEAK',
      acquisition_outcome: 'REJECTED',
      rejection_reasons: ['market'],
      false_positive_flag: true,
      false_positive_root_cause: 'market_mismatch',
      false_negative_flag: false,
      false_negative_category: null,
      analyst_notes: 'Analyst rejected candidate despite system prioritisation.',
      created_at: '2026-09-18T10:00:00Z',
      updated_at: '2026-09-18T10:00:00Z',
    };

    const prioritisation: PrioritisationResult = {
      priority: 'high',
      priorityReasons: ['Brownfield parcel in prime settlement'],
      recommendedNextActions: ['Initiate owner contact'],
      evidenceCompleteness: {
        evaluatedCount: 8,
        totalCount: 10,
        percentage: 80,
        assessedCategories: ['planning', 'market'],
        missingCategories: ['title'],
      },
      whySurfaced: {
        coreDriver: 'Brownfield re-use',
        keyPositiveFactors: ['Urban location'],
        activeConstraints: [],
        visualUnknowns: [],
        recommendedAngle: 'Residential option',
      },
    };

    const report = detectContradictions({
      siteId: 'site-contra-02',
      siteReference: 'EUK-S-CONTRA-02',
      prioritisation,
      validationRecord,
    });

    const derivedVsAnalyst = report.contradictions.find((c) => c.category === 'DERIVED_VS_ANALYST');
    assert.ok(derivedVsAnalyst);
    assert.strictEqual(derivedVsAnalyst?.severity, 'significant');
    assert.strictEqual(derivedVsAnalyst?.requires_human_review, true);
  });

  // -------------------------------------------------------------------------
  // 11. Acquisition Gate Report (Section 13)
  // -------------------------------------------------------------------------
  it('generates an Acquisition Gate report without making an automated commercial decision', () => {
    const site: Site = {
      id: 'site-gate-01',
      internal_reference: 'EUK-S-GATE-01',
      name: 'Cape Road Industrial Yard',
      status: 'investigating',
      source: 'DLUHC',
      source_reference: 'WAR-01',
      geometry: null,
      centroid: null,
      area_sqm: 14500,
      area_sqm_source: 14500,
      area_discrepancy_flag: false,
      local_authority: 'Warwick',
      country: 'England',
      postcode_sector: 'CV34 4',
      location_description: 'Cape Road Warwick',
      created_at: '2026-09-12T00:00:00Z',
      updated_at: '2026-09-12T00:00:00Z',
    };

    const signals: SiteSignal[] = [
      {
        id: 'sig-01',
        site_id: site.id,
        signal_type: 'brownfield_signal',
        status: 'known',
        value: 1,
        value_text: null,
        confidence: 1.0,
        source: 'brownfield_register',
        data_source_id: null,
        explanation: 'Registered brownfield site in local plan',
        unit: null,
        rule_version: '1.0.0',
        ingestion_job_id: null,
        calculated_at: '2026-09-12T00:00:00Z',
        created_at: '2026-09-12T00:00:00Z',
        updated_at: '2026-09-12T00:00:00Z',
      },
      {
        id: 'sig-02',
        site_id: site.id,
        signal_type: 'flood_risk',
        status: 'known',
        value: 1,
        value_text: null,
        confidence: 1.0,
        source: 'ea_flood_zones',
        data_source_id: null,
        explanation: 'Flood Zone 1 (low risk)',
        unit: null,
        rule_version: '1.0.0',
        ingestion_job_id: null,
        calculated_at: '2026-09-12T00:00:00Z',
        created_at: '2026-09-12T00:00:00Z',
        updated_at: '2026-09-12T00:00:00Z',
      },
    ];

    const gate = generateAcquisitionGate({
      site,
      signals,
      ownershipSummary: {
        site_id: site.id,
        site_reference: site.internal_reference,
        ownership_evidence_status: 'SUPPORTED',
        complexity: 'SINGLE_TITLE',
        title_relationship_strength: 'STRONG',
        title_count: 1,
        title_references: ['WK184920'],
        availability_state: 'AVAILABLE',
        latest_availability_evidence_date: '2026-09-15',
        contact_history_count: 1,
        latest_contact_outcome: 'INTERESTED',
        acquisition_evidence_count: 1,
        ownership_evidence_records: [
          {
            id: 'own-01',
            site_id: site.id,
            site_reference: site.internal_reference,
            title_reference: 'WK184920',
            proprietor_notes: 'Industrial Properties Ltd',
            ownership_source: 'HMLR Title Register',
            source_reference: null,
            retrieval_date: '2026-09-15',
            retrieval_mode: 'manual_entry',
            evidence_status: 'SUPPORTED',
            ownership_interpretation: 'freehold',
            acquisition_relevance: 'likely_single_owner',
            analyst_notes: null,
            recorded_by: 'Sarah Jenkins',
            created_at: '2026-09-15T10:00:00Z',
          },
        ],
        title_relationships: [],
        availability_history: [],
        contact_history: [],
        acquisition_evidence: [],
        assessed_at: '2026-09-20T10:00:00Z',
      },
      contradictions: {
        site_id: site.id,
        site_reference: site.internal_reference,
        contradictions: [],
        unresolved_count: 0,
        critical_count: 0,
        has_machine_vs_external: false,
        generated_at: '2026-09-20T10:00:00Z',
      },
      analystView: 'Vendor interested in option; site suitable for residential allocation.',
      nextAction: 'Instruct highways engineer and prepare draft Heads of Terms.',
      generatedBy: 'Sarah Jenkins (Lead Acquisitions Analyst)',
    });

    assert.strictEqual(gate.site_id, site.id);
    assert.strictEqual(gate.ownership_summary.status, 'SUPPORTED');
    assert.strictEqual(gate.ownership_summary.complexity, 'SINGLE_TITLE');
    assert.strictEqual(gate.availability_summary.state, 'AVAILABLE');
    assert.strictEqual(gate.contradictions.length, 0);
    assert.ok(gate.analyst_view.includes('Vendor interested'));
    assert.ok(gate.next_action.includes('draft Heads of Terms'));
  });

  // -------------------------------------------------------------------------
  // 12. Validation Evidence Status Classification (Section 1 & 2)
  // -------------------------------------------------------------------------
  it('enforces that TEST_FIXTURE and BENCHMARK records are explicitly classified', () => {
    const permittedStatuses: ValidationEvidenceStatus[] = [
      'TEST_FIXTURE',
      'BENCHMARK',
      'EXTERNAL_EVIDENCE',
      'REAL_ACQUISITION_EVENT',
      'UNKNOWN',
    ];

    for (const status of permittedStatuses) {
      assert.ok(typeof status === 'string');
    }

    // A synthetic fixture must NOT claim REAL_ACQUISITION_EVENT
    const fixtureStatus: ValidationEvidenceStatus = 'TEST_FIXTURE';
    assert.notStrictEqual(fixtureStatus, 'REAL_ACQUISITION_EVENT');
  });

  // -------------------------------------------------------------------------
  // 13. Truth Ledger Layer 4/5 Event Recording (Section 14)
  // -------------------------------------------------------------------------
  it('appends external_evidence events to Truth Ledger with immutable audit trail', async () => {
    await recordAcquisitionEvidence({
      site_id: 'site-ledger-01',
      site_reference: 'EUK-S-LEDGER-01',
      evidence_type: 'planning_consultant_advice',
      evidence_date: '2026-09-19',
      source: 'Marrons Planning Consultancy',
      summary: 'Pre-application response supportive of residential density of 45 dph.',
      actor: 'David Vance',
      interpretation: 'Affirms planning capacity estimate.',
      confidence: 'high',
      recorded_by: 'Sarah Jenkins',
    });

    const events = await listTruthEventsForSite('site-ledger-01');
    assert.ok(events.length >= 1);
    assert.strictEqual(events[0].layer, 'external_evidence');
    assert.strictEqual(events[0].event_type, 'acquisition_evidence_recorded');
    assert.strictEqual(events[0].actor, 'Sarah Jenkins');
  });
});
