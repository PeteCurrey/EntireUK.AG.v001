-- ==============================================================================
-- ENTIRE UK — LAND RADAR TEST FIXTURES ONLY
--
-- CAUTION: THIS FILE CONTAINS SYNTHETIC TEST FIXTURES FOR LOCAL / CI TESTING.
-- DO NOT APPLY TO PRODUCTION ENVIRONMENTS.
--
-- PRODUCTION MUST CONTAIN ZERO FABRICATED LAND OPPORTUNITIES.
--
-- All fixtures are prefixed with TEST_ and have unmistakable placeholder names.
-- ==============================================================================

DO $$
BEGIN
  -- Strict guard against running in non-test environments
  IF current_database() NOT LIKE '%test%' AND current_database() NOT LIKE '%dev%' AND current_database() != 'postgres' THEN
    RAISE EXCEPTION 'Refusing to apply seed.test.sql to non-test database: %', current_database();
  END IF;
END $$;

-- 1. Create Synthetic Data Source
INSERT INTO data_sources (
  id, organisation, dataset_name, source_type, licence, coverage, status, notes
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TEST_FIXTURE_ORG',
  'TEST_SYNTHETIC_DATASET_V1',
  'manual',
  'TEST_ONLY_NOT_FOR_PRODUCTION',
  'test_sandbox',
  'active',
  'Synthetic test fixture dataset for automated pipeline tests.'
) ON CONFLICT (id) DO NOTHING;

-- 2. Synthetic Test Ingestion Job
INSERT INTO ingestion_jobs (
  id, data_source_id, started_at, completed_at, status,
  records_seen, records_inserted, processing_version
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  now(), now(), 'completed', 2, 2, 'test_v1'
) ON CONFLICT (id) DO NOTHING;

-- 3. Synthetic Test Sites (Clearly labelled TEST_FIXTURE)
-- Site 1: Passing candidate (approx 2.5 ha in Warwickshire test boundary)
INSERT INTO sites (
  id, internal_reference, name, status, source,
  location_description, local_authority, country
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'TEST-EUK-S-FIXTURE-001',
  '[TEST FIXTURE] Edge of Town Settlement Parcel',
  'candidate',
  'test_fixture',
  'Synthetic parcel for automated test harness',
  'Warwick District Council (Test)',
  'england'
) ON CONFLICT (id) DO NOTHING;

-- Site 2: Sub-threshold small infill (approx 400 m²)
INSERT INTO sites (
  id, internal_reference, name, status, source,
  location_description, local_authority, country
) VALUES (
  '00000000-0000-0000-0000-000000000020',
  'TEST-EUK-S-FIXTURE-002',
  '[TEST FIXTURE] Sub-Threshold Urban Plot',
  'candidate',
  'test_fixture',
  'Synthetic small plot to test RULE-AREA-001 exclusion',
  'Birmingham City Council (Test)',
  'england'
) ON CONFLICT (id) DO NOTHING;

-- 4. Synthetic Signals for Site 1
INSERT INTO site_signals (
  site_id, signal_type, value, unit, status, confidence,
  source, explanation, rule_version
) VALUES
(
  '00000000-0000-0000-0000-000000000010',
  'settlement_proximity',
  350,
  'metres',
  'known',
  0.9,
  'TEST_SYNTHETIC_DATASET_V1',
  '[TEST FIXTURE] Site centroid is 350m from test settlement boundary.',
  'v1'
),
(
  '00000000-0000-0000-0000-000000000010',
  'road_proximity',
  25,
  'metres',
  'known',
  0.95,
  'TEST_SYNTHETIC_DATASET_V1',
  '[TEST FIXTURE] Direct frontage to test road network.',
  'v1'
),
(
  '00000000-0000-0000-0000-000000000010',
  'flood_risk',
  0,
  'percent',
  'known',
  0.85,
  'TEST_SYNTHETIC_DATASET_V1',
  '[TEST FIXTURE] Zero overlap with test flood zones.',
  'v1'
)
ON CONFLICT (site_id, signal_type, rule_version) DO NOTHING;

-- 5. Synthetic Provenance Records
INSERT INTO provenance_records (
  entity_type, entity_id, source_organisation, dataset_name,
  licence, processing_version, raw_record
) VALUES (
  'site',
  '00000000-0000-0000-0000-000000000010',
  'TEST_FIXTURE_ORG',
  'TEST_SYNTHETIC_DATASET_V1',
  'TEST_ONLY',
  'v1',
  '{"fixture": true, "note": "Synthetic test data only"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 6. Synthetic Test Opportunity
INSERT INTO opportunities (
  id, site_id, opportunity_type_id, status, priority,
  assessment_notes, signal_count, positive_signals, soft_constraints, hard_exclusions, unknown_signals
) VALUES (
  '00000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000010',
  'development_land',
  'screening',
  3,
  '[TEST FIXTURE] Opportunity under automated test evaluation.',
  3, 3, 0, 0, 0
) ON CONFLICT (id) DO NOTHING;
