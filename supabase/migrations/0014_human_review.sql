-- ============================================================
-- Migration 0014: Human Review
-- Human review is the gate between signal detection and active investigation.
-- AI may NEVER be the final acquisition decision-maker.
-- ============================================================

CREATE TYPE review_decision AS ENUM (
  'investigate',              -- proceed to active investigation
  'monitor',                  -- watch but do not act now
  'decline',                  -- not suitable; record reason
  'insufficient_information'  -- needs more data before decision
);

CREATE TYPE confidence_level AS ENUM (
  'low', 'medium', 'high'
);

CREATE TABLE IF NOT EXISTS site_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,

  -- Reviewer identity
  reviewer text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now(),

  -- Review content
  assessment text,
  notes text,
  decision review_decision NOT NULL,
  confidence confidence_level NOT NULL DEFAULT 'low',

  -- Follow-up
  follow_up_required boolean NOT NULL DEFAULT false,
  follow_up_notes text,

  -- Auditability: snapshot of signals at time of review
  -- Stored so that the review context is preserved even if signals are recalculated
  signals_at_review jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_reviews_site_idx ON site_reviews (site_id);
CREATE INDEX site_reviews_decision_idx ON site_reviews (decision);
CREATE INDEX site_reviews_reviewed_at_idx ON site_reviews (reviewed_at DESC);
CREATE INDEX site_reviews_follow_up_idx ON site_reviews (follow_up_required) WHERE follow_up_required = true;

ALTER TABLE site_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_reviews_authenticated" ON site_reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "site_reviews_service_role" ON site_reviews
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE site_reviews IS
  'Human review records. AI may not replace human judgement for acquisition decisions. '
  'signals_at_review captures the evidence snapshot so historical reviews remain meaningful '
  'even after signals are recalculated with updated data.';
COMMENT ON COLUMN site_reviews.decision IS
  'insufficient_information is a valid and common outcome. It is not a failure state.';
