-- ============================================================
-- Migration 0024: Acquisition Operations Workbench & Opportunity Execution
--
-- Phase 13: Acquisition Operations Workbench & Opportunity Execution
--
-- Core Principles:
-- - Sourced, attributable, auditable operational acquisition workflow.
-- - Actionable contact tracking with follow-up dates (not a generic CRM).
-- - Formal contradiction resolution tracking with mandatory rationale.
-- - All operations protected by Row Level Security (RLS).
-- ============================================================

-- 1. Extend acquisition_contact_records with operational follow-up columns
ALTER TABLE acquisition_contact_records
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS follow_up_status text NOT NULL DEFAULT 'pending'
  CHECK (follow_up_status IN ('pending', 'completed', 'deferred', 'cancelled', 'none'));

CREATE INDEX IF NOT EXISTS acquisition_contact_followup_idx
  ON acquisition_contact_records (follow_up_date, follow_up_status);

-- 2. Contradiction Resolutions Table
CREATE TABLE IF NOT EXISTS candidate_contradiction_resolutions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_reference text NOT NULL,
  contradiction_id text NOT NULL,
  contradiction_type text NOT NULL,
  resolution_status text NOT NULL DEFAULT 'RESOLVED' CHECK (
    resolution_status IN ('RESOLVED', 'UNRESOLVED', 'DEFERRED_TO_LEGAL', 'ACKNOWLEDGED_MATERIAL')
  ),
  resolution_rationale text NOT NULL,
  supporting_evidence_ref text,
  resolved_by text NOT NULL,
  resolved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contradiction_res_site_idx
  ON candidate_contradiction_resolutions (site_id);
CREATE INDEX IF NOT EXISTS contradiction_res_contra_idx
  ON candidate_contradiction_resolutions (contradiction_id);
CREATE INDEX IF NOT EXISTS contradiction_res_status_idx
  ON candidate_contradiction_resolutions (resolution_status);

ALTER TABLE candidate_contradiction_resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contradiction_res_authenticated" ON candidate_contradiction_resolutions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "contradiction_res_service_role" ON candidate_contradiction_resolutions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE candidate_contradiction_resolutions IS
  'Auditable resolutions for detected contradictions across machine, derived, analyst and external evidence layers.';
