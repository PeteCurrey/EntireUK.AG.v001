-- ============================================================
-- Migration 0015: Data Quality Reports
-- Track coverage, freshness and source availability per dataset.
-- source_available=false must surface uncertainty, never silence it.
-- ============================================================

CREATE TABLE IF NOT EXISTS data_quality_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  ingestion_job_id uuid REFERENCES ingestion_jobs(id),
  report_timestamp timestamptz NOT NULL DEFAULT now(),

  -- Coverage metrics
  coverage_pct numeric CHECK (coverage_pct >= 0 AND coverage_pct <= 100),
  freshness_days numeric, -- days since this dataset was last successfully ingested
  completeness_pct numeric CHECK (completeness_pct >= 0 AND completeness_pct <= 100),

  -- Geometry quality
  geometry_valid_count integer NOT NULL DEFAULT 0,
  geometry_invalid_count integer NOT NULL DEFAULT 0,

  -- Record quality
  duplicate_count integer NOT NULL DEFAULT 0,
  conflicting_count integer NOT NULL DEFAULT 0,

  -- Source availability: MUST be explicit
  -- source_available=false means the source failed during this run
  -- Previous valid data is RETAINED. Do not delete on source failure.
  source_available boolean NOT NULL DEFAULT true,
  source_failure_reason text, -- populated only when source_available = false

  -- Link to previous successful report for freshness comparison
  previous_successful_report_id uuid REFERENCES data_quality_reports(id),

  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dqr_source_idx ON data_quality_reports (data_source_id);
CREATE INDEX dqr_timestamp_idx ON data_quality_reports (report_timestamp DESC);
CREATE INDEX dqr_available_idx ON data_quality_reports (source_available);

ALTER TABLE data_quality_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "data_quality_authenticated" ON data_quality_reports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "data_quality_service_role" ON data_quality_reports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE data_quality_reports IS
  'Data quality tracking per dataset per ingestion run. '
  'source_available=false means the source was unavailable. '
  'Previous successful data is never deleted on source failure. '
  'A source being unavailable must not silently result in "no constraints found".';
COMMENT ON COLUMN data_quality_reports.source_available IS
  'false = source was unavailable during this run. '
  'This must propagate to the intelligence layer as uncertainty, not absence.';
