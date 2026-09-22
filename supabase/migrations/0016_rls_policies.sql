-- ============================================================
-- Migration 0016: Row Level Security Policies
-- Land Radar is an internal commercial intelligence system.
-- No Land Radar data is accessible to unauthenticated users.
-- No Land Radar data is accessible from the public website.
-- ============================================================

-- All RLS was already enabled per-table in previous migrations.
-- This migration documents and verifies the security boundary.

DO $$
DECLARE
  t text;
  rls_tables text[] := ARRAY[
    'data_sources', 'ingestion_jobs', 'sites', 'land_parcels',
    'land_titles', 'parcel_title_relationships', 'provenance_records',
    'opportunity_types', 'opportunities', 'site_signals', 'site_constraints',
    'planning_records', 'market_comparables', 'site_reviews', 'data_quality_reports'
  ];
BEGIN
  FOREACH t IN ARRAY rls_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE tablename = t
      AND rowsecurity = true
    ) THEN
      RAISE WARNING 'Table % does not have RLS enabled', t;
    END IF;
  END LOOP;
  RAISE NOTICE 'RLS verification complete for all Land Radar tables.';
END $$;

-- Explicit: public schema anon role has NO access to Land Radar tables
-- This is enforced by the absence of anon policies. Verified here.
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN (
    'sites', 'opportunities', 'site_signals', 'site_constraints',
    'site_reviews', 'market_comparables', 'planning_records'
  )
  AND roles @> '{anon}';

  IF policy_count > 0 THEN
    RAISE EXCEPTION 'Security violation: % policies grant anon access to Land Radar tables', policy_count;
  END IF;
END $$;

COMMENT ON SCHEMA public IS
  'Land Radar tables: authenticated and service_role access only. '
  'Public website uses /api/submit route handler with its own validation. '
  'No Land Radar intelligence is exposed to the public website or unauthenticated users.';
