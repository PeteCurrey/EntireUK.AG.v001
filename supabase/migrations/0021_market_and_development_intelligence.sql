-- ============================================================
-- Migration 0021: Market Intelligence, Development Capacity & Economics
--
-- Establishes:
-- 1. hmlr_price_paid (authoritative transaction records under OGL v3.0)
-- 2. market_comparable_matches (site-to-transaction spatial relationships & tiers)
-- 3. market_evidence_summaries (statistical market aggregates per candidate)
-- 4. local_plan_allocations (adopted/emerging Local Plan housing/employment allocations)
-- 5. development_capacity_evidence (gross vs constrained vs developable area)
--
-- Strict Epistemic Principles:
-- - No transaction evidence found != No market exists
-- - No allocation found != No allocation exists
-- - Strong market != Planning permission
-- - Planning permission != Commercial acquisition value
-- - Large site != Large developable area
-- - Explicit prohibition of automated GDV / residual land value models
-- ============================================================

-- 1. HM Land Registry Price Paid Data
CREATE TABLE IF NOT EXISTS hmlr_price_paid (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id text UNIQUE NOT NULL, -- HMLR unique transaction identifier
  price numeric NOT NULL CHECK (price > 0),
  date_of_transfer date NOT NULL,
  postcode text NOT NULL,
  property_type text NOT NULL CHECK (
    property_type IN ('D', 'S', 'T', 'F', 'O') -- Detached, Semi, Terraced, Flat, Other
  ),
  old_new text NOT NULL CHECK (old_new IN ('Y', 'N')), -- Y = Newly built, N = Established
  duration text NOT NULL CHECK (duration IN ('F', 'L', 'U')), -- Freehold, Leasehold, Unknown
  paon text, -- Primary Addressable Object Name (e.g. house number or name)
  saon text, -- Secondary Addressable Object Name (e.g. flat number)
  street text,
  locality text,
  town_city text,
  district text, -- Local Authority District (e.g. Warwick, Rugby)
  county text,
  ppd_category_type text DEFAULT 'A', -- A = Standard Price Paid, B = Additional Price Paid
  record_status text DEFAULT 'A', -- A = Add, C = Change, D = Delete
  
  -- Spatial location (derived from postcode centroid or address point)
  geometry geometry(Point, 4326),
  
  -- Provenance & Governance
  source text NOT NULL DEFAULT 'HMLR-PRICE-PAID-001',
  licence text NOT NULL DEFAULT 'OGL-v3.0',
  attribution text NOT NULL DEFAULT 'Contains HM Land Registry data (c) Crown copyright and database right 2026. This data is licensed under the Open Government Licence v3.0',
  retrieval_mode text NOT NULL DEFAULT 'local_fixture' CHECK (
    retrieval_mode IN ('live_api', 'cached', 'local_fixture', 'manual_entry', 'synthetic_test')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hmlr_price_paid_geometry_idx ON hmlr_price_paid USING GIST(geometry);
CREATE INDEX IF NOT EXISTS hmlr_price_paid_postcode_idx ON hmlr_price_paid (postcode);
CREATE INDEX IF NOT EXISTS hmlr_price_paid_district_idx ON hmlr_price_paid (district);
CREATE INDEX IF NOT EXISTS hmlr_price_paid_date_idx ON hmlr_price_paid (date_of_transfer DESC);
CREATE INDEX IF NOT EXISTS hmlr_price_paid_type_idx ON hmlr_price_paid (property_type);

ALTER TABLE hmlr_price_paid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hmlr_price_paid_authenticated" ON hmlr_price_paid
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "hmlr_price_paid_service_role" ON hmlr_price_paid
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE hmlr_price_paid IS
  'Authoritative HM Land Registry Price Paid Data. Recorded residential property sales in England & Wales.';

-- 2. Market Comparable Matches (Candidate Site <-> Transaction)
CREATE TABLE IF NOT EXISTS market_comparable_matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  price_paid_id uuid NOT NULL REFERENCES hmlr_price_paid(id) ON DELETE CASCADE,
  
  -- Spatial & Relevance relationship
  distance_m numeric NOT NULL CHECK (distance_m >= 0),
  relevance_tier text NOT NULL CHECK (
    relevance_tier IN ('directly_relevant', 'contextual', 'weak')
  ),
  relevance_rationale text NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, price_paid_id)
);

