import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  recordTruthEvent,
  listTruthEventsForSite,
  recordExternalEvidence,
  listExternalEvidenceForSite,
  recordValidationState,
  getValidationRecord,
  recordHumanBenchmark,
  listHumanBenchmarks,
  buildCandidateTruthLedger,
  _resetTruthLedgerStore,
} from '../truthLedgerService';
import { Site, SiteSignal, PrioritisationResult } from '../types';

describe('Candidate Truth Ledger & Layer Separation (Phase 10 Sections 4, 5, 17)', () => {
  beforeEach(() => {
    _resetTruthLedgerStore();
  });

  it('records an immutable, append-only event in the truth ledger', async () => {
    const event = await recordTruthEvent({
      site_id: 'site-test-001',
      site_reference: 'EUK-S-TEST-001',
      layer: 'machine_evidence',
      event_type: 'evidence_observed',
      actor: 'system_engine',
      actor_role: 'system',
      evidence_source: 'PLAN-BROWNFIELD-001',
      source_reference: 'WDC-BF-001',
      payload: { brownfield_status: true, gross_area_sqm: 15400 },
      notes: 'Ingested from DLUHC Brownfield Register.',
      confidence: 1.0,
    });

    assert.ok(event.id);
    assert.strictEqual(event.site_reference, 'EUK-S-TEST-001');
    assert.strictEqual(event.layer, 'machine_evidence');
    assert.strictEqual(event.event_type, 'evidence_observed');
    assert.ok(event.created_at);

    const history = await listTruthEventsForSite('site-test-001');
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].id, event.id);
  });

  it('preserves strict separation between all 4 evidence layers', async () => {
    // 1. Layer 1: Machine Evidence
    const l1 = await recordTruthEvent({
      site_id: 'site-test-002',
      site_reference: 'EUK-S-TEST-002',
      layer: 'machine_evidence',
      event_type: 'geometry_observed',
      actor: 'system',
      payload: { area_sqm: 25000 },
    });

    // 2. Layer 2: Derived Evidence
    const l2 = await recordTruthEvent({
      site_id: 'site-test-002',
      site_reference: 'EUK-S-TEST-002',
      layer: 'derived_evidence',
      event_type: 'screening_evaluated',
      actor: 'system_rules_engine',
      payload: { strategy: 'RESIDENTIAL_DEVELOPMENT_V3', priority: 'HIGH' },
    });

    // 3. Layer 3: Analyst Interpretation
    const l3 = await recordTruthEvent({
      site_id: 'site-test-002',
      site_reference: 'EUK-S-TEST-002',
      layer: 'analyst_interpretation',
      event_type: 'hypothesis_recorded',
      actor: 'Sarah Jenkins',
      actor_role: 'acquisitions_analyst',
      payload: { hypothesis: 'Excellent urban infill potential.' },
    });

    // 4. Layer 4: Real-World Outcome
    const l4 = await recordTruthEvent({
      site_id: 'site-test-002',
      site_reference: 'EUK-S-TEST-002',
      layer: 'real_world_outcome',
      event_type: 'external_evidence_received',
      actor: 'Marcus Wright (Highways)',
      payload: { access_verdict: 'FAILED', reason: 'Ransom strip' },
    });

    assert.notStrictEqual(l1.layer, l2.layer);
    assert.notStrictEqual(l2.layer, l3.layer);
    assert.notStrictEqual(l3.layer, l4.layer);

    const events = await listTruthEventsForSite('site-test-002');
    assert.strictEqual(events.length, 4);
    const layers = events.map((e) => e.layer);
    assert.ok(layers.includes('machine_evidence'));
    assert.ok(layers.includes('derived_evidence'));
    assert.ok(layers.includes('analyst_interpretation'));
    assert.ok(layers.includes('real_world_outcome'));
  });

  it('records real-world external evidence and automatically logs a Layer 4 event', async () => {
    const ext = await recordExternalEvidence({
      site_id: 'site-test-003',
      site_reference: 'EUK-S-TEST-003',
      evidence_type: 'highways_advice',
      evidence_date: '2026-09-18',
      source_organisation: 'Warwickshire County Council',
      author: 'Marcus Wright',
      author_role: 'Highways Engineer',
      summary: 'Adopted highway terminates 0.5m short of site boundary. Unadopted ransom strip prevents legal access.',
      supporting_document_ref: 'WCC-HIGHWAYS-091',
      analyst_interpretation: 'Fatal access defect; site cannot be developed without acquiring third-party strip.',
      contradiction_status: 'contradicts_prioritisation',
      confidence: 'high',
    });

    assert.ok(ext.id);
    assert.strictEqual(ext.contradiction_status, 'contradicts_prioritisation');

    const extList = await listExternalEvidenceForSite('site-test-003');
    assert.strictEqual(extList.length, 1);
    assert.strictEqual(extList[0].id, ext.id);

    // Verify automatic Layer 4 event creation
    const events = await listTruthEventsForSite('site-test-003');
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].layer, 'real_world_outcome');
    assert.strictEqual(events[0].event_type, 'external_evidence_received');
  });

  it('records candidate validation state and enforces ground truth realities', async () => {
    const val = await recordValidationState({
      site_id: 'site-test-004',
      site_reference: 'EUK-S-TEST-004',
      cohort_id: 'COHORT-WARWICK-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'SITE_VALIDATION',
      commercial_decision: 'PROGRESS',
      availability_reality: 'AVAILABLE',
      owner_engagement_reality: 'INTERESTED',
      planning_reality: 'SUPPORTIVE',
      access_reality: 'SUPPORTIVE',
      market_reality: 'SUPPORTIVE',
      acquisition_outcome: 'PROGRESSED',
      rejection_reasons: [],
      false_positive_flag: false,
      false_positive_root_cause: null,
      false_negative_flag: false,
      false_negative_category: null,
      analyst_notes: 'Owner confirmed willingness to explore option.',
    });

    assert.ok(val.id);
    assert.strictEqual(val.validation_status, 'VALIDATED');
    assert.strictEqual(val.commercial_decision, 'PROGRESS');

    const fetched = await getValidationRecord('site-test-004', 'COHORT-WARWICK-001');
    assert.ok(fetched);
    assert.strictEqual(fetched?.id, val.id);
  });

  it('records human benchmark candidate for false negative detection', async () => {
    const hb = await recordHumanBenchmark({
      benchmark_set_id: 'BENCHMARK-WARWICK-HUMAN-001',
      geography: 'Warwick District',
      site_reference: 'EUK-HB-WAR-001',
      site_name: 'Old Warwick Road Gasworks',
      identified_by: 'Sarah Jenkins',
      identification_date: '2026-09-11',
      identification_method: 'Direct utility engagement',
      rationale: 'Redundant gas holder site with urban rail adjacency.',
      surfaced_by_land_radar: false,
      land_radar_site_reference: null,
      screening_outcome: 'unassessed',
      exclusion_rule_id: null,
      disagreement_reason: 'Omitted from DLUHC open data register.',
    });

    assert.ok(hb.id);
    assert.strictEqual(hb.surfaced_by_land_radar, false);

    const list = await listHumanBenchmarks('BENCHMARK-WARWICK-HUMAN-001');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, hb.id);
  });

  it('builds a composite 4-Layer Candidate Truth Ledger correctly', async () => {
    const mockSite: Site = {
      id: 'site-composite-001',
      internal_reference: 'EUK-S-WARWICK-BF-001',
      name: 'Former Ford Foundry',
      status: 'candidate',
      source: 'PLAN-BROWNFIELD-001',
      source_reference: 'WDC-001',
      geometry: null,
      centroid: null,
      area_sqm: 130500,
      area_sqm_source: 130000,
      area_discrepancy_flag: false,
      local_authority: 'Warwick District',
      country: 'england',
      postcode_sector: 'CV31',
      location_description: 'Princes Drive, Leamington Spa',
      created_at: '2026-09-10T00:00:00Z',
      updated_at: '2026-09-10T00:00:00Z',
    };

    const mockSignals: SiteSignal[] = [
      {
        id: 'sig-1',
        site_id: 'site-composite-001',
        signal_type: 'brownfield_signal',
        value: 1,
        value_text: 'active',
        unit: null,
        source: 'PLAN-BROWNFIELD-001',
        data_source_id: 'PLAN-BROWNFIELD-001',
        status: 'known',
        confidence: 1.0,
        explanation: 'Brownfield confirmed',
        rule_version: '1.0.0',
        ingestion_job_id: null,
        calculated_at: '2026-09-10T00:00:00Z',
        created_at: '2026-09-10T00:00:00Z',
        updated_at: '2026-09-10T00:00:00Z',
      },
    ];

    const mockPrioritisation: PrioritisationResult = {
      priority: 'high',
      priorityReasons: ['Brownfield register parcel'],
      recommendedNextActions: ['Inspect site'],
      evidenceCompleteness: {
        evaluatedCount: 9,
        totalCount: 9,
        percentage: 100,
        assessedCategories: ['brownfield'],
        missingCategories: [],
      },
      whySurfaced: {
        coreDriver: 'Brownfield site with excellent settlement connectivity',
        keyPositiveFactors: ['brownfield'],
        activeConstraints: [],
        visualUnknowns: [],
        recommendedAngle: 'residential infill',
      },
    };


    const ledger = await buildCandidateTruthLedger({
      site: mockSite,
      signals: mockSignals,
      prioritisation: mockPrioritisation,
      investigationNotesCount: 2,
      cohortId: 'COHORT-WARWICK-001',
    });

    assert.strictEqual(ledger.site_id, 'site-composite-001');
    assert.strictEqual(ledger.site_reference, 'EUK-S-WARWICK-BF-001');
    assert.strictEqual(ledger.layer1_machine_evidence.gross_area_sqm, 130500);
    assert.strictEqual(ledger.layer2_derived_evidence.prioritisation.priority, 'high');
    assert.ok(ledger.layer3_analyst_interpretation.hypothesis);
    assert.strictEqual(ledger.layer4_real_world_outcome.validation_status, 'UNVALIDATED');
  });
});
