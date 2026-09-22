-- Migration: 0017_pilot_config.sql
-- Purpose: Pilot configuration and dataset decision registry for Land Radar pilots.
-- All spatial operations and pilot bounds are stored in EPSG:4326.

CREATE TYPE pilot_status AS ENUM (
  'draft',
  'active',
  'completed',
  'archived',
  'deprecated'
);

CREATE TYPE dataset_decision_verdict AS ENUM (
  'ingest',
  'defer',
  'exclude'
);

CREATE TABLE pilot_configurations (
  id text PRIMARY KEY, -- e.g. 'EUK-PILOT-001'
  geography_name text NOT NULL,
  lpa_code text NOT NULL,
  boundary_geom geometry(MultiPolygon, 4326),
  crs_epsg integer NOT NULL DEFAULT 4326,
  screening_strategy text NOT NULL DEFAULT 'RESIDENTIAL_DEVELOPMENT_V1',
  rule_version text NOT NULL DEFAULT 'v1',
  pilot_version text NOT NULL DEFAULT '1.0.0',
  status pilot_status NOT NULL DEFAULT 'draft',
  included_dataset_ids text[] NOT NULL DEFAULT '{}',
  excluded_dataset_ids text[] NOT NULL DEFAULT '{}',
  target_opportunity_types text[] NOT NULL DEFAULT '{"development_land", "brownfield"}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pilot_configurations_geom_idx ON pilot_configurations USING GIST(boundary_geom);
CREATE INDEX pilot_configurations_lpa_idx ON pilot_configurations(lpa_code);

CREATE TABLE pilot_dataset_decisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pilot_id text NOT NULL REFERENCES pilot_configurations(id) ON DELETE CASCADE,
  dataset_id text NOT NULL,
  decision dataset_decision_verdict NOT NULL,
  decision_reason text NOT NULL,
  licence_name text NOT NULL,
  licence_confirmed boolean NOT NULL DEFAULT false,
  licence_confirmed_at timestamptz,
  licence_confirmed_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pilot_id, dataset_id)
);

CREATE INDEX pilot_dataset_decisions_pilot_idx ON pilot_dataset_decisions(pilot_id);

-- RLS policies
ALTER TABLE pilot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_dataset_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pilot_configurations_auth_only" ON pilot_configurations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pilot_configurations_service_role" ON pilot_configurations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pilot_dataset_decisions_auth_only" ON pilot_dataset_decisions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pilot_dataset_decisions_service_role" ON pilot_dataset_decisions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed Warwick District pilot configuration (EUK-PILOT-001)
-- Approximate Warwick District envelope bounding box polygon (EPSG:4326)
INSERT INTO pilot_configurations (
  id,
  geography_name,
  lpa_code,
  boundary_geom,
  crs_epsg,
  screening_strategy,
  rule_version,
  pilot_version,
  status,
  included_dataset_ids,
  excluded_dataset_ids,
  notes
) VALUES (
  'EUK-PILOT-001',
  'Warwick District',
  'warwick',
  ST_Multi(ST_GeomFromText('POLYGON((-1.7000 52.2200, -1.4500 52.2200, -1.4500 52.3800, -1.7000 52.3800, -1.7000 52.2200))', 4326)),
  4326,
  'RESIDENTIAL_DEVELOPMENT_V1',
  'v1',
  '1.0.0',
  'active',
  ARRAY['PLAN-BROWNFIELD-001', 'EA-FLOOD-001', 'NE-SSSI-001', 'HMLR-INSPIRE-001', 'ONS-BUILTUP-001'],
  ARRAY['OS-OPEN-ROADS-001', 'LPA-GREENBELT-001'],
  'Warwick District pilot geography for Land Radar screening pilot. Covers Warwick, Royal Leamington Spa, Kenilworth, and Whitnash.'
) ON CONFLICT (id) DO NOTHING;

-- Seed dataset decisions for EUK-PILOT-001
INSERT INTO pilot_dataset_decisions (
  pilot_id,
  dataset_id,
  decision,
  decision_reason,
  licence_name,
  licence_confirmed,
  licence_confirmed_at,
  licence_confirmed_by
) VALUES
  ('EUK-PILOT-001', 'PLAN-BROWNFIELD-001', 'ingest', 'Authoritative DLUHC planning data platform brownfield register. OGL v3 permits commercial use with attribution.', 'Open Government Licence v3.0', true, now(), 'compliance@entire-uk.com'),
  ('EUK-PILOT-001', 'EA-FLOOD-001', 'ingest', 'Defra / Environment Agency Flood Map for Planning. OGL v3 allows spatial screening and derived analysis.', 'Open Government Licence v3.0', true, now(), 'compliance@entire-uk.com'),
  ('EUK-PILOT-001', 'NE-SSSI-001', 'ingest', 'Natural England Sites of Special Scientific Interest. OGL v3 open data geoportal.', 'Open Government Licence v3.0', true, now(), 'compliance@entire-uk.com'),
  ('EUK-PILOT-001', 'HMLR-INSPIRE-001', 'ingest', 'HMLR INSPIRE Index Polygons for Warwick District. Internal spatial processing permitted under post-July 2020 terms.', 'Open Government Licence v3.0 / HMLR INSPIRE', true, now(), 'compliance@entire-uk.com'),
  ('EUK-PILOT-001', 'ONS-BUILTUP-001', 'ingest', 'ONS Built-up Areas 2022 dataset for settlement proximity boundary derivation.', 'Open Government Licence v3.0', true, now(), 'compliance@entire-uk.com'),
  ('EUK-PILOT-001', 'OS-OPEN-ROADS-001', 'defer', 'National 400MB dataset deferred in Phase 5 to avoid excessive local storage dependencies. Road proximity treated as unknown without blocker.', 'Open Government Licence v3.0', false, null, null),
  ('EUK-PILOT-001', 'LPA-GREENBELT-001', 'defer', 'National dataset absent; local authority polygon licensing verification deferred to Phase 5.1.', 'Local Authority Open Data', false, null, null)
ON CONFLICT (pilot_id, dataset_id) DO NOTHING;

COMMENT ON TABLE pilot_configurations IS 'Controlled configuration objects defining geographical boundaries and rule parameters for Land Radar pilots.';
COMMENT ON TABLE pilot_dataset_decisions IS 'Licence audit and inclusion gate tracking whether a dataset is legally and technically approved for pilot ingestion.';