CREATE INDEX IF NOT EXISTS market_comparable_matches_site_idx ON market_comparable_matches (site_id);
CREATE INDEX IF NOT EXISTS market_comparable_matches_tier_idx ON market_comparable_matches (relevance_tier);

ALTER TABLE market_comparable_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_comparable_matches_authenticated" ON market_comparable_matches
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "market_comparable_matches_service_role" ON market_comparable_matches
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE market_comparable_matches IS
  'Spatial and attribute linkage between candidate acquisition sites and nearby residential transactions. Distinguishes directly relevant vs contextual evidence.';

-- 3. Market Evidence Summaries
CREATE TABLE IF NOT EXISTS market_evidence_summaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Metrics
  sample_size integer NOT NULL DEFAULT 0,
  directly_relevant_count integer NOT NULL DEFAULT 0,
  contextual_count integer NOT NULL DEFAULT 0,
  median_price numeric,
  p25_price numeric,
  p75_price numeric,
  min_price numeric,
  max_price numeric,
  new_build_count integer NOT NULL DEFAULT 0,
  new_build_percentage numeric,
  
  -- Search Parameters
  search_radius_m numeric NOT NULL,
  observation_period_months integer NOT NULL,
  earliest_transaction_date date,
  latest_transaction_date date,
  
  -- Deterministic Classification
  market_strength text NOT NULL CHECK (
    market_strength IN (
      'STRONG_MARKET_EVIDENCE',
      'MODERATE_MARKET_EVIDENCE',
      'WEAK_MARKET_EVIDENCE',
      'INSUFFICIENT_MARKET_EVIDENCE',
      'CONFLICTING_EVIDENCE',
      'UNKNOWN'
    )
  ),
  market_classification_rationale text NOT NULL,
  
  -- Rule Versioning & Provenance
  rule_version text NOT NULL DEFAULT 'v1',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (site_id, rule_version)
);

CREATE INDEX IF NOT EXISTS market_evidence_summaries_site_idx ON market_evidence_summaries (site_id);
CREATE INDEX IF NOT EXISTS market_evidence_summaries_strength_idx ON market_evidence_summaries (market_strength);

CREATE TRIGGER market_evidence_summaries_updated_at
  BEFORE UPDATE ON market_evidence_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE market_evidence_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_evidence_summaries_authenticated" ON market_evidence_summaries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "market_evidence_summaries_service_role" ON market_evidence_summaries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE market_evidence_summaries IS
  'Aggregated local housing market evidence. Does NOT compute GDV or residual land values. Factual transaction distribution metrics only.';

-- 4. Local Plan Allocations
CREATE TABLE IF NOT EXISTS local_plan_allocations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lpa_code text NOT NULL,
  plan_name text NOT NULL,
  policy_reference text NOT NULL,
  site_name text,
  allocation_type text NOT NULL CHECK (
    allocation_type IN ('housing', 'employment', 'mixed_use', 'regeneration', 'infrastructure', 'other')
  ),
  status text NOT NULL CHECK (
    status IN ('adopted', 'emerging', 'allocated', 'safeguarded', 'withdrawn', 'unknown')
  ),
  indicative_capacity_units integer,
  indicative_density_dph numeric,
  adoption_date date,
  plan_period text,
  
  geometry geometry(MultiPolygon, 4326),
  
  source text NOT NULL,
  licence text NOT NULL DEFAULT 'OGL-v3.0',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS local_plan_allocations_geometry_idx ON local_plan_allocations USING GIST(geometry);
CREATE INDEX IF NOT EXISTS local_plan_allocations_lpa_idx ON local_plan_allocations (lpa_code);

