-- ============================================================
-- Migration 0009: Opportunities
-- Canonical opportunity abstraction.
-- An opportunity sits above evidence and signals, not above opinions.
-- ============================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  opportunity_type_id text REFERENCES opportunity_types(id),

  status text NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified', 'screening', 'assessed', 'active', 'paused', 'declined', 'archived'
  )),

  -- Priority: nullable. Human-assigned only. No magic score yet.
  -- When scoring is introduced it must be versioned, explainable and decomposable.
  priority integer CHECK (priority >= 1 AND priority <= 5),

  -- Assessment
  assessed_at timestamptz,
  assessed_by text,
  assessment_notes text,

  -- Signal summary (denormalised for query performance)
  -- Source of truth is site_signals. These are updated by triggers/application logic.
  signal_count integer NOT NULL DEFAULT 0,
  positive_signals integer NOT NULL DEFAULT 0,
  soft_constraints integer NOT NULL DEFAULT 0,
  hard_exclusions integer NOT NULL DEFAULT 0,
  unknown_signals integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX opportunities_site_idx ON opportunities (site_id);
CREATE INDEX opportunities_status_idx ON opportunities (status);
CREATE INDEX opportunities_type_idx ON opportunities (opportunity_type_id);

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opportunities_authenticated" ON opportunities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunities_service_role" ON opportunities
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE opportunities IS
  'An identifiable land/property situation where evidence suggests development, '
  'redevelopment, planning or value-creation potential worthy of investigation. '
  'An opportunity is NOT a confirmed development site. '
  'priority is human-assigned only. There is no automated 0-100 score at this stage.';
COMMENT ON COLUMN opportunities.priority IS
  'Human-assigned priority 1-5. Null = not yet prioritised. '
  'Automated scoring will eventually sit above the evidence layer when sufficient data exists.';
