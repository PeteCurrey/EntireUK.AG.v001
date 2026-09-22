/**
 * Land Radar — Phase 10 Real-World Validation Cohorts
 *
 * Section 7 & Section 8 & Section 27 Implementation:
 * - Deliberately mixed cohort per pilot geography:
 *     1. HIGH priority candidates
 *     2. MEDIUM priority candidates
 *     3. LOW / constrained candidates
 *     4. Excluded / rejected candidates
 *     5. Independently identified human benchmark candidates (False Negative detection)
 * - Ground truth external evidence and validation records.
 */

import {
  CandidateValidationRecord,
  ExternalEvidenceRecord,
  HumanBenchmarkCandidate,
} from '../types';

export interface ValidationCohortConfig {
  cohortId: string;
  geography: string;
  pilotId: string;
  description: string;
  candidates: CandidateValidationRecord[];
  externalEvidence: ExternalEvidenceRecord[];
  humanBenchmarks: HumanBenchmarkCandidate[];
}

/**
 * ---------------------------------------------------------------------------
 * Warwick District Validation Cohort (COHORT-WARWICK-001)
 * ---------------------------------------------------------------------------
 */
export const WARWICK_VALIDATION_COHORT: ValidationCohortConfig = {
  cohortId: 'COHORT-WARWICK-001',
  geography: 'Warwick District',
  pilotId: 'EUK-PILOT-001',
  description:
    'Primary Phase 10 validation cohort covering Leamington Spa, Warwick core, and Kenilworth fringe. Features 6 deliberately mixed candidate types including independently identified surveyor benchmarks.',
  candidates: [
    // 1. HIGH PRIORITY: Montague Road Commercial Yard (Verified Success)
    {
      id: 'val-war-002',
      site_id: 'site-WAR-BF-002',
      site_reference: 'EUK-S-WARWICK-BF-002',
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
      analyst_notes:
        'Owner confirmed willingness to explore residential option agreement. Planning pre-app officer affirmed brownfield reuse under NPPF paragraph 123.',
      validated_at: '2026-09-15T14:30:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-15T14:30:00Z',
    },
    // 2. HIGH PRIORITY: Cape Road Works, Warwick (Verified Progressing)
    {
      id: 'val-war-003',
      site_id: 'site-WAR-BF-003',
      site_reference: 'EUK-S-WARWICK-BF-003',
      cohort_id: 'COHORT-WARWICK-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'PLANNING_VALIDATION',
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
      analyst_notes:
        'Local Plan Policy DS11 regeneration allocation confirmed. Pre-app response supportive of residential transition.',
      validated_at: '2026-09-16T11:00:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-16T11:00:00Z',
    },
    // 3. MEDIUM PRIORITY: Ford Foundry Site, Princes Drive (Hold due to Contamination)
    {
      id: 'val-war-001',
      site_id: 'site-WAR-BF-001',
      site_reference: 'EUK-S-WARWICK-BF-001',
      cohort_id: 'COHORT-WARWICK-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'SITE_INSPECTION',
      commercial_decision: 'HOLD',
      availability_reality: 'AVAILABLE',
      owner_engagement_reality: 'INTERESTED',
      planning_reality: 'SUPPORTIVE',
      access_reality: 'SUPPORTIVE',
      market_reality: 'SUPPORTIVE',
      acquisition_outcome: 'HELD',
      rejection_reasons: ['site_condition'],
      false_positive_flag: false,
      false_positive_root_cause: null,
      false_negative_flag: false,
      false_negative_category: null,
      analyst_notes:
        'Ground investigation report reveals severe heavy-metal and hydrocarbon contamination from historic foundry operations. Remediation cost premium requires renegotiation of option baseline.',
      validated_at: '2026-09-17T16:00:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-17T16:00:00Z',
    },
    // 4. LOW / CONSTRAINED: Farmer Ward Road, Kenilworth (FALSE POSITIVE: Access Ransom Strip)
    {
      id: 'val-war-004',
      site_id: 'site-WAR-BF-004',
      site_reference: 'EUK-S-WARWICK-BF-004',
      cohort_id: 'COHORT-WARWICK-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'COMMERCIAL_DECISION',
      commercial_decision: 'REJECT',
      availability_reality: 'UNAVAILABLE',
      owner_engagement_reality: 'NOT_INTERESTED',
      planning_reality: 'NEUTRAL',
      access_reality: 'FAILED',
      market_reality: 'SUPPORTIVE',
      acquisition_outcome: 'REJECTED',
      rejection_reasons: ['access', 'title'],
      false_positive_flag: true,
      false_positive_root_cause: 'access_failure',
      false_negative_flag: false,
      false_negative_category: null,
      analyst_notes:
        'Highways audit and title search confirmed a 0.5m third-party ransom strip between the site boundary and adopted Farmer Ward Road highway boundary. Strip owner demanded extortionate ransom fee. Geometric road proximity did not equal legal vehicular access.',
      validated_at: '2026-09-18T10:30:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-18T10:30:00Z',
    },
    // 5. SCREENING EXCLUDED: River Leam Meadow Fringe (Correct Exclusion by Rule-Flood-001)
    {
      id: 'val-war-ex01',
      site_id: 'site-WAR-EX-001',
      site_reference: 'EUK-S-WARWICK-EX-001',
      cohort_id: 'COHORT-WARWICK-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'SCREENED',
      commercial_decision: 'REJECT',
      availability_reality: 'UNKNOWN',
      owner_engagement_reality: 'UNKNOWN',
      planning_reality: 'ADVERSE',
      access_reality: 'CONSTRAINED',
      market_reality: 'SUPPORTIVE',
      acquisition_outcome: 'REJECTED',
      rejection_reasons: ['environmental', 'planning'],
      false_positive_flag: false,
      false_positive_root_cause: null,
      false_negative_flag: false,
      false_negative_category: null,
      analyst_notes:
        'Excluded by screening rule RULE-FLOOD-001 (Functional Floodplain Zone 3b). Environment Agency validated that site floods annually; development prohibition justified.',
      validated_at: '2026-09-14T09:00:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-14T09:00:00Z',
    },
    // 6. HUMAN BENCHMARK SITE: Old Warwick Road Gasworks (FALSE NEGATIVE: Data Gap in Brownfield Register)
    {
      id: 'val-war-fn01',
      site_id: 'site-HB-WAR-001',
      site_reference: 'EUK-HB-WARWICK-001',
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
      false_negative_flag: true,
      false_negative_category: 'data_false_negative',
      analyst_notes:
        'Identified by senior acquisition surveyor via National Grid surplus land enquiries. Land Radar missed surfacing this site because Warwick LPA had omitted the decommissioned gas holder parcel from the published DLUHC Brownfield Register. Demonstrates a Data False Negative.',
      validated_at: '2026-09-19T13:00:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-19T13:00:00Z',
    },
  ],
  externalEvidence: [
    {
      id: 'ext-war-001',
      site_id: 'site-WAR-BF-002',
      site_reference: 'EUK-S-WARWICK-BF-002',
      evidence_type: 'planning_officer_discussion',
      evidence_date: '2026-09-14',
      source_organisation: 'Warwick District Council Planning Policy Team',
      author: 'Clare Henderson',
      author_role: 'Principal Planning Officer',
      summary:
        'Informal pre-application discussion confirmed LPA support for residential redevelopment under Policy DS15. Indicative capacity 80-100 dwellings acceptable in principle.',
      supporting_document_ref: 'WDC-PREAPP-2026-089',
      analyst_interpretation:
        'Substantiates Land Radar Layer 2 planning precedent classification. High deliverability confidence.',
      contradiction_status: 'supports_prioritisation',
      confidence: 'high',
      created_at: '2026-09-14T11:00:00Z',
    },
    {
      id: 'ext-war-002',
      site_id: 'site-WAR-BF-004',
      site_reference: 'EUK-S-WARWICK-BF-004',
      evidence_type: 'highways_advice',
      evidence_date: '2026-09-16',
      source_organisation: 'Warwickshire County Council Local Highway Authority',
      author: 'Marcus Wright',
      author_role: 'Highway Development Management Engineer',
      summary:
        'Highway boundary records confirm adopted highway terminates 0.5m short of site boundary along Farmer Ward Road. Verges owned by third party; unadopted ransom strip prevents legal vehicular connection.',
      supporting_document_ref: 'WCC-HIGHWAY-AUDIT-4412',
      analyst_interpretation:
        'Directly contradicts Land Radar geometric road proximity signal. Proves false positive root cause: access_failure.',
      contradiction_status: 'contradicts_prioritisation',
      confidence: 'high',
      created_at: '2026-09-16T15:30:00Z',
    },
    {
      id: 'ext-war-003',
      site_id: 'site-WAR-BF-001',
      site_reference: 'EUK-S-WARWICK-BF-001',
      evidence_type: 'survey',
      evidence_date: '2026-09-17',
      source_organisation: 'Delta Environmental Consulting Ltd',
      author: 'Dr. Jeremy Bell',
      author_role: 'Senior Geo-environmental Specialist',
      summary:
        'Phase 2 Environmental Site Investigation report. Heavy metals (lead, arsenic) and PAH contamination found in fill material across 45% of site area. Estimated remediation cost £1.85m.',
      supporting_document_ref: 'DELTA-ESI-2026-041',
      analyst_interpretation:
        'Ground condition requires remediation cost deduction from acquisition bid. Candidate held pending landowner negotiation.',
      contradiction_status: 'contradicts_prioritisation',
      confidence: 'high',
      created_at: '2026-09-17T14:00:00Z',
    },
  ],
  humanBenchmarks: [
    {
      id: 'hb-war-001',
      benchmark_set_id: 'BENCHMARK-WARWICK-HUMAN-001',
      geography: 'Warwick District',
      site_reference: 'EUK-HB-WARWICK-001',
      site_name: 'Old Warwick Road Gasworks, Leamington Spa',
      identified_by: 'Sarah Jenkins (Lead Acquisitions Analyst)',
      identification_date: '2026-09-11',
      identification_method: 'Off-market direct utility dialogue (National Grid Property)',
      rationale:
        'Decommissioned redundant gas holder site adjoining urban rail corridor. Excellent brownfield residential regeneration potential.',
      surfaced_by_land_radar: false,
      land_radar_site_reference: null,
      screening_outcome: 'unassessed',
      exclusion_rule_id: null,
      disagreement_reason:
        'DATA FALSE NEGATIVE: Site parcel omitted from DLUHC Brownfield Register open data feed. Land Radar had no ingestion source containing this parcel.',
      created_at: '2026-09-11T10:00:00Z',
    },
    {
      id: 'hb-war-002',
      benchmark_set_id: 'BENCHMARK-WARWICK-HUMAN-001',
      geography: 'Warwick District',
      site_reference: 'EUK-S-WARWICK-BF-002',
      site_name: 'Montague Road Commercial Yard, Warwick',
      identified_by: 'David Vance (Senior Planning Surveyor)',
      identification_date: '2026-09-11',
      identification_method: 'LPA Local Plan monitoring report review',
      rationale:
        'Prominent urban commercial yard with pending lease expiries and low site coverage.',
      surfaced_by_land_radar: true,
      land_radar_site_reference: 'EUK-S-WARWICK-BF-002',
      screening_outcome: 'passed_v3',
      exclusion_rule_id: null,
      disagreement_reason: 'Full agreement: both human surveyor and Land Radar surfaced candidate.',
      created_at: '2026-09-11T10:00:00Z',
    },
  ],
};