CREATE TRIGGER local_plan_allocations_updated_at
  BEFORE UPDATE ON local_plan_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE local_plan_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "local_plan_allocations_authenticated" ON local_plan_allocations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "local_plan_allocations_service_role" ON local_plan_allocations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE local_plan_allocations IS
  'Authoritative LPA Local Plan site allocations and policy designations under OGL v3.0.';

-- 5. Development Capacity Evidence
CREATE TABLE IF NOT EXISTS development_capacity_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  gross_area_sqm numeric NOT NULL,
  constrained_area_sqm numeric NOT NULL DEFAULT 0,
  constrained_percentage numeric NOT NULL DEFAULT 0,
  
  developable_area_status text NOT NULL CHECK (
    developable_area_status IN ('known', 'uncertain', 'unknown')
  ),
  potentially_developable_area_sqm numeric, -- null if developable_area_status is unknown
  
  indicative_density_min_dph numeric,
  indicative_density_max_dph numeric,
  
  development_potential text NOT NULL CHECK (
    development_potential IN (
      'HIGH_DEVELOPMENT_POTENTIAL',
      'MODERATE_DEVELOPMENT_POTENTIAL',
      'LOW_DEVELOPMENT_POTENTIAL',
      'INSUFFICIENT_EVIDENCE',
      'CONFLICTING_EVIDENCE',
      'UNKNOWN'
    )
  ),
  potential_classification_rationale text NOT NULL,
  capacity_caveats text[] DEFAULT ARRAY[]::text[],
  
  rule_version text NOT NULL DEFAULT 'v1',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (site_id, rule_version)
);

CREATE INDEX IF NOT EXISTS development_capacity_evidence_site_idx ON development_capacity_evidence (site_id);
CREATE INDEX IF NOT EXISTS development_capacity_evidence_potential_idx ON development_capacity_evidence (development_potential);

CREATE TRIGGER development_capacity_evidence_updated_at
  BEFORE UPDATE ON development_capacity_evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE development_capacity_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "development_capacity_evidence_authenticated" ON development_capacity_evidence
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "development_capacity_evidence_service_role" ON development_capacity_evidence
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE development_capacity_evidence IS
  'Transparent spatial development capacity breakdown. Gross vs constrained vs developable area. Never computes an automated GDV or unverified dwelling count.';

-- 6. Candidate Outcomes Lifecycle (Phase 9 Section 16)
DO $$ BEGIN
  CREATE TYPE acquisition_outcome_state AS ENUM (
    'SURFACED',
    'SCREENED',
    'ANALYST_REVIEW',
    'INVESTIGATING',
    'CONTACTED',
    'UNDER_NEGOTIATION',
    'CONTROLLED',
    'DUE_DILIGENCE',
    'ACQUISITION_AGREED',
    'ACQUIRED',
    'PLANNING',
    'DEVELOPMENT',
    'REALISATION',
    'REJECTED_PLANNING',
    'REJECTED_MARKET',
    'REJECTED_ACCESS',
    'REJECTED_TITLE',
    'REJECTED_ENVIRONMENTAL',
    'REJECTED_ECONOMICS',
    'REJECTED_OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS candidate_outcomes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  state acquisition_outcome_state NOT NULL,
  previous_state acquisition_outcome_state,
  recorded_by text NOT NULL,
  rationale text NOT NULL,
  evidence_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS candidate_outcomes_site_idx ON candidate_outcomes (site_id);
CREATE INDEX IF NOT EXISTS candidate_outcomes_state_idx ON candidate_outcomes (state);

ALTER TABLE candidate_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate_outcomes_authenticated" ON candidate_outcomes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "candidate_outcomes_service_role" ON candidate_outcomes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE candidate_outcomes IS
  'Authoritative audit ledger of candidate progression through the acquisition lifecycle (SURFACED -> SCREENED -> ANALYST_REVIEW -> INVESTIGATING -> ...). Never fabricates outcomes.';

