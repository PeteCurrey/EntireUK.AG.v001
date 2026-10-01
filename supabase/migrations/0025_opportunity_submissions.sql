-- ============================================================
-- Migration 0025: Opportunity Submissions Intake Persistence
--
-- Phase 13 Critical Integrity: DATA-013-01
--
-- Core Principles:
-- - Real database persistence for all public opportunity submissions.
-- - Public / anon role permitted to INSERT only (cannot SELECT other submissions).
-- - Authenticated analysts / service_role permitted to SELECT and UPDATE status.
-- - No synthetic or console-only fake success.
-- ============================================================

CREATE TABLE IF NOT EXISTS opportunity_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_reference text UNIQUE NOT NULL,
  submission_type text NOT NULL CHECK (
    submission_type IN ('land', 'property', 'opportunity', 'partner', 'general_contact')
  ),
  submitter_name text NOT NULL,
  organisation text,
  email text NOT NULL,
  phone text,
  address text,
  postcode text,
  site_size_description text,
  current_use text,
  planning_status text,
  ownership_status text,
  opportunity_description text,
  submitted_notes text,
  consent_acknowledged boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'received' CHECK (
    status IN ('received', 'under_review', 'screened', 'archived')
  ),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS opp_submissions_ref_idx ON opportunity_submissions (submission_reference);
CREATE INDEX IF NOT EXISTS opp_submissions_type_idx ON opportunity_submissions (submission_type);
CREATE INDEX IF NOT EXISTS opp_submissions_created_idx ON opportunity_submissions (created_at DESC);

ALTER TABLE opportunity_submissions ENABLE ROW LEVEL SECURITY;

-- Public submission allowed (INSERT only, cannot query existing submissions)
CREATE POLICY "opportunity_submissions_anon_insert" ON opportunity_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Internal analysts and service role can inspect submissions
CREATE POLICY "opportunity_submissions_auth_select" ON opportunity_submissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "opportunity_submissions_auth_update" ON opportunity_submissions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "opportunity_submissions_service_role" ON opportunity_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE opportunity_submissions IS
  'Persisted intake ledger of all external land, property, opportunity, and partnership submissions. Public insert only; authenticated internal read.';
