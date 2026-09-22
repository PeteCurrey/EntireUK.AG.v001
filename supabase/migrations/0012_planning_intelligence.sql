-- ============================================================
-- Migration 0012: Planning Intelligence
-- Planning is contextual. Not a simple yes/no.
-- Records may predate site identification.
-- ============================================================

CREATE TABLE IF NOT EXISTS planning_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- site_id is nullable: records may exist before site identification
  site_id uuid REFERENCES sites(id),

  -- Application fields
  application_reference text,
  application_type text,
  description text,
  decision_type text CHECK (decision_type IN (
    'approved', 'refused', 'withdrawn', 'pending', 'appeal', 'enforcement', 'unknown'
  )),
  has_appeal boolean,
  has_enforcement boolean,

  -- Designation fields (when not an application)
  designation_type text,

  -- Geography
  geometry geometry(MultiPolygon, 4326),
  centroid geometry(Point, 4326) GENERATED ALWAYS AS (
    CASE WHEN geometry IS NOT NULL THEN ST_Centroid(geometry) ELSE NULL END
  ) STORED,
  local_authority text,

  -- Dates
  decision_date date,
  application_date date,

  -- Source and provenance
  source text NOT NULL,
  source_dataset text,
  provenance_id uuid REFERENCES provenance_records(id),
  ingestion_job_id uuid REFERENCES ingestion_jobs(id),

  -- Intelligence status
  status intelligence_status NOT NULL DEFAULT 'known',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX planning_records_site_idx ON planning_records (site_id);
CREATE INDEX planning_records_la_idx ON planning_records (local_authority);
CREATE INDEX planning_records_decision_idx ON planning_records (decision_type, decision_date);
CREATE INDEX planning_records_geometry_idx ON planning_records USING GIST(geometry);
CREATE INDEX planning_records_centroid_idx ON planning_records USING GIST(centroid);

CREATE TRIGGER planning_records_updated_at
  BEFORE UPDATE ON planning_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE planning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planning_records_authenticated" ON planning_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "planning_records_service_role" ON planning_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE planning_records IS
  'Planning intelligence is contextual. Records represent applications, decisions, '
  'appeals, enforcement and designations. site_id is nullable because records may '
  'predate site identification. decision_type=unknown is a valid state.';
