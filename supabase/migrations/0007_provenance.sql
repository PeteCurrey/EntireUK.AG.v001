-- ============================================================
-- Migration 0007: Provenance Records
-- Every imported record must retain its origin.
-- The system must always answer: "Where did this fact come from?"
-- ============================================================

CREATE TABLE IF NOT EXISTS provenance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Entity this provenance record belongs to
  entity_type text NOT NULL CHECK (entity_type IN (
    'site', 'parcel', 'title', 'signal', 'constraint',
    'planning_record', 'market_comparable', 'opportunity'
  )),
  entity_id uuid NOT NULL,
  -- Source information
  source_organisation text NOT NULL,
  dataset_name text NOT NULL,
  source_url text,
  dataset_version text,
  -- Temporal
  retrieval_timestamp timestamptz NOT NULL DEFAULT now(),
  effective_date date,
  -- Spatial
  geometry_source text, -- e.g. 'cadastral', 'os', 'self_reported', 'derived'
  -- Record identification
  record_identifier text,
  -- Legal
  licence text,
  -- Processing traceability
  processing_version text NOT NULL DEFAULT 'v1',
  -- Raw source record: the original data as received, NEVER mutated
  -- This allows future reprocessing if schema changes, rules change, or source is corrected
  raw_record jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX provenance_entity_idx ON provenance_records (entity_type, entity_id);
CREATE INDEX provenance_source_idx ON provenance_records (source_organisation, dataset_name);
CREATE INDEX provenance_retrieval_idx ON provenance_records (retrieval_timestamp DESC);

ALTER TABLE provenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provenance_authenticated" ON provenance_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "provenance_service_role" ON provenance_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE provenance_records IS
  'Provenance for every imported entity. raw_record stores the original source data unmodified. '
  'This enables reprocessing when schemas change, parsing improves, or source corrections occur. '
  'Never ingest data without a provenance record.';
COMMENT ON COLUMN provenance_records.raw_record IS
  'The original source record as received. This is NEVER modified after creation. '
  'All transformations produce separate normalised records.';
