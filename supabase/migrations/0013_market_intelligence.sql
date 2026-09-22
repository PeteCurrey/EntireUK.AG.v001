-- ============================================================
-- Migration 0013: Market Intelligence Foundation
-- Market comparables as evidence only.
-- Do not calculate GDV without explicit methodology and sufficient evidence.
-- ============================================================

CREATE TABLE IF NOT EXISTS market_comparables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Location
  geometry geometry(Point, 4326),
  postcode_sector text,
  local_authority text,

  -- Property
  property_type text,
  tenure text CHECK (tenure IN ('freehold', 'leasehold', 'unknown')),
  floor_area_sqm numeric, -- null if not known

  -- Transaction data (all nullable: source may not supply)
  transaction_value numeric,
  transaction_date date,
  price_per_sqm numeric, -- derived only when floor_area_sqm is known

  -- CRITICAL: Values MUST be labelled with their nature
  values_are_estimates boolean NOT NULL DEFAULT false,
  value_source text, -- 'land_registry', 'agent_evidence', 'model_estimate', 'user_input'

  -- Intelligence status
  status intelligence_status NOT NULL DEFAULT 'known',

  -- Provenance
  source text NOT NULL,
  licence text,
  provenance_id uuid REFERENCES provenance_records(id),
  ingestion_job_id uuid REFERENCES ingestion_jobs(id),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX market_comparables_geometry_idx ON market_comparables USING GIST(geometry);
CREATE INDEX market_comparables_la_idx ON market_comparables (local_authority);
CREATE INDEX market_comparables_date_idx ON market_comparables (transaction_date DESC);
CREATE INDEX market_comparables_type_idx ON market_comparables (property_type);

ALTER TABLE market_comparables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_comparables_authenticated" ON market_comparables
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "market_comparables_service_role" ON market_comparables
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE market_comparables IS
  'Market evidence only. Do not use to calculate GDV without an explicit methodology. '
  'values_are_estimates must be set explicitly. '
  'price_per_sqm is a derived field and must only be populated when floor_area_sqm is known.';
COMMENT ON COLUMN market_comparables.values_are_estimates IS
  'If true, these values are estimates or model-derived, not confirmed transactions. '
  'This must NEVER be silently set to false.';
