-- ============================================================
-- Migration 0006: Land Titles & Parcel-Title Relationships
-- Title information where legally and technically available.
-- Many-to-many with partial overlaps supported.
-- ============================================================

CREATE TABLE IF NOT EXISTS land_titles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_reference text,
  tenure text CHECK (tenure IN ('freehold', 'leasehold', 'unknown')),
  -- has_geometry is EXPLICIT. Do not infer from geometry IS NULL.
  -- A null geometry with has_geometry=true means geometry was expected but unavailable.
  -- A null geometry with has_geometry=false means title has no registered extent.
  has_geometry boolean NOT NULL DEFAULT false,
  geometry geometry(MultiPolygon, 4326),
  centroid geometry(Point, 4326) GENERATED ALWAYS AS (
    CASE WHEN geometry IS NOT NULL THEN ST_Centroid(geometry) ELSE NULL END
  ) STORED,
  source text NOT NULL,
  source_identifier text,
  data_timestamp timestamptz,
  provenance jsonb,
  ingestion_job_id uuid REFERENCES ingestion_jobs(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX land_titles_geometry_idx ON land_titles USING GIST(geometry);
CREATE INDEX land_titles_reference_idx ON land_titles (title_reference);
CREATE INDEX land_titles_tenure_idx ON land_titles (tenure);

CREATE TRIGGER land_titles_updated_at
  BEFORE UPDATE ON land_titles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Parcel-Title relationship: many-to-many with overlap quantification
-- Supports: one parcel -> multiple titles, multiple parcels -> one title, partial overlaps
CREATE TABLE IF NOT EXISTS parcel_title_relationships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id uuid NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
  title_id uuid NOT NULL REFERENCES land_titles(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'unknown' CHECK (
    relationship_type IN ('one_to_one', 'one_to_many', 'many_to_one', 'partial_overlap', 'unknown')
  ),
  -- Percentage of parcel geometry covered by this title (0-100)
  -- null = not yet calculated
  overlap_pct numeric CHECK (overlap_pct >= 0 AND overlap_pct <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parcel_id, title_id)
);

CREATE INDEX ptr_parcel_idx ON parcel_title_relationships (parcel_id);
CREATE INDEX ptr_title_idx ON parcel_title_relationships (title_id);

ALTER TABLE land_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "land_titles_authenticated" ON land_titles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "land_titles_service_role" ON land_titles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE parcel_title_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ptr_authenticated" ON parcel_title_relationships
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ptr_service_role" ON parcel_title_relationships
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE land_titles IS
  'Title register information. has_geometry is explicit: false means no registered extent, '
  'not that it was unavailable. One parcel may map to multiple titles and vice versa.';
COMMENT ON COLUMN land_titles.has_geometry IS
  'Explicit boolean. false = title has no registered geographic extent. '
  'Do not infer from geometry IS NULL.';
