-- ============================================================
-- Migration 0023: Ownership Intelligence & Live Acquisition Operations
--
-- Phase 11: Ownership Intelligence & Live Acquisition Operations
--
-- Core Principles:
-- - Sourced, attributable, temporally explicit ownership evidence.
-- - Unknown ownership is a valid state; no silent inferences.
-- - Candidate != Parcel != Title. Multi-title sites modelled explicitly.
-- - Availability is separate from ownership.
-- - Strictly separates TEST_FIXTURE / BENCHMARK from REAL_ACQUISITION_EVENT.
-- - Privacy-conscious: no personal data in structured columns.
-- ============================================================

-- 1. Extend candidate_validation_records with validation_evidence_status
ALTER TABLE candidate_validation_records
  ADD COLUMN IF NOT EXISTS validation_evidence_status text NOT NULL DEFAULT 'UNKNOWN'
  CHECK (validation_evidence_status IN ('TEST_FIXTURE', 'BENCHMARK', 'EXTERNAL_EVIDENCE', 'REAL_ACQUISITION_EVENT', 'UNKNOWN'));

-- 2. Update candidate_truth_ledger check constraint to include 'external_evidence'
ALTER TABLE candidate_truth_ledger
  DROP CONSTRAINT IF EXISTS candidate_truth_ledger_layer_check;

ALTER TABLE candidate_truth_ledger
  ADD CONSTRAINT candidate_truth_ledger_layer_check CHECK (
    layer IN ('machine_evidence', 'derived_evidence', 'analyst_interpretation', 'external_evidence', 'real_world_outcome')
  );

-- 3. Ownership Evidence Table
CREATE TABLE IF NOT EXISTS ownership_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  title_reference text,
  proprietor_notes text, -- Free-text entity description, never personal structured data
  ownership_source text NOT NULL,
  source_reference text,
  retrieval_date date NOT NULL,
  retrieval_mode text NOT NULL DEFAULT 'manual_entry' CHECK (
    retrieval_mode IN ('live_api', 'cached', 'local_fixture', 'manual_entry', 'synthetic_test')
  ),
  evidence_status text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    evidence_status IN ('VERIFIED', 'SUPPORTED', 'INDICATIVE', 'CONFLICTING', 'STALE', 'UNKNOWN')
  ),
  ownership_interpretation text NOT NULL DEFAULT 'unknown' CHECK (
    ownership_interpretation IN ('freehold', 'leasehold', 'multiple_interests', 'uncertain', 'unknown')
  ),
  acquisition_relevance text NOT NULL DEFAULT 'unknown' CHECK (
    acquisition_relevance IN ('likely_single_owner', 'multiple_ownership', 'ownership_complexity', 'unknown')
  ),
  analyst_notes text,
  recorded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ownership_evidence_site_idx ON ownership_evidence (site_id);
CREATE INDEX IF NOT EXISTS ownership_evidence_site_ref_idx ON ownership_evidence (site_reference);
CREATE INDEX IF NOT EXISTS ownership_evidence_status_idx ON ownership_evidence (evidence_status);

ALTER TABLE ownership_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ownership_evidence_authenticated" ON ownership_evidence
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ownership_evidence_service_role" ON ownership_evidence
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Title Candidate Relationships Table
CREATE TABLE IF NOT EXISTS title_candidate_relationships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title_id text NOT NULL,
  title_reference text,
  relationship_strength text NOT NULL DEFAULT 'UNKNOWN' CHECK (
    relationship_strength IN ('STRONG', 'PARTIAL', 'WEAK', 'UNKNOWN')
  ),
  overlap_pct numeric CHECK (overlap_pct >= 0 AND overlap_pct <= 100),
  title_geometry_available boolean NOT NULL DEFAULT false,
  analyst_notes text,
  assessed_by text NOT NULL,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS title_candidate_rel_site_idx ON title_candidate_relationships (site_id);
CREATE INDEX IF NOT EXISTS title_candidate_rel_title_idx ON title_candidate_relationships (title_id);

