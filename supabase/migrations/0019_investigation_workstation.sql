-- Migration: 0019_investigation_workstation.sql
-- Purpose: Support Phase 6 Land Radar Acquisition Workstation:
-- 1. Explicit retrieval_mode on provenance records
-- 2. Structured next actions for site investigation
-- 3. Immutable investigation notes
-- 4. Controlled opportunity progression records

-- 1. Retrieval Mode for Provenance
DO $$ BEGIN
  CREATE TYPE retrieval_mode AS ENUM (
    'live_api',
    'cached',
    'local_fixture',
    'manual_entry',
    'synthetic_test'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE provenance_records
  ADD COLUMN IF NOT EXISTS retrieval_mode retrieval_mode NOT NULL DEFAULT 'local_fixture';

-- 2. Investigation Actions
CREATE TABLE IF NOT EXISTS investigation_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id text NOT NULL, -- references site internal_reference or uuid
  action_type text NOT NULL, -- 'verify_planning_history', 'verify_green_belt', 'verify_ownership', 'investigate_access', 'review_planning_policy', 'commission_site_visit', 'contact_landowner', 'obtain_title', 'other'
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  assigned_to text NOT NULL DEFAULT 'Acquisition Analyst',
  due_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  completed_at timestamptz,
  completed_by text,
  completion_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investigation_actions_site ON investigation_actions(site_id);
CREATE INDEX IF NOT EXISTS idx_investigation_actions_status ON investigation_actions(status);

-- 3. Investigation Notes (Immutable Audit Feed)
CREATE TABLE IF NOT EXISTS investigation_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id text NOT NULL,
  author text NOT NULL,
  author_role text NOT NULL DEFAULT 'Acquisition Analyst',
  content text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investigation_notes_site ON investigation_notes(site_id);
CREATE INDEX IF NOT EXISTS idx_investigation_notes_created_at ON investigation_notes(created_at DESC);

-- 4. Opportunity Progressions (Controlled Human Gate)
CREATE TABLE IF NOT EXISTS opportunity_progressions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id text NOT NULL,
  opportunity_id text NOT NULL,
  progressed_by text NOT NULL,
  progressed_at timestamptz NOT NULL DEFAULT now(),
  decision_reason text NOT NULL,
  review_id text,
  evidence_snapshot jsonb NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_progressions_site ON opportunity_progressions(site_id);

-- Enable RLS
ALTER TABLE investigation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_progressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investigation_actions_auth_only" ON investigation_actions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "investigation_actions_service_role" ON investigation_actions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "investigation_notes_auth_only" ON investigation_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "investigation_notes_service_role" ON investigation_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "opportunity_progressions_auth_only" ON opportunity_progressions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunity_progressions_service_role" ON opportunity_progressions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE investigation_actions IS 'Operational follow-up tasks required to progress candidate site investigation.';
COMMENT ON TABLE investigation_notes IS 'Immutable audit log of qualitative analyst assessments, phone calls, and site observations.';
COMMENT ON TABLE opportunity_progressions IS 'Audit record of candidate promotion to commercial opportunity, capturing the responsible human and evidence snapshot.';
