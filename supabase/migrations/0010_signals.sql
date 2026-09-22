-- ============================================================
-- Migration 0010: Site Signals
-- Individual, independently explainable signals per site.
-- UNKNOWN IS NOT CLEAR: status='unknown' means no data was found,
-- NOT that no constraint exists.
-- ============================================================

-- Intelligence status enum: shared across signals, constraints and other entities
CREATE TYPE intelligence_status AS ENUM (
  'known',       -- fact established from authoritative source
  'unknown',     -- no data available; absence of record ≠ absence of constraint
  'conflicting', -- multiple sources disagree
  'inferred',    -- derived from related evidence, not directly observed
  'verified'     -- confirmed by human review or additional corroboration
);

CREATE TYPE signal_type AS ENUM (
  'settlement_proximity',
  'road_proximity',
  'planning_activity',
  'brownfield_signal',
  'constraint_signal',
  'development_pattern',
  'market_signal',
  'flood_risk',
  'green_belt',
  'conservation_area',
  'access_adequacy',
  'protected_site',
  'ancient_woodland',
  'listed_building_proximity',
  'economic_zone'
);

CREATE TABLE IF NOT EXISTS site_signals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  signal_type signal_type NOT NULL,

  -- Value: numeric where applicable
  value numeric,
  unit text, -- 'metres', 'percent', 'count', 'boolean_flag'
  value_text text, -- for categorical signals

  -- Intelligence status: must never collapse to boolean
  status intelligence_status NOT NULL DEFAULT 'unknown',
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),

  -- Source and explanation: explanation is REQUIRED
  source text,
  data_source_id uuid REFERENCES data_sources(id),
  explanation text NOT NULL, -- human-readable explanation, always required

  -- Auditability: results must be reproducible
  calculated_at timestamptz NOT NULL DEFAULT now(),
  rule_version text NOT NULL DEFAULT 'v1',
  ingestion_job_id uuid REFERENCES ingestion_jobs(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- One signal type per site per rule version (upsert-safe)
  UNIQUE (site_id, signal_type, rule_version)
);

CREATE INDEX site_signals_site_idx ON site_signals (site_id);
CREATE INDEX site_signals_type_idx ON site_signals (signal_type);
CREATE INDEX site_signals_status_idx ON site_signals (status);

CREATE TRIGGER site_signals_updated_at
  BEFORE UPDATE ON site_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE site_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_signals_authenticated" ON site_signals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "site_signals_service_role" ON site_signals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE site_signals IS
  'Independent, explainable signals per site. Every signal traces back to evidence. '
  'status=unknown means no data was found for this signal, NOT that no constraint exists. '
  'explanation is required: every signal must be able to say WHY it has this value.';
COMMENT ON COLUMN site_signals.status IS
  'unknown = dataset was unavailable or site was not covered. '
  'This must surface as uncertainty, not as absence of constraint.';
COMMENT ON COLUMN site_signals.explanation IS
  'Required. Human-readable explanation of why this signal has this value. '
  'Example: "Site centroid is 420m from nearest settlement boundary per ONS 2023 data."';
