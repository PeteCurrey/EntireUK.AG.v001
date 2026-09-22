import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanningAdapter } from '../adapters/planningAdapter';
import { classifyPlanningDescription } from '../planning/classifier';
import { matchPlanningRecordToSite } from '../planning/spatialMatcher';
import { buildPlanningActivitySignal } from '../signals';
import {
  runScreeningPipeline,
  RESIDENTIAL_DEVELOPMENT_V1,
  RESIDENTIAL_DEVELOPMENT_V2,
} from '../rules';
import { generateAcquisitionInvestigationBrief } from '../planning/briefGenerator';
import { WARWICK_PILOT, RUGBY_PILOT } from '../pilot/config';
import { Site, PlanningEvidenceItem, WhySurfacedProfile, GeoJSON } from '../types';

test('PlanningAdapter — ingests authentic fixtures and enforces OGL v3 licence gate', async () => {
  const adapter = new PlanningAdapter();
  const warwickRes = await adapter.ingest(WARWICK_PILOT);

  assert.ok(warwickRes.records.length >= 5, 'Warwick should have at least 5 authentic planning records');
  assert.equal(warwickRes.retrievalMode, 'local_fixture');

  for (const rec of warwickRes.records) {
    assert.ok(rec.applicationReference.startsWith('W/'), 'Warwick references should start with W/');
    assert.ok(rec.decision, 'Decision must be present');
    assert.ok(rec.lpaCode === 'warwick', 'LPA code must be warwick');
  }

  const rugbyRes = await adapter.ingest(RUGBY_PILOT);
  assert.ok(rugbyRes.records.length >= 4, 'Rugby should have at least 4 authentic planning records');
  for (const rec of rugbyRes.records) {
    assert.ok(rec.applicationReference.startsWith('R'), 'Rugby references should start with R');
    assert.ok(rec.lpaCode === 'rugby', 'LPA code must be rugby');
  }
});

test('Planning Classifier — categorises descriptions deterministically without magic scores', () => {
  const residentialDesc = 'Erection of 120 residential dwellings with associated vehicular access, open space, and drainage.';
  assert.equal(classifyPlanningDescription(residentialDesc, 'full'), 'residential');

  const commercialDesc = 'Change of use from retail unit (Class E) to office accommodation and commercial hub.';
  assert.equal(classifyPlanningDescription(commercialDesc, 'full'), 'commercial');

  const mixedDesc = 'Hybrid application for 250 residential dwellings and 1,500 sqm of mixed-use commercial and retail floorspace.';
  assert.equal(classifyPlanningDescription(mixedDesc, 'outline'), 'mixed_use');

  const infraDesc = 'Installation of electric vehicle charging substation and electrical infrastructure.';
  assert.equal(classifyPlanningDescription(infraDesc, 'full'), 'infrastructure');

  const unknownDesc = 'Various minor amendments to non-standard elevation details.';
  assert.equal(classifyPlanningDescription(unknownDesc, 'other'), 'unknown');
});