/**
 * ---------------------------------------------------------------------------
 * Rugby Borough Validation Cohort (COHORT-RUGBY-001)
 * ---------------------------------------------------------------------------
 */
export const RUGBY_VALIDATION_COHORT: ValidationCohortConfig = {
  cohortId: 'COHORT-RUGBY-001',
  geography: 'Rugby Borough',
  pilotId: 'EUK-PILOT-002',
  description:
    'Secondary Phase 10 validation cohort in Rugby town and growth corridors. Evaluates urban brownfield vs industrial fringe deliverability.',
  candidates: [
    // 1. HIGH PRIORITY: Mill Road Industrial Yard, Rugby
    {
      id: 'val-rug-001',
      site_id: 'site-RUG-BF-001',
      site_reference: 'EUK-S-RUGBY-BF-001',
      cohort_id: 'COHORT-RUGBY-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'OWNER_INTELLIGENCE',
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
      analyst_notes:
        'Managing agent confirmed site available for freehold purchase. Adopted highway frontage directly to Mill Road.',
      validated_at: '2026-09-16T14:00:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-16T14:00:00Z',
    },
    // 2. MEDIUM PRIORITY: Railway Terrace Depot, Rugby (Market Mismatch False Positive)
    {
      id: 'val-rug-002',
      site_id: 'site-RUG-BF-002',
      site_reference: 'EUK-S-RUGBY-BF-002',
      cohort_id: 'COHORT-RUGBY-001',
      validation_status: 'VALIDATED',
      validation_evidence_status: 'BENCHMARK',
      validation_stage: 'COMMERCIAL_DECISION',
      commercial_decision: 'REJECT',
      availability_reality: 'AVAILABLE',
      owner_engagement_reality: 'INTERESTED',
      planning_reality: 'SUPPORTIVE',
      access_reality: 'SUPPORTIVE',
      market_reality: 'WEAK',
      acquisition_outcome: 'REJECTED',
      rejection_reasons: ['market', 'economics'],
      false_positive_flag: true,
      false_positive_root_cause: 'market_mismatch',
      false_negative_flag: false,
      false_negative_category: null,
      analyst_notes:
        'Local commercial agency survey revealed heavy noise pollution from adjoining West Coast Main Line freight sidings. Net residential sales values unviable for high-density apartments.',
      validated_at: '2026-09-18T16:30:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-18T16:30:00Z',
    },
    // 3. HUMAN BENCHMARK SITE: Newbold Road Commercial Estate (RULE FALSE NEGATIVE)
    {
      id: 'val-rug-fn01',
      site_id: 'site-HB-RUG-001',
      site_reference: 'EUK-HB-RUGBY-001',
      cohort_id: 'COHORT-RUGBY-001',
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
      false_negative_flag: true,
      false_negative_category: 'rule_false_negative',
      analyst_notes:
        'Surveyor identified 4.8 ha commercial yard for residential conversion. Land Radar screening strategy V3 deprioritised candidate due to rigid 1000m settlement boundary buffer rule (site was at 1040m). Represents a Rule False Negative.',
      validated_at: '2026-09-19T15:00:00Z',
      created_at: '2026-09-12T09:00:00Z',
      updated_at: '2026-09-19T15:00:00Z',
    },
  ],
  externalEvidence: [
    {
      id: 'ext-rug-001',
      site_id: 'site-RUG-BF-001',
      site_reference: 'EUK-S-RUGBY-BF-001',
      evidence_type: 'agent_conversation',
      evidence_date: '2026-09-15',
      source_organisation: 'Bromwich Hardy Commercial Surveyors',
      author: 'Richard Parker',
      author_role: 'Partner',
      summary:
        'Sole selling agent confirmed client instructing disposal of freehold commercial premises with vacant possession by Q1 2027. Welcomes residential development offers.',
      supporting_document_ref: 'BH-RUGBY-DISPOSAL-091',
      analyst_interpretation:
        'Confirms site availability and willing vendor. Progressing to pre-acquisition site inspection.',
      contradiction_status: 'supports_prioritisation',
      confidence: 'high',
      created_at: '2026-09-15T12:00:00Z',
    },
    {
      id: 'ext-rug-002',
      site_id: 'site-RUG-BF-002',
      site_reference: 'EUK-S-RUGBY-BF-002',
      evidence_type: 'market_research',
      evidence_date: '2026-09-17',
      source_organisation: 'Knight Frank Residential Land Research',
      author: 'Hannah Davies',
      author_role: 'Associate Director',
      summary:
        'Residential pricing audit in immediate rail siding corridor shows achievable sales values capped at £235/sq ft, compared to wider Rugby average of £310/sq ft. Severe acoustic mitigation costs extinguish developer margin.',
      supporting_document_ref: 'KF-RUGBY-NOISE-PRICING-2026',
      analyst_interpretation:
        'Reveals acoustic market mismatch. Proves false positive root cause: market_mismatch.',
      contradiction_status: 'contradicts_prioritisation',
      confidence: 'high',
      created_at: '2026-09-17T16:00:00Z',
    },
  ],
  humanBenchmarks: [
    {
      id: 'hb-rug-001',
      benchmark_set_id: 'BENCHMARK-RUGBY-HUMAN-001',
      geography: 'Rugby Borough',
      site_reference: 'EUK-HB-RUGBY-001',
      site_name: 'Newbold Road Commercial Estate, Rugby',
      identified_by: 'Sarah Jenkins (Lead Acquisitions Analyst)',
      identification_date: '2026-09-11',
      identification_method: 'Local commercial property agent direct briefing',
      rationale:
        'Strategic 4.8 ha commercial site in growth corridor with emerging residential transition potential.',
      surfaced_by_land_radar: false,
      land_radar_site_reference: null,
      screening_outcome: 'excluded_by_rule',
      exclusion_rule_id: 'RULE-SETTLE-001',
      disagreement_reason:
        'RULE FALSE NEGATIVE: Deprioritised by rigid 1000m settlement buffer rule (site was 1040m from boundary).',
      created_at: '2026-09-11T10:00:00Z',
    },
  ],
};

import { LIVE_ACQUISITION_COHORT } from './liveCohort';

/**
 * Retrieve all registered Phase 10 & Phase 12 validation cohorts
 */
export function getAllValidationCohorts(): ValidationCohortConfig[] {
  return [LIVE_ACQUISITION_COHORT, WARWICK_VALIDATION_COHORT, RUGBY_VALIDATION_COHORT];
}

export function getValidationCohort(cohortId: string): ValidationCohortConfig | null {
  return (
    getAllValidationCohorts().find(
      (c) => c.cohortId.toUpperCase() === cohortId.toUpperCase()
    ) ?? null
  );
}
