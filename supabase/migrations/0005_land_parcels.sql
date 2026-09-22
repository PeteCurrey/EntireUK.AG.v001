-- ============================================================
-- Migration 0005: Land Parcels
-- Geographic parcel representation from authoritative sources.
-- A parcel is NOT automatically a site or opportunity.
-- This distinction is critical.
-- ============================================================

CREATE TABLE IF NOT EXISTS land_parcels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Source information
  source text NOT NULL,
  source_id text,
  source_dataset text,
  -- Geometry: stored EPSG:4326
  geometry geometry(MultiPolygon, 4326),
  centroid geometry(Point, 4326) GENERATED ALWAYS AS (ST_Centroid(geometry)) STORED,
  -- Area calculated via EPSG:27700 for metre accuracy
  area_sqm_calculated numeric GENERATED ALWAYS AS (
    CASE WHEN geometry IS NOT NULL
    THEN ST_Area(ST_Transform(geometry, 27700))
    ELSE NULL END
  ) STORED,
  -- Source-supplied area retained unmodified
  area_sqm_source numeric,
  -- Geometry validation results
  geometry_valid boolean,
  geometry_validation_notes text,
  -- Provenance and ingestion tracking
  provenance jsonb,
  ingestion_job_id uuid REFERENCES ingestion_jobs(id),
  dataset_version text,
  import_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX land_parcels_geometry_idx ON land_parcels USING GIST(geometry);
CREATE INDEX land_parcels_centroid_idx ON land_parcels USING GIST(centroid);
CREATE INDEX land_parcels_source_idx ON land_parcels (source, source_id);
CREATE INDEX land_parcels_geometry_valid_idx ON land_parcels (geometry_valid);

ALTER TABLE land_parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "land_parcels_authenticated" ON land_parcels
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "land_parcels_service_role" ON land_parcels
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE land_parcels IS
  'Geographic land parcels from authoritative sources (e.g. HMLR INSPIRE). '
  'A parcel is a geographic fact, not an opportunity assessment. '
  'geometry_valid=false means the geometry was rejected but the record is retained for audit.';
COMMENT ON COLUMN land_parcels.geometry_valid IS
  'false = geometry failed validation (self-intersection, invalid polygon, etc.). '
  'null = validation not yet run. true = passed validation. '
  'Invalid records are retained with notes, never silently discarded.';