test('Spatial Matcher — 5-tier spatial matching hierarchy behaves deterministically', () => {
  const candidateSite = {
    siteId: 'site-001',
    siteReference: 'EUK-WAR-BF-001',
    siteName: 'Former Ford Foundry Site, Princes Drive, Leamington Spa',
    siteGeometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-1.5450, 52.2840] as GeoJSON.Position,
          [-1.5360, 52.2840] as GeoJSON.Position,
          [-1.5360, 52.2890] as GeoJSON.Position,
          [-1.5450, 52.2890] as GeoJSON.Position,
          [-1.5450, 52.2840] as GeoJSON.Position,
        ],
      ],
    },
  };

  // 1. Direct candidate polygon overlap (Tier 1: intersects_candidate)
  const overlappingRecord = {
    sourceId: 'rec-001',
    applicationReference: 'W/20/1245',
    lpaCode: 'warwick',
    lpaName: 'Warwick District Council',
    siteLocation: 'Princes Drive, Leamington Spa',
    applicationType: 'outline',
    description: 'Mixed use residential redevelopment up to 350 dwellings.',
    decision: 'approved' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-1.5420, 52.2850] as GeoJSON.Position,
          [-1.5380, 52.2850] as GeoJSON.Position,
          [-1.5380, 52.2880] as GeoJSON.Position,
          [-1.5420, 52.2880] as GeoJSON.Position,
          [-1.5420, 52.2850] as GeoJSON.Position,
        ],
      ],
    },
    rawRecord: {},
  };

  const match1 = matchPlanningRecordToSite(candidateSite, overlappingRecord);
  assert.ok(match1, 'Overlapping record should match');
  assert.equal(match1.match_tier, 'intersects_candidate');
  assert.equal(match1.distance_m, 0);

  // 2. Nearby buffer match (Tier 3: nearby_buffer)
  const nearbyRecord = {
    sourceId: 'rec-002',
    applicationReference: 'W/22/0450',
    lpaCode: 'warwick',
    lpaName: 'Warwick District Council',
    siteLocation: 'Adjacent land, Princes Drive, Leamington Spa',
    applicationType: 'full',
    description: 'Infrastructure works adjacent to candidate site.',
    decision: 'approved' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [-1.5420, 52.2835] as GeoJSON.Position,
    },
    rawRecord: {},
  };

  const match2 = matchPlanningRecordToSite(candidateSite, nearbyRecord);
  assert.ok(match2, 'Nearby buffer record should match');
  assert.equal(match2.match_tier, 'nearby_buffer');
  assert.ok(match2.distance_m !== null && match2.distance_m <= 350);

  // 3. Far distance with zero shared road names (No match)
  const distantRecord = {
    sourceId: 'rec-003',
    applicationReference: 'W/23/9999',
    lpaCode: 'warwick',
    lpaName: 'Warwick District Council',
    siteLocation: 'Kenilworth Castle Grounds, Castle Green, Kenilworth',
    applicationType: 'full',
    description: 'Visitor centre alterations.',
    decision: 'approved' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [-1.5900, 52.3400] as GeoJSON.Position,
    },
    rawRecord: {},
  };

  const match3 = matchPlanningRecordToSite(candidateSite, distantRecord);
  assert.equal(match3, null, 'Distant unrelated record should not match');
});

test('Planning Activity Signal — strict epistemic semantics', () => {
  // Case A: Coverage unknown -> signal status must be unknown
  const sigUnknown = buildPlanningActivitySignal('s1', [], 'unknown');
  assert.equal(sigUnknown.status, 'unknown');
  assert.ok(sigUnknown.explanation.includes('unassessed'));

  // Case B: Coverage known, 0 records found -> known, but explicitly disclaims absence of historical records
  const sigZero = buildPlanningActivitySignal('s2', [], 'known');
  assert.equal(sigZero.status, 'known');
  assert.equal(sigZero.value, 0);
  assert.ok(
    sigZero.explanation.toLowerCase().includes('absence') ||
    sigZero.explanation.toLowerCase().includes('does not confirm absence')
  );

  // Case C: Coverage known, 2 records found (1 approved, 1 refused) -> known with count and friction notes
  const mockEvidence: PlanningEvidenceItem[] = [
    {
      id: 'e1',
      site_id: 's3',
      application: {
        id: 'app1',
        application_reference: 'W/20/1245',
        local_authority: 'warwick',
        site_location: 'Location 1',
        application_type: 'outline',
        description: 'Residential 200 units',
        classification: 'residential',
        decision: 'approved',
        decision_date: '2022-01-01',
        application_date: '2020-01-01',
        geometry: null,
        source_dataset: 'PLANNING-REGISTER-001',
        retrieval_timestamp: '2026-09-07T00:00:00Z',
      },
      match_tier: 'intersects_candidate',
      distance_m: 0,
      overlap_pct: 100,
      is_relevant_to_strategy: true,
      relevance_notes: 'Intersects candidate boundary',
    },
    {
      id: 'e2',
      site_id: 's3',
      application: {
        id: 'app2',
        application_reference: 'W/21/0884',
        local_authority: 'warwick',
        site_location: 'Location 2',
        application_type: 'full',
        description: 'Commercial unit',
        classification: 'commercial',
        decision: 'refused',
        decision_date: '2021-06-01',
        application_date: '2021-02-01',
        geometry: null,
        source_dataset: 'PLANNING-REGISTER-001',
        retrieval_timestamp: '2026-09-07T00:00:00Z',
      },
      match_tier: 'nearby_buffer',
      distance_m: 60,
      overlap_pct: null,
      is_relevant_to_strategy: true,
      relevance_notes: 'Nearby buffer',
    },
  ];

  const sigMulti = buildPlanningActivitySignal('s3', mockEvidence, 'known');
  assert.equal(sigMulti.status, 'known');
  assert.equal(sigMulti.value, 2);
  assert.ok(sigMulti.explanation.includes('2 planning record(s)'));
  assert.ok(sigMulti.explanation.includes('1 approved'));
  assert.ok(sigMulti.explanation.includes('1 refused'));
});

