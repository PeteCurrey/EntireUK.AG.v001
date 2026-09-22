-- ============================================================
-- Migration 0022: Candidate Truth Ledger & Acquisition Validation
--
-- Phase 10: Real-World Acquisition Validation & Candidate Truth Ledger
--
-- Core Principles:
-- - A model output is not validated merely because the software produced it.
-- - Truth Ledger is append-only and immutable.
-- - Strict 4-layer separation:
--     1. Machine Evidence (observed source facts)
--     2. Derived Evidence (deterministic derivations & rules)
--     3. Analyst Interpretation (human commercial hypothesis)
--     4. Real-World Outcome (subsequently discovered external facts)
-- - Real-World Evidence Requirement:
--     A site is UNVALIDATED until corroborated by external evidence.
-- ============================================================

-- 1. Candidate Truth Ledger (Append-Only Event Ledger)
CREATE TABLE IF NOT EXISTS candidate_truth_ledger (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  layer text NOT NULL CHECK (
    layer IN ('machine_evidence', 'derived_evidence', 'analyst_interpretation', 'real_world_outcome')
  ),
  event_type text NOT NULL, -- e.g. 'evidence_observed', 'screening_evaluated', 'analyst_hypothesis_recorded', 'external_advice_received', 'reality_discovered'
  actor text NOT NULL, -- user identifier or 'system_engine'
  actor_role text, -- 'acquisitions_analyst', 'planning_surveyor', 'system'
  evidence_source text, -- e.g. 'DLUHC-BROWNFIELD', 'PLANNING_CONSULTANT_REPORT', 'HIGHWAYS_AUDIT'
  source_reference text, -- document reference, application ID, or transaction ID
  previous_state text,
  new_state text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  confidence numeric CHECK (confidence >= 0.0 AND confidence <= 1.0),
  event_timestamp timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidate_truth_ledger_site_idx ON candidate_truth_ledger (site_id);
CREATE INDEX IF NOT EXISTS candidate_truth_ledger_site_ref_idx ON candidate_truth_ledger (site_reference);
CREATE INDEX IF NOT EXISTS candidate_truth_ledger_layer_idx ON candidate_truth_ledger (layer);
CREATE INDEX IF NOT EXISTS candidate_truth_ledger_event_type_idx ON candidate_truth_ledger (event_type);
CREATE INDEX IF NOT EXISTS candidate_truth_ledger_timestamp_idx ON candidate_truth_ledger (event_timestamp DESC);

ALTER TABLE candidate_truth_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_truth_ledger_authenticated" ON candidate_truth_ledger
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "candidate_truth_ledger_service_role" ON candidate_truth_ledger
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE candidate_truth_ledger IS
  'Append-only immutable event ledger capturing the 4 layers of candidate truth (machine, derived, interpretation, reality).';

-- 2. External Evidence Records (Real-World Independent Corroboration)
CREATE TABLE IF NOT EXISTS external_evidence_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  evidence_type text NOT NULL CHECK (
    evidence_type IN (
      'planning_consultant_advice',
      'highways_advice',
      'site_inspection',
      'owner_conversation',
      'agent_conversation',
      'title_research',
      'survey',
      'lpa_correspondence',
      'planning_officer_discussion',
      'market_research',
      'other'
    )
  ),
  evidence_date date NOT NULL,
  source_organisation text NOT NULL,
  author text NOT NULL,
  author_role text,
  summary text NOT NULL,
  supporting_document_ref text,
  analyst_interpretation text NOT NULL,
  contradiction_status text NOT NULL DEFAULT 'neutral' CHECK (
    contradiction_status IN ('supports_prioritisation', 'contradicts_prioritisation', 'neutral', 'unresolved')
  ),
  confidence text NOT NULL DEFAULT 'medium' CHECK (
    confidence IN ('high', 'medium', 'low', 'provisional')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS external_evidence_site_idx ON external_evidence_records (site_id);
CREATE INDEX IF NOT EXISTS external_evidence_type_idx ON external_evidence_records (evidence_type);
CREATE INDEX IF NOT EXISTS external_evidence_contradiction_idx ON external_evidence_records (contradiction_status);

ALTER TABLE external_evidence_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "external_evidence_records_authenticated" ON external_evidence_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "external_evidence_records_service_role" ON external_evidence_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE external_evidence_records IS
  'Documented external evidence (planning consultant advice, highways audits, title deeds, owner outreach) for real-world validation.';

-- 3. Candidate Validation Records (Status, Stage & Discovered Realities)
CREATE TABLE IF NOT EXISTS candidate_validation_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  cohort_id text NOT NULL, -- e.g. 'COHORT-WARWICK-001', 'COHORT-RUGBY-001'
  
  -- Validation Governance
  validation_status text NOT NULL DEFAULT 'UNVALIDATED' CHECK (
    validation_status IN ('UNVALIDATED', 'IN_VALIDATION', 'VALIDATED')
  ),
  validation_stage text NOT NULL DEFAULT 'SURFACED' CHECK (
    validation_stage IN (
      'SURFACED',
      'SCREENED',
      'ANALYST_REVIEW',
      'INVESTIGATING',
      'SITE_VALIDATION',
      'OWNER_INTELLIGENCE',
      'PLANNING_VALIDATION',
      'MARKET_VALIDATION',
      'SITE_INSPECTION',
      'COMMERCIAL_DECISION'
    )
  ),
  commercial_decision text NOT NULL DEFAULT 'UNDECIDED' CHECK (
    commercial_decision IN ('PROGRESS', 'HOLD', 'REJECT', 'UNDECIDED')
  ),

  -- Real-World Realities (Independent ground truth)
  availability_reality text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    availability_reality IN ('AVAILABLE', 'UNAVAILABLE', 'UNKNOWN')
  ),
  owner_engagement_reality text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    owner_engagement_reality IN ('INTERESTED', 'NOT_INTERESTED', 'NO_RESPONSE', 'UNKNOWN')
  ),
  planning_reality text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    planning_reality IN ('SUPPORTIVE', 'NEUTRAL', 'ADVERSE', 'CONFLICTING', 'UNKNOWN')
  ),
  access_reality text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    access_reality IN ('SUPPORTIVE', 'CONSTRAINED', 'FAILED', 'UNKNOWN')
  ),
  market_reality text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    market_reality IN ('SUPPORTIVE', 'NEUTRAL', 'WEAK', 'CONFLICTING', 'UNKNOWN')
  ),
  acquisition_outcome text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    acquisition_outcome IN ('PROGRESSED', 'HELD', 'REJECTED', 'CONTROLLED', 'ACQUIRED', 'UNKNOWN')
  ),

  -- Multi-factor Rejection Taxonomy
  rejection_reasons text[] DEFAULT ARRAY[]::text[],

  -- False Positive / False Negative Diagnosis
  false_positive_flag boolean NOT NULL DEFAULT false,
  false_positive_root_cause text CHECK (
    false_positive_root_cause IS NULL OR
    false_positive_root_cause IN (
      'planning_mismatch',
      'market_mismatch',
      'access_failure',
      'title_defect',
      'environmental_blocker',
      'economic_unviability',
      'owner_refusal',
      'infrastructure_failure',
      'other'
    )
  ),
  false_negative_flag boolean NOT NULL DEFAULT false,
  false_negative_category text CHECK (
    false_negative_category IS NULL OR
    false_negative_category IN (
      'data_false_negative',
      'rule_false_negative',
      'geometry_false_negative',
      'classification_false_negative',
      'strategy_false_negative'
    )
  ),

  analyst_notes text,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (site_id, cohort_id)
);

