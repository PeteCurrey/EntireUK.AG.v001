-- ============================================================
-- Migration 0003: Ingestion Jobs
-- Reusable job tracking for every import run.
-- Every ingestion pipeline must create and close a job record.
-- ============================================================

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN (
    'running', 'completed', 'failed', 'partial'
  )),
  records_seen integer NOT NULL DEFAULT 0,
  records_inserted integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  records_rejected integer NOT NULL DEFAULT 0,
  geometry_errors integer NOT NULL DEFAULT 0,
  validation_errors integer NOT NULL DEFAULT 0,
  error_message text,
  dataset_version text,
  processing_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ingestion_jobs_source_idx ON ingestion_jobs (data_source_id);
CREATE INDEX ingestion_jobs_started_idx ON ingestion_jobs (started_at DESC);
CREATE INDEX ingestion_jobs_status_idx ON ingestion_jobs (status);

ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingestion_jobs_authenticated" ON ingestion_jobs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ingestion_jobs_service_role" ON ingestion_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE ingestion_jobs IS
  'Every ingestion run creates a job record. status=failed retains the error. '
  'Source failure does NOT delete previously successful data. '
  'Query the most recent completed job per source for freshness assessment.';
COMMENT ON COLUMN ingestion_jobs.status IS
  'partial = some records processed but errors occurred. completed = all records processed without error.';
