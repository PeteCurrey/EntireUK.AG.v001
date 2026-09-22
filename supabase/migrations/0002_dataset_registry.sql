-- ============================================================
-- Migration 0002: Dataset Registry
-- Control plane for every ingested dataset.
-- ============================================================

CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation text NOT NULL,
  dataset_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'open_government', 'commercial', 'licensed', 'public_api', 'scrape', 'manual', 'partner'
  )),
  licence text,
  permitted_use text,
  attribution_requirements text,
  redistribution_restrictions text,
  commercial_restrictions text,
  endpoint text,
  update_frequency text,
  geometry_type text,
  coverage text DEFAULT 'england_wales',
  last_successful_ingestion timestamptz,
  last_attempted_ingestion timestamptz,
  current_version text,
  status text NOT NULL DEFAULT 'not_configured' CHECK (status IN (
    'not_configured', 'active', 'paused', 'failed', 'deprecated'
  )),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_sources_updated_at
  BEFORE UPDATE ON data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_sources_authenticated_read" ON data_sources
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "data_sources_authenticated_write" ON data_sources
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "data_sources_service_role" ON data_sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE data_sources IS
  'Dataset registry: control plane for every external data source ingested into Land Radar. '
  'Records licensing, permitted use, attribution requirements and ingestion health. '
  'Do not build a commercial data product assuming open-looking endpoints permit unrestricted redistribution.';

-- Seed known UK authoritative sources (not_configured = not yet integrated)
INSERT INTO data_sources (organisation, dataset_name, source_type, licence, coverage, status, notes) VALUES
  ('HM Land Registry', 'Price Paid Data', 'open_government', 'OGL v3.0',
   'england_wales', 'not_configured',
   'Residential and commercial property transactions. Monthly releases. Free download.'),
  ('HM Land Registry', 'INSPIRE Index Polygons', 'open_government', 'OGL v3.0',
   'england_wales', 'not_configured',
   'Registered title extents as polygons. Updated monthly. EPSG:27700 source CRS.'),
  ('Planning Data (DLUHC)', 'Brownfield Land Register', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Local authority brownfield registers. GeoJSON/CSV. Verify individual LA coverage.'),
  ('Planning Data (DLUHC)', 'Conservation Areas', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Designated conservation areas. GeoJSON. Some LAs missing.'),
  ('Planning Data (DLUHC)', 'Listed Buildings', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Listed building point data. Verify spatial accuracy before use.'),
  ('Environment Agency', 'Flood Map for Planning - Zone 2', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Flood Zone 2 polygons. Key constraint for residential development appraisal.'),
  ('Environment Agency', 'Flood Map for Planning - Zone 3', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Flood Zone 3 polygons. Hard planning constraint in many LPA policies.'),
  ('Natural England', 'Sites of Special Scientific Interest (SSSI)', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'SSSI boundaries. Serious constraint on most development types.'),
  ('Natural England', 'Ancient Woodland Inventory', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Irreplaceable habitat. Effectively a hard constraint under NPPF.'),
  ('Natural England', 'Areas of Outstanding Natural Beauty (AONB)', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'AONB boundaries. Strong landscape policy protection.'),
  ('Historic England', 'Scheduled Monuments', 'open_government', 'OGL v3.0',
   'england', 'not_configured',
   'Scheduled monument polygons. Near-absolute development constraint.'),
  ('Ordnance Survey', 'OS Open Roads', 'open_government', 'OGL v3.0',
   'great_britain', 'not_configured',
   'Open-licence road network. Suitable for access proximity signals.'),
  ('Ordnance Survey', 'OS Open Greenspace', 'open_government', 'OGL v3.0',
   'great_britain', 'not_configured',
   'Open spaces. Verify licensing before use in commercial context.');
