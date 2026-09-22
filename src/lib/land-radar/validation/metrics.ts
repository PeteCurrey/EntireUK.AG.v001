/**
 * Land Radar — Phase 10 Validation Diagnostic Metrics
 *
 * Section 21 Implementation:
 * - Diagnostic measures rather than simplistic "accuracy scores".
 * - Metrics:
 *     1. Discovery Overlap Rate (Human Benchmark vs Machine Surfacing)
 *     2. Investigation Yield Rate (% justifying deeper investigation)
 *     3. False-Positive Rate by Cause (Root causes)
 *     4. False-Negative Rate by Cause (Data, Rule, Geometry, Classification, Strategy)
 *     5. Realities Summary (Ground truth availability, planning, access, market)
 *     6. Commercial Decisions Breakdown (PROGRESS, HOLD, REJECT, UNDECIDED)
 */

import { ValidationCohortConfig } from './validationCohort';
import { ValidationDiagnosticMetrics } from '../types';

export function calculateValidationMetrics(
  cohort: ValidationCohortConfig
): ValidationDiagnosticMetrics {
  const candidates = cohort.candidates;
  const humanBenchmarks = cohort.humanBenchmarks;
  const total = candidates.length;

  if (total === 0) {
    return {
      cohort_id: cohort.cohortId,
      total_candidates: 0,
      validated_count: 0,
      unvalidated_count: 0,
      in_validation_count: 0,
      discovery_overlap_rate: 0,
      investigation_yield_rate: 0,
      false_positive_count: 0,
      false_positive_rate: 0,
      false_positives_by_cause: {},
      false_negative_count: 0,
      false_negatives_by_cause: {},
      realities_summary: {
        supportive_planning_pct: 0,
        supportive_access_pct: 0,
        supportive_market_pct: 0,
        available_pct: 0,
      },
      test_fixture_count: 0,
      benchmark_count: 0,
      external_evidence_count: 0,
      real_acquisition_event_count: 0,
      unknown_evidence_status_count: 0,
      commercial_decisions: {
        progress: 0,
        hold: 0,
        reject: 0,
        undecided: 0,
      },
    };
  }

  const validatedCount = candidates.filter((c) => c.validation_status === 'VALIDATED').length;
  const inValidationCount = candidates.filter((c) => c.validation_status === 'IN_VALIDATION').length;
  const unvalidatedCount = candidates.filter((c) => c.validation_status === 'UNVALIDATED').length;

  // Phase 11: Explicit Evidence Status Separation (Sections 1 & 2)
  const testFixtureCount = candidates.filter((c) => c.validation_evidence_status === 'TEST_FIXTURE').length;
  const benchmarkCount = candidates.filter((c) => c.validation_evidence_status === 'BENCHMARK').length;
  const externalEvidenceCount = candidates.filter((c) => c.validation_evidence_status === 'EXTERNAL_EVIDENCE').length;
  const realAcquisitionEventCount = candidates.filter((c) => c.validation_evidence_status === 'REAL_ACQUISITION_EVENT').length;
  const unknownEvidenceStatusCount = candidates.filter((c) => !c.validation_evidence_status || c.validation_evidence_status === 'UNKNOWN').length;

  // 1. Discovery Overlap: What proportion of human benchmarks were also surfaced?
  const surfacedBenchmarks = humanBenchmarks.filter((b) => b.surfaced_by_land_radar).length;
  const discoveryOverlapRate = humanBenchmarks.length > 0
    ? Math.round((surfacedBenchmarks / humanBenchmarks.length) * 100)
    : 0;

  // 2. Investigation Yield: What proportion of surfaced candidates justified progressing?
  const progressedCount = candidates.filter(
    (c) => c.commercial_decision === 'PROGRESS' || c.acquisition_outcome === 'PROGRESSED'
  ).length;
  const investigationYieldRate = Math.round((progressedCount / total) * 100);

  // 3. False Positives: Documented contradiction where site looked good but real world failed
  const falsePositives = candidates.filter((c) => c.false_positive_flag);
  const falsePositiveCount = falsePositives.length;
  const falsePositiveRate = Math.round((falsePositiveCount / total) * 100);

  const fpCauses: Record<string, number> = {};
  for (const fp of falsePositives) {
    const cause = fp.false_positive_root_cause ?? 'unspecified';
    fpCauses[cause] = (fpCauses[cause] ?? 0) + 1;
  }

  // 4. False Negatives: Sites independently identified that Land Radar missed or excluded
  const falseNegatives = candidates.filter((c) => c.false_negative_flag);
  const falseNegativeCount = falseNegatives.length;

  const fnCauses: Record<string, number> = {};
  for (const fn of falseNegatives) {
    const cat = fn.false_negative_category ?? 'unspecified';
    fnCauses[cat] = (fnCauses[cat] ?? 0) + 1;
  }

  // 5. Realities Breakdown
  const supportivePlanning = candidates.filter((c) => c.planning_reality === 'SUPPORTIVE').length;
  const supportiveAccess = candidates.filter((c) => c.access_reality === 'SUPPORTIVE').length;
  const supportiveMarket = candidates.filter((c) => c.market_reality === 'SUPPORTIVE').length;
  const available = candidates.filter((c) => c.availability_reality === 'AVAILABLE').length;

  // 6. Commercial Decisions Breakdown
  const commercialDecisions = {
    progress: candidates.filter((c) => c.commercial_decision === 'PROGRESS').length,
    hold: candidates.filter((c) => c.commercial_decision === 'HOLD').length,
    reject: candidates.filter((c) => c.commercial_decision === 'REJECT').length,
    undecided: candidates.filter((c) => c.commercial_decision === 'UNDECIDED').length,
  };

  return {
    cohort_id: cohort.cohortId,
    total_candidates: total,
    validated_count: validatedCount,
    unvalidated_count: unvalidatedCount,
    in_validation_count: inValidationCount,
    test_fixture_count: testFixtureCount,
    benchmark_count: benchmarkCount,
    external_evidence_count: externalEvidenceCount,
    real_acquisition_event_count: realAcquisitionEventCount,
    unknown_evidence_status_count: unknownEvidenceStatusCount,
    discovery_overlap_rate: discoveryOverlapRate,
    investigation_yield_rate: investigationYieldRate,
    false_positive_count: falsePositiveCount,
    false_positive_rate: falsePositiveRate,
    false_positives_by_cause: fpCauses,
    false_negative_count: falseNegativeCount,
    false_negatives_by_cause: fnCauses,
    realities_summary: {
      supportive_planning_pct: Math.round((supportivePlanning / total) * 100),
      supportive_access_pct: Math.round((supportiveAccess / total) * 100),
      supportive_market_pct: Math.round((supportiveMarket / total) * 100),
      available_pct: Math.round((available / total) * 100),
    },
    commercial_decisions: commercialDecisions,
  };
}