CREATE INDEX IF NOT EXISTS candidate_validation_site_idx ON candidate_validation_records (site_id);
CREATE INDEX IF NOT EXISTS candidate_validation_cohort_idx ON candidate_validation_records (cohort_id);
CREATE INDEX IF NOT EXISTS candidate_validation_status_idx ON candidate_validation_records (validation_status);
CREATE INDEX IF NOT EXISTS candidate_validation_stage_idx ON candidate_validation_records (validation_stage);
CREATE INDEX IF NOT EXISTS candidate_validation_decision_idx ON candidate_validation_records (commercial_decision);
CREATE INDEX IF NOT EXISTS candidate_validation_fp_idx ON candidate_validation_records (false_positive_flag);
CREATE INDEX IF NOT EXISTS candidate_validation_fn_idx ON candidate_validation_records (false_negative_flag);

CREATE TRIGGER candidate_validation_records_updated_at
  BEFORE UPDATE ON candidate_validation_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE candidate_validation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_validation_records_authenticated" ON candidate_validation_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "candidate_validation_records_service_role" ON candidate_validation_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE candidate_validation_records IS
  'Tracks candidate progression through real-world validation stages, recording ground truth realities and FP/FN diagnoses.';

-- 4. Human Benchmark Candidates (Independent Acquisition Research)
CREATE TABLE IF NOT EXISTS human_benchmark_candidates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  benchmark_set_id text NOT NULL, -- e.g. 'BENCHMARK-WARWICK-HUMAN-001'
  geography text NOT NULL,
  site_reference text NOT NULL,
  site_name text NOT NULL,
  identified_by text NOT NULL,
  identification_date date NOT NULL,
  identification_method text NOT NULL, -- e.g. 'agent_off_market', 'local_plan_call_for_sites', 'site_drive_by', 'desktop_aerial'
  rationale text NOT NULL,
  geometry geometry(MultiPolygon, 4326),
  surfaced_by_land_radar boolean NOT NULL DEFAULT false,
  land_radar_site_reference text,
  screening_outcome text, -- 'passed_v3', 'excluded_by_rule', 'unassessed'
  exclusion_rule_id text,
  disagreement_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS human_benchmark_set_idx ON human_benchmark_candidates (benchmark_set_id);
CREATE INDEX IF NOT EXISTS human_benchmark_geography_idx ON human_benchmark_candidates (geography);
CREATE INDEX IF NOT EXISTS human_benchmark_surfaced_idx ON human_benchmark_candidates (surfaced_by_land_radar);

ALTER TABLE human_benchmark_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "human_benchmark_candidates_authenticated" ON human_benchmark_candidates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "human_benchmark_candidates_service_role" ON human_benchmark_candidates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE human_benchmark_candidates IS
  'Sites independently identified by human acquisition surveyors, used to measure machine discovery overlap and false negatives.';
