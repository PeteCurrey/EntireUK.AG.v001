-- ============================================================
-- Migration 0020: Planning Intelligence, Spatial Matching & Coverage
--
-- Extends Land Radar with:
-- 1. planning_evidence (relationship table between candidate sites and planning records with 5-tier spatial confidence)
-- 2. planning_lpa_coverage (tracks authoritative dataset coverage explicitly per LPA)
--
-- Strict Epistemic Principles:
-- - No record in source != No planning history exists
-- - Approved != Developable
-- - Refused != Impossible
-- ============================================================

-- 1. Planning Evidence Relationships (Candidate Site <-> Planning Application)
CREATE TABLE IF NOT EXISTS planning_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  planning_record_id uuid NOT NULL REFERENCES planning_records(id) ON DELETE CASCADE,
  
  -- Spatial matching tier
  match_tier text NOT NULL CHECK (
    match_tier IN ('intersects_candidate', 'intersects_source_parcel', 'nearby_buffer', 'address_match', 'textual')
  ),
  distance_m numeric, -- null if intersecting
  overlap_pct numeric, -- null if point or non-overlapping polygon
  
  -- Classification of development proposal
  proposal_classification text NOT NULL DEFAULT 'unknown' CHECK (
    proposal_classification IN ('residential', 'commercial', 'industrial', 'mixed_use', 'infrastructure', 'agricultural', 'unknown')
  ),
  
  -- Semantic context
  is_relevant_to_strategy boolean NOT NULL DEFAULT true,
  relevance_notes text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (site_id, planning_record_id)
);

CREATE INDEX IF NOT EXISTS planning_evidence_site_idx ON planning_evidence (site_id);
CREATE INDEX IF NOT EXISTS planning_evidence_record_idx ON planning_evidence (planning_record_id);
CREATE INDEX IF NOT EXISTS planning_evidence_tier_idx ON planning_evidence (match_tier);

CREATE TRIGGER planning_evidence_updated_at
  BEFORE UPDATE ON planning_evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE planning_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planning_evidence_authenticated" ON planning_evidence
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "planning_evidence_service_role" ON planning_evidence
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE planning_evidence IS
  'Derived spatial and textual relationship between candidate sites and planning records. Preserves matching tier and does not equate proximity with development certainty.';

-- 2. Explicit Local Planning Authority Coverage Tracking
CREATE TABLE IF NOT EXISTS planning_lpa_coverage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lpa_code text UNIQUE NOT NULL,
  lpa_name text NOT NULL,
  coverage_status text NOT NULL DEFAULT 'unknown' CHECK (
    coverage_status IN ('known', 'partial', 'unknown')
  ),
  total_records_ingested integer NOT NULL DEFAULT 0,
  has_geometry boolean NOT NULL DEFAULT false,
  source_dataset text NOT NULL,
  licence text NOT NULL DEFAULT 'OGL-v3.0',
  data_quality_notes text,
  last_retrieval_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planning_lpa_coverage_code_idx ON planning_lpa_coverage (lpa_code);

CREATE TRIGGER planning_lpa_coverage_updated_at
  BEFORE UPDATE ON planning_lpa_coverage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE planning_lpa_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planning_lpa_coverage_authenticated" ON planning_lpa_coverage
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "planning_lpa_coverage_service_role" ON planning_lpa_coverage
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE planning_lpa_coverage IS
  'Authoritative planning coverage per LPA. Absence of coverage means status is partial or unknown, never that planning history is clear.';
