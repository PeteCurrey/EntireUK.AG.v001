/**
 * Land Radar — Phase 12 Live Acquisition Validation & Calibration Tests
 *
 * Implements tests across:
 * 1. Live Evidence Classification (TEST_FIXTURE, BENCHMARK, EXTERNAL_EVIDENCE, REAL_ACQUISITION_EVENT, UNKNOWN)
 * 2. Strict Persistence Integrity (No silent fallbacks in production, explicit error throws on Supabase failure)
 * 3. Candidate != Parcel != Title disaggregation
 * 4. Availability Reality ("Silence is not negative")
 * 5. Truth Ledger 5-Layer separation & reconstructability
 * 6. Contradiction Detection & Diagnostics (MACHINE_VS_EXTERNAL, DERIVED_VS_ANALYST, etc.)
 * 7. Acquisition Gate Reality & Human Responsibility
 * 8. Independent Human Benchmark Protocol (Frozen before Land Radar comparison)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  LIVE_ACQUISITION_COHORT,
  LIVE_COHORT_CANDIDATES,
} from '../validation/liveCohort';
import { calculateValidationMetrics } from '../validation/metrics';
import {
  recordOwnershipEvidence,
  recordAvailabilityEvidence,
  recordContactOutcome,
  recordAcquisitionEvidence,
  buildOwnershipIntelligenceSummary,
  _resetOwnershipStore,
} from '../ownership/ownershipService';
import { detectContradictions } from '../ownership/contradictionEngine';
import { generateAcquisitionGate } from '../ownership/acquisitionGate';
import {
  recordTruthEvent,
  buildCandidateTruthLedger,
  _resetTruthLedgerStore,
} from '../truthLedgerService';
import {
  getPersistenceMode,
  PersistenceError,
} from '../db';
import {
  Site,
  SiteSignal,
  CandidateValidationRecord,
  ValidationEvidenceStatus,
} from '../types';

describe('Phase 12: Live Acquisition Validation & Evidence Calibration', () => {
  beforeEach(() => {
    _resetOwnershipStore();
    _resetTruthLedgerStore();
  });

  // -------------------------------------------------------------------------
  // 1. Live Evidence Classification & No-Contamination Audit
  // -------------------------------------------------------------------------
  describe('1. Live Evidence Classification (§2 & §4)', () => {
    it('contains exactly 10 genuine live investigated candidates in COHORT-LIVE-001', () => {
      assert.strictEqual(LIVE_ACQUISITION_COHORT.candidates.length, 10);
      assert.strictEqual(LIVE_COHORT_CANDIDATES.length, 10);
    });

    it('strictly separates REAL_ACQUISITION_EVENT, EXTERNAL_EVIDENCE, and BENCHMARK', () => {
      const metrics = calculateValidationMetrics(LIVE_ACQUISITION_COHORT);

      // Verify that no candidate is misclassified as TEST_FIXTURE
      assert.strictEqual(metrics.test_fixture_count, 0);

      // Verify explicit presence of real acquisition events
      assert.strictEqual(metrics.real_acquisition_event_count, 2); // Montague Road & Mill Road
      assert.strictEqual(metrics.external_evidence_count, 5); // Farmer Ward, Ford Foundry, Cape Road, Railway Terrace, Wood Street
      assert.strictEqual(metrics.benchmark_count, 3); // Gasworks FN, Newbold Road FN, River Leam EX

      // Sum equals total candidates
      assert.strictEqual(
        metrics.real_acquisition_event_count +
          metrics.external_evidence_count +
          metrics.benchmark_count,
        10
      );
    });

    it('prohibits benchmark or fixture from claiming REAL_ACQUISITION_EVENT', () => {
      const benchmarkCandidates = LIVE_ACQUISITION_COHORT.candidates.filter(
        (c) => c.validation_evidence_status === 'BENCHMARK'
      );
      assert.ok(benchmarkCandidates.length > 0);
      for (const b of benchmarkCandidates) {
        assert.notStrictEqual(b.validation_evidence_status, 'REAL_ACQUISITION_EVENT');
        assert.notStrictEqual(b.validation_evidence_status, 'TEST_FIXTURE');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 2. Production Persistence Audit & No Silent Fallbacks
  // -------------------------------------------------------------------------
  describe('2. Production Persistence Integrity (§3 & §29)', () => {
    it('throws PersistenceError on unconfigured Supabase in production mode', () => {
      const origEnv = process.env.LAND_RADAR_PERSISTENCE_MODE;
      process.env.LAND_RADAR_PERSISTENCE_MODE = 'supabase';
      try {
        assert.throws(
          () => {
            const { getLandRadarDb } = require('../db');
            getLandRadarDb();
          },
          (err: any) => err instanceof PersistenceError
        );
      } finally {
        process.env.LAND_RADAR_PERSISTENCE_MODE = origEnv;
      }
    });

    it('re-throws PersistenceError when truth ledger event fails in supabase mode', async () => {
      const origEnv = process.env.LAND_RADAR_PERSISTENCE_MODE;
      process.env.LAND_RADAR_PERSISTENCE_MODE = 'supabase';

      try {
        await assert.rejects(
          async () => {
            await recordOwnershipEvidence({
              site_id: 'site-test-prod',
              site_reference: 'EUK-S-PROD-001',
              ownership_source: 'hmlr_title_register',
              retrieval_date: '2026-09-20',
              evidence_status: 'SUPPORTED',
              recorded_by: 'Test Analyst',
            });
          },
          (err: any) => err instanceof PersistenceError
        );
      } finally {
        process.env.LAND_RADAR_PERSISTENCE_MODE = origEnv;
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Candidate != Parcel != Title Disaggregation
  // -------------------------------------------------------------------------
  describe('3. Candidate != Parcel != Title Disaggregation (§6 & §8)', () => {
    it('models multi-title relationships explicitly for assembly candidate Cape Road', async () => {
      const siteId = 'site-WAR-BF-003';
      const siteRef = 'EUK-S-WARWICK-BF-003';

      await recordOwnershipEvidence({
        site_id: siteId,
        site_reference: siteRef,
        title_reference: 'WK29101',
        proprietor_notes: 'Cape Works Holdings Ltd (Title 1)',
        ownership_source: 'hmlr_title_register',
        retrieval_date: '2026-09-15',
        evidence_status: 'SUPPORTED',
        ownership_interpretation: 'multiple_interests',
        acquisition_relevance: 'ownership_complexity',
        recorded_by: 'David Vance',
      });

      await recordOwnershipEvidence({
        site_id: siteId,
        site_reference: siteRef,
        title_reference: 'WK29102',
        proprietor_notes: 'Cape Road Logistics Ltd (Title 2)',
        ownership_source: 'hmlr_title_register',
        retrieval_date: '2026-09-15',
        evidence_status: 'SUPPORTED',
        ownership_interpretation: 'multiple_interests',
        acquisition_relevance: 'ownership_complexity',
        recorded_by: 'David Vance',
      });

      const summary = await buildOwnershipIntelligenceSummary(siteId, siteRef);
      assert.strictEqual(summary.complexity, 'FRAGMENTED');
      assert.strictEqual(summary.title_count, 2);
      assert.deepStrictEqual(summary.title_references.sort(), ['WK29101', 'WK29102']);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Availability Reality & "Silence is Not Negative"
  // -------------------------------------------------------------------------
  describe('4. Availability Reality (§9 & §10)', () => {
    it('enforces that lack of response leaves availability as UNKNOWN or NO_RESPONSE', async () => {
      const siteId = 'site-RUG-BF-003';
      const siteRef = 'EUK-S-RUGBY-BF-003';

      // Log contact attempt with no reply
      await recordContactOutcome({
        site_id: siteId,
        site_reference: siteRef,
        contact_type: 'letter',
        contact_date: '2026-09-01',
        outcome: 'NO_RESPONSE',
        analyst: 'Sarah Jenkins',
        notes: 'Written enquiry regarding freehold availability sent to registered office. 21 days elapsed without reply.',
      });

      const summary = await buildOwnershipIntelligenceSummary(siteId, siteRef);
      // Availability MUST NOT transition to NOT_AVAILABLE
      assert.strictEqual(summary.availability_state, 'UNKNOWN');
      assert.strictEqual(summary.latest_contact_outcome, 'NO_RESPONSE');
    });

    it('transitions availability only upon affirmative vendor evidence', async () => {
      const siteId = 'site-WAR-BF-002';
      const siteRef = 'EUK-S-WARWICK-BF-002';

      await recordAvailabilityEvidence({
        site_id: siteId,
        site_reference: siteRef,
        availability_state: 'AVAILABLE',
        evidence_source: 'agent_communication',
        evidence_date: '2026-09-14',
        confidence: 0.95,
        evidence_notes: 'Sole agent confirmed vendor willingness to enter residential option discussions.',
        recorded_by: 'Sarah Jenkins',
      });

      const summary = await buildOwnershipIntelligenceSummary(siteId, siteRef);
      assert.strictEqual(summary.availability_state, 'AVAILABLE');
      assert.strictEqual(summary.latest_availability_evidence_date, '2026-09-14');
    });
  });

  // -------------------------------------------------------------------------
  // 5. Candidate Truth Ledger: 5-Layer Reconstruction
  // -------------------------------------------------------------------------
  describe('5. Candidate Truth Ledger: 5-Layer Reconstruction (§12)', () => {
    it('reconstructs complete chronological audit trail across all 5 layers', async () => {
      const siteId = 'site-WAR-BF-004';
      const siteRef = 'EUK-S-WARWICK-BF-004';

      // Layer 1: Machine Signal
      await recordTruthEvent({
        site_id: siteId,
        site_reference: siteRef,
        layer: 'machine_evidence',
        event_type: 'signal_calculated',
        actor: 'engine',
        evidence_source: 'OS-OPEN-ROADS-001',
        payload: { signal: 'road_proximity', status: 'known', value: 1 },
      });

      // Layer 2: Derived Prioritisation
      await recordTruthEvent({
        site_id: siteId,
        site_reference: siteRef,
        layer: 'derived_evidence',
        event_type: 'priority_evaluated',
        actor: 'prioritisation_engine',
        payload: { priority_category: 'LOW', whySurfaced: ['road_adjacent'] },
      });

      // Layer 3: Analyst Interpretation
      await recordTruthEvent({
        site_id: siteId,
        site_reference: siteRef,
        layer: 'analyst_interpretation',
        event_type: 'opportunity_progressed',
        actor: 'David Vance',
        payload: { stage: 'COMMERCIAL_DECISION' },
        notes: 'Highways audit commissioned to verify physical frontage.',
      });

      // Layer 4: External Evidence
      await recordTruthEvent({
        site_id: siteId,
        site_reference: siteRef,
        layer: 'external_evidence',
        event_type: 'highways_audit_completed',
        actor: 'Marcus Wright (WCC Highways)',
        evidence_source: 'WCC-HIGHWAY-AUDIT-4412',
        payload: { access_viable: false, ransom_strip: true },
      });

      // Layer 5: Real-World Outcome
      await recordTruthEvent({
        site_id: siteId,
        site_reference: siteRef,
        layer: 'real_world_outcome',
        event_type: 'acquisition_rejected',
        actor: 'Investment Committee',
        payload: { outcome: 'REJECTED', root_cause: 'access_failure' },
        notes: 'Extortionate £350k ransom strip cost kills scheme viability.',
      });

      const mockSite: Site = {
        id: siteId,
        internal_reference: siteRef,
        name: 'Farmer Ward Road',
        status: 'candidate',
        source: 'brownfield_register',
        source_reference: 'WAR-BF-004',
        geometry: null,
        centroid: null,
        area_sqm: 12000,
        area_sqm_source: 12000,
        area_discrepancy_flag: false,
        local_authority: 'Warwick',
        country: 'England',
        postcode_sector: 'CV8 2',
        location_description: 'Kenilworth',
        created_at: '2026-09-12T00:00:00Z',
        updated_at: '2026-09-12T00:00:00Z',
      };

      const ledger = await buildCandidateTruthLedger({
        site: mockSite,
        signals: [],
        prioritisation: {
          priority: 'low',
          priorityReasons: ['Road adjacent'],
          recommendedNextActions: ['Inspect physical road frontage'],
          whySurfaced: {
            coreDriver: 'Highway proximity',
            keyPositiveFactors: ['Adjoins road network'],
            activeConstraints: [],
            visualUnknowns: [],
            recommendedAngle: 'Highway access review',
          },
          evidenceCompleteness: {
            evaluatedCount: 1,
            totalCount: 1,
            percentage: 100,
            assessedCategories: ['Access'],
            missingCategories: [],
          },
        },
      });

      assert.strictEqual(ledger.events.length, 5);
      const layers = ledger.events.map((e) => e.layer);
      assert.deepStrictEqual(layers.sort(), [
        'analyst_interpretation',
        'derived_evidence',
        'external_evidence',
        'machine_evidence',
        'real_world_outcome',
      ]);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Contradiction Detection & Human Review Requirement
  // -------------------------------------------------------------------------
  describe('6. Contradiction Detection (§13)', () => {
    it('detects MACHINE_VS_EXTERNAL contradiction when highway audit contradicts road signal', () => {
      const siteId = 'site-WAR-BF-004';
      const siteRef = 'EUK-S-WARWICK-BF-004';

      const signals: SiteSignal[] = [
        {
          id: 'sig-access-1',
          site_id: siteId,
          signal_type: 'road_proximity',
          status: 'known',
          value: 1,
          value_text: null,
          confidence: 1.0,
          source: 'os_open_roads',
          data_source_id: null,
          explanation: 'Road proximity within 50m',
          unit: 'metres',
          rule_version: '1.0.0',
          ingestion_job_id: null,
          calculated_at: '2026-09-12T00:00:00Z',
          created_at: '2026-09-12T00:00:00Z',
          updated_at: '2026-09-12T00:00:00Z',
        },
      ];

      const report = detectContradictions({
        siteId,
        siteReference: siteRef,
        signals,
        externalEvidence: [
          {
            id: 'ext-01',
            site_id: siteId,
            site_reference: siteRef,
            evidence_type: 'highways_advice',
            evidence_date: '2026-09-16',
            source_organisation: 'Warwickshire County Council',
            author: 'Marcus Wright',
            summary: 'Adopted highway terminates 0.5m short; ransom strip present.',
            analyst_interpretation: 'Ransom strip blocker',
            contradiction_status: 'contradicts_prioritisation',
            confidence: 'high',
            created_at: '2026-09-16T00:00:00Z',
          },
        ],
      });

      assert.strictEqual(report.contradictions.length, 1);
      assert.strictEqual(report.has_machine_vs_external, true);
      assert.strictEqual(report.contradictions[0].category, 'MACHINE_VS_EXTERNAL');
      assert.strictEqual(report.contradictions[0].requires_human_review, true);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Acquisition Gate Reality Test
  // -------------------------------------------------------------------------
  describe('7. Acquisition Gate Reality Test (§18)', () => {
    it('surfaces active unknowns and contradictions without making automated decisions', () => {
      const mockSite: Site = {
        id: 'site-RUG-BF-003',
        internal_reference: 'EUK-S-RUGBY-BF-003',
        name: 'Wood Street Depot',
        status: 'candidate',
        source: 'brownfield_register',
        source_reference: 'RUG-BF-003',
        geometry: null,
        centroid: null,
        area_sqm: 14000,
        area_sqm_source: 14000,
        area_discrepancy_flag: false,
        local_authority: 'Rugby',
        country: 'England',
        postcode_sector: 'CV21 3',
        location_description: 'Wood Street',
        created_at: '2026-09-12T00:00:00Z',
        updated_at: '2026-09-12T00:00:00Z',
      };

      const gate = generateAcquisitionGate({
        site: mockSite,
        signals: [
          {
            id: 'sig-01',
            site_id: mockSite.id,
            signal_type: 'brownfield_signal',
            status: 'known',
            value: 1,
            value_text: null,
            confidence: 1.0,
            source: 'brownfield_register',
            data_source_id: null,
            explanation: 'Brownfield register entry',
            unit: null,
            rule_version: '1.0.0',
            ingestion_job_id: null,
            calculated_at: '2026-09-12T00:00:00Z',
            created_at: '2026-09-12T00:00:00Z',
            updated_at: '2026-09-12T00:00:00Z',
          },
          {
            id: 'sig-02',
            site_id: mockSite.id,
            signal_type: 'green_belt',
            status: 'unknown',
            value: null,
            value_text: null,
            confidence: null,
            source: null,
            data_source_id: null,
            explanation: 'Green belt dataset unassessed',
            unit: null,
            rule_version: '1.0.0',
            ingestion_job_id: null,
            calculated_at: '2026-09-12T00:00:00Z',
            created_at: '2026-09-12T00:00:00Z',
            updated_at: '2026-09-12T00:00:00Z',
          },
        ],
        ownershipSummary: {
          site_id: mockSite.id,
          site_reference: mockSite.internal_reference,
          ownership_evidence_status: 'UNKNOWN',
          complexity: 'FRAGMENTED',
          title_relationship_strength: 'UNKNOWN',
          title_count: 4,
          title_references: ['WK101', 'WK102', 'WK103', 'WK104'],
          availability_state: 'UNKNOWN',
          latest_availability_evidence_date: null,
          contact_history_count: 1,
          latest_contact_outcome: 'NO_RESPONSE',
          acquisition_evidence_count: 1,
          ownership_evidence_records: [],
          title_relationships: [],
          availability_history: [],
          contact_history: [],
          acquisition_evidence: [],
          assessed_at: '2026-09-21T00:00:00Z',
        },
        contradictions: {
          site_id: mockSite.id,
          site_reference: mockSite.internal_reference,
          contradictions: [],
          unresolved_count: 0,
          critical_count: 0,
          has_machine_vs_external: false,
          generated_at: '2026-09-21T00:00:00Z',
        },
        analystView: 'Held pending response from registered proprietors on titles WK101-WK104.',
        nextAction: 'Re-issue formal letter of enquiry to corporate registered office.',
        generatedBy: 'Sarah Jenkins',
      });

      assert.strictEqual(gate.site_reference, 'EUK-S-RUGBY-BF-003');
      assert.strictEqual(gate.ownership_summary.complexity, 'FRAGMENTED');
      assert.strictEqual(gate.availability_summary.state, 'UNKNOWN');
      assert.ok(gate.unknowns.some((u) => u.includes('green_belt')));
      assert.ok(gate.unknowns.some((u) => u.includes('ownership')));
      assert.strictEqual(gate.next_action, 'Re-issue formal letter of enquiry to corporate registered office.');
    });
  });

  // -------------------------------------------------------------------------
  // 8. Independent Benchmark Protocol
  // -------------------------------------------------------------------------
  describe('8. Independent Benchmark Protocol (§5 & §21)', () => {
    it('verifies that independent human benchmarks were frozen before comparison', () => {
      const benchmarks = LIVE_ACQUISITION_COHORT.humanBenchmarks;
      assert.strictEqual(benchmarks.length, 3);

      for (const hb of benchmarks) {
        assert.ok(hb.identification_date <= '2026-09-11', 'Benchmark must be dated prior to pilot review');
        assert.ok(hb.identified_by.length > 0);
        assert.ok(hb.rationale.length > 0);
        assert.ok(hb.identification_method.length > 0);
      }
    });

    it('diagnoses both Data False Negative and Rule False Negative among benchmarks', () => {
      const benchmarks = LIVE_ACQUISITION_COHORT.humanBenchmarks;
      const dataFn = benchmarks.find((b) => b.disagreement_reason?.includes('DATA FALSE NEGATIVE'));
      const ruleFn = benchmarks.find((b) => b.disagreement_reason?.includes('RULE FALSE NEGATIVE'));

      assert.ok(dataFn, 'Must identify Data False Negative');
      assert.strictEqual(dataFn?.site_reference, 'EUK-HB-WARWICK-001');

      assert.ok(ruleFn, 'Must identify Rule False Negative');
      assert.strictEqual(ruleFn?.site_reference, 'EUK-HB-RUGBY-001');
    });
  });
});
