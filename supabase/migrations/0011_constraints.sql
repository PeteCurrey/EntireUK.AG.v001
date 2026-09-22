-- ============================================================
-- Migration 0011: Site Constraints
-- Constraint model with hard/soft/positive/unknown classification.
-- CRITICAL: Not every constraint eliminates a site.
-- Severity must distinguish source facts from Entire UK derivations.
-- ============================================================

CREATE TYPE constraint_type AS ENUM (
  'flood_risk_zone_1',
  'flood_risk_zone_2',
  'flood_risk_zone_3',
  'flood_risk_zone_3b',
  'green_belt',
  'conservation_area',
  'listed_building',
  'ancient_woodland',
  'sssi',
  'sac',
  'spa',
  'ramsar',
  'aonb',
  'national_park',
  'heritage_coast',
  'scheduled_monument',
  'article_4',
  'tree_preservation_order',
  'contamination',
  'infrastructure',
  'access_constraint',
  'other'
);

CREATE TYPE constraint_severity AS ENUM (
  'hard_exclusion',  -- removes candidate from specific strategy; not necessarily all strategies
  'soft_constraint', -- reduces attractiveness; does not eliminate
  'positive_signal', -- increases investigation priority
  'unknown'          -- insufficient evidence to classify
);

CREATE TABLE IF NOT EXISTS site_constraints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  constraint_type constraint_type NOT NULL,

  -- Constraint geometry (may differ from site geometry)
  constraint_geometry geometry(MultiPolygon, 4326),
  -- Percentage of site geometry intersecting this constraint
  -- null = not yet calculated
  overlap_pct numeric CHECK (overlap_pct >= 0 AND overlap_pct <= 100),

  -- Severity: MUST distinguish source fact from Entire UK derivation
  severity_classification constraint_severity NOT NULL DEFAULT 'unknown',
  severity_is_derived boolean NOT NULL DEFAULT true,
  -- true  = Entire UK has applied classification logic
  -- false = the source dataset establishes severity directly

  -- Intelligence status
  status intelligence_status NOT NULL DEFAULT 'unknown',
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),

  -- Provenance
  source text,
  data_source_id uuid REFERENCES data_sources(id),
  provenance_id uuid REFERENCES provenance_records(id),

  -- Auditability
  calculated_at timestamptz NOT NULL DEFAULT now(),
  rule_version text NOT NULL DEFAULT 'v1',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_constraints_site_idx ON site_constraints (site_id);
CREATE INDEX site_constraints_type_idx ON site_constraints (constraint_type);
CREATE INDEX site_constraints_severity_idx ON site_constraints (severity_classification);
CREATE INDEX site_constraints_status_idx ON site_constraints (status);
CREATE INDEX site_constraints_geometry_idx ON site_constraints USING GIST(constraint_geometry);

CREATE TRIGGER site_constraints_updated_at
  BEFORE UPDATE ON site_constraints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE site_constraints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_constraints_authenticated" ON site_constraints
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "site_constraints_service_role" ON site_constraints
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE site_constraints IS
  'Constraint model. Flood risk is a constraint, not an automatic hard exclusion. '
  'The correct treatment depends on site, policy, use and professional assessment. '
  'severity_is_derived=true means Entire UK applied the severity label; '
  'severity_is_derived=false means the source dataset established it directly. '
  'status=unknown means the constraint dataset was unavailable, not that no constraint exists.';