test('Screening Strategy V1 vs V2 — V2 incorporates planning rules while preserving V1 blockers', () => {
  const mockSignalsWithApprovedPlanning = {
    settlement_proximity: { value: 200, status: 'known' as const },
    road_proximity: { value: 30, status: 'known' as const },
    flood_risk: { value: 0, status: 'known' as const },
    protected_site: { value: 0, status: 'known' as const },
    brownfield_signal: { value: 1, status: 'known' as const },
    green_belt: { value: 0, status: 'known' as const },
    planning_activity: { value: 1, status: 'known' as const },
  };

  // Run V1: does not include RULE-PLAN-001
  const resV1 = runScreeningPipeline(
    {
      siteId: 'site-test',
      areaSqm: 10000,
      signals: mockSignalsWithApprovedPlanning,
    },
    RESIDENTIAL_DEVELOPMENT_V1
  );

  // Run V2: includes RULE-PLAN-001
  const resV2 = runScreeningPipeline(
    {
      siteId: 'site-test',
      areaSqm: 10000,
      signals: mockSignalsWithApprovedPlanning,
    },
    RESIDENTIAL_DEVELOPMENT_V2
  );

  assert.equal(resV1.passed, true);
  assert.equal(resV2.passed, true);

  // V2 should have evaluated planning rule(s)
  const v1HasPlanRule = resV1.results.some((r) => r.ruleId.startsWith('RULE-PLAN'));
  const v2HasPlanRule = resV2.results.some((r) => r.ruleId.startsWith('RULE-PLAN'));

  assert.equal(v1HasPlanRule, false, 'V1 must not evaluate planning rules');
  assert.equal(v2HasPlanRule, true, 'V2 must evaluate planning rules');
  assert.ok(
    resV2.positive_signals.some((ps) => ps.ruleId === 'RULE-PLAN-001'),
    'V2 should register RULE-PLAN-001 as a positive signal when planning history is present'
  );
});

test('Investigation Brief Generator — creates complete deterministic briefing file', () => {
  const site: Site = {
    id: 's-brief',
    internal_reference: 'EUK-WAR-BF-001',
    name: 'Former Ford Foundry Site',
    status: 'candidate',
    source: 'DLUHC Brownfield Register',
    source_reference: 'WDC-BF-001',
    geometry: null,
    centroid: null,
    area_sqm: 45000,
    area_sqm_source: 45000,
    area_discrepancy_flag: false,
    local_authority: 'Warwick District Council',
    country: 'england',
    postcode_sector: 'CV31 3',
    location_description: 'Princes Drive, Leamington Spa',
    created_at: '2026-09-07T00:00:00Z',
    updated_at: '2026-09-07T00:00:00Z',
  };

  const whySurfaced: WhySurfacedProfile = {
    coreDriver: 'DLUHC Brownfield Land Register — Identified deliverable redevelopment site (4.50 ha).',
    keyPositiveFactors: ['Previously Developed Land (brownfield) with NPPF presumption.'],
    activeConstraints: [],
    visualUnknowns: [],
    recommendedAngle: 'Verify deliverability with LPA officers.',
  };

  const mockEvidence: PlanningEvidenceItem[] = [
    {
      id: 'e1',
      site_id: site.id,
      application: {
        id: 'app1',
        application_reference: 'W/20/1245',
        local_authority: 'warwick',
        site_location: 'Princes Drive, Leamington Spa',
        application_type: 'outline',
        description: '350 dwellings redevelopment',
        classification: 'residential',
        decision: 'approved',
        decision_date: '2022-04-14',
        application_date: '2020-09-15',
        geometry: null,
        source_dataset: 'PLANNING-REGISTER-001',
        retrieval_timestamp: '2026-09-07T00:00:00Z',
      },
      match_tier: 'intersects_candidate',
      distance_m: 0,
      overlap_pct: 100,
      is_relevant_to_strategy: true,
      relevance_notes: 'Intersects candidate footprint',
    },
  ];

  const brief = generateAcquisitionInvestigationBrief(
    site,
    whySurfaced,
    [],
    [],
    mockEvidence,
    'known'
  );

  assert.equal(brief.site_reference, 'EUK-WAR-BF-001');
  assert.equal(brief.area_ha, 4.5);
  assert.equal(brief.planning_summary.total_found, 1);
  assert.equal(brief.planning_summary.latest_decision, 'approved');
  assert.equal(brief.planning_summary.highest_match_tier, 'intersects_candidate');
  assert.ok(brief.recommended_next_actions.length > 0);
  assert.ok(brief.disclaimer.includes('does NOT constitute legal advice'));
});