ALTER TABLE title_candidate_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "title_candidate_rel_authenticated" ON title_candidate_relationships
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "title_candidate_rel_service_role" ON title_candidate_relationships
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Availability Evidence Table
CREATE TABLE IF NOT EXISTS availability_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  availability_state text NOT NULL CHECK (
    availability_state IN (
      'AVAILABLE',
      'POTENTIALLY_AVAILABLE',
      'UNDER_DISCUSSION',
      'UNDER_OPTION',
      'UNDER_PROMOTION',
      'UNDER_CONTRACT',
      'NOT_AVAILABLE',
      'UNKNOWN'
    )
  ),
  evidence_source text NOT NULL,
  evidence_date date NOT NULL,
  confidence numeric NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  evidence_notes text,
  recorded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS availability_evidence_site_idx ON availability_evidence (site_id);
CREATE INDEX IF NOT EXISTS availability_evidence_state_idx ON availability_evidence (availability_state);

ALTER TABLE availability_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_evidence_authenticated" ON availability_evidence
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "availability_evidence_service_role" ON availability_evidence
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Acquisition Contact Records Table
CREATE TABLE IF NOT EXISTS acquisition_contact_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  contact_type text NOT NULL CHECK (
    contact_type IN ('email', 'phone', 'letter', 'in_person', 'agent_intermediary', 'other')
  ),
  organisation_or_role text, -- entity contacted, never personal data
  source_of_contact_details text,
  contact_date date NOT NULL,
  communication_method_notes text,
  outcome text NOT NULL CHECK (
    outcome IN (
      'INTERESTED',
      'OPEN_TO_DISCUSSION',
      'REQUESTED_INFORMATION',
      'NO_RESPONSE',
      'DEFERRED',
      'UNKNOWN',
      'NOT_INTERESTED',
      'NOT_AVAILABLE',
      'ALREADY_COMMITTED',
      'MULTIPLE_OWNERS',
      'AGENT_CONTROLLED',
      'LEGAL_COMPLEXITY',
      'OTHER'
    )
  ),
  availability_information text,
  next_action text,
  analyst text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS acquisition_contact_site_idx ON acquisition_contact_records (site_id);
CREATE INDEX IF NOT EXISTS acquisition_contact_outcome_idx ON acquisition_contact_records (outcome);

ALTER TABLE acquisition_contact_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acquisition_contact_authenticated" ON acquisition_contact_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acquisition_contact_service_role" ON acquisition_contact_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. Acquisition Evidence Records Table
CREATE TABLE IF NOT EXISTS acquisition_evidence_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  evidence_type text NOT NULL CHECK (
    evidence_type IN (
      'title_research',
      'owner_communication',
      'agent_communication',
      'planning_consultant_advice',
      'highways_advice',
      'site_inspection',
      'survey',
      'local_authority_discussion',
      'market_agent_intelligence',
      'legal_advice',
      'acquisition_negotiation',
      'other_documented_evidence'
    )
  ),
  evidence_date date NOT NULL,
  source text NOT NULL,
  source_reference text,
  summary text NOT NULL,
  actor text NOT NULL,
  actor_role text,
  supporting_document_ref text,
  contradiction_status text NOT NULL DEFAULT 'neutral' CHECK (
    contradiction_status IN ('supports_prioritisation', 'contradicts_prioritisation', 'neutral', 'unresolved')
  ),
  interpretation text NOT NULL,
  confidence text NOT NULL DEFAULT 'medium' CHECK (
    confidence IN ('high', 'medium', 'low', 'provisional')
  ),
  recorded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS acquisition_evidence_site_idx ON acquisition_evidence_records (site_id);
CREATE INDEX IF NOT EXISTS acquisition_evidence_type_idx ON acquisition_evidence_records (evidence_type);
CREATE INDEX IF NOT EXISTS acquisition_evidence_contradiction_idx ON acquisition_evidence_records (contradiction_status);

ALTER TABLE acquisition_evidence_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acquisition_evidence_authenticated" ON acquisition_evidence_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acquisition_evidence_service_role" ON acquisition_evidence_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE ownership_evidence IS
  'Attributable ownership evidence records for candidate parcels and titles.';
COMMENT ON TABLE title_candidate_relationships IS
  'Spatial and cadastral relationships between candidate boundaries and titles.';
COMMENT ON TABLE availability_evidence IS
  'Append-only log of site availability state supported by real evidence.';
COMMENT ON TABLE acquisition_contact_records IS
  'Auditable log of communication events with owners, agents and intermediaries.';
COMMENT ON TABLE acquisition_evidence_records IS
  'Formal acquisition intelligence records across title, planning, highways, and market domains.';
