-- Migration: 0018_pilot_run_log.sql
-- Purpose: Track execution runs of Land Radar pilots, including performance, candidate generation, and failures.

CREATE TYPE pilot_run_status AS ENUM (
  'running',
  'completed',
  'failed',
  'partial'
);

CREATE TABLE pilot_run_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pilot_id text NOT NULL REFERENCES pilot_configurations(id) ON DELETE CASCADE,
  status pilot_run_status NOT NULL DEFAULT 'running',
  is_dry_run boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  screening_strategy text NOT NULL,
  rule_version text NOT NULL,
  datasets_attempted text[] NOT NULL DEFAULT '{}',
  datasets_succeeded text[] NOT NULL DEFAULT '{}',
  datasets_failed text[] NOT NULL DEFAULT '{}',
  records_ingested integer NOT NULL DEFAULT 0,
  sites_evaluated integer NOT NULL DEFAULT 0,
  sites_passed_screening integer NOT NULL DEFAULT 0,
  opportunities_generated integer NOT NULL DEFAULT 0,
  summary jsonb,
  failures jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pilot_run_logs_pilot_id_idx ON pilot_run_logs(pilot_id);
CREATE INDEX pilot_run_logs_started_at_idx ON pilot_run_logs(started_at);

ALTER TABLE pilot_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pilot_run_logs_auth_only" ON pilot_run_logs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pilot_run_logs_service_role" ON pilot_run_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE pilot_run_logs IS 'Audit log of Land Radar pilot executions, tracking dataset ingestions, screening metrics, and candidate counts.';
